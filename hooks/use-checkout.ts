// hooks/use-checkout.ts
"use client";

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/cart-context';
import { OrderService } from '@/services/order.service';
import { CreateOrderDto } from '@/types/order';
import { ShippingOption, CalculateShippingDto } from '@/types/shipping';
import { toast } from 'sonner';

type CheckoutStep = 'review' | 'shipping' | 'address';

export interface CheckoutState {
    currentStep: CheckoutStep;
    shippingType: 'DOMESTIC' | 'INTERNATIONAL';
    selectedShipping?: ShippingOption;
    shippingAddress?: {
        recipientName: string;
        recipientPhone: string;
        shippingAddress: string;
        shippingCity: string;
        shippingProvince?: string;
        shippingCountry: string;
        shippingPostalCode: string;
        shippingNotes?: string;
    };
}

export function useCheckout() {
    const router = useRouter();
    const { cart, guestCartWithDetails, clearCart } = useCart();

    const [state, setState] = useState<CheckoutState>({
        currentStep: 'review',
        shippingType: 'DOMESTIC',
    });

    const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
    const [isCalculating, setIsCalculating] = useState(false);
    const [isCreatingOrder, setIsCreatingOrder] = useState(false);

    // Get cart items (user or guest)
    const cartItems = cart?.items || guestCartWithDetails;
    const hasItems = cartItems.length > 0;

    // Calculate shipping
    const calculateShipping = useCallback(async (
        destinationType: 'DOMESTIC' | 'INTERNATIONAL',
        destination: { postalCode?: string; country?: string }
    ) => {
        if (!hasItems) {
            toast.error('Cart is empty');
            return;
        }

        setIsCalculating(true);
        try {
            // Prepare items for shipping calculation
            const items = cartItems.map(item => ({
                productId: item.product?.id || '', // Fixed: Use optional chaining and provide fallback
                variantId: item.variantId || item.variant?.id || '', // Fixed: Use optional chaining and provide fallback
                quantity: item.quantity,
                weight: 1000, // Default 1kg per item (you should get this from product)
            }));

            const data: CalculateShippingDto = {
                destinationType,
                items,
                ...(destinationType === 'DOMESTIC'
                        ? { destinationPostalCode: destination.postalCode }
                        : { destinationCountry: destination.country }
                ),
            };

            const response = await OrderService.calculateShipping(data);
            setShippingOptions(response.data.shippingOptions);

            toast.success('Shipping options loaded');
        } catch (error: unknown) { // Fixed: Use unknown instead of any
            const errorMessage = error instanceof Error ? error.message : 'Failed to calculate shipping';
            toast.error(errorMessage);
            setShippingOptions([]);
        } finally {
            setIsCalculating(false);
        }
    }, [hasItems, cartItems]);

    // Select shipping option
    const selectShipping = useCallback((option: ShippingOption) => {
        setState(prev => ({
            ...prev,
            selectedShipping: option,
        }));
    }, []);

    // Go to next step
    const goToNextStep = useCallback(() => {
        setState(prev => {
            if (prev.currentStep === 'review') {
                return { ...prev, currentStep: 'shipping' };
            }
            if (prev.currentStep === 'shipping') {
                if (!prev.selectedShipping) {
                    toast.error('Please select a shipping option');
                    return prev;
                }
                return { ...prev, currentStep: 'address' };
            }
            return prev;
        });
    }, []);

    // Go to previous step
    const goToPreviousStep = useCallback(() => {
        setState(prev => {
            if (prev.currentStep === 'address') {
                return { ...prev, currentStep: 'shipping' };
            }
            if (prev.currentStep === 'shipping') {
                return { ...prev, currentStep: 'review' };
            }
            return prev;
        });
    }, []);

    // Set shipping type
    const setShippingType = useCallback((type: 'DOMESTIC' | 'INTERNATIONAL') => {
        setState(prev => ({
            ...prev,
            shippingType: type,
            selectedShipping: undefined, // Reset selection
        }));
        setShippingOptions([]); // Reset options
    }, []);

    // Create order
    const createOrder = useCallback(async (addressData: CheckoutState['shippingAddress']) => {
        if (!state.selectedShipping || !addressData) {
            toast.error('Missing required data');
            return;
        }

        setIsCreatingOrder(true);
        try {
            const orderData: CreateOrderDto = {
                shippingType: state.shippingType,
                shippingMethod: `${state.selectedShipping.courierName} - ${state.selectedShipping.description}`,
                courierCode: state.selectedShipping.courierCode,
                courierService: state.selectedShipping.courierService,
                shippingCost: state.selectedShipping.price,
                shippingAddress: addressData,
            };

            const response = await OrderService.createOrder(orderData);
            const order = response.data;

            // Clear cart
            await clearCart();

            toast.success('Order created successfully!');

            // Redirect to payment page
            router.push(`/orders/${order.orderNumber}`);
        } catch (error: unknown) { // Fixed: Use unknown instead of any
            const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
            toast.error(errorMessage);
        } finally {
            setIsCreatingOrder(false);
        }
    }, [state, clearCart, router]);

    return {
        // State
        state,
        shippingOptions,
        isCalculating,
        isCreatingOrder,
        hasItems,
        cartItems,

        // Actions
        calculateShipping,
        selectShipping,
        goToNextStep,
        goToPreviousStep,
        setShippingType,
        createOrder,
    };
}
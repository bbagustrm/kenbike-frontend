// hooks/use-checkout.ts
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useCart } from '@/contexts/cart-context';
import { OrderService } from '@/services/order.service';
import { toast } from 'sonner';
import {
    CreateOrderDto,
    ShippingCalculationResponse,
    ShippingRate,
    PaymentMethod,
    ShippingType,
} from '@/types/order';

export function useCheckout() {
    const router = useRouter();
    const { user } = useAuth();
    const { cart, cartItemsCount, clearCart } = useCart();

    const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
    const [shippingCalculation, setShippingCalculation] = useState<ShippingCalculationResponse | null>(null);
    const [selectedCourier, setSelectedCourier] = useState<ShippingRate | null>(null);
    const [isCreatingOrder, setIsCreatingOrder] = useState(false);

    // Check if user has complete address
    const hasCompleteAddress = Boolean(
        user &&
        user.country &&
        user.address &&
        user.postal_code &&
        (user.country !== 'Indonesia' || (user.province && user.city && user.district))
    );

    // Calculate total weight from cart
    const getTotalWeight = (): number => {
        if (!cart) return 0;

        return cart.items.reduce((total, item) => {
            // Assuming product has weight in grams
            const productWeight = (item.product as { weight?: number }).weight || 0;
            return total + (productWeight * item.quantity);
        }, 0);
    };

    // Calculate subtotal based on user's locale
    const getSubtotal = (): number => {
        if (!cart) return 0;

        const currency = user?.country === 'Indonesia' ? 'IDR' : 'USD';

        return cart.items.reduce((total, item) => {
            const price = currency === 'IDR' ? item.product.idPrice : item.product.enPrice;
            const discount = item.product.promotion?.isActive ? item.product.promotion.discount : 0;
            const finalPrice = price * (1 - discount);
            return total + (finalPrice * item.quantity);
        }, 0);
    };

    // Calculate shipping automatically on mount
    useEffect(() => {
        if (hasCompleteAddress && cartItemsCount > 0) {
            calculateShipping();
        }
    }, [hasCompleteAddress, cartItemsCount]);

    const calculateShipping = async () => {
        if (!user || !hasCompleteAddress) {
            toast.error('Please complete your address first');
            return;
        }

        // Type guard - ensure required fields
        if (!user.postal_code) {
            toast.error('Postal code is required');
            return;
        }

        if (!user.address) {
            toast.error('Address is required');
            return;
        }

        setIsCalculatingShipping(true);

        try {
            const totalWeight = getTotalWeight();

            // Ensure we have total weight
            if (totalWeight <= 0) {
                toast.error('Cart items must have weight information');
                setIsCalculatingShipping(false);
                return;
            }

            const result = await OrderService.calculateShipping({
                country: user.country || '',
                province: user.province || undefined,
                city: user.city || undefined,
                postalCode: user.postal_code,
                address: user.address, // Include address if backend requires it
                totalWeight,
            });

            setShippingCalculation(result);

            // Auto-select cheapest courier for domestic
            if (result.type === 'DOMESTIC' && result.rates && result.rates.length > 0) {
                const cheapest = result.rates.reduce((prev, current) =>
                    current.price < prev.price ? current : prev
                );
                setSelectedCourier(cheapest);
            }

            toast.success('Shipping calculated successfully');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to calculate shipping';
            toast.error(errorMessage);
            setShippingCalculation(null);
        } finally {
            setIsCalculatingShipping(false);
        }
    };

    const createOrder = async () => {
        if (!user || !hasCompleteAddress) {
            toast.error('Please complete your address first');
            router.push('/user/profile');
            return;
        }

        if (!shippingCalculation) {
            toast.error('Please calculate shipping first');
            return;
        }

        if (shippingCalculation.type === 'DOMESTIC' && !selectedCourier) {
            toast.error('Please select a courier');
            return;
        }

        // Type guards - ensure required fields are present
        if (!user.postal_code) {
            toast.error('Postal code is required');
            return;
        }

        if (!user.address) {
            toast.error('Address is required');
            return;
        }

        if (!user.first_name || !user.last_name) {
            toast.error('Name is required');
            return;
        }

        setIsCreatingOrder(true);

        try {
            const isDomestic = user.country === 'Indonesia';
            const paymentMethod = isDomestic ? PaymentMethod.MIDTRANS_SNAP : PaymentMethod.PAYPAL;

            const orderDto: CreateOrderDto = {
                shippingType: isDomestic ? ShippingType.DOMESTIC : ShippingType.INTERNATIONAL,
                recipientName: `${user.first_name} ${user.last_name}`,
                recipientPhone: user.phone_number || 'N/A',
                shippingAddress: user.address,
                shippingCity: user.city || '',
                shippingProvince: user.province || undefined,
                shippingCountry: user.country || '',
                shippingPostalCode: user.postal_code,
                paymentMethod,
            };

            // Add domestic shipping details
            if (isDomestic && selectedCourier) {
                orderDto.biteshipCourier = selectedCourier.courier;
                orderDto.biteshipService = selectedCourier.service;
            }

            // Add international shipping details
            if (!isDomestic && shippingCalculation.zone) {
                orderDto.shippingZoneId = shippingCalculation.zone.id;
            }

            const response = await OrderService.createOrder(orderDto);

            // Clear cart after order created
            await clearCart();

            // Redirect to payment
            if (response.data.payment.redirectUrl) {
                // Midtrans: Open in new tab
                window.open(response.data.payment.redirectUrl, '_blank');
            } else if (response.data.payment.approveUrl) {
                // PayPal: Open in new tab
                window.open(response.data.payment.approveUrl, '_blank');
            }

            // Redirect to waiting payment page
            router.push(`/orders/${response.data.order.orderNumber}`);

            toast.success('Order created successfully!');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
            toast.error(errorMessage);
        } finally {
            setIsCreatingOrder(false);
        }
    };

    return {
        user,
        hasCompleteAddress,
        isCalculatingShipping,
        shippingCalculation,
        selectedCourier,
        setSelectedCourier,
        calculateShipping,
        isCreatingOrder,
        createOrder,
        subtotal: getSubtotal(),
        totalWeight: getTotalWeight(),
    };
}
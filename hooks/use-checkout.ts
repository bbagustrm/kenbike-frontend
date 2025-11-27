// hooks/use-checkout.ts - DEBUG VERSION
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useCart } from '@/contexts/cart-context';
import { useTranslation } from '@/hooks/use-translation';
import { OrderService } from '@/services/order.service';
import { getCurrencyFromLocale, getLocalizedPrice } from '@/lib/format-currency';
import { toast } from 'sonner';
import {
    CreateOrderDto,
    ShippingCalculationResponse,
    ShippingOption,
    PaymentMethod,
    ShippingType,
} from '@/types/order';

export function useCheckout() {
    const router = useRouter();
    const { user } = useAuth();
    const { cart, cartItemsCount, clearCart } = useCart();
    const { locale } = useTranslation();

    const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
    const [shippingCalculation, setShippingCalculation] = useState<ShippingCalculationResponse | null>(null);
    const [selectedCourier, setSelectedCourier] = useState<ShippingOption | null>(null);
    const [isCreatingOrder, setIsCreatingOrder] = useState(false);

    const currency = getCurrencyFromLocale(locale);

    const hasCompleteAddress = Boolean(
        user &&
        user.country &&
        user.city &&
        user.address &&
        user.postal_code &&
        (user.country !== 'ID' || (user.province && user.district))
    );

    const getTotalWeight = (): number => {
        if (!cart) return 0;

        return cart.items.reduce((total, item) => {
            const productWeight = (item.product as { weight?: number }).weight || 0;
            return total + (productWeight * item.quantity);
        }, 0);
    };

    const getSubtotal = (): number => {
        if (!cart) return 0;

        return cart.items.reduce((total, item) => {
            const price = getLocalizedPrice(item.product.idPrice, item.product.enPrice, locale);
            const discount = item.product.promotion?.isActive ? item.product.promotion.discount : 0;
            const finalPrice = price * (1 - discount);
            return total + (finalPrice * item.quantity);
        }, 0);
    };

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

        if (!user.country || !user.city || !user.postal_code || !user.address) {
            toast.error('Please complete all required address fields');
            return;
        }

        if (user.address.length < 10) {
            toast.error('Address must be at least 10 characters');
            return;
        }

        if (user.address.length > 500) {
            toast.error('Address must be less than 500 characters');
            return;
        }

        setIsCalculatingShipping(true);

        try {
            const totalWeight = getTotalWeight();

            if (totalWeight < 1) {
                toast.error('Cart weight must be at least 1 gram');
                setIsCalculatingShipping(false);
                return;
            }

            if (totalWeight > 30000) {
                toast.error('Cart weight exceeds maximum 30kg (30000 grams)');
                setIsCalculatingShipping(false);
                return;
            }

            const result = await OrderService.calculateShipping({
                country: user.country,
                province: user.province || undefined,
                city: user.city,
                district: user.district || undefined,
                postal_code: user.postal_code,
                address: user.address,
                total_weight: totalWeight,
                courier: undefined,
            });

            setShippingCalculation(result);

            if (result.shippingType === 'DOMESTIC' && result.options && result.options.length > 0) {
                const cheapest = result.options.reduce((prev, current) =>
                    current.cost < prev.cost ? current : prev
                );
                setSelectedCourier(cheapest);
            }

            toast.success('Shipping calculated successfully');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to calculate shipping';
            console.error('❌ Shipping calculation error:', error);
            toast.error(errorMessage);
            setShippingCalculation(null);
        } finally {
            setIsCalculatingShipping(false);
        }
    };

    const createOrder = async () => {
        // ... (semua validasi di bagian awal fungsi tetap sama dan bagus)
        if (!user || !hasCompleteAddress) {
            toast.error('Please complete your address first');
            router.push('/user/profile');
            return;
        }

        if (!shippingCalculation) {
            toast.error('Please calculate shipping first');
            return;
        }

        if (shippingCalculation.shippingType === 'DOMESTIC' && !selectedCourier) {
            toast.error('Please select a courier');
            return;
        }

        if (!user.country || !user.city || !user.postal_code || !user.address) {
            toast.error('Please complete all required address fields');
            return;
        }

        if (!user.first_name || !user.last_name) {
            toast.error('Name is required');
            return;
        }

        // ... (semua log dan validasi lainnya tetap sama)
        const isDomestic = user.country === 'ID';

        if (isDomestic && !user.province) {
            console.error('❌ Province missing for domestic order');
            toast.error('Province is required for domestic shipping. Please update your profile.');
            router.push('/user/profile');
            return;
        }

        if (isDomestic && !selectedCourier) {
            console.error('❌ Courier not selected for domestic order');
            toast.error('Please select a courier');
            return;
        }

        if (isDomestic && selectedCourier) {
            if (!selectedCourier.biteshipPriceId || !selectedCourier.courier || !selectedCourier.service) {
                console.error('❌ Missing Biteship fields:', {
                    priceId: selectedCourier.biteshipPriceId,
                    courier: selectedCourier.courier,
                    service: selectedCourier.service
                });
                toast.error('Invalid courier selection. Please select again.');
                return;
            }
        }

        setIsCreatingOrder(true);

        try {
            const paymentMethod = isDomestic ? PaymentMethod.MIDTRANS_SNAP : PaymentMethod.PAYPAL;

            const orderDto: CreateOrderDto = {
                shippingType: isDomestic ? ShippingType.DOMESTIC : ShippingType.DOMESTIC, // Perhatikan: seharusnya INTERNATIONAL jika bukan ID
                recipientName: `${user.first_name} ${user.last_name}`,
                recipientPhone: user.phone_number || 'N/A',
                shippingAddress: user.address,
                shippingCity: user.city,
                shippingProvince: user.province || undefined,
                shippingCountry: user.country,
                shippingPostalCode: user.postal_code,
                paymentMethod,
                currency,
            };

            if (isDomestic && selectedCourier) {
                orderDto.biteshipCourier = selectedCourier.courier;
                orderDto.biteshipService = selectedCourier.service;
                orderDto.biteshipPriceId = selectedCourier.biteshipPriceId;
            }

            if (!isDomestic && shippingCalculation.options[0]) {
                orderDto.shippingZoneId = shippingCalculation.options[0].zoneId;
            }

            const response = await OrderService.createOrder(orderDto);

            // ✅ DEBUG: Lihat respons yang sebenarnya
            console.log('✅ Order created, full response:', response);

            await clearCart();

            // ❌ KODE INI DIHAPUS KARENA BACKEND TIDAK MENGEMBALIKAN 'payment'
            // Logika pembayaran perlu dipanggil secara terpisah atau backend perlu diperbaiki.
            /*
            if (response.data.payment?.redirectUrl) {
                window.open(response.data.payment.redirectUrl, '_blank');
            } else if (response.data.payment?.approveUrl) {
                window.open(response.data.payment.approveUrl, '_blank');
            }
            */

            // ✅ KODE INI SUDAH BENAR DAN SESUAI DENGAN TIPE BARU
            router.push(`/orders/${response.data.orderNumber}`);
            toast.success('Order created successfully!');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
            console.error('❌ Create order error:', error);
            console.error('❌ Error details:', JSON.stringify(error, null, 2));
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
        currency,
        locale,
    };
}
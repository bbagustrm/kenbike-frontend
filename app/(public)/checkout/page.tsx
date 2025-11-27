// app/(public)/checkout/page.tsx - FINAL WITH TRANSLATIONS
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useCart } from '@/contexts/cart-context';
import { useCheckout } from '@/hooks/use-checkout';
import { useTranslation } from '@/hooks/use-translation';
import { AddressSection } from '@/components/checkout/address-section';
import { ShippingSection } from '@/components/checkout/shipping-section';
import { OrderSummary } from '@/components/checkout/order-summary';
import { PaymentSection } from '@/components/checkout/payment-section';
import { motion } from 'framer-motion';

export default function CheckoutPage() {
    const router = useRouter();
    const { isAuthenticated, user, isLoading: authLoading } = useAuth();
    const { cart, cartItemsCount } = useCart();
    const { t } = useTranslation();
    const {
        hasCompleteAddress,
        isCalculatingShipping,
        shippingCalculation,
        selectedCourier,
        setSelectedCourier,
        isCreatingOrder,
        createOrder,
        subtotal,
        currency,
    } = useCheckout();

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login?redirect=/checkout');
        }
    }, [isAuthenticated, authLoading, router]);

    // Redirect if cart is empty
    useEffect(() => {
        if (!authLoading && isAuthenticated && cartItemsCount === 0) {
            router.push('/search');
        }
    }, [cartItemsCount, isAuthenticated, authLoading, router]);

    if (authLoading) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return null;
    }

    if (cartItemsCount === 0) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <ShoppingCart className="w-16 h-16 text-muted-foreground mb-4" />
                    <h2 className="text-2xl font-bold mb-2">{t.checkout.emptyCart}</h2>
                    <p className="text-muted-foreground mb-4">{t.checkout.emptyCartMessage}</p>
                    <Button onClick={() => router.push('/search')}>
                        {t.checkout.continueShoppingButton}
                    </Button>
                </div>
            </div>
        );
    }

    // Check if can checkout - for DOMESTIC need courier selected, for INTERNATIONAL just need calculation
    const canCheckout = Boolean(
        hasCompleteAddress &&
        shippingCalculation &&
        (shippingCalculation.shippingType === 'DOMESTIC'
            ? selectedCourier !== null
            : shippingCalculation.options && shippingCalculation.options.length > 0)
    );

    return (
        <div className="container mx-auto px-4 py-6 md:py-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                    className="mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t.checkout.back}
                </Button>
                <h1 className="text-2xl md:text-3xl font-bold">{t.checkout.title}</h1>
                <p className="text-muted-foreground mt-1">
                    {t.checkout.reviewOrder}
                </p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column - Forms */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Address Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <AddressSection
                            user={{
                                firstName: user.first_name || '',
                                lastName: user.last_name || '',
                                email: user.email || '',
                                phoneNumber: user.phone_number,
                                country: user.country || '',
                                province: user.province,
                                city: user.city,
                                district: user.district,
                                postalCode: user.postal_code,
                                address: user.address,
                            }}
                            hasCompleteAddress={Boolean(hasCompleteAddress)}
                        />
                    </motion.div>

                    {/* Shipping Section */}
                    {hasCompleteAddress && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <ShippingSection
                                isCalculating={isCalculatingShipping}
                                calculation={shippingCalculation}
                                selectedCourier={selectedCourier}
                                onSelectCourier={setSelectedCourier}
                                currency={currency}
                            />
                        </motion.div>
                    )}

                    {/* Payment Section */}
                    {hasCompleteAddress && canCheckout && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <PaymentSection country={user.country || ''} />
                        </motion.div>
                    )}
                </div>

                {/* Right Column - Order Summary */}
                <div className="lg:col-span-1">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <OrderSummary
                            cart={cart}
                            currency={currency}
                            subtotal={subtotal}
                            selectedCourier={selectedCourier}
                            internationalShippingCost={
                                shippingCalculation?.shippingType === 'INTERNATIONAL' && shippingCalculation.options?.[0]
                                    ? shippingCalculation.options[0].cost
                                    : null
                            }
                        />

                        {/* Checkout Button */}
                        {hasCompleteAddress && (
                            <div className="mt-6 space-y-3">
                                <Button
                                    className="w-full"
                                    size="lg"
                                    onClick={createOrder}
                                    disabled={!canCheckout || isCreatingOrder}
                                >
                                    {isCreatingOrder ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            {t.checkout.processing}
                                        </>
                                    ) : (
                                        t.checkout.payNow
                                    )}
                                </Button>

                                <p className="text-xs text-center text-muted-foreground">
                                    {t.checkout.termsAgreement}
                                </p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
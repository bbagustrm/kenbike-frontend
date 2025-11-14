// app/(public)/checkout/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { useCheckout } from '@/hooks/use-checkout';
import { useTranslation } from '@/hooks/use-translation';
import { CheckoutStepper } from '@/components/checkout/checkout-stepper';
import { CartReview } from '@/components/checkout/cart-review';
import { ShippingCalculator } from '@/components/checkout/shipping-calculator';
import { ShippingAddressForm } from '@/components/checkout/shipping-address-form';
import { OrderSummary } from '@/components/checkout/order-summary';
import { determineCurrency } from '@/lib/payment-utils';
import { EmptyState } from '@/components/ui/empty-state';
import { toast } from 'sonner';

interface ShippingAddressData {
    recipientName: string;
    recipientPhone: string;
    shippingAddress: string;
    shippingCity: string;
    shippingProvince: string;
    shippingCountry: string;
    shippingPostalCode: string;
    shippingNotes: string;
}

export default function CheckoutPage() {
    const router = useRouter();
    const { locale } = useTranslation();

    const {
        state,
        shippingOptions,
        isCalculating,
        isCreatingOrder,
        hasItems,
        cartItems,
        calculateShipping,
        selectShipping,
        goToNextStep,
        goToPreviousStep,
        setShippingType,
        createOrder,
    } = useCheckout();

    // Ganti any dengan ShippingAddressData
    const [addressData, setAddressData] = useState<ShippingAddressData | null>(null);

    // Redirect if cart is empty
    useEffect(() => {
        if (!hasItems) {
            toast.error(locale === 'id' ? 'Keranjang kosong' : 'Cart is empty');
            router.push('/');
        }
    }, [hasItems, router, locale]);

    if (!hasItems) {
        return (
            <div className="container mx-auto px-4 py-12">
                <EmptyState
                    title={locale === 'id' ? 'Keranjang Kosong' : 'Cart is Empty'}
                    description={locale === 'id' ? 'Tambahkan produk ke keranjang terlebih dahulu' : 'Add products to cart first'}
                />
            </div>
        );
    }

    const currency = determineCurrency(state.shippingType);

    const handleNext = () => {
        if (state.currentStep === 'address') {
            // Validate address data
            if (!addressData?.recipientName || !addressData?.recipientPhone || !addressData?.shippingAddress) {
                toast.error(locale === 'id' ? 'Lengkapi alamat pengiriman' : 'Complete shipping address');
                return;
            }
            // Create order
            createOrder(addressData);
        } else {
            goToNextStep();
        }
    };

    const canProceed = () => {
        if (state.currentStep === 'review') return true;
        if (state.currentStep === 'shipping') return !!state.selectedShipping;
        if (state.currentStep === 'address') return !!addressData?.recipientName;
        return false;
    };

    return (
        <div className="min-h-screen bg-muted/30 py-8">
            <div className="container mx-auto px-4">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => state.currentStep === 'review' ? router.push('/') : goToPreviousStep()}
                    className="mb-4"
                >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    {locale === 'id' ? 'Kembali' : 'Back'}
                </Button>

                {/* Stepper */}
                <CheckoutStepper currentStep={state.currentStep} locale={locale} />

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                    {/* Left: Steps Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {state.currentStep === 'review' && (
                            <CartReview items={cartItems} locale={locale} />
                        )}

                        {state.currentStep === 'shipping' && (
                            <ShippingCalculator
                                shippingType={state.shippingType}
                                shippingOptions={shippingOptions}
                                selectedShipping={state.selectedShipping}
                                isCalculating={isCalculating}
                                locale={locale}
                                onShippingTypeChange={setShippingType}
                                onCalculate={calculateShipping}
                                onSelectShipping={selectShipping}
                            />
                        )}

                        {state.currentStep === 'address' && (
                            <ShippingAddressForm
                                shippingType={state.shippingType}
                                locale={locale}
                                onDataChange={setAddressData}
                            />
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            {state.currentStep !== 'review' && (
                                <Button
                                    variant="outline"
                                    onClick={goToPreviousStep}
                                    disabled={isCreatingOrder}
                                    className="flex-1"
                                >
                                    {locale === 'id' ? 'Sebelumnya' : 'Previous'}
                                </Button>
                            )}

                            <Button
                                onClick={handleNext}
                                disabled={!canProceed() || isCreatingOrder}
                                className="flex-1"
                            >
                                {isCreatingOrder ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        {locale === 'id' ? 'Membuat Pesanan...' : 'Creating Order...'}
                                    </>
                                ) : state.currentStep === 'address' ? (
                                    locale === 'id' ? 'Buat Pesanan' : 'Create Order'
                                ) : (
                                    locale === 'id' ? 'Lanjutkan' : 'Continue'
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Right: Order Summary */}
                    <div className="lg:col-span-1">
                        <OrderSummary
                            items={cartItems}
                            selectedShipping={state.selectedShipping}
                            currency={currency}
                            locale={locale}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
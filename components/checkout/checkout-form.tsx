// components/checkout/checkout-form.tsx
"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { useOrder } from "@/contexts/order-context";
import { useTranslation } from "@/hooks/use-translation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import { ShippingAddressDisplay } from "./shipping-address-display";
import { ShippingCalculator } from "./shipping-calculator";
import { OrderSummary } from "./order-summary";
import { PaymentMethodDisplay } from "./payment-method-display";
import { SelectedShippingMethod } from "@/types/shipping";
import { PaymentMethod, Currency } from "@/types/payment";
import { CreateOrderDto } from "@/types/order";
import { Loader2, ArrowRight, AlertCircle, Banknote, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { isIndonesia } from "@/lib/countries";

export function CheckoutForm() {
    const { t, locale } = useTranslation();
    const { user } = useAuth();
    const { cartItemsCount, clearCart } = useCart();
    const { createOrder, isCreatingOrder } = useOrder();

    // Auto-detect currency and payment method based on user's country
    const { currency, paymentMethod } = useMemo(() => {
        const isDomestic = isIndonesia(user?.country || "");
        return {
            currency: isDomestic ? "IDR" as Currency : "USD" as Currency,
            paymentMethod: isDomestic ? "MIDTRANS_SNAP" as PaymentMethod : "PAYPAL" as PaymentMethod,
        };
    }, [user?.country]);

    // Shipping state
    const [selectedShipping, setSelectedShipping] = useState<SelectedShippingMethod | null>(null);

    // Check if address is complete
    const isAddressComplete = useMemo(() => {
        if (!user) return false;

        const required = [
            user.address,
            user.city,
            user.postal_code,
            user.country,
        ];

        const isDomestic = isIndonesia(user.country || "");
        if (isDomestic) {
            required.push(user.province || "");
        }

        return required.every((field) => field && field.trim().length > 0);
    }, [user]);

    // Validation errors
    const [errors, setErrors] = useState<string[]>([]);

    // Validate before submission
    const validateForm = (): boolean => {
        const newErrors: string[] = [];

        if (!isAddressComplete) {
            newErrors.push(t.checkout?.pleaseCompleteAddress || "Please complete your shipping address");
        }

        if (!selectedShipping) {
            newErrors.push(t.checkout?.pleaseSelectShipping || "Please select a shipping method");
        }

        setErrors(newErrors);
        return newErrors.length === 0;
    };

    const handleCreateOrder = async () => {
        if (!validateForm()) {
            toast.error(t.checkout?.pleaseFixErrors || "Please fix the errors before continuing");
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }

        if (!selectedShipping || !user) {
            toast.error(t.checkout?.missingInfo || "Missing required information");
            return;
        }

        try {
            const recipientName = `${user.first_name} ${user.last_name}`.trim();

            const orderData: CreateOrderDto = {
                recipient_name: recipientName,
                recipient_phone: user.phone_number || "",
                shipping_address: user.address || "",
                shipping_city: user.city || "",
                shipping_province: user.province,
                shipping_country: user.country || "",
                shipping_postal_code: user.postal_code || "",
                shipping_notes: "",
                shipping_type: selectedShipping.type,
                currency,
            };

            // Add shipping method details based on type
            if (selectedShipping.type === "DOMESTIC") {
                orderData.biteship_courier = selectedShipping.option.courier;
                orderData.biteship_service = selectedShipping.option.service;
                orderData.biteship_price_id = selectedShipping.option.biteshipPriceId;
            } else {
                orderData.shipping_zone_id = selectedShipping.option.zoneId;
            }

            console.log('🟢 Creating order:', orderData);

            const order = await createOrder(orderData);

            console.log('🟢 Order created:', order);

            // Clear cart
            try {
                await clearCart();
            } catch (cartError) {
                console.error('Cart clear failed:', cartError);
            }

            // Redirect to order page for payment
            window.location.href = `/user/orders/${order.order_number}`;

        } catch (error) {
            console.error("Failed to create order:", error);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-6">
                {/* Error Summary */}
                {errors.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                <p className="font-semibold mb-2">
                                    {locale === "id" ? "Mohon perbaiki yang berikut:" : "Please fix the following:"}
                                </p>
                                <ul className="list-disc list-inside space-y-1">
                                    {errors.map((error, index) => (
                                        <li key={index}>{error}</li>
                                    ))}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    </motion.div>
                )}

                {/* Shipping Address */}
                <ScrollReveal delay={0.1}>
                    <Card>
                        <CardHeader>
                            <CardTitle>{t.checkout?.shippingAddress || "Shipping Address"}</CardTitle>
                            <CardDescription>
                                {t.checkout?.shippingAddressDesc || "Your order will be delivered to this address"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ShippingAddressDisplay disabled={isCreatingOrder} />
                        </CardContent>
                    </Card>
                </ScrollReveal>

                {/* Shipping Method */}
                <ScrollReveal delay={0.2}>
                    <Card>
                        <CardHeader>
                            <CardTitle>{t.checkout?.shippingMethod || "Shipping Method"}</CardTitle>
                            <CardDescription>
                                {t.checkout?.shippingMethodDesc || "Choose your preferred delivery option"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ShippingCalculator
                                currency={currency}
                                onSelect={setSelectedShipping}
                                selected={selectedShipping}
                                disabled={isCreatingOrder}
                            />
                        </CardContent>
                    </Card>
                </ScrollReveal>

                {/* Payment Method */}
                <ScrollReveal delay={0.3}>
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>{t.checkout?.paymentMethod || "Payment Method"}</CardTitle>
                                    <CardDescription>
                                        {t.checkout?.paymentMethodDesc || "Auto-selected based on your location"}
                                    </CardDescription>
                                </div>
                                <Badge variant="outline" className="gap-1">
                                    {currency === "IDR" ? (
                                        <Banknote className="h-3 w-3" />
                                    ) : (
                                        <DollarSign className="h-3 w-3" />
                                    )}
                                    {currency}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <PaymentMethodDisplay currency={currency} />
                        </CardContent>
                    </Card>
                </ScrollReveal>
            </div>

            {/* Right Column - Order Summary (Sticky) */}
            <div className="lg:col-span-1">
                <ScrollReveal delay={0.4}>
                    <div className="sticky top-24">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t.checkout?.orderSummary || "Order Summary"}</CardTitle>
                                <CardDescription>
                                    {cartItemsCount} {cartItemsCount === 1 ? (t.common?.item || "item") : (t.common?.items || "items")}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <OrderSummary
                                    currency={currency}
                                    shippingCost={selectedShipping?.cost || 0}
                                />

                                <Button
                                    className="w-full mt-6"
                                    size="lg"
                                    onClick={handleCreateOrder}
                                    disabled={isCreatingOrder || !selectedShipping || !isAddressComplete}
                                >
                                    {isCreatingOrder ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {t.checkout?.creatingOrder || "Creating Order..."}
                                        </>
                                    ) : (
                                        <>
                                            {t.checkout?.continueToPayment || "Continue to Payment"}
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>

                                {!isAddressComplete && (
                                    <p className="text-xs text-destructive text-center mt-2">
                                        {t.checkout?.pleaseCompleteAddress || "Please complete your shipping address"}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </ScrollReveal>
            </div>
        </div>
    );
}
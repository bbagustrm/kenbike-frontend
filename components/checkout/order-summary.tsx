// components/checkout/order-summary.tsx - FINAL WITH LOCALIZED PRICES
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Cart } from '@/types/cart';
import { ShippingOption } from '@/types/order';
import { useTranslation } from '@/hooks/use-translation';
import { formatCurrency, formatLocalizedPrice, getCurrencyFromLocale } from '@/lib/format-currency';

interface OrderSummaryProps {
    cart: Cart | null;
    currency: 'IDR' | 'USD';
    subtotal: number;
    selectedCourier: ShippingOption | null;
    internationalShippingCost: number | null;
}

export function OrderSummary({
                                 cart,
                                 currency,
                                 subtotal,
                                 selectedCourier,
                                 internationalShippingCost,
                             }: OrderSummaryProps) {
    const { t, locale } = useTranslation();

    if (!cart || cart.items.length === 0) {
        return null;
    }

    const shippingCost = selectedCourier?.cost || internationalShippingCost || 0;
    const taxRate = 0.11; // 11% PPN
    const tax = Math.round((subtotal + shippingCost) * taxRate);
    const total = subtotal + shippingCost + tax;

    return (
        <Card className="sticky top-4">
            <CardHeader>
                <CardTitle>{t.checkout.orderSummary}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3">
                    {cart.items.map((item) => (
                        <div key={item.id} className="flex gap-3">
                            {/* Product Image */}
                            <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                                {item.product.imageUrl && (
                                    <img
                                        src={item.product.imageUrl}
                                        alt={item.product.name}
                                        className="object-cover w-full h-full"
                                    />
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium line-clamp-1">
                                    {item.product.name}
                                </p>
                                {item.variant && (
                                    <p className="text-xs text-muted-foreground">
                                        {item.variant.variantName}
                                    </p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Qty: {item.quantity}
                                </p>
                            </div>

                            {/* Price - Localized */}
                            <div className="text-sm font-medium">
                                {formatLocalizedPrice(
                                    item.product.idPrice * item.quantity,
                                    item.product.enPrice * item.quantity,
                                    locale
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <Separator />

                {/* Subtotal */}
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t.checkout.subtotal}</span>
                    <span className="font-medium">{formatCurrency(subtotal, currency)}</span>
                </div>

                {/* Shipping */}
                {shippingCost > 0 && (
                    <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t.checkout.shipping}</span>
                            <span className="font-medium">{formatCurrency(shippingCost, currency)}</span>
                        </div>
                        {selectedCourier && (
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>{selectedCourier.serviceName}</span>
                                <span>
                                    {selectedCourier.estimatedDays.min === selectedCourier.estimatedDays.max
                                        ? `${selectedCourier.estimatedDays.min} ${t.checkout.day}`
                                        : `${selectedCourier.estimatedDays.min}-${selectedCourier.estimatedDays.max} ${t.checkout.days}`}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Tax */}
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t.checkout.tax} (11%)</span>
                    <span className="font-medium">{formatCurrency(tax, currency)}</span>
                </div>

                <Separator />

                {/* Total */}
                <div className="flex justify-between">
                    <span className="text-base font-semibold">{t.checkout.total}</span>
                    <span className="text-lg font-bold">{formatCurrency(total, currency)}</span>
                </div>
            </CardContent>
        </Card>
    );
}
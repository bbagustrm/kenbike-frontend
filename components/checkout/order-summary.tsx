// components/checkout/order-summary.tsx
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Cart } from '@/types/cart';
import { ShippingRate } from '@/types/order';
import { formatCurrency } from '@/lib/format-currency';

interface OrderSummaryProps {
    cart: Cart | null;
    currency: string;
    subtotal: number;
    selectedCourier: ShippingRate | null;
    internationalShippingCost: number | null;
}

export function OrderSummary({
                                 cart,
                                 currency,
                                 subtotal,
                                 selectedCourier,
                                 internationalShippingCost,
                             }: OrderSummaryProps) {
    if (!cart || cart.items.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5" />
                        Order Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground py-8">
                        Your cart is empty
                    </p>
                </CardContent>
            </Card>
        );
    }

    const shippingCost = selectedCourier?.price || internationalShippingCost || 0;
    const total = subtotal + shippingCost;

    return (
        <Card className="sticky top-24">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    Order Summary
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Cart Items */}
                <ScrollArea className="max-h-[300px]">
                    <div className="space-y-3 pr-4">
                        {cart.items.map((item) => {
                            const imageUrl = item.variant.imageUrl || item.product.imageUrl || '/placeholder.png';
                            const price = currency === 'IDR' ? item.product.idPrice : item.product.enPrice;
                            const discount = item.product.promotion?.isActive
                                ? item.product.promotion.discount
                                : 0;
                            const finalPrice = price * (1 - discount);

                            return (
                                <div key={item.id} className="flex gap-3">
                                    <Link
                                        href={`/products/${item.product.slug}`}
                                        className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden"
                                    >
                                        <Image
                                            src={imageUrl}
                                            alt={item.product.name}
                                            fill
                                            className="object-cover"
                                        />
                                        {discount > 0 && (
                                            <Badge
                                                variant="destructive"
                                                className="absolute -top-1 -right-1 text-xs px-1"
                                            >
                                                -{Math.round(discount * 100)}%
                                            </Badge>
                                        )}
                                    </Link>
                                    <div className="flex-1 min-w-0">
                                        <Link
                                            href={`/products/${item.product.slug}`}
                                            className="text-sm font-medium line-clamp-1 hover:underline"
                                        >
                                            {item.product.name}
                                        </Link>
                                        <p className="text-xs text-muted-foreground">
                                            {item.variant.variantName}
                                        </p>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-xs text-muted-foreground">
                                                Qty: {item.quantity}
                                            </span>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold">
                                                    {formatCurrency(finalPrice * item.quantity, currency)}
                                                </p>
                                                {discount > 0 && (
                                                    <p className="text-xs text-muted-foreground line-through">
                                                        {formatCurrency(price * item.quantity, currency)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                            Subtotal ({cart.summary.totalQuantity} items)
                        </span>
                        <span className="font-medium">
                            {formatCurrency(subtotal, currency)}
                        </span>
                    </div>

                    {shippingCost > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Shipping</span>
                            <span className="font-medium">
                                {formatCurrency(shippingCost, currency)}
                            </span>
                        </div>
                    )}

                    {shippingCost === 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Shipping</span>
                            <span className="text-yellow-600 dark:text-yellow-400">
                                Select courier
                            </span>
                        </div>
                    )}
                </div>

                <Separator />

                {/* Total */}
                <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold">
                        {formatCurrency(total, currency)}
                    </span>
                </div>

                {/* Tax Note */}
                <p className="text-xs text-muted-foreground text-center">
                    Tax included in product prices
                </p>
            </CardContent>
        </Card>
    );
}
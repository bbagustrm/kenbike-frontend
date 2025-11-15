// components/checkout/cart-review.tsx
"use client";

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/payment-utils';
import { CheckoutCartItem } from '@/types/checkout';

interface CartReviewProps {
    items: CheckoutCartItem[];
    locale?: 'id' | 'en';
}

export function CartReview({ items, locale = 'en' }: CartReviewProps) {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold">
                {locale === 'id' ? 'Review Pesanan Anda' : 'Review Your Order'}
            </h2>

            <div className="space-y-3">
                {items.map((item, index) => {
                    const price = locale === 'id' ? item.product.idPrice : item.product.enPrice;
                    const hasPromotion = item.product.promotion?.isActive;
                    const discount = hasPromotion ? item.product.promotion!.discount : 0;
                    const finalPrice = price * (1 - discount);
                    const subtotal = finalPrice * item.quantity;

                    const displayImage = item.variant.imageUrl || item.product.imageUrl;

                    return (
                        <Card key={index}>
                            <CardContent className="p-4">
                                <div className="flex gap-4">
                                    {/* Product Image */}
                                    <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                                        {displayImage ? (
                                            <Image
                                                src={displayImage}
                                                alt={item.product.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                No Image
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-sm line-clamp-2">
                                            {item.product.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {item.variant.variantName}
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {locale === 'id' ? 'Jumlah' : 'Qty'}: {item.quantity}
                                        </p>
                                    </div>

                                    {/* Price */}
                                    <div className="text-right">
                                        {hasPromotion ? (
                                            <>
                                                <p className="text-xs text-muted-foreground line-through">
                                                    {formatCurrency(price * item.quantity, locale === 'id' ? 'IDR' : 'USD')}
                                                </p>
                                                <p className="text-sm font-bold">
                                                    {formatCurrency(subtotal, locale === 'id' ? 'IDR' : 'USD')}
                                                </p>
                                            </>
                                        ) : (
                                            <p className="text-sm font-bold">
                                                {formatCurrency(subtotal, locale === 'id' ? 'IDR' : 'USD')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
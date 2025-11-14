// components/order/order-card.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OrderStatusBadge } from './order-status-badge';
import { Order } from '@/types/order';
import { formatCurrency } from '@/lib/payment-utils';
import { formatOrderNumber } from '@/lib/order-utils';
import { ChevronRight } from 'lucide-react';

interface OrderCardProps {
    order: Order;
    locale?: 'id' | 'en';
}

export function OrderCard({ order, locale = 'en' }: OrderCardProps) {
    const firstItem = order.items[0];
    const remainingCount = order.items.length - 1;

    return (
        <Link href={`/orders/${order.orderNumber}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                    <div className="flex gap-4">
                        {/* First Product Image */}
                        <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                            {firstItem.productImage ? (
                                <Image
                                    src={firstItem.productImage}
                                    alt={firstItem.productName}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                    No Image
                                </div>
                            )}
                            {remainingCount > 0 && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">
                    +{remainingCount} {locale === 'id' ? 'lainnya' : 'more'}
                  </span>
                                </div>
                            )}
                        </div>

                        {/* Order Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div>
                                    <p className="font-semibold text-sm">
                                        {formatOrderNumber(order.orderNumber)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(order.createdAt).toLocaleDateString(
                                            locale === 'id' ? 'id-ID' : 'en-US',
                                            { day: 'numeric', month: 'long', year: 'numeric' }
                                        )}
                                    </p>
                                </div>
                                <OrderStatusBadge status={order.status} locale={locale} />
                            </div>

                            <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                                {firstItem.productName}
                                {remainingCount > 0 && ` (+${remainingCount})`}
                            </p>

                            <div className="flex items-center justify-between mt-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        {locale === 'id' ? 'Total' : 'Total'}
                                    </p>
                                    <p className="font-bold text-primary">
                                        {formatCurrency(order.total, order.currency)}
                                    </p>
                                </div>

                                <Button variant="ghost" size="sm">
                                    {locale === 'id' ? 'Lihat Detail' : 'View Details'}
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
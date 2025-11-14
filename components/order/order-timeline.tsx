// components/order/order-timeline.tsx
"use client";

import { Order } from '@/types/order';
import { getStatusConfig } from '@/lib/order-utils';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle } from 'lucide-react';

type OrderStatus = 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' | 'FAILED';

interface OrderTimelineProps {
    order: Order;
    locale?: 'id' | 'en';
}

export function OrderTimeline({ order, locale = 'en' }: OrderTimelineProps) {
    // Define timeline steps based on order status
    const getTimelineSteps = () => {
        const steps = [
            {
                status: 'PENDING' as OrderStatus,
                label: locale === 'id' ? 'Pesanan Dibuat' : 'Order Created',
                timestamp: order.createdAt,
                completed: true,
            },
            {
                status: 'PAID' as OrderStatus,
                label: locale === 'id' ? 'Pembayaran Dikonfirmasi' : 'Payment Confirmed',
                timestamp: order.paidAt,
                completed: !!order.paidAt,
            },
            {
                status: 'PROCESSING' as OrderStatus,
                label: locale === 'id' ? 'Pesanan Diproses' : 'Order Processing',
                timestamp: order.paidAt, // Use paidAt as proxy for processing start
                completed: ['PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED'].includes(order.status),
            },
            {
                status: 'SHIPPED' as OrderStatus,
                label: locale === 'id' ? 'Pesanan Dikirim' : 'Order Shipped',
                timestamp: order.shippedAt,
                completed: !!order.shippedAt,
            },
            {
                status: 'DELIVERED' as OrderStatus,
                label: locale === 'id' ? 'Pesanan Sampai' : 'Order Delivered',
                timestamp: order.deliveredAt,
                completed: !!order.deliveredAt,
            },
            {
                status: 'COMPLETED' as OrderStatus,
                label: locale === 'id' ? 'Pesanan Selesai' : 'Order Completed',
                timestamp: order.completedAt,
                completed: !!order.completedAt,
            },
        ];

        // Filter out steps for cancelled orders
        if (order.status === 'CANCELLED') {
            return [
                {
                    status: 'PENDING' as OrderStatus,
                    label: locale === 'id' ? 'Pesanan Dibuat' : 'Order Created',
                    timestamp: order.createdAt,
                    completed: true,
                },
                {
                    status: 'CANCELLED' as OrderStatus,
                    label: locale === 'id' ? 'Pesanan Dibatalkan' : 'Order Cancelled',
                    timestamp: order.canceledAt,
                    completed: true,
                },
            ];
        }

        // Filter out steps for failed orders
        if (order.status === 'FAILED') {
            return [
                {
                    status: 'PENDING' as OrderStatus,
                    label: locale === 'id' ? 'Pesanan Dibuat' : 'Order Created',
                    timestamp: order.createdAt,
                    completed: true,
                },
                {
                    status: 'FAILED' as OrderStatus,
                    label: locale === 'id' ? 'Pembayaran Gagal' : 'Payment Failed',
                    timestamp: order.updatedAt,
                    completed: true,
                },
            ];
        }

        return steps;
    };

    const steps = getTimelineSteps();

    const formatTimestamp = (timestamp?: string | null) => {
        if (!timestamp) return null;

        return new Date(timestamp).toLocaleString(
            locale === 'id' ? 'id-ID' : 'en-US',
            {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }
        );
    };

    return (
        <div className="space-y-4">
            {steps.map((step, index) => {
                const isLast = index === steps.length - 1;
                // Ganti any dengan OrderStatus
                const config = getStatusConfig(step.status as OrderStatus, locale);

                return (
                    <div key={step.status} className="flex gap-4">
                        {/* Icon & Line */}
                        <div className="flex flex-col items-center">
                            <div
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                                    step.completed
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground"
                                )}
                            >
                                {step.completed ? (
                                    <CheckCircle2 className="w-5 h-5" />
                                ) : (
                                    <Circle className="w-5 h-5" />
                                )}
                            </div>
                            {!isLast && (
                                <div
                                    className={cn(
                                        "w-0.5 h-12 transition-colors",
                                        step.completed ? "bg-primary" : "bg-muted"
                                    )}
                                />
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-8">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h4
                                        className={cn(
                                            "font-semibold",
                                            step.completed ? "text-foreground" : "text-muted-foreground"
                                        )}
                                    >
                                        {step.label}
                                    </h4>
                                    {step.timestamp && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {formatTimestamp(step.timestamp)}
                                        </p>
                                    )}
                                </div>
                                {step.completed && (
                                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                    {config.icon}
                  </span>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
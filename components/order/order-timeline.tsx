// components/order/order-timeline.tsx
"use client";

import { Order, OrderStatus } from "@/types/order";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import {
    Clock,
    CheckCircle2,
    Package,
    Truck,
    Home,
    CircleCheck,
} from "lucide-react";

interface OrderTimelineProps {
    order: Order;
}

interface TimelineStep {
    status: OrderStatus;
    label: string;
    icon: typeof Clock;
    date?: string | null;
}

export function OrderTimeline({ order }: OrderTimelineProps) {
    const { t, locale } = useTranslation();

    // Handle both flat and nested timestamps
    const getTimestamp = (flat?: string | null, nested?: string | null): string | null | undefined => {
        return flat ?? nested;
    };

    const steps: TimelineStep[] = [
        {
            status: "PENDING",
            label: t.orders?.timeline?.orderPlaced || (locale === "id" ? "Pesanan Dibuat" : "Order Placed"),
            icon: Clock,
            date: getTimestamp(order.created_at, order.timestamps?.created_at),
        },
        {
            status: "PAID",
            label: t.orders?.timeline?.paymentConfirmed || (locale === "id" ? "Pembayaran Dikonfirmasi" : "Payment Confirmed"),
            icon: CheckCircle2,
            date: getTimestamp(order.paid_at, order.timestamps?.paid_at),
        },
        {
            status: "PROCESSING",
            label: t.orders?.timeline?.processing || (locale === "id" ? "Sedang Diproses" : "Processing"),
            icon: Package,
        },
        {
            status: "SHIPPED",
            label: t.orders?.timeline?.shipped || (locale === "id" ? "Dikirim" : "Shipped"),
            icon: Truck,
            date: getTimestamp(order.shipped_at, order.timestamps?.shipped_at),
        },
        {
            status: "DELIVERED",
            label: t.orders?.timeline?.delivered || (locale === "id" ? "Terkirim" : "Delivered"),
            icon: Home,
            date: getTimestamp(order.delivered_at, order.timestamps?.delivered_at),
        },
        {
            status: "COMPLETED",
            label: t.orders?.timeline?.completed || (locale === "id" ? "Selesai" : "Completed"),
            icon: CircleCheck,
            date: getTimestamp(order.completed_at, order.timestamps?.completed_at),
        },
    ];

    // Determine current step index
    const statusOrder: OrderStatus[] = [
        "PENDING",
        "PAID",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "COMPLETED",
    ];
    const currentIndex = statusOrder.indexOf(order.status);

    // Handle cancelled/failed orders
    if (order.status === "CANCELLED" || order.status === "FAILED") {
        const cancelDate = getTimestamp(
            order.canceled_at,
            order.timestamps?.canceled_at
        ) || order.updated_at || order.timestamps?.updated_at || order.created_at;

        const statusText = order.status.toLowerCase();
        const cancelledText = (t.orders?.timeline?.cancelledOn || "Order {status} on")
            .replace("{status}", statusText);

        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm font-medium text-red-800">
                    {cancelledText}{" "}
                    {new Date(cancelDate).toLocaleDateString(locale === "id" ? "id-ID" : "en-US")}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {steps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index <= currentIndex;
                const isCurrent = index === currentIndex;

                return (
                    <div key={step.status} className="flex gap-4">
                        {/* Icon & Line */}
                        <div className="flex flex-col items-center">
                            <div
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                                    isCompleted
                                        ? "bg-primary border-primary text-primary-foreground"
                                        : "bg-muted border-muted-foreground/20 text-muted-foreground"
                                )}
                            >
                                <Icon className="h-5 w-5" />
                            </div>
                            {index < steps.length - 1 && (
                                <div
                                    className={cn(
                                        "w-0.5 h-12 transition-colors",
                                        isCompleted && !isCurrent
                                            ? "bg-primary"
                                            : "bg-muted-foreground/20"
                                    )}
                                />
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-6">
                            <p
                                className={cn(
                                    "font-semibold text-sm",
                                    isCompleted ? "text-foreground" : "text-muted-foreground"
                                )}
                            >
                                {step.label}
                            </p>
                            {step.date && isCompleted && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    {new Date(step.date).toLocaleDateString(locale === "id" ? "id-ID" : "en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                            )}
                            {isCurrent && (
                                <p className="text-xs text-primary mt-1">
                                    {t.orders?.timeline?.currentStatus || (locale === "id" ? "Status Saat Ini" : "Current Status")}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
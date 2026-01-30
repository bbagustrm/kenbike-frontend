// components/admin/order/order-stats-cards.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderListItem } from "@/types/order";
import { formatCurrency } from "@/lib/format-currency";
import {
    Package,
    DollarSign,
    TrendingUp,
    Clock,
    CheckCircle2,
    Truck,
    XCircle,
} from "lucide-react";

interface OrderStatsCardsProps {
    orders: OrderListItem[];
}

export function OrderStatsCards({ orders }: OrderStatsCardsProps) {
    // Calculate stats
    const stats = {
        total: orders.length,
        totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
        pending: orders.filter((o) => o.status === "PENDING").length,
        paid: orders.filter((o) => o.status === "PAID").length,
        processing: orders.filter((o) => o.status === "PROCESSING").length,
        shipped: orders.filter((o) => o.status === "SHIPPED").length,
        completed: orders.filter((o) => o.status === "COMPLETED").length,
        cancelled: orders.filter(
            (o) => o.status === "CANCELLED" || o.status === "FAILED"
        ).length,
    };

    const cards = [
        {
            title: "Total Orders",
            value: stats.total,
            icon: Package,
            color: "text-blue-600",
            bgColor: "bg-blue-100",
        },
        {
            title: "Total Revenue",
            value: formatCurrency(stats.totalRevenue, "IDR"),
            icon: DollarSign,
            color: "text-green-600",
            bgColor: "bg-green-100",
        },
        {
            title: "Pending Payment",
            value: stats.pending,
            icon: Clock,
            color: "text-yellow-600",
            bgColor: "bg-yellow-100",
        },
        {
            title: "Processing",
            value: stats.processing,
            icon: TrendingUp,
            color: "text-purple-600",
            bgColor: "bg-purple-100",
        },
        {
            title: "Shipped",
            value: stats.shipped,
            icon: Truck,
            color: "text-indigo-600",
            bgColor: "bg-indigo-100",
        },
        {
            title: "Completed",
            value: stats.completed,
            icon: CheckCircle2,
            color: "text-teal-600",
            bgColor: "bg-teal-100",
        },
        {
            title: "Cancelled/Failed",
            value: stats.cancelled,
            icon: XCircle,
            color: "text-red-600",
            bgColor: "bg-red-100",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, index) => {
                const Icon = card.icon;
                return (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {card.title}
                            </CardTitle>
                            <div className={`p-2 rounded-full ${card.bgColor}`}>
                                <Icon className={`h-4 w-4 ${card.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {typeof card.value === "number" && card.title !== "Total Revenue"
                                    ? card.value.toLocaleString()
                                    : card.value}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
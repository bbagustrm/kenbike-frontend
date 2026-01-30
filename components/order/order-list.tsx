// components/order/order-list.tsx
"use client";

import { OrderListItem } from "@/types/order";
import { OrderCard } from "./order-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface OrderListProps {
    orders: OrderListItem[];
    isLoading?: boolean;
}

export function OrderList({ orders, isLoading }: OrderListProps) {
    const router = useRouter();

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
                ))}
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <EmptyState
                icon={<PackageOpen className="h-10 w-10 text-muted-foreground" />}
                title="No orders found"
                description="You haven't placed any orders yet or no orders match your filters"
            >
                <Button onClick={() => router.push("/search")} className="mt-4">
                    Start Shopping
                </Button>
            </EmptyState>
        );
    }

    return (
        <div className="space-y-4">
            {orders.map((order, index) => (
                <OrderCard key={order.id} order={order} index={index} />
            ))}
        </div>
    );
}
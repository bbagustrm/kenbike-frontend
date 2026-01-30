// components/order/order-status-badge.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { OrderStatus } from "@/types/order";
import {
    Clock,
    CheckCircle2,
    Package,
    Truck,
    Home,
    CircleCheck,
    XCircle,
    AlertCircle,
    LucideIcon,
} from "lucide-react";

interface OrderStatusBadgeProps {
    status: OrderStatus;
    className?: string;
}

interface StatusConfig {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    icon: LucideIcon;
    className?: string;
}

const STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
    PENDING: {
        label: "Pending Payment",
        variant: "secondary",
        icon: Clock,
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    PAID: {
        label: "Paid",
        variant: "default",
        icon: CheckCircle2,
        className: "bg-green-100 text-green-800 border-green-200",
    },
    PROCESSING: {
        label: "Processing",
        variant: "default",
        icon: Package,
        className: "bg-blue-100 text-blue-800 border-blue-200",
    },
    SHIPPED: {
        label: "Shipped",
        variant: "default",
        icon: Truck,
        className: "bg-purple-100 text-purple-800 border-purple-200",
    },
    DELIVERED: {
        label: "Delivered",
        variant: "default",
        icon: Home,
        className: "bg-teal-100 text-teal-800 border-teal-200",
    },
    COMPLETED: {
        label: "Completed",
        variant: "default",
        icon: CircleCheck,
        className: "bg-green-100 text-green-800 border-green-200",
    },
    CANCELLED: {
        label: "Cancelled",
        variant: "outline",
        icon: XCircle,
        className: "bg-gray-100 text-gray-800 border-gray-200",
    },
    FAILED: {
        label: "Failed",
        variant: "destructive",
        icon: AlertCircle,
        className: "bg-red-100 text-red-800 border-red-200",
    },
};

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
    const config = STATUS_CONFIG[status];
    const Icon = config.icon;

    return (
        <Badge variant={config.variant} className={`${config.className} ${className}`}>
            <Icon className="h-3 w-3 mr-1" />
            {config.label}
        </Badge>
    );
}
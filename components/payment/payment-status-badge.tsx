// components/payment/payment-status-badge.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { PaymentStatus } from "@/types/payment";
import {
    CheckCircle2,
    Clock,
    XCircle,
    AlertCircle,
    Ban,
    LucideIcon,
} from "lucide-react";

interface PaymentStatusBadgeProps {
    status: PaymentStatus;
    className?: string;
}

interface StatusConfig {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    icon: LucideIcon;
    className?: string;
}

const STATUS_CONFIG: Record<PaymentStatus, StatusConfig> = {
    PENDING: {
        label: "Pending",
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
    FAILED: {
        label: "Failed",
        variant: "destructive",
        icon: XCircle,
        className: "bg-red-100 text-red-800 border-red-200",
    },
    EXPIRED: {
        label: "Expired",
        variant: "outline",
        icon: AlertCircle,
        className: "bg-gray-100 text-gray-800 border-gray-200",
    },
    CANCELLED: {
        label: "Cancelled",
        variant: "outline",
        icon: Ban,
        className: "bg-gray-100 text-gray-800 border-gray-200",
    },
};

export function PaymentStatusBadge({
                                       status,
                                       className,
                                   }: PaymentStatusBadgeProps) {
    const config = STATUS_CONFIG[status];

    // Fallback for unknown status
    if (!config) {
        return (
            <Badge variant="outline" className={className}>
                {status}
            </Badge>
        );
    }

    const Icon = config.icon;

    return (
        <Badge variant={config.variant} className={`${config.className} ${className}`}>
            <Icon className="h-3 w-3 mr-1" />
            {config.label}
        </Badge>
    );
}
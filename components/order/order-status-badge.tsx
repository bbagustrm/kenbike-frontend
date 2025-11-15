// components/order/order-status-badge.tsx
"use client";

import { Badge } from '@/components/ui/badge';
import { OrderStatus } from '@/types/order';
import { getStatusConfig } from '@/lib/order-utils';
import { cn } from '@/lib/utils';

interface OrderStatusBadgeProps {
    status: OrderStatus;
    locale?: 'id' | 'en';
    showIcon?: boolean;
    className?: string;
}

export function OrderStatusBadge({
                                     status,
                                     locale = 'en',
                                     showIcon = true,
                                     className
                                 }: OrderStatusBadgeProps) {
    const config = getStatusConfig(status, locale);

    return (
        <Badge
            variant="outline"
            className={cn(
                "font-medium",
                config.color,
                config.bgColor,
                className
            )}
        >
            {showIcon && <span className="mr-1">{config.icon}</span>}
            {config.label}
        </Badge>
    );
}
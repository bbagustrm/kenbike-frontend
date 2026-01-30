// lib/order-status.ts

import { OrderStatus } from '@/types/order';
import {
    Clock,
    CheckCircle2,
    Package,
    Truck,
    XCircle,
    AlertCircle,
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

/**
 * Order status configuration
 */
export interface OrderStatusConfig {
    status: OrderStatus;
    color: string;
    bgClass: string;
    textClass: string;
    badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline';
    icon: LucideIcon;
    label: {
        en: string;
        id: string;
    };
    description: {
        en: string;
        id: string;
    };
}

/**
 * Order status configurations
 */
export const orderStatusConfig: Record<OrderStatus, OrderStatusConfig> = {
    PENDING: {
        status: 'PENDING',
        color: 'yellow',
        bgClass: 'bg-yellow-500',
        textClass: 'text-yellow-700 dark:text-yellow-400',
        badgeVariant: 'outline',
        icon: Clock,
        label: {
            en: 'Pending Payment',
            id: 'Menunggu Pembayaran',
        },
        description: {
            en: 'Waiting for payment confirmation',
            id: 'Menunggu konfirmasi pembayaran',
        },
    },
    PAID: {
        status: 'PAID',
        color: 'green',
        bgClass: 'bg-green-500',
        textClass: 'text-green-700 dark:text-green-400',
        badgeVariant: 'default',
        icon: CheckCircle2,
        label: {
            en: 'Paid',
            id: 'Dibayar',
        },
        description: {
            en: 'Payment received, preparing order',
            id: 'Pembayaran diterima, menyiapkan pesanan',
        },
    },
    PROCESSING: {
        status: 'PROCESSING',
        color: 'blue',
        bgClass: 'bg-blue-500',
        textClass: 'text-blue-700 dark:text-blue-400',
        badgeVariant: 'default',
        icon: Package,
        label: {
            en: 'Processing',
            id: 'Diproses',
        },
        description: {
            en: 'Order is being prepared',
            id: 'Pesanan sedang disiapkan',
        },
    },
    SHIPPED: {
        status: 'SHIPPED',
        color: 'purple',
        bgClass: 'bg-purple-500',
        textClass: 'text-purple-700 dark:text-purple-400',
        badgeVariant: 'default',
        icon: Truck,
        label: {
            en: 'Shipped',
            id: 'Dikirim',
        },
        description: {
            en: 'Order has been shipped',
            id: 'Pesanan telah dikirim',
        },
    },
    DELIVERED: {
        status: 'DELIVERED',
        color: 'green',
        bgClass: 'bg-green-500',
        textClass: 'text-green-700 dark:text-green-400',
        badgeVariant: 'default',
        icon: CheckCircle2,
        label: {
            en: 'Delivered',
            id: 'Terkirim',
        },
        description: {
            en: 'Order has been delivered',
            id: 'Pesanan telah sampai',
        },
    },
    COMPLETED: {
        status: 'COMPLETED',
        color: 'green',
        bgClass: 'bg-green-600',
        textClass: 'text-green-800 dark:text-green-300',
        badgeVariant: 'default',
        icon: CheckCircle2,
        label: {
            en: 'Completed',
            id: 'Selesai',
        },
        description: {
            en: 'Order completed',
            id: 'Pesanan selesai',
        },
    },
    CANCELLED: {
        status: 'CANCELLED',
        color: 'red',
        bgClass: 'bg-destructive',
        textClass: 'text-destructive',
        badgeVariant: 'destructive',
        icon: XCircle,
        label: {
            en: 'Cancelled',
            id: 'Dibatalkan',
        },
        description: {
            en: 'Order has been cancelled',
            id: 'Pesanan telah dibatalkan',
        },
    },
    FAILED: {
        status: 'FAILED',
        color: 'red',
        bgClass: 'bg-destructive',
        textClass: 'text-destructive',
        badgeVariant: 'destructive',
        icon: AlertCircle,
        label: {
            en: 'Failed',
            id: 'Gagal',
        },
        description: {
            en: 'Payment failed',
            id: 'Pembayaran gagal',
        },
    },
};

/**
 * Get status config
 */
export const getOrderStatusConfig = (status: OrderStatus): OrderStatusConfig => {
    return orderStatusConfig[status];
};

/**
 * Get status label
 */
export const getOrderStatusLabel = (status: OrderStatus, locale: 'en' | 'id' = 'en'): string => {
    return orderStatusConfig[status].label[locale];
};

/**
 * Get status description
 */
export const getOrderStatusDescription = (
    status: OrderStatus,
    locale: 'en' | 'id' = 'en'
): string => {
    return orderStatusConfig[status].description[locale];
};

/**
 * Check if order can be cancelled by user
 */
export const canCancelOrder = (status: OrderStatus): boolean => {
    return ['PENDING', 'FAILED'].includes(status);
};

/**
 * Check if order can be paid
 */
export const canPayOrder = (status: OrderStatus): boolean => {
    return status === 'PENDING' || status === 'FAILED';
};

/**
 * Check if order has tracking
 */
export const hasTracking = (status: OrderStatus): boolean => {
    return ['SHIPPED', 'DELIVERED', 'COMPLETED'].includes(status);
};

/**
 * Get next possible statuses (for admin)
 */
export const getNextStatuses = (currentStatus: OrderStatus): OrderStatus[] => {
    const transitions: Record<OrderStatus, OrderStatus[]> = {
        PENDING: ['PAID', 'CANCELLED', 'FAILED'],
        PAID: ['PROCESSING', 'CANCELLED'],
        PROCESSING: ['SHIPPED', 'CANCELLED'],
        SHIPPED: ['DELIVERED', 'CANCELLED'],
        DELIVERED: ['COMPLETED'],
        COMPLETED: [],
        CANCELLED: [],
        FAILED: ['PENDING'],
    };

    return transitions[currentStatus] || [];
};

/**
 * Check if status transition is valid (for admin)
 */
export const isValidStatusTransition = (
    from: OrderStatus,
    to: OrderStatus
): boolean => {
    const validTransitions = getNextStatuses(from);
    return validTransitions.includes(to);
};

/**
 * Get status progress percentage
 */
export const getStatusProgress = (status: OrderStatus): number => {
    const progressMap: Record<OrderStatus, number> = {
        PENDING: 0,
        PAID: 20,
        PROCESSING: 40,
        SHIPPED: 60,
        DELIVERED: 80,
        COMPLETED: 100,
        CANCELLED: 0,
        FAILED: 0,
    };

    return progressMap[status];
};
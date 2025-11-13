// lib/order-utils.ts

import { OrderStatus } from '@/types/order';

// Status Configuration
export const ORDER_STATUS_CONFIG: Record<
    OrderStatus,
    {
        label: string;
        labelId: string;
        color: string;
        bgColor: string;
        icon: string;
        description: string;
        descriptionId: string;
    }
> = {
    PENDING: {
        label: 'Pending Payment',
        labelId: 'Menunggu Pembayaran',
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-100',
        icon: '⏳',
        description: 'Waiting for payment',
        descriptionId: 'Menunggu pembayaran',
    },
    PAID: {
        label: 'Paid',
        labelId: 'Sudah Dibayar',
        color: 'text-green-700',
        bgColor: 'bg-green-100',
        icon: '✓',
        description: 'Payment confirmed',
        descriptionId: 'Pembayaran dikonfirmasi',
    },
    PROCESSING: {
        label: 'Processing',
        labelId: 'Diproses',
        color: 'text-blue-700',
        bgColor: 'bg-blue-100',
        icon: '📦',
        description: 'Order is being prepared',
        descriptionId: 'Pesanan sedang diproses',
    },
    SHIPPED: {
        label: 'Shipped',
        labelId: 'Dikirim',
        color: 'text-purple-700',
        bgColor: 'bg-purple-100',
        icon: '🚚',
        description: 'Order has been shipped',
        descriptionId: 'Pesanan telah dikirim',
    },
    DELIVERED: {
        label: 'Delivered',
        labelId: 'Terkirim',
        color: 'text-teal-700',
        bgColor: 'bg-teal-100',
        icon: '📬',
        description: 'Order has been delivered',
        descriptionId: 'Pesanan telah sampai',
    },
    COMPLETED: {
        label: 'Completed',
        labelId: 'Selesai',
        color: 'text-gray-700',
        bgColor: 'bg-gray-100',
        icon: '✅',
        description: 'Order completed',
        descriptionId: 'Pesanan selesai',
    },
    CANCELLED: {
        label: 'Cancelled',
        labelId: 'Dibatalkan',
        color: 'text-red-700',
        bgColor: 'bg-red-100',
        icon: '❌',
        description: 'Order cancelled',
        descriptionId: 'Pesanan dibatalkan',
    },
    FAILED: {
        label: 'Failed',
        labelId: 'Gagal',
        color: 'text-red-700',
        bgColor: 'bg-red-100',
        icon: '⚠️',
        description: 'Payment failed',
        descriptionId: 'Pembayaran gagal',
    },
};

/**
 * Get status configuration
 */
export function getStatusConfig(
    status: OrderStatus,
    locale: 'id' | 'en' = 'en'
) {
    const config = ORDER_STATUS_CONFIG[status];
    return {
        ...config,
        label: locale === 'id' ? config.labelId : config.label,
        description: locale === 'id' ? config.descriptionId : config.description,
    };
}

/**
 * Check if order can be cancelled
 */
export function canCancelOrder(status: OrderStatus): boolean {
    return status === 'PENDING' || status === 'FAILED';
}

/**
 * Check if order can be paid
 */
export function canPayOrder(status: OrderStatus): boolean {
    return status === 'PENDING';
}

/**
 * Check if order is finalized (cannot be modified)
 */
export function isOrderFinalized(status: OrderStatus): boolean {
    return ['COMPLETED', 'CANCELLED'].includes(status);
}

/**
 * Check if shipping label is available
 */
export function hasShippingLabel(status: OrderStatus): boolean {
    return ['SHIPPED', 'DELIVERED', 'COMPLETED'].includes(status);
}

/**
 * Get order status timeline steps
 */
export function getStatusTimeline(status: OrderStatus): {
    step: number;
    totalSteps: number;
    steps: { status: OrderStatus; label: string; active: boolean }[];
} {
    const allSteps: OrderStatus[] = [
        'PENDING',
        'PAID',
        'PROCESSING',
        'SHIPPED',
        'DELIVERED',
        'COMPLETED',
    ];

    const currentStepIndex = allSteps.indexOf(status);

    return {
        step: currentStepIndex + 1,
        totalSteps: allSteps.length,
        steps: allSteps.map((s, idx) => ({
            status: s,
            label: ORDER_STATUS_CONFIG[s].label,
            active: idx <= currentStepIndex,
        })),
    };
}

/**
 * Format order number for display
 */
export function formatOrderNumber(orderNumber: string): string {
    return orderNumber;
}

/**
 * Get payment deadline (24 hours from order creation)
 */
export function getPaymentDeadline(createdAt: string): Date {
    const created = new Date(createdAt);
    return new Date(created.getTime() + 24 * 60 * 60 * 1000);
}

/**
 * Check if payment is expired
 */
export function isPaymentExpired(createdAt: string): boolean {
    return new Date() > getPaymentDeadline(createdAt);
}

/**
 * Format time remaining for payment
 */
export function getPaymentTimeRemaining(createdAt: string): string {
    const deadline = getPaymentDeadline(createdAt);
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
}
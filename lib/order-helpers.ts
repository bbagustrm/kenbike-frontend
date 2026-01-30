// lib/order-helpers.ts

import { Order, OrderItem, Currency } from '@/types/order';
import { CartItem } from '@/types/cart';
import { formatCurrency } from './format-currency';
import { getOrderStatusLabel } from './order-status';

// Re-export for convenience
export { getOrderStatusLabel };

/**
 * Order Summary Item (snake_case to match API)
 */
export interface OrderSummaryItem {
    product_name: string;
    variant_name: string;
    quantity: number;
    price_per_item: number;
    discount: number;
    subtotal: number;
    image_url?: string;
}

/**
 * Order Summary (snake_case to match API)
 */
export interface OrderSummary {
    items: OrderSummaryItem[];
    subtotal: number;
    discount: number;
    tax: number;
    shipping_cost: number;
    total: number;
    currency: Currency;
}

/**
 * Calculate order totals (using snake_case)
 */
export const calculateOrderTotals = (
    items: Array<{ price_per_item: number; discount: number; quantity: number }>,
    shipping_cost: number = 0
): {
    subtotal: number;
    discount: number;
    tax: number;
    shipping_cost: number;
    total: number;
} => {
    const subtotal = items.reduce((sum, item) => {
        return sum + (item.price_per_item * item.quantity);
    }, 0);

    const discount = items.reduce((sum, item) => {
        return sum + (item.discount * item.quantity);
    }, 0);

    const tax = 0; // Tax is included in product prices

    const total = subtotal - discount + tax + shipping_cost;

    return {
        subtotal,
        discount,
        tax,
        shipping_cost,
        total,
    };
};

/**
 * Convert cart items to order summary (snake_case output)
 */
export const cartToOrderSummary = (
    cartItems: CartItem[],
    shipping_cost: number,
    currency: Currency
): {
    items: {
        product_name: string;
        variant_name: string;
        quantity: number;
        price_per_item: number;
        discount: number;
        subtotal: number;
        image_url: string | null
    }[];
    subtotal: number;
    discount: number;
    tax: number;
    shipping_cost: number;
    total: number;
    currency: "IDR" | "USD"
} => {
    const items: {
        product_name: string;
        variant_name: string;
        quantity: number;
        price_per_item: number;
        discount: number;
        subtotal: number;
        image_url: string | null
    }[] = cartItems.map(item => {
        const price = currency === 'IDR' ? item.product.idPrice : item.product.enPrice;
        const discount = item.product.promotion?.isActive
            ? Math.round(price * item.product.promotion.discount)
            : 0;
        const price_per_item = price;
        const subtotal = (price - discount) * item.quantity;

        return {
            product_name: item.product.name,
            variant_name: item.variant.variantName,
            quantity: item.quantity,
            price_per_item,
            discount,
            subtotal,
            image_url: item.variant.imageUrl || item.product.imageUrl,
        };
    });

    const totals = calculateOrderTotals(items, shipping_cost);

    return {
        items,
        ...totals,
        currency,
    };
};

/**
 * Format order number for display
 */
export const formatOrderNumber = (order_number: string): string => {
    // ORD-uuid -> ORD-XXXX (show first 8 chars after prefix)
    if (order_number.startsWith('ORD-')) {
        const id = order_number.substring(4);
        return `ORD-${id.substring(0, 8).toUpperCase()}`;
    }
    return order_number;
};

/**
 * Get order total weight
 */
export const getOrderTotalWeight = (items: OrderItem[]): number => {
    // This would need product weight data
    // For now, return estimated weight (1kg per item)
    return items.reduce((sum, item) => sum + (item.quantity * 1000), 0);
};

/**
 * Format order date
 */
export const formatOrderDate = (
    date: string | Date,
    locale: 'en' | 'id' = 'en'
): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    return dateObj.toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

/**
 * Format order time
 */
export const formatOrderTime = (
    date: string | Date,
    locale: 'en' | 'id' = 'en'
): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    return dateObj.toLocaleTimeString(locale === 'id' ? 'id-ID' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });
};

/**
 * Format order date and time
 */
export const formatOrderDateTime = (
    date: string | Date,
    locale: 'en' | 'id' = 'en'
): string => {
    return `${formatOrderDate(date, locale)} ${formatOrderTime(date, locale)}`;
};

/**
 * Check if order is recent (within 24 hours)
 */
export const isRecentOrder = (created_at: string | Date): boolean => {
    const date = typeof created_at === 'string' ? new Date(created_at) : created_at;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    return diff < 24 * 60 * 60 * 1000; // 24 hours
};

/**
 * Get order payment deadline (24 hours from creation)
 */
export const getPaymentDeadline = (created_at: string | Date): Date => {
    const date = typeof created_at === 'string' ? new Date(created_at) : created_at;
    return new Date(date.getTime() + 24 * 60 * 60 * 1000);
};

/**
 * Check if payment is expired
 */
export const isPaymentExpired = (created_at: string | Date): boolean => {
    const deadline = getPaymentDeadline(created_at);
    return new Date() > deadline;
};

/**
 * Get time remaining for payment
 */
export const getPaymentTimeRemaining = (created_at: string | Date): string => {
    const deadline = getPaymentDeadline(created_at);
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (60 * 60 * 1000));
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
};

/**
 * Validate order data before submission (snake_case parameters)
 */
export const validateOrderData = (data: {
    recipient_name?: string;
    recipient_phone?: string;
    shipping_address?: string;
    shipping_city?: string;
    shipping_country?: string;
    shipping_postal_code?: string;
}): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!data.recipient_name || data.recipient_name.trim().length < 2) {
        errors.push('Recipient name is required (min 2 characters)');
    }

    if (!data.recipient_phone || data.recipient_phone.trim().length < 10) {
        errors.push('Recipient phone is required (min 10 characters)');
    }

    if (!data.shipping_address || data.shipping_address.trim().length < 10) {
        errors.push('Shipping address is required (min 10 characters)');
    }

    if (!data.shipping_city || data.shipping_city.trim().length < 2) {
        errors.push('City is required');
    }

    if (!data.shipping_country) {
        errors.push('Country is required');
    }

    if (!data.shipping_postal_code || data.shipping_postal_code.trim().length < 3) {
        errors.push('Postal code is required');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
};

/**
 * Format order summary text for sharing (using snake_case fields)
 */
export const formatOrderSummaryText = (order: Order, locale: 'en' | 'id' = 'en'): string => {
    const lines: string[] = [];

    lines.push(`Order ${formatOrderNumber(order.order_number)}`);
    lines.push(`Status: ${getOrderStatusLabel(order.status, locale)}`);
    lines.push(`Date: ${formatOrderDate(order.created_at, locale)}`);
    lines.push('');
    lines.push('Items:');

    order.items.forEach(item => {
        lines.push(`- ${item.product_name} (${item.variant_name}) x${item.quantity}`);
    });

    lines.push('');
    lines.push(`Total: ${formatCurrency(order.total, order.currency)}`);

    return lines.join('\n');
};

/**
 * Get estimated delivery date range
 */
export const getEstimatedDelivery = (
    shipped_at: string | Date | undefined,
    min_days: number = 2,
    max_days: number = 5,
    locale: 'en' | 'id' = 'en'
): string => {
    if (!shipped_at) return '-';

    const shippedDate = typeof shipped_at === 'string' ? new Date(shipped_at) : shipped_at;

    const minDate = new Date(shippedDate);
    minDate.setDate(minDate.getDate() + min_days);

    const maxDate = new Date(shippedDate);
    maxDate.setDate(maxDate.getDate() + max_days);

    const formatOptions: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
    };

    const localeStr = locale === 'id' ? 'id-ID' : 'en-US';

    return `${minDate.toLocaleDateString(localeStr, formatOptions)} - ${maxDate.toLocaleDateString(localeStr, formatOptions)}`;
};

/**
 * Check if order can be cancelled
 */
export const canCancelOrder = (order: Order): boolean => {
    // Can only cancel orders that are PENDING or PAID (before processing)
    return ['PENDING', 'PAID'].includes(order.status);
};

/**
 * Check if order can be marked as received
 */
export const canMarkAsReceived = (order: Order): boolean => {
    // Can only mark SHIPPED or DELIVERED orders as received
    return ['SHIPPED', 'DELIVERED'].includes(order.status);
};

/**
 * Get order progress percentage
 */
export const getOrderProgress = (status: Order['status']): number => {
    const progressMap: Record<Order['status'], number> = {
        'PENDING': 10,
        'PAID': 25,
        'PROCESSING': 50,
        'SHIPPED': 75,
        'DELIVERED': 90,
        'COMPLETED': 100,
        'CANCELLED': 0,
        'FAILED': 0,
    };

    return progressMap[status] || 0;
};
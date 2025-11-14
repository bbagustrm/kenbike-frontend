// lib/payment-utils.ts

import { PaymentMethod, PaymentMethodConfig } from '@/types/payment';

/**
 * Payment method configurations
 */
export const PAYMENT_METHODS: PaymentMethodConfig[] = [
    {
        method: 'MIDTRANS_SNAP',
        name: 'Midtrans',
        description: 'Credit Card, Bank Transfer, E-Wallet, and more',
        icon: '💳',
        available: true,
        currencies: ['IDR'],
    },
    {
        method: 'PAYPAL',
        name: 'PayPal',
        description: 'PayPal Balance, Credit/Debit Card',
        icon: '🅿️',
        available: true,
        currencies: ['USD'],
    },
];

/**
 * Get available payment methods for currency
 */
export function getAvailablePaymentMethods(
    currency: 'IDR' | 'USD'
): PaymentMethodConfig[] {
    return PAYMENT_METHODS.filter(
        (method) => method.available && method.currencies.includes(currency)
    );
}

/**
 * Get payment method config
 */
export function getPaymentMethodConfig(
    method: PaymentMethod
): PaymentMethodConfig | undefined {
    return PAYMENT_METHODS.find((m) => m.method === method);
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency: 'IDR' | 'USD'): string {
    if (currency === 'IDR') {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    } else {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    }
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: 'IDR' | 'USD'): string {
    return currency === 'IDR' ? 'Rp' : '$';
}

/**
 * Determine currency based on shipping type and country
 */
export function determineCurrency(
    shippingType: 'DOMESTIC' | 'INTERNATIONAL',
    country?: string
): 'IDR' | 'USD' {
    if (shippingType === 'DOMESTIC' || country === 'ID') {
        return 'IDR';
    }
    return 'USD';
}

/**
 * Calculate tax (11% PPN for Indonesia)
 */
export function calculateTax(subtotal: number, currency: 'IDR' | 'USD'): number {
    if (currency === 'IDR') {
        return Math.round(subtotal * 0.11);
    }
    // No tax for international
    return 0;
}

/**
 * Calculate total amount
 */
export function calculateTotal(
    subtotal: number,
    shippingCost: number,
    discount: number,
    currency: 'IDR' | 'USD'
): number {
    const tax = calculateTax(subtotal - discount, currency);
    return subtotal - discount + shippingCost + tax;
}
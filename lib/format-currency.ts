// lib/format-currency.ts - EXTENDED WITH LOCALE SUPPORT

import { Locale } from '@/types/translation';

/**
 * Format number to Indonesian Rupiah or USD currency
 * @param amount - The amount to format
 * @param currency - Currency type ('IDR' or 'USD')
 * @returns Formatted currency string (e.g., "Rp 320.000" or "$320.00")
 */
export function formatCurrency(amount: number, currency: 'IDR' | 'USD' = 'IDR'): string {
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
 * Format number to compact Rupiah format
 * @param amount - The amount to format
 * @returns Compact currency string (e.g., "Rp 1,2 Jt")
 */
export function formatCompactCurrency(amount: number): string {
    if (amount >= 1_000_000_000) {
        return `Rp ${(amount / 1_000_000_000).toFixed(1)} M`;
    }
    if (amount >= 1_000_000) {
        return `Rp ${(amount / 1_000_000).toFixed(1)} Jt`;
    }
    if (amount >= 1_000) {
        return `Rp ${(amount / 1_000).toFixed(0)} Rb`;
    }
    return `Rp ${amount}`;
}

/**
 * Format number without currency symbol
 * @param amount - The amount to format
 * @returns Formatted number string (e.g., "320.000")
 */
export function formatNumber(amount: number): string {
    return new Intl.NumberFormat('id-ID').format(amount);
}

// ========================================
// ✅ NEW: LOCALE-AWARE HELPERS
// ========================================

/**
 * Get currency code based on locale
 * @param locale - The current locale ('id' or 'en')
 * @returns Currency code ('IDR' or 'USD')
 */
export function getCurrencyFromLocale(locale: Locale): 'IDR' | 'USD' {
    return locale === 'id' ? 'IDR' : 'USD';
}

/**
 * Get the appropriate price based on locale
 * @param idPrice - Indonesian price in IDR
 * @param enPrice - English/International price in USD
 * @param locale - The current locale
 * @returns The price for the current locale
 */
export function getLocalizedPrice(idPrice: number, enPrice: number, locale: Locale): number {
    return locale === 'id' ? idPrice : enPrice;
}

/**
 * Format price based on locale (auto-selects IDR/USD price and formats)
 * @param idPrice - Indonesian price in IDR
 * @param enPrice - English/International price in USD
 * @param locale - The current locale
 * @returns Formatted currency string
 *
 * @example
 * // Indonesian user (locale = 'id')
 * formatLocalizedPrice(340000, 230, 'id')
 * // → "Rp 340.000"
 *
 * @example
 * // English user (locale = 'en')
 * formatLocalizedPrice(340000, 230, 'en')
 * // → "$230.00"
 */
export function formatLocalizedPrice(idPrice: number, enPrice: number, locale: Locale): string {
    const price = getLocalizedPrice(idPrice, enPrice, locale);
    const currency = getCurrencyFromLocale(locale);
    return formatCurrency(price, currency);
}

/**
 * Get currency symbol based on locale
 * @param locale - The current locale
 * @returns Currency symbol ('Rp' or '$')
 */
export function getCurrencySymbol(locale: Locale): string {
    return locale === 'id' ? 'Rp' : '$';
}
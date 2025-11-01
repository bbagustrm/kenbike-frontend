// lib/format-currency.ts

/**
 * Format number to Indonesian Rupiah currency
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "Rp 320.000")
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
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
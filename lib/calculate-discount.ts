// lib/calculate-discount.ts

/**
 * Calculate discounted price
 * @param originalPrice - Original price
 * @param discountRate - Discount rate (0.2 = 20%)
 * @returns Discounted price
 */
export function calculateDiscountedPrice(
    originalPrice: number,
    discountRate: number
): number {
    return Math.round(originalPrice * (1 - discountRate));
}

/**
 * Calculate discount percentage for display
 * @param discountRate - Discount rate (0.2 = 20%)
 * @returns Formatted percentage string (e.g., "20%")
 */
export function formatDiscountPercentage(discountRate: number): string {
    return `${Math.round(discountRate * 100)}%`;
}

/**
 * Calculate savings amount
 * @param originalPrice - Original price
 * @param discountRate - Discount rate
 * @returns Amount saved
 */
export function calculateSavings(
    originalPrice: number,
    discountRate: number
): number {
    return Math.round(originalPrice * discountRate);
}
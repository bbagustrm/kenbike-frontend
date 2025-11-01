// lib/check-stock.ts

import { ProductVariant } from "@/types/product";

/**
 * Calculate total stock from product variants
 * @param variants - Array of product variants
 * @returns Total stock count
 */
export function getTotalStock(
    variants?: Pick<ProductVariant, "stock" | "isActive">[]
): number {
    if (!variants || variants.length === 0) return 0;

    return variants
        .filter((v) => v.isActive)
        .reduce((sum, v) => sum + v.stock, 0);
}

/**
 * Check if product has stock available
 * @param variants - Array of product variants
 * @returns True if stock is available
 */
export function hasStock(
    variants?: Pick<ProductVariant, "stock" | "isActive">[]
): boolean {
    return getTotalStock(variants) > 0;
}

/**
 * Get stock status
 * @param variants - Array of product variants
 * @returns Stock status: "out" | "low" | "available"
 */
export function getStockStatus(
    variants?: Pick<ProductVariant, "stock" | "isActive">[]
): "out" | "low" | "available" {
    const total = getTotalStock(variants);

    if (total === 0) return "out";
    if (total <= 5) return "low";
    return "available";
}
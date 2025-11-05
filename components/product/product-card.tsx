"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProductListItem } from "@/types/product";
import { formatCurrency } from "@/lib/format-currency";
import { calculateDiscountedPrice, formatDiscountPercentage } from "@/lib/calculate-discount";
import { getTotalStock } from "@/lib/check-stock";
import { getImageUrl } from "@/lib/image-utils";
import { cn } from "@/lib/utils";
import {Separator} from "@/components/ui/separator";

interface ProductCardProps {
    product: ProductListItem;
    className?: string;
}

// Map variant names to color classes
const getVariantColor = (variantName: string): string => {
    const name = variantName.toLowerCase();

    const colorMap: Record<string, string> = {
        // Basic colors
        'black': 'bg-black',
        'white': 'bg-white border border-gray-300',
        'silver': 'bg-gray-300',
        'gray': 'bg-gray-500',
        'grey': 'bg-gray-500',

        // Chrome/Metal finishes
        'chrome': 'bg-gradient-to-br from-gray-300 via-gray-100 to-gray-300',
        'satin': 'bg-gradient-to-br from-gray-400 via-gray-300 to-gray-400',
        'polished': 'bg-gradient-to-br from-gray-200 via-white to-gray-200',

        // Other colors
        'red': 'bg-red-500',
        'blue': 'bg-blue-500',
        'green': 'bg-green-500',
        'yellow': 'bg-yellow-400',
        'orange': 'bg-orange-500',
        'purple': 'bg-purple-500',
        'pink': 'bg-pink-500',
        'brown': 'bg-amber-700',
        'gold': 'bg-gradient-to-br from-yellow-400 via-yellow-200 to-yellow-400',
        'rose': 'bg-gradient-to-br from-rose-400 via-pink-300 to-rose-400',
    };

    // Check if variant name contains any color keyword
    for (const [key, value] of Object.entries(colorMap)) {
        if (name.includes(key)) {
            return value;
        }
    }

    // Default gray if no color found
    return 'bg-gray-400';
};

export function ProductCard({ product, className }: ProductCardProps) {
    const totalStock = getTotalStock(product.variants);
    const isOutOfStock = totalStock === 0;
    const hasPromotion = !!product.promotion;

    const originalPrice = product.idPrice;
    const discountedPrice = hasPromotion
        ? calculateDiscountedPrice(originalPrice, product.promotion!.discount)
        : originalPrice;

    const displayImage = product.imageUrl || product.images?.[0]?.imageUrl;

    // Get unique variant colors (max 4)
    const variantColors = product.variants
        ?.slice(0, 4)
        .map(v => ({
            name: v.variantName,
            color: getVariantColor(v.variantName)
        })) || [];

    return (
        <div
            className={cn(
                "relative overflow-hidden",
                "bg-white dark:bg-slate-900 rounded-lg shadow-sm",
                isOutOfStock && "opacity-75",
                className
            )}
        >
            <Link href={`/products/${product.slug}`} className="block">
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden  dark:bg-slate-800 rounded-t-lg">
                    <Image
                        src={getImageUrl(displayImage) || "/placeholder.png"}
                        alt={product.name}
                        fill
                        className="object-contain p-4"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    />

                    {/* Out of Stock Overlay */}
                    {isOutOfStock && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                            <div className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-lg">
                                Out of Stock
                            </div>
                        </div>
                    )}

                    {/* Promotion Banner - Absolute positioned at bottom of image */}
                    {hasPromotion && !isOutOfStock && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-orange-500 to-orange-400 text-white py-1 px-3">
                            <p className="text-xs font-bold uppercase tracking-wide text-center line-clamp-1">
                                 {formatDiscountPercentage(product.promotion!.discount)} - {product.promotion!.name}
                            </p>
                        </div>
                    )}
                </div>
                {/* Content */}
                <div className="p-3 space-y-2.5">
                    {/* Product Name - Fixed height for alignment */}
                    <h3 className="line-clamp-1 uppercase text-sm font-medium leading-tight min-h-[1.25rem] text-slate-900 dark:text-slate-100">
                        {product.name}
                    </h3>

                    {/* Category + Tags */}
                    <div className="flex flex-wrap gap-1 min-h-[20px]">
                        {product.category && (
                            <Badge
                                variant="secondary"
                                className="text-[10px] px-2 py-0.5 h-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                            >
                                {product.category.name}
                            </Badge>
                        )}
                        {product.tags && product.tags.length > 0 && (
                            <>
                                {product.tags.slice(0, 1).map((tag) => (
                                    <Badge
                                        key={tag.id}
                                        variant="outline"
                                        className="text-[10px] px-2 py-0.5 h-5 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
                                    >
                                        {tag.name}
                                    </Badge>
                                ))}
                            </>
                        )}
                    </div>

                    {/* Price */}
                    <div className="space-y-1 py-2">
                        {hasPromotion ? (
                            <>
                                <p className="text-xs text-slate-400 line-through leading-none">
                                    {formatCurrency(originalPrice)}
                                </p>
                                <p className="text-lg font-bold text-orange-500 dark:text-orange-500 leading-none">
                                    {formatCurrency(discountedPrice)}
                                </p>
                            </>
                        ) : (
                            <p className="text-lg font-bold text-orange-500 dark:text-orange-500 leading-none">
                                {formatCurrency(originalPrice)}
                            </p>
                        )}
                    </div>

                    {/* Rating (Sold) + Variant Colors Row */}
                    <div className="flex items-center justify-between">
                        {/* Rating & Sales Combined */}
                        <div className="flex items-center gap-1 text-xs">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                                {product.avgRating > 0 ? product.avgRating.toFixed(1) : "0.0"}
                            </span>
                            <span className="text-slate-400">
                                ({product.totalSold})
                            </span>
                        </div>

                        {/* Variant Colors */}
                        {variantColors.length > 0 && (
                            <div className="flex items-center gap-1.5">
                                {variantColors.map((variant, index) => (
                                    <div
                                        key={index}
                                        className={cn(
                                            "w-4 h-4 rounded-full ring-1 ring-slate-200 dark:ring-slate-700",
                                            variant.color
                                        )}
                                        title={variant.name}
                                    />
                                ))}
                                {product.variants && product.variants.length > 4 && (
                                    <span className="text-[10px] text-slate-400">
                                        +{product.variants.length - 4}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </Link>
        </div>
    );
}
// components/product/product-card.tsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProductListItem } from "@/types/product";
import { formatCurrency } from "@/lib/format-currency";
import { calculateDiscountedPrice, formatDiscountPercentage } from "@/lib/calculate-discount";
import { getTotalStock } from "@/lib/check-stock";
import { normalizeImageUrl } from "@/lib/image-utils";
import { cn } from "@/lib/utils";

interface ProductCardProps {
    product: ProductListItem;
    className?: string;
    locale?: "id" | "en";
}

const getVariantColor = (variantName: string): string => {
    const name = variantName.toLowerCase();
    const colorMap: Record<string, string> = {
        black: "bg-black",
        white: "bg-white border border-border",
        silver: "bg-gray-300 dark:bg-gray-400",
        gray: "bg-gray-500",
        grey: "bg-gray-500",
        chrome: "bg-gradient-to-br from-gray-300 via-gray-100 to-gray-300 dark:from-gray-400 dark:via-gray-200 dark:to-gray-400",
        satin: "bg-gradient-to-br from-gray-400 via-gray-300 to-gray-400",
        polished: "bg-gradient-to-br from-gray-200 via-white to-gray-200",
        red: "bg-red-500",
        blue: "bg-blue-500",
        green: "bg-green-500",
        yellow: "bg-yellow-400",
        orange: "bg-orange-500",
        purple: "bg-purple-500",
        pink: "bg-pink-500",
        brown: "bg-amber-700",
        gold: "bg-gradient-to-br from-yellow-400 via-yellow-200 to-yellow-400",
        rose: "bg-gradient-to-br from-rose-400 via-pink-300 to-rose-400",
    };

    for (const [key, value] of Object.entries(colorMap)) {
        if (name.includes(key)) return value;
    }

    return "bg-gray-400";
};

export function ProductCard({ product, className, locale = "id" }: ProductCardProps) {
    const totalStock = getTotalStock(product.variants);
    const isOutOfStock = totalStock === 0;
    const hasPromotion = !!product.promotion;

    // Get price based on locale
    const originalPrice = locale === "id" ? product.idPrice : product.enPrice;
    const currency = locale === "id" ? "IDR" : "USD";

    const discountedPrice = hasPromotion
        ? calculateDiscountedPrice(originalPrice, product.promotion!.discount)
        : originalPrice;

    // ✅ Normalize image URL
    const displayImage = normalizeImageUrl(product.imageUrl || product.images?.[0]?.imageUrl);

    const variantColors =
        product.variants?.slice(0, 4).map((v) => ({
            name: v.variantName,
            color: getVariantColor(v.variantName),
        })) || [];

    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
                "relative overflow-hidden group",
                "rounded-sm bg-transparent backdrop-blur-sm",
                isOutOfStock && "opacity-70",
                className
            )}
        >
            <Link href={`/products/${product.slug}`} className="block">
                {/* Image */}
                <div className="relative aspect-square overflow-hidden rounded-sm border border-border bg-muted/40">
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="w-full h-full"
                    >
                        <Image
                            src={displayImage || "/placeholder.png"}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        />
                    </motion.div>

                    {/* Out of Stock */}
                    {isOutOfStock && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md"
                        >
                            <div className="rounded-md bg-white/90 dark:bg-gray-800/90 px-4 py-1.5 text-xs font-semibold shadow">
                                Out of Stock
                            </div>
                        </motion.div>
                    )}

                    {/* Promotion Tag */}
                    {hasPromotion && !isOutOfStock && (
                        <motion.div
                            initial={{ scale: 0, rotate: -12 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 200,
                                damping: 15,
                                delay: 0.2
                            }}
                            className="absolute top-2 right-2 bg-gradient-to-r bg-accent text-accent-foreground text-xs font-bold font-mono px-2 py-0.5 rounded-full shadow-sm"
                        >
                            {formatDiscountPercentage(product.promotion!.discount)}
                        </motion.div>
                    )}
                </div>

                {/* Content */}
                <div className="p-3 space-y-2.5">
                    <h3 className="line-clamp-1 uppercase text-sm font-medium text-foreground">
                        {product.name}
                    </h3>

                    {/* Category + Tag */}
                    <div className="flex flex-wrap gap-1">
                        {product.category && (
                            <Badge variant="secondary" className="text-[10px] px-2 py-0.5 h-5 rounded-full">
                                {product.category.name}
                            </Badge>
                        )}
                        {product.tags?.slice(0, 1).map((tag) => (
                            <Badge key={tag.id} variant="outline" className="text-[10px] px-2 py-0.5 h-5 rounded-full">
                                {tag.name}
                            </Badge>
                        ))}
                    </div>

                    {/* Price */}
                    <div className="space-y-1">
                        {hasPromotion ? (
                            <>
                                <p className="text-xs text-muted-foreground line-through leading-none">
                                    {formatCurrency(originalPrice, currency)}
                                </p>
                                <p className="text-lg font-bold leading-none">
                                    {formatCurrency(discountedPrice, currency)}
                                </p>
                            </>
                        ) : (
                            <p className="text-lg font-bold leading-none">
                                {formatCurrency(originalPrice, currency)}
                            </p>
                        )}
                    </div>

                    {/* Rating & Variants */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span className="font-semibold">{product.avgRating > 0 ? product.avgRating.toFixed(1) : "0.0"}</span>
                            <span className="text-muted-foreground">({product.totalSold})</span>
                        </div>

                        {variantColors.length > 0 && (
                            <div className="flex items-center gap-1.5">
                                {variantColors.map((variant, index) => (
                                    <motion.div
                                        key={index}
                                        whileHover={{ scale: 1.3 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                        className={cn("w-4 h-4 rounded-full ring-1 ring-border cursor-pointer", variant.color)}
                                        title={variant.name}
                                    />
                                ))}
                                {product.variants && product.variants.length > 4 && (
                                    <span className="text-[10px] text-muted-foreground">
                                        +{product.variants.length - 4}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
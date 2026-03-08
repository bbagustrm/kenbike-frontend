"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {Clock, Star} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProductListItem } from "@/types/product";
import { formatCurrency } from "@/lib/format-currency";
import { calculateDiscountedPrice, formatDiscountPercentage } from "@/lib/calculate-discount";
import { getTotalStock } from "@/lib/check-stock";
import { getImageUrl } from "@/lib/image-utils";
import { cn } from "@/lib/utils";

interface ProductCardProps {
    product: ProductListItem;
    className?: string;
    locale?: "id" | "en";
}

const getVariantColor = (variantName: string): string => {
    const name = variantName.toLowerCase();
    const colorMap: Record<string, string> = {
        // Neutrals
        black:    "bg-zinc-900",
        white:    "bg-zinc-50 border border-zinc-300",
        // Metallic
        silver:   "bg-gradient-to-br from-zinc-200 via-zinc-100 to-zinc-300",
        gray:     "bg-zinc-400",
        grey:     "bg-zinc-400",
        chrome:   "bg-gradient-to-br from-zinc-200 via-white to-zinc-300",
        satin:    "bg-gradient-to-br from-zinc-300 via-zinc-200 to-zinc-400",
        polished: "bg-gradient-to-br from-zinc-100 via-white to-zinc-200",
        titanium: "bg-gradient-to-br from-zinc-400 via-zinc-300 to-zinc-500",
        // Vivid — sampled from bolt image
        orange:   "bg-[#E8640A]",
        red:      "bg-[#D42B1E]",
        gold:     "bg-[#C89B1A]",
        yellow:   "bg-[#D4A817]",
        green:    "bg-[#2DAB3A]",
        blue:     "bg-[#1A6FD4]",
        purple:   "bg-[#9B2EC8]",
        pink:     "bg-[#D42BA0]",
        rose:     "bg-[#C82B6A]",
        brown:    "bg-amber-700",
    };

    for (const [key, value] of Object.entries(colorMap)) {
        if (name.includes(key)) return value;
    }

    return "bg-zinc-400";
};

export function ProductCard({ product, className, locale = "id" }: ProductCardProps) {
    const totalStock = getTotalStock(product.variants);
    const isOutOfStock = totalStock === 0;
    const hasPromotion = !!product.promotion;
    const isPreOrder = !!product.isPreOrder;

    const originalPrice = locale === "id" ? product.idPrice : product.enPrice;
    const currency = locale === "id" ? "IDR" : "USD";

    const discountedPrice = hasPromotion
        ? calculateDiscountedPrice(originalPrice, product.promotion!.discount)
        : originalPrice;

    const displayImage = getImageUrl(product.imageUrl || product.images?.[0]?.imageUrl);

    const variantColors =
        product.variants?.slice(0, 4).map((v) => ({
            name: v.variantName,
            color: getVariantColor(v.variantName),
        })) || [];

    return (
        <motion.div
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
                "relative group",
                "rounded-sm bg-transparent backdrop-blur-sm",
                className
            )}
        >
            <Link href={`/products/${product.slug}`} className="block">
                {/* Image */}
                <div className="relative aspect-square overflow-hidden rounded-md">
                    <motion.div
                        whileHover={{ scale: 1.2 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="w-full h-full"
                    >
                        <Image
                            src={displayImage || "/placeholder.png"}
                            alt={product.name}
                            fill
                            className={cn(
                                "object-cover transition-all duration-300",
                                isOutOfStock && "grayscale opacity-50"
                            )}
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        />
                    </motion.div>

                    {/* Out of Stock Overlay */}
                    {isOutOfStock && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <span className="text-xs font-bold tracking-wider uppercase text-white px-4 py-2 ">
                              Out of Stock
                            </span>
                        </div>
                    )}

                    {/* Promotion Tag */}
                    {hasPromotion && !isOutOfStock && (
                        <motion.div
                            initial={{ scale: 0, rotate: -12 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                            className="absolute top-2 right-2 bg-accent text-accent-foreground text-xs font-bold font-mono px-2 py-0.5 rounded-md shadow-sm"
                        >
                            {formatDiscountPercentage(product.promotion!.discount)}
                        </motion.div>
                    )}

                    {/* Pre Order Badge */}
                    {isPreOrder && !isOutOfStock && (
                        <motion.div
                            initial={{ scale: 0, x: -10 }}
                            animate={{ scale: 1, x: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                            className="absolute top-2 left-2 bg-background text-card-foreground text-xs font-bold px-2 py-0.5 rounded-md border border-border flex gap-2"
                        >
                            <Clock className="w-3 h-3" />
                            Pre Order
                        </motion.div>
                    )}
                </div>

                {/* Content */}
                <div className="py-3 space-y-2.5">
                    <h3 className={cn(
                        "line-clamp-1 uppercase text-sm font-medium text-foreground",
                        isOutOfStock && "text-muted-foreground"
                    )}>
                        {product.name}
                    </h3>

                    {/* Category + Tag */}
                    <div className="flex flex-wrap gap-1">
                        {product.category && (
                            <Badge variant="secondary" className="text-[10px] px-2 py-0.5 h-5 rounded-md">
                                {product.category.name}
                            </Badge>
                        )}
                        {product.tags?.slice(0, 1).map((tag) => (
                            <Badge key={tag.id} variant="outline" className="text-[10px] px-2 py-0.5 h-5 rounded-md">
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
                            <p className={cn(
                                "text-lg font-bold leading-none",
                                isOutOfStock && "text-muted-foreground"
                            )}>
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
                            <div className="flex items-center gap-1">
                                {variantColors.map((variant, index) => (
                                    <div
                                        key={index}
                                        className={cn("w-3 h-3 rounded-full opacity-80", variant.color)}
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
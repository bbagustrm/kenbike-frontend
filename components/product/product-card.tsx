"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProductListItem } from "@/types/product";
import { formatCurrency } from "@/lib/format-currency";
import { calculateDiscountedPrice, formatDiscountPercentage } from "@/lib/calculate-discount";
import { getTotalStock } from "@/lib/check-stock";
import { getImageUrl } from "@/lib/image-utils";
import { cn } from "@/lib/utils";

interface ProductCardProps {
    product: ProductListItem;
    className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
    const totalStock = getTotalStock(product.variants);
    const isOutOfStock = totalStock === 0;
    const hasPromotion = !!product.promotion;

    const originalPrice = product.idPrice;
    const discountedPrice = hasPromotion
        ? calculateDiscountedPrice(originalPrice, product.promotion!.discount)
        : originalPrice;

    const displayImage = product.imageUrl || product.images?.[0]?.imageUrl;

    return (
        <Card
            className={cn(
                "group relative overflow-hidden transition-all hover:shadow-lg",
                isOutOfStock && "opacity-75",
                className
            )}
        >
            <Link href={`/products/${product.slug}`} className="block">
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-muted">
                    <Image
                        src={getImageUrl(displayImage) || "/placeholder.png"}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />

                    {/* Out of Stock Overlay */}
                    {isOutOfStock && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                            <div className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-900">
                                Out of Stock
                            </div>
                        </div>
                    )}

                    {/* Promotion Badge */}
                    {hasPromotion && !isOutOfStock && (
                        <div className="absolute top-2 right-2">
                            <Badge variant="destructive" className="font-bold">
                                PROMO {formatDiscountPercentage(product.promotion!.discount)}
                            </Badge>
                        </div>
                    )}

                    {/* Category Badge */}
                    {product.category && (
                        <div className="absolute top-2 left-2">
                            <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
                                {product.category.name}
                            </Badge>
                        </div>
                    )}
                </div>

                <CardContent className="p-4">
                    {/* Product Name */}
                    <h3 className="mb-2 line-clamp-2 text-sm font-semibold leading-tight group-hover:text-primary transition-colors">
                        {product.name}
                    </h3>

                    {/* Price */}
                    <div className="mb-3">
                        {hasPromotion ? (
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground line-through">
                                    {formatCurrency(originalPrice)}
                                </p>
                                <p className="text-lg font-bold text-primary">
                                    {formatCurrency(discountedPrice)}
                                </p>
                            </div>
                        ) : (
                            <p className="text-lg font-bold">
                                {formatCurrency(originalPrice)}
                            </p>
                        )}
                    </div>

                    {/* Rating & Sales */}
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">
                {product.avgRating > 0 ? product.avgRating.toFixed(1) : "0.0"}
              </span>
                        </div>
                        <span className="text-muted-foreground">
              {product.totalSold} terjual
            </span>
                    </div>

                    {/* Tags */}
                    {product.tags && product.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                            {product.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag.id} variant="outline" className="text-xs">
                                    {tag.name}
                                </Badge>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Link>
        </Card>
    );
}
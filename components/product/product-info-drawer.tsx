"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronUp, Minus, Plus, ShoppingCart, AlertTriangle, CheckCircle2, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product, ProductVariant } from "@/types/product";
import { formatCurrency } from "@/lib/format-currency";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

interface ProductInfoDrawerProps {
    product: Product;
    selectedVariant: ProductVariant | null;
    quantity: number;
    finalPrice: number;
    isPreOrder: boolean;
    cartLoading: boolean;
    onVariantSelect: (variant: ProductVariant) => void;
    onQuantityChange: (delta: number) => void;
    onAddToCart: () => void;
}

const COLOR_MAP: Record<string, string> = {
    black: "#000000",
    white: "#FFFFFF",
    chrome: "#C0C0C0",
    silver: "#C0C0C0",
    gold: "#FFD700",
    red: "#FF0000",
    blue: "#0000FF",
    green: "#00FF00",
    yellow: "#FFFF00",
    orange: "#FFA500",
    purple: "#800080",
    pink: "#FFC0CB",
    brown: "#8B4513",
    gray: "#808080",
    grey: "#808080",
};

const getColorFromVariantName = (variantName: string): string => {
    const firstWord = variantName.toLowerCase().split(" ")[0];
    return COLOR_MAP[firstWord] || "#CCCCCC";
};

export function ProductInfoDrawer({
    product,
    selectedVariant,
    quantity,
    finalPrice,
    isPreOrder,
    cartLoading,
    onVariantSelect,
    onQuantityChange,
    onAddToCart,
}: ProductInfoDrawerProps) {
    const { t, locale } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const currentStock = selectedVariant?.stock || 0;
    const isOutOfStock = currentStock === 0;
    const isLowStock = currentStock > 0 && currentStock <= 10;
    const isAvailable = currentStock > 10;

    return (
        <>
            {/* Sticky Bottom Bar - Always Visible */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                        {/* Price */}
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground">{t.productDetail.subtotal}</p>
                            <p className="text-lg font-bold text-accent truncate">
                                {formatCurrency(finalPrice * quantity, locale === "id" ? "IDR" : "USD")}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsOpen(true)}
                                className="flex items-center gap-1"
                            >
                                <span className="hidden sm:inline">Details</span>
                                <ChevronUp className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Drawer Overlay */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Drawer Content */}
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: isOpen ? 0 : "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl shadow-2xl max-h-[85vh] overflow-hidden"
            >
                {/* Drawer Handle */}
                <div className="sticky top-0 bg-card z-10 pt-3 pb-2 border-b border-border">
                    <div className="flex justify-center mb-2">
                        <div className="w-12 h-1.5 bg-muted rounded-full" />
                    </div>
                    <div className="flex items-center justify-between px-4 pb-2">
                        <h3 className="font-semibold text-lg">Product Details</h3>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto max-h-[calc(85vh-80px)] pb-20">
                    <div className="p-4 space-y-4">
                        {/* Tags & Category */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {product.category && (
                                <Badge variant="secondary">{product.category.name}</Badge>
                            )}
                            {isPreOrder && (
                                <Badge className="bg-accent text-accent-foreground gap-1">
                                    <Clock className="w-3 h-3" />
                                    Pre Order
                                </Badge>
                            )}
                            {product.tags?.map((tag) => (
                                <Badge key={tag.id} variant="outline">
                                    {tag.name}
                                </Badge>
                            ))}
                        </div>

                        {/* Product Name */}
                        <h2 className="text-xl font-bold uppercase text-foreground">
                            {product.name}
                        </h2>

                        {/* Price */}
                        <div className="flex items-baseline gap-3">
                            <span className="text-2xl font-bold text-accent">
                                {formatCurrency(finalPrice, locale === "id" ? "IDR" : "USD")}
                            </span>
                        </div>

                        {/* Stock Info */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{t.productDetail.stock}:</span>
                            {isOutOfStock && (
                                <Badge variant="destructive" className="gap-1.5">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    {t.products.outOfStock}
                                </Badge>
                            )}
                            {isLowStock && (
                                <Badge variant="destructive" className="gap-1.5">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    {t.productDetail.onlyLeftInStock.replace("{count}", currentStock.toString())}
                                </Badge>
                            )}
                            {isAvailable && (
                                <Badge variant="outline" className="gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    {t.products.inStock}
                                </Badge>
                            )}
                        </div>

                        {/* Variant Selection */}
                        {product.variants && product.variants.length > 0 && (
                            <div className="space-y-3">
                                <label className="text-sm font-semibold block">
                                    {t.productDetail.chooseColor}:{" "}
                                    <span className="font-normal text-muted-foreground">
                                        {selectedVariant?.variantName}
                                    </span>
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    {product.variants
                                        .filter((v) => v.isActive)
                                        .map((variant) => (
                                            <motion.button
                                                key={variant.id}
                                                onClick={() => onVariantSelect(variant)}
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                className={cn(
                                                    "w-10 h-10 rounded-full border-2 transition-all",
                                                    selectedVariant?.id === variant.id &&
                                                    "ring-2 ring-accent ring-offset-2"
                                                )}
                                                style={{
                                                    backgroundColor: getColorFromVariantName(variant.variantName),
                                                }}
                                                title={variant.variantName}
                                                aria-label={variant.variantName}
                                            />
                                        ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity Selector */}
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-semibold">{t.productDetail.quantity}</label>
                            <div className="flex items-center border border-border rounded-lg overflow-hidden">
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => onQuantityChange(-1)}
                                    disabled={quantity <= 1}
                                    className="p-3 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    <Minus className="w-4 h-4" />
                                </motion.button>
                                <span className="px-6 font-semibold min-w-[3rem] text-center">
                                    {quantity}
                                </span>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => onQuantityChange(1)}
                                    disabled={quantity >= (selectedVariant?.stock || 0)}
                                    className="p-3 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    <Plus className="w-4 h-4" />
                                </motion.button>
                            </div>
                        </div>

                        {/* Subtotal */}
                        <div className="border-t pt-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">{t.productDetail.subtotal}</span>
                                <span className="text-2xl font-bold">
                                    {formatCurrency(finalPrice * quantity, locale === "id" ? "IDR" : "USD")}
                                </span>
                            </div>

                            {/* Add to Cart Button */}
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button
                                    onClick={() => {
                                        onAddToCart();
                                        setIsOpen(false);
                                    }}
                                    size="lg"
                                    variant="secondary"
                                    className="w-full"
                                    disabled={!selectedVariant || isOutOfStock || cartLoading}
                                >
                                    <ShoppingCart className="w-5 h-5 mr-2" />
                                    {cartLoading ? t.common.loading : t.productDetail.addToCart}
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    );
}
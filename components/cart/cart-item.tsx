// components/cart/cart-item.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CartItem as CartItemType } from "@/types/cart";
import { formatCurrency } from "@/lib/format-currency";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Plus,
    Minus,
    Trash2,
    AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CartItemProps {
    item: CartItemType;
    onUpdateQuantity: (quantity: number) => void;
    onRemove: () => void;
    isLoading?: boolean;
}

export function CartItem({
                             item,
                             onUpdateQuantity,
                             onRemove,
                             isLoading = false,
                         }: CartItemProps) {
    const { locale } = useTranslation();
    const [quantity, setQuantity] = useState(item.quantity);

    const handleQuantityChange = (newQuantity: number) => {
        if (newQuantity < 0) return;
        if (newQuantity > item.variant.stock) return;

        setQuantity(newQuantity);
        onUpdateQuantity(newQuantity);
    };

    const imageUrl = item.variant.imageUrl || item.product.imageUrl || '/placeholder.png';
    const currency = locale === 'id' ? 'IDR' : 'USD';
    const price = locale === 'id' ? item.product.idPrice : item.product.enPrice;

    const discountedPrice = item.product.promotion?.isActive
        ? price * (1 - item.product.promotion.discount)
        : price;

    return (
        <div
            className={cn(
                "flex gap-3 p-3 rounded-lg border border-border",
                !item.isAvailable && "opacity-60 bg-muted"
            )}
        >
            {/* Image */}
            <Link
                href={`/products/${item.product.slug}`}
                className="relative w-16 h-16 flex-shrink-0"
            >
                <Image
                    src={imageUrl}
                    alt={item.product.name}
                    fill
                    className="object-cover rounded-md"
                />
                {item.product.promotion?.isActive && (
                    <Badge
                        variant="destructive"
                        className="absolute -top-2 -right-2 text-xs"
                    >
                        -{Math.round(item.product.promotion.discount * 100)}%
                    </Badge>
                )}
            </Link>

            {/* Details */}
            <div className="flex-1 min-w-0">
                <Link
                    href={`/products/${item.product.slug}`}
                    className="text-sm font-medium hover:underline line-clamp-1"
                >
                    {item.product.name}
                </Link>

                <p className="text-xs text-muted-foreground mt-0.5">
                    {item.variant.variantName}
                </p>

                {/* Price */}
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-semibold">
                        {formatCurrency(discountedPrice, currency)}
                    </span>
                    {item.product.promotion?.isActive && (
                        <span className="text-xs text-muted-foreground line-through">
                            {formatCurrency(price, currency)}
                        </span>
                    )}
                </div>

                {/* Availability Warning */}
                {!item.isAvailable && (
                    <div className="flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3 text-red-500 dark:text-red-400" />
                        <span className="text-xs text-red-500 dark:text-red-400">
                            {item.variant.stock === 0 ? 'Out of stock' : 'Unavailable'}
                        </span>
                    </div>
                )}

                {/* Stock Info */}
                {item.isAvailable && item.variant.stock < 10 && (
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                        Only {item.variant.stock} left in stock
                    </p>
                )}
            </div>

            {/* Quantity Controls */}
            <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={isLoading || !item.isAvailable || quantity <= 1}
                    >
                        <Minus className="w-3 h-3" />
                    </Button>

                    <Input
                        type="number"
                        value={quantity}
                        onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 0)}
                        className="w-12 h-7 text-center text-sm"
                        disabled={isLoading || !item.isAvailable}
                    />

                    <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={
                            isLoading ||
                            !item.isAvailable ||
                            quantity >= item.variant.stock
                        }
                    >
                        <Plus className="w-3 h-3" />
                    </Button>
                </div>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                                onClick={onRemove}
                                disabled={isLoading}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Remove from cart</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    );
}
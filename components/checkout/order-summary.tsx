// components/checkout/order-summary.tsx
"use client";

import { useMemo } from "react";
import Image from "next/image";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import { useTranslation } from "@/hooks/use-translation";
import { Currency } from "@/types/payment";
import type { CartItem, GuestCartItemWithDetails } from "@/types/cart";
import { formatCurrency } from "@/lib/format-currency";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface OrderSummaryProps {
    currency: Currency;
    shippingCost: number;
}

export function OrderSummary({ currency, shippingCost }: OrderSummaryProps) {
    const { isAuthenticated } = useAuth();
    const { cart, guestCartWithDetails } = useCart();
    const { t } = useTranslation();

    // Calculate totals
    const summary = useMemo(() => {
        let subtotal = 0;
        let discount = 0;
        const tax = 0; // Tax included in prices

        if (isAuthenticated && cart) {
            // Authenticated user
            cart.items.forEach((item) => {
                const price =
                    currency === "IDR" ? item.product.idPrice : item.product.enPrice;
                const itemDiscount = item.product.promotion?.isActive
                    ? Math.round(price * item.product.promotion.discount)
                    : 0;

                subtotal += price * item.quantity;
                discount += itemDiscount * item.quantity;
            });
        } else {
            // Guest user
            guestCartWithDetails.forEach((item) => {
                if (item.product) {
                    const price =
                        currency === "IDR"
                            ? item.product.idPrice
                            : item.product.enPrice;
                    const itemDiscount = item.product.promotion?.isActive
                        ? Math.round(price * item.product.promotion.discount)
                        : 0;

                    subtotal += price * item.quantity;
                    discount += itemDiscount * item.quantity;
                }
            });
        }

        const total = subtotal - discount + tax + shippingCost;

        return { subtotal, discount, tax, shippingCost, total };
    }, [isAuthenticated, cart, guestCartWithDetails, currency, shippingCost]);

    // Get items to display
    const items = isAuthenticated && cart ? cart.items : guestCartWithDetails;

    // Helper function to render individual cart item
    const renderCartItem = (
        item: CartItem | GuestCartItemWithDetails,
        index: number
    ) => {
        // Type guard to check if it's authenticated cart item
        const isAuthItem = "id" in item && "productId" in item;

        // Extract data with proper types
        const imageUrl = isAuthItem
            ? (item as CartItem).variant.imageUrl || (item as CartItem).product.imageUrl
            : (item as GuestCartItemWithDetails).variant?.imageUrl ||
            (item as GuestCartItemWithDetails).product?.imageUrl;

        const productName = isAuthItem
            ? (item as CartItem).product.name
            : (item as GuestCartItemWithDetails).product?.name || "Product";

        const variantName = isAuthItem
            ? (item as CartItem).variant.variantName
            : (item as GuestCartItemWithDetails).variant?.variantName || "";

        const price = isAuthItem
            ? currency === "IDR"
                ? (item as CartItem).product.idPrice
                : (item as CartItem).product.enPrice
            : currency === "IDR"
                ? (item as GuestCartItemWithDetails).product?.idPrice || 0
                : (item as GuestCartItemWithDetails).product?.enPrice || 0;

        const hasPromo = isAuthItem
            ? (item as CartItem).product.promotion?.isActive
            : (item as GuestCartItemWithDetails).product?.promotion?.isActive;

        const promoDiscount = hasPromo
            ? isAuthItem
                ? (item as CartItem).product.promotion?.discount || 0
                : (item as GuestCartItemWithDetails).product?.promotion?.discount || 0
            : 0;

        const finalPrice = price * (1 - promoDiscount);

        // Generate unique key
        const itemKey = isAuthItem
            ? (item as CartItem).id
            : `guest-${(item as GuestCartItemWithDetails).variantId}`;

        return (
            <div key={itemKey} className="flex gap-3">
                {/* Product Image */}
                <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted shrink-0">
                    <Image
                        src={imageUrl || "/placeholder.png"}
                        alt={productName}
                        fill
                        className="object-cover"
                    />
                    {hasPromo && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 text-[10px] px-1 py-0"
                        >
                            -{Math.round(promoDiscount * 100)}%
                        </Badge>
                    )}
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{productName}</p>
                    <p className="text-xs text-muted-foreground">{variantName}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-semibold">
                            {formatCurrency(finalPrice, currency)}
                        </span>
                        {hasPromo && (
                            <span className="text-xs text-muted-foreground line-through">
                                {formatCurrency(price, currency)}
                            </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                            × {item.quantity}
                        </span>
                    </div>
                </div>

                {/* Item Total */}
                <div className="text-right shrink-0">
                    <p className="text-sm font-semibold">
                        {formatCurrency(finalPrice * item.quantity, currency)}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {/* Items List */}
            <div>
                <h4 className="font-semibold text-sm mb-3">
                    {t.checkout?.items || "Items"} ({items.length})
                </h4>
                <ScrollArea className="max-h-[300px]">
                    <div className="space-y-3">
                        {items.map((item, index) => renderCartItem(item, index))}
                    </div>
                </ScrollArea>
            </div>

            <Separator />

            {/* Totals Breakdown */}
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                        {t.checkout?.subtotal || "Subtotal"}
                    </span>
                    <span className="font-medium">
                        {formatCurrency(summary.subtotal, currency)}
                    </span>
                </div>

                {summary.discount > 0 && (
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                            {t.checkout?.discount || "Discount"}
                        </span>
                        <span className="font-medium text-green-600">
                            -{formatCurrency(summary.discount, currency)}
                        </span>
                    </div>
                )}

                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                        {t.checkout?.shipping || "Shipping"}
                    </span>
                    <span className="font-medium">
                        {shippingCost > 0
                            ? formatCurrency(shippingCost, currency)
                            : (t.checkout?.notSelected || "Not selected")}
                    </span>
                </div>

                <Separator />

                <div className="flex justify-between text-base">
                    <span className="font-semibold">
                        {t.checkout?.total || "Total"}
                    </span>
                    <span className="font-bold text-lg">
                        {formatCurrency(summary.total, currency)}
                    </span>
                </div>

                <p className="text-xs text-muted-foreground mt-2">
                    {t.checkout?.taxIncluded || "Tax included in product prices"}
                </p>
            </div>
        </div>
    );
}
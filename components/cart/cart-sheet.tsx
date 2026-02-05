"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import { useTranslation } from "@/hooks/use-translation";
import { formatCurrency } from "@/lib/format-currency";
import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    ShoppingCart,
    Trash2,
    AlertCircle,
    Package,
    Minus,
    Plus,
} from "lucide-react";
import { CartItem } from "./cart-item";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { useMemo } from "react";

interface CartSheetProps {
    className?: string;
}

export function CartSheet({ className }: CartSheetProps) {
    const router = useRouter();
    const { t, locale } = useTranslation();
    const { isAuthenticated } = useAuth();
    const {
        cart,
        guestCartWithDetails,
        cartItemsCount,
        removeFromCart,
        updateQuantity,
        clearCart,
        isLoading,
        isCartOpen,
        setIsCartOpen,
    } = useCart();

    const handleCheckout = () => {
        if (!isAuthenticated) {
            router.push("/login?redirect=/checkout");
        } else {
            router.push("/checkout");
        }
        setIsCartOpen(false);
    };

    const isEmpty = cartItemsCount === 0;
    const hasUnavailableItems = cart?.summary.hasUnavailableItems || false;
    const currency = locale === "id" ? "IDR" : "USD";

    // Calculate subtotal based on locale for guest cart
    const guestCartSubtotal = useMemo(() => {
        if (isAuthenticated) return 0;

        return guestCartWithDetails.reduce((total, item) => {
            const price = locale === "id"
                ? item.product?.idPrice ?? 0
                : item.product?.enPrice ?? 0;

            const discount = item.product?.promotion?.isActive
                ? item.product?.promotion.discount ?? 0
                : 0;

            const finalPrice = price * (1 - discount);
            return total + (finalPrice * item.quantity);
        }, 0);
    }, [guestCartWithDetails, locale, isAuthenticated]);

    // Calculate subtotal based on locale for authenticated cart
    const authenticatedCartSubtotal = useMemo(() => {
        if (!isAuthenticated || !cart) return 0;

        return cart.items.reduce((total, item) => {
            const price = locale === "id"
                ? item.product.idPrice
                : item.product.enPrice;

            const discount = item.product.promotion?.isActive
                ? item.product.promotion.discount
                : 0;

            const finalPrice = price * (1 - discount);
            return total + (finalPrice * item.quantity);
        }, 0);
    }, [cart, locale, isAuthenticated]);

    // Use the correct subtotal based on authentication status
    const displaySubtotal = isAuthenticated ? authenticatedCartSubtotal : guestCartSubtotal;

    return (
        <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn("relative", className)}
                    aria-label="Cart"
                    onClick={(e) => (e.currentTarget as HTMLElement).blur()}
                >
                    <ShoppingCart className="w-5 h-5" />
                    {cartItemsCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {cartItemsCount}
                        </Badge>
                    )}
                </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-full flex flex-col p-0 bg-card">
                <SheetHeader className="px-6 py-4 border-b border-border">
                    <SheetTitle>{t.cart.title}</SheetTitle>
                    <SheetDescription>
                        {isEmpty
                            ? t.cart.emptyCart
                            : `${cartItemsCount} ${cartItemsCount === 1 ? t.cart.itemInCart : t.cart.itemsInCartPlural}`}
                    </SheetDescription>
                </SheetHeader>

                {isEmpty ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6">
                        <Package className="w-16 h-16 text-muted mb-4" />
                        <p className="text-muted-foreground text-center mb-4">{t.cart.emptyMessage}</p>
                        <Button
                            onClick={() => {
                                setIsCartOpen(false);
                                router.push("/search");
                            }}
                        >
                            {t.cart.continueShopping}
                        </Button>
                    </div>
                ) : (
                    <>
                        <ScrollArea className="flex-1 px-6 max-h-[55vh]" aria-orientation={"vertical"}>
                            <div className="space-y-4">
                                {isAuthenticated && cart ? (
                                    cart.items.map((item) => (
                                        <CartItem
                                            key={item.id}
                                            item={item}
                                            onUpdateQuantity={(quantity) =>
                                                updateQuantity(item.id, item.variantId, quantity)
                                            }
                                            onRemove={() => removeFromCart(item.id, item.variantId)}
                                            isLoading={isLoading}
                                        />
                                    ))
                                ) : (
                                    guestCartWithDetails.map((item) => {
                                        const imageUrl =
                                            item.variant?.imageUrl ||
                                            item.product?.imageUrl ||
                                            "/placeholder.png";

                                        const price = locale === "id"
                                            ? item.product?.idPrice ?? 0
                                            : item.product?.enPrice ?? 0;

                                        const discount = item.product?.promotion?.isActive
                                            ? item.product?.promotion.discount ?? 0
                                            : 0;

                                        const finalPrice = price * (1 - discount);

                                        return (
                                            <div
                                                key={item.variantId}
                                                className="flex gap-3 p-3 rounded-lg border border-border"
                                            >
                                                <Link
                                                    href={`/products/${item.product?.slug}`}
                                                    className="relative w-16 h-16 flex-shrink-0"
                                                >
                                                    <Image
                                                        src={imageUrl}
                                                        alt={item.product?.name || "Product"}
                                                        fill
                                                        className="object-cover rounded-md"
                                                    />
                                                    {discount > 0 && (
                                                        <Badge
                                                            variant="destructive"
                                                            className="absolute -top-2 -right-2 text-xs"
                                                        >
                                                            -{Math.round(discount * 100)}%
                                                        </Badge>
                                                    )}
                                                </Link>

                                                <div className="flex-1 min-w-0">
                                                    <Link
                                                        href={`/products/${item.product?.slug}`}
                                                        className="text-sm font-medium hover:underline line-clamp-1"
                                                    >
                                                        {item.product?.name || "Product"}
                                                    </Link>

                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        {item.variant?.variantName || ""}
                                                    </p>

                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-sm font-semibold">
                                                          {formatCurrency(finalPrice, currency)}
                                                        </span>
                                                        {discount > 0 && (
                                                            <span className="text-xs text-muted-foreground line-through">
                                                                {formatCurrency(price, currency)}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-1 mt-2">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-7 w-7"
                                                            onClick={() =>
                                                                updateQuantity("", item.variantId, item.quantity - 1)
                                                            }
                                                            disabled={isLoading || item.quantity <= 1}
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </Button>

                                                        <Input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) =>
                                                                updateQuantity(
                                                                    "",
                                                                    item.variantId,
                                                                    parseInt(e.target.value) || 0
                                                                )
                                                            }
                                                            className="w-12 h-7 text-center text-sm"
                                                            disabled={isLoading}
                                                        />

                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-7 w-7"
                                                            onClick={() =>
                                                                updateQuantity("", item.variantId, item.quantity + 1)
                                                            }
                                                            disabled={isLoading}
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                                                    onClick={() => removeFromCart("", item.variantId)}
                                                    disabled={isLoading}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {hasUnavailableItems && (
                                <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                            {t.cart.unavailableItemsWarning}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </ScrollArea>

                        <SheetFooter className="border-t border-border p-6 space-y-4">
                            <div className="w-full space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{t.cart.subtotal}</span>
                                    <span className="font-semibold">
                                        {formatCurrency(displaySubtotal, currency)}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2 pt-2">
                                <Button
                                    className="w-full"
                                    size="lg"
                                    onClick={handleCheckout}
                                    disabled={hasUnavailableItems || isLoading}
                                >
                                    {isAuthenticated ? t.cart.checkout : t.cart.loginToCheckout}
                                </Button>

                                <Button
                                    className="w-full"
                                    size="lg"
                                    variant="outline"
                                    onClick={clearCart}
                                    disabled={isLoading}
                                >
                                    {t.cart.clearCart}
                                </Button>
                            </div>
                        </SheetFooter>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
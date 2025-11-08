// components/cart/cart-sheet.tsx
"use client";

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
} from "lucide-react";
import { CartItem } from "./cart-item";
import { cn } from "@/lib/utils";

interface CartSheetProps {
    className?: string;
}

export function CartSheet({ className }: CartSheetProps) {
    const router = useRouter();
    const { t, locale } = useTranslation();
    const { isAuthenticated } = useAuth();
    const {
        cart,
        guestCart,
        cartItemsCount,
        cartSubtotal,
        removeFromCart,
        updateQuantity,
        isLoading,
        isCartOpen,
        setIsCartOpen,
    } = useCart();

    const handleCheckout = () => {
        if (!isAuthenticated) {
            router.push('/login?redirect=/checkout');
        } else {
            router.push('/checkout');
        }
        setIsCartOpen(false);
    };

    const isEmpty = cartItemsCount === 0;
    const hasUnavailableItems = cart?.summary.hasUnavailableItems || false;

    return (
        <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn("relative", className)}
                    aria-label="Cart"
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

            <SheetContent side="right" className="w-full sm:w-[400px] flex flex-col p-0">
                <SheetHeader className="px-6 py-4 border-b">
                    <SheetTitle>{t.cart.title}</SheetTitle>
                    <SheetDescription>
                        {isEmpty
                            ? t.cart.emptyCart
                            : `${cartItemsCount} ${cartItemsCount === 1 ? 'item' : 'items'} in cart`}
                    </SheetDescription>
                </SheetHeader>

                {isEmpty ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6">
                        <Package className="w-16 h-16 text-gray-300 mb-4" />
                        <p className="text-gray-500 text-center mb-4">
                            {t.cart.emptyMessage}
                        </p>
                        <Button
                            onClick={() => {
                                setIsCartOpen(false);
                                router.push('/search');
                            }}
                        >
                            Continue Shopping
                        </Button>
                    </div>
                ) : (
                    <>
                        <ScrollArea className="flex-1 px-6">
                            <div className="space-y-4 py-4">
                                {isAuthenticated && cart ? (
                                    // User cart items
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
                                    // Guest cart items (simplified view)
                                    guestCart.map((item) => (
                                        <div
                                            key={item.variantId}
                                            className="flex items-center justify-between py-2"
                                        >
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">Product</p>
                                                <p className="text-xs text-gray-500">
                                                    Quantity: {item.quantity}
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeFromCart('', item.variantId)}
                                                disabled={isLoading}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>

                            {hasUnavailableItems && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                                        <p className="text-sm text-yellow-800">
                                            Some items in your cart are unavailable or out of stock.
                                            Please review before checkout.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </ScrollArea>

                        <SheetFooter className="border-t p-6 space-y-4">
                            {/* Summary */}
                            <div className="w-full space-y-2">
                                {isAuthenticated && cart && (
                                    <>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Subtotal</span>
                                            <span className="font-semibold">
                                                {formatCurrency(cartSubtotal, locale === 'id' ? 'IDR' : 'USD')}
                                            </span>
                                        </div>
                                        {cart.summary.unavailableItems > 0 && (
                                            <div className="flex justify-between text-sm text-yellow-600">
                                                <span>Unavailable items</span>
                                                <span>{cart.summary.unavailableItems}</span>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Actions */}
                                <div className="space-y-2 pt-2">
                                    <Button
                                        className="w-full"
                                        size="lg"
                                        onClick={handleCheckout}
                                        disabled={hasUnavailableItems || isLoading}
                                    >
                                        {isAuthenticated ? t.cart.checkout : 'Login to Checkout'}
                                    </Button>

                                </div>
                            </div>
                        </SheetFooter>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
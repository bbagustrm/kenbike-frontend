// contexts/cart-context.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartService } from '@/services/cart.service';
import { Cart, CartItem, AddToCartDto, GuestCartItem } from '@/types/cart';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';

interface CartContextType {
    cart: Cart | null;
    guestCart: GuestCartItem[];
    isLoading: boolean;
    cartItemsCount: number;
    cartSubtotal: number;
    addToCart: (variantId: string, quantity: number) => Promise<void>;
    updateQuantity: (itemId: string, variantId: string, quantity: number) => Promise<void>;
    removeFromCart: (itemId: string, variantId: string) => Promise<void>;
    clearCart: () => Promise<void>;
    refreshCart: () => Promise<void>;
    isCartOpen: boolean;
    setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();
    const [cart, setCart] = useState<Cart | null>(null);
    const [guestCart, setGuestCart] = useState<GuestCartItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Load cart data
    const loadCart = useCallback(async () => {
        if (isAuthenticated) {
            try {
                const cartData = await CartService.getCart();
                setCart(cartData);
            } catch (error) {
                console.error('Failed to load cart:', error);
            }
        } else {
            // Load guest cart
            const items = CartService.getGuestCart();
            setGuestCart(items);
        }
    }, [isAuthenticated]);

    // Merge guest cart when user logs in
    useEffect(() => {
        if (isAuthenticated) {
            CartService.mergeGuestCart().then(() => {
                loadCart();
            });
        }
    }, [isAuthenticated, loadCart]);

    // Initial load
    useEffect(() => {
        loadCart();
    }, [loadCart]);

    // Add to cart
    const addToCart = async (variantId: string, quantity: number) => {
        setIsLoading(true);

        try {
            if (isAuthenticated) {
                const response = await CartService.addItem({ variantId, quantity });
                toast.success(response.message || "Item added to cart");
                await loadCart();
            } else {
                CartService.addToGuestCart(variantId, quantity);
                setGuestCart(CartService.getGuestCart());
                toast.success("Item added to cart");
            }
            setIsCartOpen(true); // Open cart sheet
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Failed to add item to cart";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Update quantity
    const updateQuantity = async (itemId: string, variantId: string, quantity: number) => {
        setIsLoading(true);

        try {
            if (isAuthenticated) {
                await CartService.updateItemQuantity(itemId, { quantity });
                await loadCart();
            } else {
                CartService.updateGuestCartItem(variantId, quantity);
                setGuestCart(CartService.getGuestCart());
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Failed to update quantity";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Remove from cart
    const removeFromCart = async (itemId: string, variantId: string) => {
        setIsLoading(true);

        try {
            if (isAuthenticated) {
                await CartService.removeItem(itemId);
                toast.success("Item removed from cart");
                await loadCart();
            } else {
                CartService.removeFromGuestCart(variantId);
                setGuestCart(CartService.getGuestCart());
                toast.success("Item removed from cart");
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Failed to remove item";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Clear cart
    const clearCart = async () => {
        setIsLoading(true);

        try {
            if (isAuthenticated) {
                await CartService.clearCart();
                await loadCart();
            } else {
                CartService.clearGuestCart();
                setGuestCart([]);
            }
            toast.success("Cart cleared successfully");
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Failed to clear cart";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate totals
    const cartItemsCount = isAuthenticated
        ? (cart?.summary.totalQuantity || 0)
        : guestCart.reduce((sum, item) => sum + item.quantity, 0);

    const cartSubtotal = isAuthenticated
        ? (cart?.summary.subtotal || 0)
        : 0; // Guest cart doesn't have price info yet

    return (
        <CartContext.Provider
            value={{
                cart,
                guestCart,
                isLoading,
                cartItemsCount,
                cartSubtotal,
                addToCart,
                updateQuantity,
                removeFromCart,
                clearCart,
                refreshCart: loadCart,
                isCartOpen,
                setIsCartOpen,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
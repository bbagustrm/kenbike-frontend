// contexts/cart-context.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartService } from '@/services/cart.service';
import { ProductService } from '@/services/product.service';
import { Cart, GuestCartItem } from '@/types/cart';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';

// Extended guest cart with product details
interface GuestCartItemWithDetails extends GuestCartItem {
    product?: {
        id: string;
        name: string;
        slug: string;
        idPrice: number;
        enPrice: number;
        imageUrl: string | null;
        promotion?: {
            isActive: boolean;
            discount: number;
        } | null;
    };
    variant?: {
        id: string;
        variantName: string;
        sku: string;
        stock: number;
        imageUrl: string | null;
    };
}

interface VariantWithImages {
    images?: { imageUrl?: string | null }[];
    imageUrl?: string | null;
    id: string;
    variantName: string;
    sku: string;
    stock: number;
}

interface CartContextType {
    cart: Cart | null;
    guestCart: GuestCartItem[];
    guestCartWithDetails: GuestCartItemWithDetails[];
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
    const [guestCartWithDetails, setGuestCartWithDetails] = useState<GuestCartItemWithDetails[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Fetch product details for guest cart items
    const fetchGuestCartDetails = useCallback(async (items: GuestCartItem[]) => {
        if (items.length === 0) {
            setGuestCartWithDetails([]);
            return;
        }

        try {
            // Fetch all variant details
            const detailsPromises = items.map(async (item) => {
                try {
                    // Fetch all products to find the variant
                    const response = await ProductService.getProducts({ limit: 100 });

                    // Find product that has this variant
                    for (const product of response.data) {
                        const variant = product.variants?.find(v => v.id === item.variantId);
                        if (variant) {
                            // Get first image from variant images array if available
                            const v = variant as VariantWithImages;

                            let variantImageUrl: string | null = null;
                            if (Array.isArray(v.images) && v.images.length > 0) {
                                variantImageUrl = v.images[0]?.imageUrl ?? null;
                            } else if (v.imageUrl) {
                                variantImageUrl = v.imageUrl;
                            }

                            return {
                                ...item,
                                product: {
                                    id: product.id,
                                    name: product.name,
                                    slug: product.slug,
                                    idPrice: product.idPrice,
                                    enPrice: product.enPrice,
                                    imageUrl: product.imageUrl,
                                    promotion: product.promotion,
                                },
                                variant: {
                                    id: variant.id,
                                    variantName: variant.variantName,
                                    sku: variant.sku,
                                    stock: variant.stock,
                                    imageUrl: variantImageUrl,
                                },
                            };
                        }
                    }
                    return item; // Return without details if not found
                } catch (error) {
                    console.error(`Failed to fetch details for variant ${item.variantId}:`, error);
                    return item;
                }
            });

            const itemsWithDetails = await Promise.all(detailsPromises);
            setGuestCartWithDetails(itemsWithDetails);
        } catch (error) {
            console.error('Failed to fetch guest cart details:', error);
        }
    }, []);

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
            // Fetch product details for guest cart
            await fetchGuestCartDetails(items);
        }
    }, [isAuthenticated, fetchGuestCartDetails]);

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
                const items = CartService.getGuestCart();
                setGuestCart(items);
                await fetchGuestCartDetails(items);
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
                const items = CartService.getGuestCart();
                setGuestCart(items);
                await fetchGuestCartDetails(items);
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
                const items = CartService.getGuestCart();
                setGuestCart(items);
                await fetchGuestCartDetails(items);
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
                setGuestCartWithDetails([]);
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
        : guestCartWithDetails.reduce((sum, item) => {
            if (item.product) {
                const price = item.product.idPrice;
                const discount = item.product.promotion?.isActive ? item.product.promotion.discount : 0;
                const finalPrice = price * (1 - discount);
                return sum + (finalPrice * item.quantity);
            }
            return sum;
        }, 0);

    return (
        <CartContext.Provider
            value={{
                cart,
                guestCart,
                guestCartWithDetails,
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
// types/cart.ts
export interface CartItem {
    id: string;
    productId: string;
    variantId: string;
    quantity: number;
    product: {
        id: string;
        name: string;
        slug: string;
        idPrice: number;
        enPrice: number;
        imageUrl: string | null;
        isActive: boolean;
        isDeleted: boolean;
        category?: {
            id: string;
            name: string;
            slug: string;
        };
        promotion?: {
            id: string;
            name: string;
            discount: number;
            startDate: string;
            endDate: string;
            isActive: boolean;
        } | null;
    };
    variant: {
        id: string;
        variantName: string;
        sku: string;
        stock: number;
        isActive: boolean;
        isDeleted: boolean;
        imageUrl: string | null;
    };
    subtotal: number;
    isAvailable: boolean;
    createdAt: string;
}

export interface CartSummary {
    totalItems: number;
    totalQuantity: number;
    subtotal: number;
    unavailableItems: number;
    hasUnavailableItems: boolean;
}

export interface Cart {
    id: string;
    userId: string;
    items: CartItem[];
    summary: CartSummary;
    createdAt: string;
    updatedAt: string;
}

export interface AddToCartDto {
    variantId: string;
    quantity: number;
}

export interface UpdateQuantityDto {
    quantity: number;
}

// Guest cart stored in localStorage
export interface GuestCartItem {
    variantId: string;
    quantity: number;
    addedAt: string;
}
// services/cart.service.ts
import { apiClient, handleApiError } from '@/lib/api-client';
import { Cart, AddToCartDto, UpdateQuantityDto, GuestCartItem } from '@/types/cart';

const GUEST_CART_KEY = 'kenbike_guest_cart';

export class CartService {
    // === API Methods ===
    static async getCart(): Promise<Cart> {
        try {
            const response = await apiClient.get('/cart');
            return response.data.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    static async addItem(dto: AddToCartDto): Promise<any> {
        try {
            const response = await apiClient.post('/cart/items', dto);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    static async updateItemQuantity(itemId: string, dto: UpdateQuantityDto): Promise<any> {
        try {
            const response = await apiClient.patch(`/cart/items/${itemId}`, dto);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    static async removeItem(itemId: string): Promise<any> {
        try {
            const response = await apiClient.delete(`/cart/items/${itemId}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    static async clearCart(): Promise<any> {
        try {
            const response = await apiClient.delete('/cart');
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    // === Guest Cart Methods (localStorage) ===
    static getGuestCart(): GuestCartItem[] {
        if (typeof window === 'undefined') return [];

        const stored = localStorage.getItem(GUEST_CART_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    static saveGuestCart(items: GuestCartItem[]): void {
        if (typeof window === 'undefined') return;

        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
    }

    static addToGuestCart(variantId: string, quantity: number): void {
        const items = this.getGuestCart();
        const existingIndex = items.findIndex(item => item.variantId === variantId);

        if (existingIndex >= 0) {
            items[existingIndex].quantity += quantity;
            items[existingIndex].addedAt = new Date().toISOString();
        } else {
            items.push({
                variantId,
                quantity,
                addedAt: new Date().toISOString(),
            });
        }

        this.saveGuestCart(items);
    }

    static updateGuestCartItem(variantId: string, quantity: number): void {
        const items = this.getGuestCart();
        const index = items.findIndex(item => item.variantId === variantId);

        if (index >= 0) {
            if (quantity === 0) {
                items.splice(index, 1);
            } else {
                items[index].quantity = quantity;
            }
            this.saveGuestCart(items);
        }
    }

    static removeFromGuestCart(variantId: string): void {
        const items = this.getGuestCart();
        const filtered = items.filter(item => item.variantId !== variantId);
        this.saveGuestCart(filtered);
    }

    static clearGuestCart(): void {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(GUEST_CART_KEY);
    }

    // === Merge Guest Cart with User Cart ===
    static async mergeGuestCart(): Promise<void> {
        const guestItems = this.getGuestCart();

        if (guestItems.length === 0) return;

        try {
            // Get current user cart
            const userCart = await this.getCart();

            // Find items to merge (not already in user cart)
            for (const guestItem of guestItems) {
                const existsInUserCart = userCart.items.some(
                    item => item.variantId === guestItem.variantId
                );

                // Only add if not already in user cart
                if (!existsInUserCart) {
                    await this.addItem({
                        variantId: guestItem.variantId,
                        quantity: guestItem.quantity,
                    });
                }
            }

            // Clear guest cart after merge
            this.clearGuestCart();
        } catch (error) {
            console.error('Failed to merge guest cart:', error);
        }
    }
}
// types/checkout.ts
import { ShippingAddress, ShippingType } from './order';
import { ShippingOption } from './shipping'; // Import dari shipping.ts

// Checkout Cart Item - simplified dari CartItem untuk keperluan checkout
export interface CheckoutCartItem {
    quantity: number;
    product: {
        id: string;
        name: string;
        slug?: string;
        idPrice: number;
        enPrice: number;
        imageUrl: string | null;
        promotion?: {
            isActive: boolean;
            discount: number;
        } | null;
    };
    variant: {
        id?: string;
        variantName: string;
        imageUrl: string | null;
        sku?: string;
        stock?: number;
        isActive?: boolean;
        isDeleted?: boolean;
    };
}

// Checkout Step Type
export type CheckoutStep = 'review' | 'shipping' | 'address';

// Checkout State
export interface CheckoutState {
    currentStep: CheckoutStep;
    shippingType: ShippingType;
    selectedShipping?: ShippingOption;
}

// Create Order Request (untuk checkout)
export interface CreateCheckoutOrderDto {
    shippingType: ShippingType;
    shippingMethod: string;
    courierCode?: string;
    courierService?: string;
    shippingZoneId?: string;
    shippingCost: number;
    shippingAddress: ShippingAddress;
}

// Re-export untuk convenience
export type { ShippingOption };
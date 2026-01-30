// types/order.ts

// ============================================
// ORDER TYPES - Using snake_case from API
// ============================================

// Import PaymentStatus from payment types to avoid duplicate definitions
import { PaymentStatus } from './payment';

// Re-export for convenience
export type { PaymentStatus };

export type OrderStatus =
    | 'PENDING'
    | 'PAID'
    | 'PROCESSING'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'FAILED';

export type ShippingType = 'DOMESTIC' | 'INTERNATIONAL';

export type Currency = 'IDR' | 'USD';

/**
 * Order Item (from API - snake_case)
 * Note: API doesn't return 'id' for order items, use sku as key
 */
export interface OrderItem {
    product_id?: string;
    variant_id?: string;
    product_name: string;
    variant_name: string;
    sku?: string;
    quantity: number;
    price_per_item: number;
    discount?: number;
    subtotal: number;
    product_image?: string | null;
}

/**
 * Shipping Info for List View (minimal)
 */
export interface ShippingInfoList {
    type: ShippingType;
    method?: string;
    recipient_name: string;
    address?: string;
    city: string;
    country: string;
}

/**
 * Shipping Info for Detail View (full)
 */
export interface ShippingInfoDetail {
    type: ShippingType;
    method?: string | null;
    courier?: string | null;
    service?: string | null;
    recipient_name: string;
    recipient_phone?: string;
    address: string;
    city: string;
    province?: string | null;
    country: string;
    postal_code?: string;
    notes?: string | null;
    zone?: string | null;
}

/**
 * Order User Info (for admin view)
 */
export interface OrderUser {
    id: string;
    email: string;
    username?: string;
    name?: string;
    phone?: string | null;
}

/**
 * Order Payment Info (nested structure from admin API)
 */
export interface OrderPayment {
    method: string | null;
    provider: string | null;
    payment_id: string | null;
}

/**
 * Order Timestamps (nested structure from admin API)
 */
export interface OrderTimestamps {
    created_at: string;
    paid_at: string | null;
    shipped_at: string | null;
    delivered_at: string | null;
    completed_at: string | null;
    canceled_at: string | null;
    updated_at: string;
}

/**
 * Order List Item (for list views)
 */
export interface OrderListItem {
    id: string;
    order_number: string;
    status: OrderStatus;
    subtotal: number;
    discount: number;
    tax: number;
    shipping_cost: number;
    total: number;
    currency: Currency;
    items_count: number;
    items: OrderItem[];
    shipping: ShippingInfoList;
    tracking_number?: string | null;
    payment_method?: string | null;
    payment_status?: PaymentStatus;
    created_at: string;
    paid_at?: string | null;
    shipped_at?: string | null;
    delivered_at?: string | null;
    // For admin view
    user?: OrderUser;
}

/**
 * Order Detail (full detail view)
 * Supports both flat (user API) and nested (admin API) structures
 */
export interface Order {
    id: string;
    order_number: string;
    user_id?: string;
    status: OrderStatus;
    subtotal: number;
    discount: number;
    tax: number;
    shipping_cost: number;
    total: number;
    currency: Currency;
    exchange_rate?: number | null;
    items: OrderItem[];

    // Nested shipping object from backend
    shipping: ShippingInfoDetail;

    // Tracking
    tracking_number?: string | null;
    biteship_order_id?: string | null;

    // Payment - flat structure (user API)
    payment_method?: string | null;
    payment_provider?: string | null;
    payment_id?: string | null;
    payment_status?: PaymentStatus;

    // Payment - nested structure (admin API)
    payment?: OrderPayment;

    // Timestamps - flat structure (user API)
    created_at: string;
    updated_at?: string;
    paid_at?: string | null;
    shipped_at?: string | null;
    delivered_at?: string | null;
    completed_at?: string | null;
    canceled_at?: string | null;

    // Timestamps - nested structure (admin API)
    timestamps?: OrderTimestamps;

    // User info (admin view)
    user?: OrderUser;
}

/**
 * Tracking History Item
 */
export interface TrackingHistoryItem {
    status: string;
    note?: string;
    date: string;
}

/**
 * Tracking Info
 */
export interface TrackingInfo {
    order_number: string;
    tracking_number: string;
    courier?: string;
    service?: string;
    shipping_method?: string;
    status: string;
    history?: TrackingHistoryItem[];
    tracking_url?: string;
    shipped_at?: string | null;
    delivered_at?: string | null;
}

/**
 * API Response Types
 */
export interface OrderResponse {
    status: string;
    code: number;
    message?: string;
    data: Order;
}

export interface OrderListResponse {
    status: string;
    code: number;
    data: OrderListItem[];
    meta: PaginationMeta;
}

export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

/**
 * Create Order DTO (frontend sends snake_case)
 */
export interface CreateOrderDto {
    recipient_name: string;
    recipient_phone: string;
    shipping_address: string;
    shipping_city: string;
    shipping_province?: string;
    shipping_country: string;
    shipping_postal_code: string;
    shipping_notes?: string;
    shipping_type: ShippingType;
    biteship_courier?: string;
    biteship_service?: string;
    biteship_price_id?: string;
    shipping_zone_id?: string;
    currency: Currency;
}

/**
 * Get Orders Params
 */
export interface GetOrdersParams {
    page?: number;
    limit?: number;
    status?: OrderStatus;
    sort_by?: 'created_at' | 'updated_at' | 'total';
    order?: 'asc' | 'desc';
    search?: string;
}

/**
 * Get All Orders Params (Admin)
 */
export interface GetAllOrdersParams extends GetOrdersParams {
    user_id?: string;
    payment_method?: string;
    shipping_type?: ShippingType;
    date_from?: string;
    date_to?: string;
}

/**
 * Update Order Status DTO
 */
export interface UpdateOrderStatusDto {
    status: OrderStatus;
    tracking_number?: string;
    notes?: string;
}

/**
 * Cancel Order DTO
 */
export interface CancelOrderDto {
    reason?: string;
}
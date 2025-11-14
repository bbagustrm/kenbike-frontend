// types/order.ts

export type OrderStatus =
    | 'PENDING'      // Order created, waiting payment
    | 'PAID'         // Payment confirmed
    | 'PROCESSING'   // Admin processing order
    | 'SHIPPED'      // Order shipped
    | 'DELIVERED'    // Order delivered
    | 'COMPLETED'    // Order completed
    | 'CANCELLED'    // Order cancelled
    | 'FAILED';      // Payment failed

export type PaymentStatus = 'UNPAID' | 'PAID' | 'FAILED';

export type PaymentMethod = 'MIDTRANS_SNAP' | 'PAYPAL';

export type ShippingType = 'DOMESTIC' | 'INTERNATIONAL';

// Order Item Interface
export interface OrderItem {
    id: string;
    productId: string;
    variantId: string;
    productName: string;
    variantName: string;
    sku: string;
    quantity: number;
    pricePerItem: number;
    discount: number;
    subtotal: number;
    productImage?: string;
}

// Shipping Address Interface
export interface ShippingAddress {
    recipientName: string;
    recipientPhone: string;
    shippingAddress: string;
    shippingCity: string;
    shippingProvince?: string;
    shippingCountry: string;
    shippingPostalCode: string;
    shippingNotes?: string;
}

// Order Interface (Complete)
export interface Order {
    id: string;
    orderNumber: string;
    userId: string;
    status: OrderStatus;

    // Items
    items: OrderItem[];

    // Pricing
    subtotal: number;
    discount: number;
    tax: number;
    shippingCost: number;
    total: number;
    currency: 'IDR' | 'USD';
    exchangeRate?: number;

    // Shipping
    shippingType: ShippingType;
    shippingMethod: string;
    biteshipCourier?: string;
    biteshipService?: string;
    biteshipOrderId?: string;
    trackingNumber?: string;
    shippingZoneId?: string;

    // Shipping Address
    recipientName: string;
    recipientPhone: string;
    shippingAddress: string;
    shippingCity: string;
    shippingProvince?: string;
    shippingCountry: string;
    shippingPostalCode: string;
    shippingNotes?: string;

    // Payment
    paymentMethod?: PaymentMethod;
    paymentProvider?: string;
    paymentId?: string;
    paymentStatus: PaymentStatus;

    // Timestamps
    paidAt?: string;
    shippedAt?: string;
    deliveredAt?: string;
    completedAt?: string;
    canceledAt?: string;
    createdAt: string;
    updatedAt: string;

    // Relations (optional from API)
    user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    };

    shippingZone?: {
        id: string;
        name: string;
        countries: string[];
    };
}

// DTOs

export interface CreateOrderDto {
    shippingType: ShippingType;
    shippingMethod: string;
    courierCode?: string;        // For domestic (biteship)
    courierService?: string;     // For domestic (biteship)
    shippingZoneId?: string;     // For international
    shippingCost: number;
    shippingAddress: ShippingAddress;
}

export interface GetOrdersParams {
    page?: number;
    limit?: number;
    status?: OrderStatus;
    search?: string;
    startDate?: string;
    endDate?: string;
}

export interface OrderStats {
    totalOrders: number;
    totalRevenue: number;
    totalPaid: number;
    totalShipped: number;
    byStatus: Record<OrderStatus, number>;
}

export interface UpdateOrderStatusDto {
    status: OrderStatus;
    notes?: string;
}

export interface MarkAsShippedDto {
    courierCode: string;
    courierService: string;
}

// API Response Types
export interface OrderResponse {
    status: string;
    data: Order;
}

export interface OrdersResponse {
    status: string;
    data: Order[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface OrderStatsResponse {
    status: string;
    data: OrderStats;
}

export interface ShippingLabelResponse {
    status: string;
    data: {
        labelUrl: string;
    };
}

export interface TrackingInfo {
    status: string;
    trackingNumber: string;
    courier: string;
    estimatedDelivery?: string;
    history: TrackingHistory[];
}

export interface TrackingHistory {
    status: string;
    note: string;
    updatedAt: string;
}

export interface TrackingResponse {
    status: string;
    data: TrackingInfo;
}
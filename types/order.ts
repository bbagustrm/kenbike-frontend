// types/order.ts

export enum OrderStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    PROCESSING = 'PROCESSING',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    FAILED = 'FAILED',
}

export enum PaymentMethod {
    MIDTRANS_SNAP = 'MIDTRANS_SNAP',
    PAYPAL = 'PAYPAL',
    MANUAL = 'MANUAL',
}

export enum ShippingType {
    DOMESTIC = 'DOMESTIC',
    INTERNATIONAL = 'INTERNATIONAL',
}

// Order Item
export interface OrderItem {
    id: string;
    orderId: string;
    productId: string | null;
    variantId: string | null;
    productName: string;
    variantName: string;
    sku: string;
    quantity: number;
    pricePerItem: number;
    discount: number;
    subtotal: number;
    productImage: string | null;
    createdAt: string;
}

// Order
export interface Order {
    id: string;
    orderNumber: string;
    userId: string;
    status: OrderStatus;

    // Pricing
    subtotal: number;
    discount: number;
    tax: number;
    shippingCost: number;
    total: number;

    // Currency & Exchange
    currency: string;
    exchangeRate: number | null;

    // Payment Info
    paymentMethod: PaymentMethod | null;
    paymentProvider: string | null;
    paymentId: string | null;

    // Shipping Info
    shippingType: ShippingType;
    shippingMethod: string;
    biteshipCourier: string | null;
    biteshipService: string | null;
    biteshipOrderId: string | null;
    trackingNumber: string | null;
    shippingZoneId: string | null;

    // Recipient Details
    recipientName: string;
    recipientPhone: string;
    shippingAddress: string;
    shippingCity: string;
    shippingProvince: string | null;
    shippingCountry: string;
    shippingPostalCode: string;
    shippingNotes: string | null;

    // Timestamps
    paidAt: string | null;
    shippedAt: string | null;
    deliveredAt: string | null;
    completedAt: string | null;
    canceledAt: string | null;
    createdAt: string;
    updatedAt: string;

    // Relations
    items: OrderItem[];
    user?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string | null;
    };
    shippingZone?: {
        id: string;
        name: string;
        minDays: number;
        maxDays: number;
    } | null;
}

// Order List Item (lighter version)
export interface OrderListItem {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    total: number;
    currency: string;
    shippingType: ShippingType;
    paymentMethod: PaymentMethod | null;
    createdAt: string;
    itemsCount: number;
    firstItemImage: string | null;
}

// Create Order DTO
export interface CreateOrderDto {
    // Shipping details
    shippingType: ShippingType;
    recipientName: string;
    recipientPhone: string;
    shippingAddress: string;
    shippingCity: string;
    shippingProvince?: string; // For domestic
    shippingCountry: string;
    shippingPostalCode: string;
    shippingNotes?: string;

    // Domestic shipping (Biteship)
    biteshipCourier?: string; // "jne", "tiki", etc
    biteshipService?: string; // "reg", "yes", etc

    // International shipping
    shippingZoneId?: string;

    // Payment
    paymentMethod: PaymentMethod;
}

// Calculate Shipping DTO
// Calculate Shipping DTO
export interface CalculateShippingDto {
    country: string;
    province?: string; // For domestic
    city?: string; // For domestic
    postalCode: string;
    address?: string; // Backend may require this
    totalWeight: number; // in grams
}

// Shipping Rate (Biteship)
export interface ShippingRate {
    courier: string;
    courierName: string;
    courierLogo: string | null;
    service: string;
    serviceName: string;
    description: string;
    price: number;
    estimatedDays: string; // e.g., "2-3 hari"
    minDay: number;
    maxDay: number;
}

// Shipping Calculation Response
export interface ShippingCalculationResponse {
    type: ShippingType;
    country: string;
    rates?: ShippingRate[]; // For domestic
    cost?: number; // For international
    zone?: {
        id: string;
        name: string;
        minDays: number;
        maxDays: number;
    };
}

// API Response types
export interface OrdersResponse {
    data: OrderListItem[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

export interface OrderResponse {
    data: Order;
}

export interface CreateOrderResponse {
    message: string;
    data: {
        order: Order;
        payment: {
            method: PaymentMethod;
            redirectUrl?: string; // Midtrans Snap URL
            approveUrl?: string; // PayPal approve URL
        };
    };
}

export interface CancelOrderResponse {
    message: string;
    data: {
        orderNumber: string;
        status: OrderStatus;
    };
}

// Query params for orders
export interface GetOrdersParams {
    page?: number;
    limit?: number;
    status?: OrderStatus;
    sortBy?: 'createdAt' | 'total';
    order?: 'asc' | 'desc';
}

// Order status labels
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: 'Pending Payment',
    [OrderStatus.PAID]: 'Paid',
    [OrderStatus.PROCESSING]: 'Processing',
    [OrderStatus.SHIPPED]: 'Shipped',
    [OrderStatus.DELIVERED]: 'Delivered',
    [OrderStatus.COMPLETED]: 'Completed',
    [OrderStatus.CANCELLED]: 'Cancelled',
    [OrderStatus.FAILED]: 'Failed',
};

// Order status colors
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    [OrderStatus.PAID]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    [OrderStatus.PROCESSING]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    [OrderStatus.SHIPPED]: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    [OrderStatus.DELIVERED]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    [OrderStatus.COMPLETED]: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    [OrderStatus.FAILED]: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};
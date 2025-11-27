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
    biteshipPriceId?: string; // ← REQUIRED for backend! "jne_reg", "tiki_reg", etc

    // International shipping
    shippingZoneId?: string;

    // Payment
    paymentMethod: PaymentMethod;
    currency: 'IDR' | 'USD'; // ← ADDED! Required by backend
}

// Calculate Shipping DTO - Backend Compatible (REQUIRED fields!)
export interface CalculateShippingDto {
    country: string; // REQUIRED! 2-char ISO code (e.g., "ID", "US", "SG")
    province?: string; // Optional - Required for domestic Indonesia only
    city: string; // REQUIRED! City name
    district?: string; // Optional - Kecamatan (for domestic Indonesia)
    postal_code: string; // REQUIRED! Postal/ZIP code (1-10 chars)
    address: string; // REQUIRED! Full address (10-500 chars)
    total_weight: number; // REQUIRED! Weight in grams (1-30000, max 30kg)
    courier?: string; // Optional - Courier preference for domestic: "jne,tiki" or empty for all
}

// Shipping Option (Backend format)
export interface ShippingOption {
    type: 'DOMESTIC' | 'INTERNATIONAL';
    courier?: string; // For domestic: "jne", "tiki", etc.
    service?: string; // For domestic: "reg", "yes", etc.
    serviceName: string; // Display name: "JNE REG", "Zone 1 - Southeast Asia"
    description?: string;
    cost: number;
    estimatedDays: {
        min: number;
        max: number;
    };
    // Biteship specific (for domestic)
    biteshipPriceId?: string;
    insurance?: {
        required: boolean;
        fee: number;
    };
    // Zone specific (for international)
    zoneId?: string;
    zoneName?: string;
}

// Shipping Calculation Response (Backend format)
export interface ShippingCalculationResponse {
    destination: {
        country: string;
        city: string;
        postalCode: string;
    };
    totalWeight: number; // in grams
    shippingType: 'DOMESTIC' | 'INTERNATIONAL';
    options: ShippingOption[];
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
        id: string;
        orderNumber: string;
        status: string;
        subtotal: number;
        discount: number;
        tax: number;
        shippingCost: number;
        total: number;
        currency: string;
        items: {
            productName: string;
            variantName: string;
            quantity: number;
            pricePerItem: number;
            subtotal: number;
        }[];
        shipping: {
            type: string;
            method: string;
            recipientName: string;
            address: string;
            city: string;
            country: string;
        };
        paymentMethod?: string;
        createdAt: string; // atau Date, tergantung bagaimana API kamu mengirimnya
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
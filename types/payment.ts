// types/payment.ts

export type PaymentMethod = 'MIDTRANS_SNAP' | 'PAYPAL';

export type PaymentProvider = 'midtrans' | 'paypal';

export interface CreatePaymentDto {
    orderNumber: string;
    paymentMethod: PaymentMethod;
}

export interface PaymentResponse {
    status: string;
    data: {
        paymentUrl: string;
        token: string;
        orderNumber: string;
    };
}

export interface PaymentStatusData {
    orderNumber: string;
    paymentStatus: 'UNPAID' | 'PAID' | 'FAILED';
    paymentMethod?: PaymentMethod;
    paymentProvider?: string;
    paymentId?: string;
    paidAt?: string;
    paymentDetails?: unknown;
}

export interface PaymentStatusResponse {
    status: string;
    data: PaymentStatusData;
}

// Midtrans specific
export interface MidtransConfig {
    clientKey: string;
    isProduction: boolean;
}

// PayPal specific
export interface PayPalConfig {
    clientId: string;
    mode: 'sandbox' | 'live';
}

// Payment method configuration
export interface PaymentMethodConfig {
    method: PaymentMethod;
    name: string;
    description: string;
    icon: string;
    available: boolean;
    currencies: ('IDR' | 'USD')[];
}
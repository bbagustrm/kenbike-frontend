// types/payment.ts

/** Currency enum */
export type Currency = "IDR" | "USD";

/**
 * Payment method enum
 */
export type PaymentMethod = "MIDTRANS_SNAP" | "PAYPAL";

/**
 * Payment provider enum
 */
export type PaymentProvider = "MIDTRANS" | "PAYPAL";

/**
 * Payment status enum
 * Note: REFUNDED can be added later when refund feature is implemented
 */
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "CANCELLED";

/**
 * DTO for creating payment (snake_case for API)
 */
export interface CreatePaymentDto {
    order_number: string;
    payment_method: PaymentMethod;
}

/**
 * Payment response from create payment (snake_case from API)
 */
export interface PaymentResponse {
    order_number: string;
    payment_method: PaymentMethod;
    payment_provider?: string;
    payment_url?: string; // URL to redirect/open
    token?: string; // Midtrans Snap token
    payment_id?: string; // PayPal order ID
    currency?: string;
    amount?: number;
    expires_at?: string;
}

/**
 * Payment status response (snake_case from API)
 */
export interface PaymentStatusResponse {
    order_number: string;
    payment_status: PaymentStatus;
    payment_method: string;
    payment_id?: string;
    paid_at?: string;
    amount: number;
    currency: string;
}

/**
 * DTO for capturing PayPal payment (snake_case for API)
 */
export interface CapturePayPalPaymentDto {
    order_number: string;
    paypal_order_id: string;
}

/**
 * Midtrans Snap callback result (from Midtrans SDK - keep as is)
 */
export interface MidtransSnapResult {
    status_code: string;
    status_message: string;
    transaction_id: string;
    order_id: string;
    gross_amount: string;
    payment_type: string;
    transaction_time: string;
    transaction_status: string;
    fraud_status?: string;
}

/**
 * PayPal return URL params
 */
export interface PayPalReturnParams {
    payment: "success" | "cancelled";
    token: string;
    PayerID: string;
}

/**
 * Payment method config for UI
 */
export interface PaymentMethodConfig {
    id: PaymentMethod;
    name: string;
    description: string;
    logo: string;
    available: boolean;
    popular?: boolean;
    supported_currencies: Currency[];
}

/**
 * API response wrapper
 */
export interface PaymentApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
}
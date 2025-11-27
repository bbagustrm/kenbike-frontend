// types/payment.ts

export enum PaymentProvider {
    MIDTRANS = 'midtrans',
    PAYPAL = 'paypal',
}

export interface MidtransSnapResponse {
    token: string;
    redirect_url: string;
}

export interface PayPalCreateOrderResponse {
    id: string; // PayPal order ID
    status: string;
    links: {
        href: string;
        rel: string;
        method: string;
    }[];
}

export interface PaymentRedirect {
    method: 'MIDTRANS_SNAP' | 'PAYPAL';
    redirectUrl?: string; // Midtrans Snap URL
    approveUrl?: string; // PayPal approve URL
    orderId?: string; // PayPal order ID
    token?: string; // Midtrans token
}
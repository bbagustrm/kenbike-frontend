// lib/payment-utils.ts

import { PaymentMethod, MidtransSnapResult } from '@/types/payment';

/**
 * Window interface with Midtrans Snap
 */
interface WindowWithSnap extends Window {
    snap?: MidtransSnap;
}

/**
 * Midtrans Snap interface
 */
interface MidtransSnap {
    pay: (token: string, options: {
        onSuccess?: (result: MidtransSnapResult) => void;
        onPending?: (result: MidtransSnapResult) => void;
        onError?: (result: MidtransSnapResult) => void;
        onClose?: () => void;
    }) => void;
}

/**
 * Load Midtrans Snap script dynamically
 * Returns the snap object
 */
export const loadMidtransSnap = (): Promise<MidtransSnap> => {
    return new Promise((resolve, reject) => {
        const windowWithSnap = window as unknown as WindowWithSnap;

        // Check if already loaded
        if (typeof window !== 'undefined' && windowWithSnap.snap) {
            resolve(windowWithSnap.snap);
            return;
        }

        // Create script element
        const script = document.createElement('script');
        const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;

        if (!clientKey) {
            reject(new Error('Midtrans client key not configured'));
            return;
        }

        // Use sandbox or production URL based on env
        const isProduction = process.env.NODE_ENV === 'production';
        script.src = isProduction
            ? 'https://app.midtrans.com/snap/snap.js'
            : 'https://app.sandbox.midtrans.com/snap/snap.js';

        script.setAttribute('data-client-key', clientKey);
        script.async = true;

        script.onload = () => {
            console.log('✅ Midtrans Snap loaded');
            if (windowWithSnap.snap) {
                resolve(windowWithSnap.snap);
            } else {
                reject(new Error('Snap object not available after script load'));
            }
        };

        script.onerror = () => {
            reject(new Error('Failed to load Midtrans Snap'));
        };

        document.body.appendChild(script);
    });
};

/**
 * Open Midtrans Snap payment popup
 */
export const openMidtransSnap = async (
    token: string,
    callbacks: {
        onSuccess?: (result: MidtransSnapResult) => void;
        onPending?: (result: MidtransSnapResult) => void;
        onError?: (result: MidtransSnapResult) => void;
        onClose?: () => void;
    } = {}
): Promise<void> => {
    try {
        // Load Snap
        const snap = await loadMidtransSnap();

        snap.pay(token, {
            onSuccess: (result: MidtransSnapResult) => {
                console.log('✅ Midtrans payment success:', result);
                callbacks.onSuccess?.(result);
            },
            onPending: (result: MidtransSnapResult) => {
                console.log('⏳ Midtrans payment pending:', result);
                callbacks.onPending?.(result);
            },
            onError: (result: MidtransSnapResult) => {
                console.error('❌ Midtrans payment error:', result);
                callbacks.onError?.(result);
            },
            onClose: () => {
                console.log('🔒 Midtrans Snap closed');
                callbacks.onClose?.();
            },
        });
    } catch (error) {
        console.error('Failed to open Midtrans Snap:', error);
        throw error;
    }
};

/**
 * Redirect to PayPal
 */
export const redirectToPayPal = (approvalUrl: string): void => {
    if (typeof window !== 'undefined') {
        window.location.href = approvalUrl;
    }
};

/**
 * Parse PayPal return URL parameters
 */
export const parsePayPalReturnUrl = (
    searchParams: URLSearchParams
): {
    payment: 'success' | 'cancelled' | null;
    token: string | null;
    payerId: string | null;
} => {
    return {
        payment: searchParams.get('payment') as 'success' | 'cancelled' | null,
        token: searchParams.get('token'),
        payerId: searchParams.get('PayerID'),
    };
};

/**
 * Get payment method config
 */
export const getPaymentMethodConfig = (method: PaymentMethod, currency: 'IDR' | 'USD') => {
    const configs = {
        MIDTRANS_SNAP: {
            id: 'MIDTRANS_SNAP' as PaymentMethod,
            name: 'Midtrans',
            description: 'Credit/Debit Card, Bank Transfer, E-Wallet (GoPay, OVO, Dana)',
            logo: '/images/payment/midtrans.png',
            available: currency === 'IDR',
            popular: true,
            supportedCurrencies: ['IDR'] as Array<'IDR' | 'USD'>,
        },
        PAYPAL: {
            id: 'PAYPAL' as PaymentMethod,
            name: 'PayPal',
            description: 'Pay securely with PayPal or credit card',
            logo: '/images/payment/paypal.png',
            available: currency === 'USD',
            popular: false,
            supportedCurrencies: ['USD'] as Array<'IDR' | 'USD'>,
        },
    };

    return configs[method];
};

/**
 * Get available payment methods for currency
 */
export const getAvailablePaymentMethods = (currency: 'IDR' | 'USD') => {
    if (currency === 'IDR') {
        return [getPaymentMethodConfig('MIDTRANS_SNAP', currency)];
    } else {
        return [getPaymentMethodConfig('PAYPAL', currency)];
    }
};

/**
 * Check if payment method is available for currency
 */
export const isPaymentMethodAvailable = (method: PaymentMethod, currency: 'IDR' | 'USD'): boolean => {
    const config = getPaymentMethodConfig(method, currency);
    return config.available;
};

/**
 * Format payment method name for display
 */
export const formatPaymentMethodName = (method: string | null | undefined): string => {
    if (!method) return 'Not specified';

    const names: Record<string, string> = {
        MIDTRANS_SNAP: 'Midtrans',
        PAYPAL: 'PayPal',
    };

    return names[method] || method;
};

/**
 * Get payment method icon component
 */
export const getPaymentMethodIcon = (method: string | null | undefined): string => {
    if (!method) return '💳';

    const icons: Record<string, string> = {
        MIDTRANS_SNAP: '💳',
        PAYPAL: '🅿️',
    };

    return icons[method] || '💳';
};
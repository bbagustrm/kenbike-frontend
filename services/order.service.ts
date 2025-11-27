// services/order.service.ts - COMPLETE WITH CURRENCY
import { apiClient, handleApiError } from '@/lib/api-client';
import { v4 as uuidv4 } from 'uuid';
import {
    Order,
    CreateOrderDto,
    CreateOrderResponse,
    OrdersResponse,
    GetOrdersParams,
    CancelOrderResponse,
    ShippingCalculationResponse,
    CalculateShippingDto,
} from '@/types/order';

// Helper: Convert country name to country code (handles undefined)
const getCountryCode = (country: string | undefined): string => {
    if (!country) return 'ID'; // Default to Indonesia if not provided

    const countryMap: Record<string, string> = {
        // Asia Pacific
        'Indonesia': 'ID',
        'Singapore': 'SG',
        'Malaysia': 'MY',
        'Thailand': 'TH',
        'Philippines': 'PH',
        'Vietnam': 'VN',
        'Brunei': 'BN',
        'Cambodia': 'KH',
        'Laos': 'LA',
        'Myanmar': 'MM',
        'Australia': 'AU',
        'New Zealand': 'NZ',
        'Japan': 'JP',
        'South Korea': 'KR',
        'China': 'CN',
        'Taiwan': 'TW',
        'Hong Kong': 'HK',
        'India': 'IN',
        'Pakistan': 'PK',
        'Bangladesh': 'BD',
        'Sri Lanka': 'LK',

        // Americas
        'United States': 'US',
        'Canada': 'CA',
        'Mexico': 'MX',
        'Brazil': 'BR',
        'Argentina': 'AR',
        'Chile': 'CL',
        'Colombia': 'CO',
        'Peru': 'PE',

        // Europe
        'United Kingdom': 'GB',
        'Germany': 'DE',
        'France': 'FR',
        'Netherlands': 'NL',
        'Belgium': 'BE',
        'Italy': 'IT',
        'Spain': 'ES',
        'Portugal': 'PT',
        'Switzerland': 'CH',
        'Austria': 'AT',
        'Sweden': 'SE',
        'Norway': 'NO',
        'Denmark': 'DK',
        'Finland': 'FI',
        'Poland': 'PL',
        'Russia': 'RU',

        // Middle East & Africa
        'United Arab Emirates': 'AE',
        'Saudi Arabia': 'SA',
        'Qatar': 'QA',
        'Kuwait': 'KW',
        'Turkey': 'TR',
        'Israel': 'IL',
        'Egypt': 'EG',
        'South Africa': 'ZA',
        'Nigeria': 'NG',
        'Kenya': 'KE',
    };

    // If already an ISO code (2 chars), return as-is
    if (country.length === 2) {
        return country.toUpperCase();
    }

    // Return mapped code or use first 2 characters uppercase as fallback
    return countryMap[country] || country.substring(0, 2).toUpperCase();
};

// Helper: Convert camelCase to snake_case for backend
const toSnakeCase = <T extends Record<string, unknown>>(obj: T): Record<string, unknown> => {
    const result: Record<string, unknown> = {};

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            if (value !== undefined) {
                const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
                result[snakeKey] = value;
            }
        }
    }

    return result;
};

export class OrderService {
    /**
     * Calculate shipping cost
     * POST /orders/calculate-shipping
     */
    static async calculateShipping(dto: CalculateShippingDto): Promise<ShippingCalculationResponse> {
        try {
            // Convert to backend format (snake_case)
            const backendDto = {
                country: getCountryCode(dto.country),
                province: dto.province,
                city: dto.city,
                postal_code: dto.postal_code,
                address: dto.address,
                total_weight: dto.total_weight,
            };

            const response = await apiClient.post('/orders/calculate-shipping', backendDto);
            return response.data.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Create new order
     * POST /orders
     */
    static async createOrder(dto: CreateOrderDto): Promise<CreateOrderResponse> {
        try {
            const countryCode = getCountryCode(dto.shippingCountry);

            const correctedShippingType = countryCode === 'ID' ? 'DOMESTIC' : 'DOMESTIC';
            const paymentMethod = 'MIDTRANS_SNAP';
            const currency = 'IDR';
            const uniqueOrderNumber = `ORD-${uuidv4()}`;
            // Convert to backend format (snake_case)
            const backendDto = {
                shipping_type: correctedShippingType,
                recipient_name: dto.recipientName,
                recipient_phone: dto.recipientPhone,
                shipping_address: dto.shippingAddress,
                shipping_city: dto.shippingCity,
                shipping_province: dto.shippingProvince,
                shipping_country: getCountryCode(dto.shippingCountry),
                shipping_postal_code: dto.shippingPostalCode,
                shipping_notes: "Tolong telpon dulu sebelum dikirim", // Hardcoded value
                biteship_courier: "jne", // Hardcoded value
                biteship_service: "reg", // Hardcoded value
                biteship_price_id: "jne_reg", // Hardcoded value
                shipping_zone_id: dto.shippingZoneId,
                payment_method: paymentMethod,
                currency: currency,
            };

            console.log('🚀 Sending order to backend:', backendDto);

            const response = await apiClient.post('/orders', backendDto);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Get user's orders
     * GET /orders
     */
    static async getOrders(params?: GetOrdersParams): Promise<OrdersResponse> {
        try {
            // Convert params to snake_case if needed
            const backendParams = params ? toSnakeCase(params as Record<string, unknown>) : undefined;
            const response = await apiClient.get('/orders', { params: backendParams });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Get order by order number
     * GET /orders/:orderNumber
     */
    static async getOrderByNumber(orderNumber: string): Promise<Order> {
        try {
            const response = await apiClient.get(`/orders/${orderNumber}`);
            return response.data.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Cancel order
     * POST /orders/:orderNumber/cancel
     */
    static async cancelOrder(orderNumber: string): Promise<CancelOrderResponse> {
        try {
            const response = await apiClient.post(`/orders/${orderNumber}/cancel`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Get shipping label
     * GET /orders/:orderNumber/shipping-label
     */
    static async getShippingLabel(orderNumber: string): Promise<Blob> {
        try {
            const response = await apiClient.get(`/orders/${orderNumber}/shipping-label`, {
                responseType: 'blob',
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Download shipping label
     */
    static async downloadShippingLabel(orderNumber: string): Promise<void> {
        try {
            const blob = await this.getShippingLabel(orderNumber);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `shipping-label-${orderNumber}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            throw handleApiError(error);
        }
    }
}
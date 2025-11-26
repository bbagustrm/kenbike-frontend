// services/order.service.ts
import { apiClient, handleApiError } from '@/lib/api-client';
import {
    Order,
    OrderListItem,
    CreateOrderDto,
    CreateOrderResponse,
    OrderResponse,
    OrdersResponse,
    GetOrdersParams,
    CancelOrderResponse,
    ShippingCalculationResponse,
    CalculateShippingDto,
} from '@/types/order';

export class OrderService {
    /**
     * Calculate shipping cost
     * POST /orders/calculate-shipping
     */
    static async calculateShipping(dto: CalculateShippingDto): Promise<ShippingCalculationResponse> {
        try {
            const response = await apiClient.post('/orders/calculate-shipping', dto);
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
            const response = await apiClient.post('/orders', dto);
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
            const response = await apiClient.get('/orders', { params });
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
     * Get shipping label (for domestic orders)
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
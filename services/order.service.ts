// services/order.service.ts

import apiClient, { handleApiError } from '@/lib/api-client';
import {
    Order,
    CreateOrderDto,
    GetOrdersParams,
    OrderStats,
    UpdateOrderStatusDto,
    MarkAsShippedDto,
    OrderResponse,
    OrdersResponse,
    OrderStatsResponse,
    ShippingLabelResponse,
    TrackingResponse,
} from '@/types/order';
import {
    CalculateShippingDto,
    CalculateShippingResponse,
} from '@/types/shipping';

export class OrderService {
    // ==========================================
    // USER ENDPOINTS
    // ==========================================

    /**
     * Calculate shipping costs
     * POST /orders/calculate-shipping
     */
    static async calculateShipping(
        data: CalculateShippingDto
    ): Promise<CalculateShippingResponse> {
        try {
            const response = await apiClient.post<CalculateShippingResponse>(
                '/orders/calculate-shipping',
                data
            );
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Create order from cart
     * POST /orders
     */
    static async createOrder(data: CreateOrderDto): Promise<OrderResponse> {
        try {
            const response = await apiClient.post<OrderResponse>('/orders', data);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Get user's orders
     * GET /orders
     */
    static async getUserOrders(
        params?: GetOrdersParams
    ): Promise<OrdersResponse> {
        try {
            const response = await apiClient.get<OrdersResponse>('/orders', {
                params,
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Get order detail by order number
     * GET /orders/:orderNumber
     */
    static async getOrderDetail(orderNumber: string): Promise<OrderResponse> {
        try {
            const response = await apiClient.get<OrderResponse>(
                `/orders/${orderNumber}`
            );
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Cancel order (only if unpaid)
     * DELETE /orders/:orderNumber
     */
    static async cancelOrder(orderNumber: string): Promise<{ status: string; message: string }> {
        try {
            const response = await apiClient.delete<{ status: string; message: string }>(
                `/orders/${orderNumber}`
            );
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Download shipping label (USER)
     * GET /orders/:orderNumber/shipping-label
     */
    static async getShippingLabel(
        orderNumber: string
    ): Promise<string> {
        try {
            const response = await apiClient.get<ShippingLabelResponse>(
                `/orders/${orderNumber}/shipping-label`
            );
            return response.data.data.labelUrl;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    // ==========================================
    // ADMIN ENDPOINTS
    // ==========================================

    /**
     * Get all orders (admin)
     * GET /admin/orders
     */
    static async getAllOrders(
        params?: GetOrdersParams
    ): Promise<OrdersResponse> {
        try {
            const response = await apiClient.get<OrdersResponse>('/admin/orders', {
                params,
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Get order statistics
     * GET /admin/orders/stats
     */
    static async getOrderStats(): Promise<OrderStatsResponse> {
        try {
            const response = await apiClient.get<OrderStatsResponse>(
                '/admin/orders/stats'
            );
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Get order detail (admin)
     * GET /admin/orders/:orderNumber
     */
    static async getAdminOrderDetail(
        orderNumber: string
    ): Promise<OrderResponse> {
        try {
            const response = await apiClient.get<OrderResponse>(
                `/admin/orders/${orderNumber}`
            );
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Update order status
     * PATCH /admin/orders/:orderNumber/status
     */
    static async updateOrderStatus(
        orderNumber: string,
        data: UpdateOrderStatusDto
    ): Promise<OrderResponse> {
        try {
            const response = await apiClient.patch<OrderResponse>(
                `/admin/orders/${orderNumber}/status`,
                data
            );
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Mark order as shipped
     * POST /admin/orders/:orderNumber/ship
     */
    static async markAsShipped(
        orderNumber: string,
        data: MarkAsShippedDto
    ): Promise<OrderResponse> {
        try {
            const response = await apiClient.post<OrderResponse>(
                `/admin/orders/${orderNumber}/ship`,
                data
            );
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Get tracking info
     * GET /admin/orders/:orderNumber/tracking
     */
    static async getTracking(orderNumber: string): Promise<TrackingResponse> {
        try {
            const response = await apiClient.get<TrackingResponse>(
                `/admin/orders/${orderNumber}/tracking`
            );
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Download shipping label (ADMIN)
     * GET /admin/orders/:orderNumber/shipping-label
     */
    static async getAdminShippingLabel(
        orderNumber: string
    ): Promise<string> {
        try {
            const response = await apiClient.get<ShippingLabelResponse>(
                `/admin/orders/${orderNumber}/shipping-label`
            );
            return response.data.data.labelUrl;
        } catch (error) {
            throw handleApiError(error);
        }
    }
}
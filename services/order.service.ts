// services/order.service.ts

import { apiClient, handleApiError } from '@/lib/api-client';
import {
    Order,
    OrderListItem,
    CreateOrderDto,
    GetOrdersParams,
    GetAllOrdersParams,
    CancelOrderDto,
    UpdateOrderStatusDto,
    TrackingInfo,
    PaginationMeta,
} from '@/types/order';

/**
 * Order Service
 * Handles all order-related API calls
 * API uses snake_case, frontend types match API
 */
export class OrderService {
    /**
     * Create order from cart
     */
    static async createOrder(dto: CreateOrderDto): Promise<{ data: Order; message: string }> {
        try {
            console.log('📦 Creating order with data:', dto);
            const response = await apiClient.post('/orders', dto);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Get user's orders with pagination and filters
     */
    static async getOrders(params?: GetOrdersParams): Promise<{
        data: OrderListItem[];
        meta: PaginationMeta;
    }> {
        try {
            const response = await apiClient.get('/orders', { params });
            return {
                data: response.data.data,
                meta: response.data.meta,
            };
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Get order detail by order number
     */
    static async getOrderDetail(orderNumber: string): Promise<{ data: Order }> {
        try {
            const response = await apiClient.get(`/orders/${orderNumber}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Get tracking info for order (User)
     */
    static async getTrackingInfo(orderNumber: string): Promise<{ data: TrackingInfo }> {
        try {
            const response = await apiClient.get(`/orders/${orderNumber}/tracking`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Cancel order (user can only cancel PENDING or FAILED orders)
     */
    static async cancelOrder(orderNumber: string, dto?: CancelOrderDto): Promise<{ message: string }> {
        try {
            const response = await apiClient.post(`/orders/${orderNumber}/cancel`, dto || {});
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Confirm delivery (user received the order)
     * DELIVERED -> COMPLETED
     */
    static async confirmDelivery(orderNumber: string): Promise<{
        message: string;
        data: {
            order_number: string;
            status: string;
            completed_at: string;
        };
    }> {
        try {
            const response = await apiClient.post(`/orders/${orderNumber}/confirm-delivery`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    // ==================== ADMIN METHODS ====================

    /**
     * Get all orders (Admin)
     */
    static async getAllOrders(params?: GetAllOrdersParams): Promise<{
        data: OrderListItem[];
        meta: PaginationMeta;
    }> {
        try {
            const response = await apiClient.get('/admin/orders', { params });
            return {
                data: response.data.data,
                meta: response.data.meta,
            };
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Get order detail (Admin)
     */
    static async getOrderDetailAdmin(orderNumber: string): Promise<{ data: Order }> {
        try {
            const response = await apiClient.get(`/admin/orders/${orderNumber}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * ✅ NEW: Get tracking info for order (Admin - no ownership check)
     */
    static async getTrackingInfoAdmin(orderNumber: string): Promise<{ data: TrackingInfo }> {
        try {
            const response = await apiClient.get(`/admin/orders/${orderNumber}/tracking`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Update order status (Admin)
     */
    static async updateOrderStatus(
        orderNumber: string,
        dto: UpdateOrderStatusDto
    ): Promise<{
        message: string;
        data: {
            id: string;
            order_number: string;
            status: string;
            tracking_number: string | null;
            biteship_order_id: string | null;
            updated_at: string;
        };
    }> {
        try {
            const response = await apiClient.patch(`/admin/orders/${orderNumber}/status`, dto);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Retry Biteship order creation (Admin)
     */
    static async retryBiteshipCreation(orderNumber: string): Promise<{
        message: string;
        data: {
            order_number: string;
            tracking_number: string;
            biteship_order_id: string;
            status: 'CREATED' | 'EXISTS';
        };
    }> {
        try {
            const response = await apiClient.post(`/admin/orders/${orderNumber}/retry-biteship`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Get shipping label (Admin)
     */
    static async getShippingLabel(orderNumber: string): Promise<{
        data: {
            order_number: string;
            tracking_number: string;
            label_url: string;
        };
    }> {
        try {
            const response = await apiClient.get(`/admin/orders/${orderNumber}/shipping-label`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Download shipping label as PDF (Admin)
     */
    static async downloadShippingLabel(orderNumber: string): Promise<void> {
        try {
            const result = await this.getShippingLabel(orderNumber);
            window.open(result.data.label_url, '_blank');
        } catch (error) {
            throw handleApiError(error);
        }
    }
}
// contexts/order-context.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { OrderService } from '@/services/order.service';
import { PaymentService } from '@/services/payment.service';
import {
    Order,
    OrderListItem,
    CreateOrderDto,
    GetOrdersParams,
    TrackingInfo,
} from '@/types/order';
import {
    CreatePaymentDto,
    PaymentResponse,
    PaymentStatusResponse,
} from '@/types/payment';
import { toast } from 'sonner';
import { handleApiError } from '@/lib/api-client';

interface OrderContextType {
    // State
    orders: OrderListItem[];
    currentOrder: Order | null;
    isLoading: boolean;
    isCreatingOrder: boolean;
    isCreatingPayment: boolean;

    // Pagination
    page: number;
    totalPages: number;
    setPage: (page: number) => void;

    // Order operations
    createOrder: (data: CreateOrderDto) => Promise<Order>;
    getOrders: (params?: GetOrdersParams) => Promise<void>;
    getOrderDetail: (orderNumber: string) => Promise<Order>;
    cancelOrder: (orderNumber: string, reason?: string) => Promise<void>;
    refreshOrders: () => Promise<void>;

    // Payment operations
    createPayment: (data: CreatePaymentDto) => Promise<PaymentResponse>;
    getPaymentStatus: (orderNumber: string) => Promise<PaymentStatusResponse>;
    pollPaymentStatus: (orderNumber: string) => Promise<PaymentStatusResponse>;

    // Tracking
    getTracking: (orderNumber: string) => Promise<TrackingInfo>;

    // Helpers
    clearCurrentOrder: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAuth();

    const [orders, setOrders] = useState<OrderListItem[]>([]);
    const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreatingOrder, setIsCreatingOrder] = useState(false);
    const [isCreatingPayment, setIsCreatingPayment] = useState(false);

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    /**
     * Create order from cart
     */
    const createOrder = useCallback(async (data: CreateOrderDto): Promise<Order> => {
        setIsCreatingOrder(true);

        try {
            const response = await OrderService.createOrder(data);

            toast.success('Order created successfully', {
                description: `Order ${response.data.order_number} has been created`,
            });

            setCurrentOrder(response.data);
            return response.data;
        } catch (error) {
            const errorResult = handleApiError(error);
            toast.error('Failed to create order', {
                description: errorResult.message,
            });
            throw error;
        } finally {
            setIsCreatingOrder(false);
        }
    }, []);

    /**
     * Get user orders with pagination
     */
    const getOrders = useCallback(async (params?: GetOrdersParams) => {
        if (!isAuthenticated) return;

        setIsLoading(true);

        try {
            const response = await OrderService.getOrders({
                page,
                limit: 10,
                ...params,
            });

            setOrders(response.data);
            setTotalPages(response.meta.totalPages);
        } catch (error) {
            const errorResult = handleApiError(error);
            toast.error('Failed to load orders', {
                description: errorResult.message,
            });
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, page]);

    /**
     * Get order detail
     */
    const getOrderDetail = useCallback(async (orderNumber: string): Promise<Order> => {
        setIsLoading(true);

        try {
            const response = await OrderService.getOrderDetail(orderNumber);
            setCurrentOrder(response.data);
            return response.data;
        } catch (error) {
            const errorResult = handleApiError(error);
            toast.error('Failed to load order details', {
                description: errorResult.message,
            });
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Cancel order
     */
    const cancelOrder = useCallback(async (orderNumber: string, reason?: string) => {
        setIsLoading(true);

        try {
            await OrderService.cancelOrder(orderNumber, reason ? { reason } : undefined);

            toast.success('Order cancelled successfully');

            // Refresh orders list
            await getOrders();

            // Clear current order if it's the one being cancelled (snake_case)
            if (currentOrder?.order_number === orderNumber) {
                setCurrentOrder(null);
            }
        } catch (error) {
            const errorResult = handleApiError(error);
            toast.error('Failed to cancel order', {
                description: errorResult.message,
            });
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [currentOrder, getOrders]);

    /**
     * Refresh orders list
     */
    const refreshOrders = useCallback(async () => {
        await getOrders();
    }, [getOrders]);

    /**
     * Create payment for order
     */
    const createPayment = useCallback(async (data: CreatePaymentDto): Promise<PaymentResponse> => {
        setIsCreatingPayment(true);

        try {
            const response = await PaymentService.createPayment(data);

            toast.success('Payment initiated', {
                description: 'Redirecting to payment gateway...',
            });

            return response;
        } catch (error) {
            const errorResult = handleApiError(error);
            toast.error('Failed to create payment', {
                description: errorResult.message,
            });
            throw error;
        } finally {
            setIsCreatingPayment(false);
        }
    }, []);

    /**
     * Get payment status
     */
    const getPaymentStatus = useCallback(async (orderNumber: string): Promise<PaymentStatusResponse> => {
        try {
            return await PaymentService.getPaymentStatus(orderNumber);
        } catch (error) {
            const errorResult = handleApiError(error);
            console.error('Failed to get payment status:', errorResult.message);
            throw error;
        }
    }, []);

    /**
     * Poll payment status until it changes
     */
    const pollPaymentStatus = useCallback(async (orderNumber: string): Promise<PaymentStatusResponse> => {
        try {
            return await PaymentService.pollPaymentStatus(orderNumber, {
                maxAttempts: 12,
                intervalMs: 5000,
                onStatusChange: (status) => {
                    // ✅ snake_case: payment_status
                    console.log('Payment status changed:', status.payment_status);

                    if (status.payment_status === 'PAID') {
                        toast.success('Payment successful!');
                        // Refresh order detail
                        getOrderDetail(orderNumber);
                    } else if (status.payment_status === 'FAILED') {
                        toast.error('Payment failed');
                    }
                },
            });
        } catch (error) {
            const errorResult = handleApiError(error);
            console.error('Failed to poll payment status:', errorResult.message);
            throw error;
        }
    }, [getOrderDetail]);

    /**
     * Get tracking info
     */
    const getTracking = useCallback(async (orderNumber: string): Promise<TrackingInfo> => {
        try {
            const response = await OrderService.getTrackingInfo(orderNumber);
            return response.data;
        } catch (error) {
            const errorResult = handleApiError(error);
            toast.error('Failed to load tracking info', {
                description: errorResult.message,
            });
            throw error;
        }
    }, []);

    /**
     * Clear current order
     */
    const clearCurrentOrder = useCallback(() => {
        setCurrentOrder(null);
    }, []);

    // Load orders on mount and when authenticated
    useEffect(() => {
        if (isAuthenticated) {
            getOrders();
        }
    }, [isAuthenticated, getOrders]);

    return (
        <OrderContext.Provider
            value={{
                orders,
                currentOrder,
                isLoading,
                isCreatingOrder,
                isCreatingPayment,
                page,
                totalPages,
                setPage,
                createOrder,
                getOrders,
                getOrderDetail,
                cancelOrder,
                refreshOrders,
                createPayment,
                getPaymentStatus,
                pollPaymentStatus,
                getTracking,
                clearCurrentOrder,
            }}
        >
            {children}
        </OrderContext.Provider>
    );
}

export const useOrder = () => {
    const context = useContext(OrderContext);
    if (context === undefined) {
        throw new Error('useOrder must be used within an OrderProvider');
    }
    return context;
};
// hooks/use-order.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import { OrderService } from '@/services/order.service';
import { Order } from '@/types/order';
import { toast } from 'sonner';

export function useOrder(orderNumber: string) {
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch order detail
    const fetchOrder = useCallback(async (showLoading = true) => {
        if (showLoading) setIsLoading(true);
        else setIsRefreshing(true);

        setError(null);

        try {
            const response = await OrderService.getOrderDetail(orderNumber);
            setOrder(response.data);
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to load order';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [orderNumber]);

    // Initial load
    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

    // Refresh order
    const refreshOrder = useCallback(() => {
        fetchOrder(false);
    }, [fetchOrder]);

    // Cancel order
    const cancelOrder = useCallback(async () => {
        if (!order) return;

        try {
            await OrderService.cancelOrder(orderNumber);
            toast.success('Order cancelled successfully');
            await refreshOrder();
        } catch (err: any) {
            toast.error(err.message || 'Failed to cancel order');
            throw err;
        }
    }, [order, orderNumber, refreshOrder]);

    // Download shipping label
    const downloadLabel = useCallback(async () => {
        try {
            const labelUrl = await OrderService.getShippingLabel(orderNumber);
            window.open(labelUrl, '_blank');
            toast.success('Shipping label opened');
        } catch (err: any) {
            toast.error(err.message || 'Failed to get shipping label');
            throw err;
        }
    }, [orderNumber]);

    return {
        order,
        isLoading,
        isRefreshing,
        error,
        refreshOrder,
        cancelOrder,
        downloadLabel,
    };
}
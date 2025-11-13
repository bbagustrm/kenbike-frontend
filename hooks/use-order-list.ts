// hooks/use-order-list.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import { OrderService } from '@/services/order.service';
import { Order, OrderStatus, GetOrdersParams } from '@/types/order';
import { toast } from 'sonner';

export function useOrderList(initialParams?: GetOrdersParams) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [params, setParams] = useState<GetOrdersParams>({
        page: 1,
        limit: 10,
        ...initialParams,
    });

    const [meta, setMeta] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
    });

    // Fetch orders
    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await OrderService.getUserOrders(params);
            setOrders(response.data);
            setMeta(response.meta);
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to load orders';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [params]);

    // Initial load
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Update filters
    const setFilters = useCallback((newParams: Partial<GetOrdersParams>) => {
        setParams(prev => ({
            ...prev,
            ...newParams,
            page: 1, // Reset to first page when filters change
        }));
    }, []);

    // Change page
    const goToPage = useCallback((page: number) => {
        setParams(prev => ({ ...prev, page }));
    }, []);

    // Set status filter
    const setStatusFilter = useCallback((status?: OrderStatus) => {
        setFilters({ status });
    }, [setFilters]);

    // Set search
    const setSearch = useCallback((search: string) => {
        setFilters({ search });
    }, [setFilters]);

    // Refresh
    const refresh = useCallback(() => {
        fetchOrders();
    }, [fetchOrders]);

    return {
        orders,
        isLoading,
        error,
        meta,
        params,
        setFilters,
        goToPage,
        setStatusFilter,
        setSearch,
        refresh,
    };
}
// services/analytics.service.ts

import { apiClient, handleApiError } from '@/lib/api-client';
import {
    OverviewStats,
    RevenueAnalytics,
    OrderStatusDistribution,
    TopProduct,
    RecentOrder,
    LowStockProduct,
    PromotionPerformance,
    AiInsight,
    AiSummary,
} from '@/types/analytics';

export class AnalyticsService {
    /**
     * Get Dashboard Overview
     */
    static async getOverview(
        period: 'today' | 'week' | 'month' | 'year' = 'month'
    ): Promise<{ data: OverviewStats }> {
        try {
            const response = await apiClient.get('/analytics/overview', {
                params: { period },
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Get Revenue Analytics
     */
    static async getRevenueAnalytics(
        period: '7days' | '30days' | '90days' | '12months' = '30days'
    ): Promise<{ data: RevenueAnalytics }> {
        try {
            const response = await apiClient.get('/analytics/revenue', {
                params: { period },
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Get Order Status Distribution
     */
    static async getOrderStatusDistribution(): Promise<{ data: OrderStatusDistribution[] }> {
        try {
            const response = await apiClient.get('/analytics/orders/status');
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Get Top Products
     */
    static async getTopProducts(
        limit: number = 10,
        sortBy: 'sales' | 'revenue' | 'views' | 'rating' = 'sales'
    ): Promise<{ data: TopProduct[] }> {
        try {
            const response = await apiClient.get('/analytics/products/top', {
                params: { limit, sortBy },
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Get Recent Orders
     */
    static async getRecentOrders(limit: number = 10): Promise<{ data: RecentOrder[] }> {
        try {
            const response = await apiClient.get('/analytics/orders/recent', {
                params: { limit },
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Get Low Stock Products
     */
    static async getLowStockProducts(
        threshold: number = 5,
        limit: number = 10
    ): Promise<{ data: LowStockProduct[] }> {
        try {
            const response = await apiClient.get('/analytics/products/low-stock', {
                params: { threshold, limit },
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Get Promotion Performance (Owner only)
     */
    static async getPromotionPerformance(): Promise<{ data: PromotionPerformance[] }> {
        try {
            const response = await apiClient.get('/analytics/promotions');
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Get AI Insights (Owner only)
     */
    static async getAiInsights(
        query: string,
        context: 'sales' | 'products' | 'customers' | 'general' = 'general'
    ): Promise<{ data: AiInsight }> {
        try {
            const response = await apiClient.post('/analytics/ai-insights', {
                query,
                context,
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Get Quick AI Summary (Owner only)
     */
    static async getQuickAiSummary(): Promise<{ data: AiSummary }> {
        try {
            const response = await apiClient.get('/analytics/ai-summary');
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }
}
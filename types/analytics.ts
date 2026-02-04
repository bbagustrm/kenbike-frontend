// types/analytics.ts

export interface OverviewStats {
    period: 'today' | 'week' | 'month' | 'year';
    orders: {
        total: number;
        paid: number;
        growth: number;
    };
    revenue: {
        idr: number;
        usd: number;
        idr_growth: number;
        usd_growth: number;
    };
    users: {
        total: number;
        new: number;
        growth: number;
    };
    products: {
        total: number;
        active: number;
    };
    alerts: {
        pending_reviews: number;
        low_stock: number;
    };
}

export interface RevenueChartData {
    date: string;
    idr: number;
    usd: number;
    orders: number;
}

export interface RevenueSummary {
    total_idr: number;
    total_usd: number;
    total_orders: number;
    avg_order_value: number;
}

export interface RevenueAnalytics {
    period: string;
    summary: RevenueSummary;
    chart: RevenueChartData[];
}

export interface OrderStatusDistribution {
    status: string;
    count: number;
}

export interface TopProduct {
    id: string;
    name: string;
    slug: string;
    image: string | null;
    category: string;
    price_idr: number;
    price_usd: number;
    total_sold: number;
    total_views: number;
    avg_rating: number | null;
    estimated_revenue_idr: number;
}

export interface RecentOrder {
    id: string;
    order_number: string;
    status: string;
    total: number;
    currency: string;
    customer_name: string;
    customer_email: string;
    created_at: string;
}

export interface LowStockProduct {
    variant_id: string;
    product_id: string;
    product_name: string;
    variant_name: string;
    sku: string;
    stock: number;
    image: string | null;
}

export interface PromotionPerformance {
    id: string;
    name: string;
    discount: number;
    discount_percentage: string;
    product_count: number;
    total_sold: number;
    potential_revenue: number;
    discount_given: number;
    days_remaining: number;
    start_date: string;
    end_date: string;
}

export interface AiInsight {
    query?: string;
    insight: string;
    suggestions?: string[];
    generated_at?: string;
    error?: string;
}

export interface AiSummary {
    summary: string;
    generated_at?: string;
}
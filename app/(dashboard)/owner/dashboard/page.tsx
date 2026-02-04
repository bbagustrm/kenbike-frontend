// app/(dashboard)/owner/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { AnalyticsService } from "@/services/analytics.service";
import {
    OverviewStats,
    RevenueAnalytics,
    OrderStatusDistribution,
    TopProduct,
    RecentOrder,
    LowStockProduct,
    PromotionPerformance,
    AiSummary,
} from "@/types/analytics";
import { StatsCard } from "@/components/dashboard/stats-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { OrderStatusChart } from "@/components/dashboard/order-status-chart";
import { TopProductsTable } from "@/components/dashboard/top-products-table";
import { RecentOrdersTable } from "@/components/dashboard/recent-orders-table";
import { LowStockAlert } from "@/components/dashboard/low-stock-alert";
import { PromotionPerformanceCard } from "@/components/dashboard/promotion-performance";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
    DollarSign,
    TrendingUp,
    ShoppingCart,
    Users,
    Package,
    BarChart3,
    RefreshCw,
    Sparkles,
    ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

export default function OwnerDashboardPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [period, setPeriod] = useState<'7days' | '30days' | '90days' | '12months'>('30days');

    // Data states
    const [overview, setOverview] = useState<OverviewStats | null>(null);
    const [revenue, setRevenue] = useState<RevenueAnalytics | null>(null);
    const [orderStatus, setOrderStatus] = useState<OrderStatusDistribution[]>([]);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
    const [lowStock, setLowStock] = useState<LowStockProduct[]>([]);
    const [promotions, setPromotions] = useState<PromotionPerformance[]>([]);
    const [aiSummary, setAiSummary] = useState<AiSummary | null>(null);
    const [aiLoading, setAiLoading] = useState(false);

    const fetchData = async (showToast = false) => {
        try {
            if (showToast) setRefreshing(true);

            const [
                overviewRes,
                revenueRes,
                statusRes,
                productsRes,
                ordersRes,
                stockRes,
                promosRes,
            ] = await Promise.all([
                AnalyticsService.getOverview('month'),
                AnalyticsService.getRevenueAnalytics(period),
                AnalyticsService.getOrderStatusDistribution(),
                AnalyticsService.getTopProducts(5, 'revenue'),
                AnalyticsService.getRecentOrders(5),
                AnalyticsService.getLowStockProducts(5, 5),
                AnalyticsService.getPromotionPerformance(),
            ]);

            setOverview(overviewRes.data);
            setRevenue(revenueRes.data);
            setOrderStatus(statusRes.data);
            setTopProducts(productsRes.data);
            setRecentOrders(ordersRes.data);
            setLowStock(stockRes.data);
            setPromotions(promosRes.data);

            if (showToast) toast.success("Data berhasil diperbarui");
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
            if (showToast) toast.error("Gagal memperbarui data");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchAiSummary = async () => {
        setAiLoading(true);
        try {
            const res = await AnalyticsService.getQuickAiSummary();
            setAiSummary(res.data);
        } catch (error) {
            console.error("Failed to fetch AI summary:", error);
        } finally {
            setAiLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        fetchAiSummary();
    }, []);

    useEffect(() => {
        // Refetch revenue when period changes
        const fetchRevenue = async () => {
            try {
                const res = await AnalyticsService.getRevenueAnalytics(period);
                setRevenue(res.data);
            } catch (error) {
                console.error("Failed to fetch revenue:", error);
            }
        };
        if (!loading) {
            fetchRevenue();
        }
    }, [period]);

    const formatCurrency = (value: number, currency: 'IDR' | 'USD' = 'IDR') => {
        if (currency === 'USD') {
            return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
        }
        if (value >= 1000000000) return `Rp ${(value / 1000000000).toFixed(1)}M`;
        if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(1)}Jt`;
        return `Rp ${value.toLocaleString('id-ID')}`;
    };

    if (loading) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="mb-8">
                    <Skeleton className="h-8 w-64 mb-2" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
                <Skeleton className="h-96 mb-6" />
                <div className="grid gap-6 lg:grid-cols-2">
                    <Skeleton className="h-80" />
                    <Skeleton className="h-80" />
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">
                        Selamat Datang, {user?.first_name || user?.username}! 👋
                    </h1>
                    <p className="text-muted-foreground">
                        Owner Dashboard - Pantau performa bisnis
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/owner/analytics" className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Analytics Detail
                        </Link>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchData(true)}
                        disabled={refreshing}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* AI Summary Card */}
            <Card className="mb-6 bg-gradient-to-r from-violet-50 to-indigo-50 border-violet-200">
                <CardContent className="py-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-violet-100">
                            <Sparkles className="h-5 w-5 text-violet-600" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-violet-700">AI Insight</span>
                                <Badge variant="secondary" className="text-xs bg-violet-100 text-violet-600">
                                    Gemini
                                </Badge>
                            </div>
                            {aiLoading ? (
                                <Skeleton className="h-4 w-full" />
                            ) : aiSummary?.summary ? (
                                <p className="text-sm text-gray-700">{aiSummary.summary}</p>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">
                                    AI Summary tidak tersedia
                                </p>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={fetchAiSummary}
                            disabled={aiLoading}
                        >
                            <RefreshCw className={`h-4 w-4 ${aiLoading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Revenue Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <StatsCard
                    title="Revenue IDR (Bulan Ini)"
                    value={formatCurrency(overview?.revenue.idr || 0)}
                    icon={DollarSign}
                    trend={{
                        value: overview?.revenue.idr_growth || 0,
                        label: "dari bulan lalu"
                    }}
                    className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
                    valueClassName="text-blue-700"
                />
                <StatsCard
                    title="Revenue USD (Bulan Ini)"
                    value={formatCurrency(overview?.revenue.usd || 0, 'USD')}
                    icon={DollarSign}
                    trend={{
                        value: overview?.revenue.usd_growth || 0,
                        label: "dari bulan lalu"
                    }}
                    className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
                    valueClassName="text-green-700"
                />
                <StatsCard
                    title="Order Sukses"
                    value={overview?.orders.paid || 0}
                    subtitle="bulan ini"
                    icon={ShoppingCart}
                    trend={{
                        value: overview?.orders.growth || 0
                    }}
                />
                <StatsCard
                    title="User Baru"
                    value={overview?.users.new || 0}
                    subtitle={`total ${overview?.users.total || 0}`}
                    icon={Users}
                    trend={{
                        value: overview?.users.growth || 0
                    }}
                />
            </div>

            {/* Revenue Chart */}
            <div className="mb-6">
                <RevenueChart
                    data={revenue?.chart || []}
                    period={period}
                    onPeriodChange={setPeriod}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column - 2/3 */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Top Products */}
                    <TopProductsTable
                        data={topProducts}
                        title="Top Produk (Revenue)"
                        showRevenue={true}
                    />

                    {/* Promotion Performance */}
                    <PromotionPerformanceCard data={promotions} />
                </div>

                {/* Right Column - 1/3 */}
                <div className="space-y-6">
                    {/* Order Status */}
                    <OrderStatusChart data={orderStatus} />

                    {/* Recent Orders */}
                    <RecentOrdersTable
                        data={recentOrders}
                        basePath="/admin/orders"
                    />

                    {/* Low Stock Alert */}
                    <LowStockAlert data={lowStock} />
                </div>
            </div>
        </div>
    );
}
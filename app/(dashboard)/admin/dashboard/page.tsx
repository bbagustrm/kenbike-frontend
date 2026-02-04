// app/(dashboard)/admin/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { AnalyticsService } from "@/services/analytics.service";
import {
    OverviewStats,
    OrderStatusDistribution,
    TopProduct,
    RecentOrder,
    LowStockProduct,
} from "@/types/analytics";
import { StatsCard } from "@/components/dashboard/stats-card";
import { OrderStatusChart } from "@/components/dashboard/order-status-chart";
import { TopProductsTable } from "@/components/dashboard/top-products-table";
import { RecentOrdersTable } from "@/components/dashboard/recent-orders-table";
import { LowStockAlert } from "@/components/dashboard/low-stock-alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
    Users,
    Package,
    ShoppingCart,
    Star,
    AlertTriangle,
    RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboardPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [overview, setOverview] = useState<OverviewStats | null>(null);
    const [orderStatus, setOrderStatus] = useState<OrderStatusDistribution[]>([]);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
    const [lowStock, setLowStock] = useState<LowStockProduct[]>([]);

    const fetchData = async (showToast = false) => {
        try {
            if (showToast) setRefreshing(true);

            const [
                overviewRes,
                statusRes,
                productsRes,
                ordersRes,
                stockRes,
            ] = await Promise.all([
                AnalyticsService.getOverview('month'),
                AnalyticsService.getOrderStatusDistribution(),
                AnalyticsService.getTopProducts(5, 'sales'),
                AnalyticsService.getRecentOrders(8),
                AnalyticsService.getLowStockProducts(5, 5),
            ]);

            setOverview(overviewRes.data);
            setOrderStatus(statusRes.data);
            setTopProducts(productsRes.data);
            setRecentOrders(ordersRes.data);
            setLowStock(stockRes.data);

            if (showToast) toast.success("Data berhasil diperbarui");
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
            if (showToast) toast.error("Gagal memperbarui data");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}Jt`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}Rb`;
        return num.toString();
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
                        Dashboard Admin - Pantau aktivitas toko
                    </p>
                </div>
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

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <StatsCard
                    title="Total Order Bulan Ini"
                    value={overview?.orders.paid || 0}
                    subtitle="order dibayar"
                    icon={ShoppingCart}
                    trend={overview?.orders.growth !== undefined ? {
                        value: overview.orders.growth,
                        label: "dari bulan lalu"
                    } : undefined}
                />
                <StatsCard
                    title="Total User"
                    value={formatNumber(overview?.users.total || 0)}
                    subtitle={`+${overview?.users.new || 0} baru`}
                    icon={Users}
                    trend={overview?.users.growth !== undefined ? {
                        value: overview.users.growth
                    } : undefined}
                />
                <StatsCard
                    title="Produk Aktif"
                    value={overview?.products.active || 0}
                    subtitle={`dari ${overview?.products.total || 0} total`}
                    icon={Package}
                />
                <StatsCard
                    title="Review Pending"
                    value={overview?.alerts.pending_reviews || 0}
                    subtitle="belum dibalas"
                    icon={Star}
                    className={overview?.alerts.pending_reviews && overview.alerts.pending_reviews > 0
                        ? "border-amber-200 bg-amber-50"
                        : ""
                    }
                />
            </div>

            {/* Alert Banner */}
            {overview?.alerts.low_stock && overview.alerts.low_stock > 0 && (
                <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <p className="text-sm text-amber-800">
                        <span className="font-medium">{overview.alerts.low_stock} produk</span> dengan stok menipis.
                        Segera lakukan restock!
                    </p>
                </div>
            )}

            {/* Main Content */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column - 2/3 */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Recent Orders */}
                    <RecentOrdersTable
                        data={recentOrders}
                        basePath="/admin/orders"
                    />

                    {/* Top Products */}
                    <TopProductsTable
                        data={topProducts}
                        showRevenue={false}
                    />
                </div>

                {/* Right Column - 1/3 */}
                <div className="space-y-6">
                    {/* Order Status */}
                    <OrderStatusChart data={orderStatus} />

                    {/* Low Stock Alert */}
                    <LowStockAlert data={lowStock} />
                </div>
            </div>
        </div>
    );
}
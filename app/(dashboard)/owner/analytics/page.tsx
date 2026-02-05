// app/(dashboard)/owner/analytics/page.tsx
"use client";

import { useState, useEffect } from "react";
import { AnalyticsService } from "@/services/analytics.service";
import {
    OverviewStats,
    RevenueAnalytics,
    OrderStatusDistribution,
    TopProduct,
    PromotionPerformance,
    AiInsight,
    AiSummary,
} from "@/types/analytics";
import { StatsCard } from "@/components/dashboard/stats-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { OrderStatusChart } from "@/components/dashboard/order-status-chart";
import { PromotionPerformanceCard } from "@/components/dashboard/promotion-performance";
import { AiInsightsPanel } from "@/components/dashboard/ai-insights-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    BarChart3,
    TrendingUp,
    DollarSign,
    Package,
    RefreshCw,
    Download,
    Filter,
    Eye,
    Star,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";

type PeriodFilter = '7days' | '30days' | '90days' | '12months';
type ProductSortBy = 'sales' | 'revenue' | 'views' | 'rating';

export default function OwnerAnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<PeriodFilter>('30days');
    const [productSort, setProductSort] = useState<ProductSortBy>('sales');

    // Data states
    const [overview, setOverview] = useState<OverviewStats | null>(null);
    const [revenue, setRevenue] = useState<RevenueAnalytics | null>(null);
    const [orderStatus, setOrderStatus] = useState<OrderStatusDistribution[]>([]);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [promotions, setPromotions] = useState<PromotionPerformance[]>([]);
    const [aiSummary, setAiSummary] = useState<AiSummary | null>(null);
    const [aiLoading, setAiLoading] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [
                overviewRes,
                revenueRes,
                statusRes,
                productsRes,
                promosRes,
            ] = await Promise.all([
                AnalyticsService.getOverview('month'),
                AnalyticsService.getRevenueAnalytics(period),
                AnalyticsService.getOrderStatusDistribution(),
                AnalyticsService.getTopProducts(20, productSort),
                AnalyticsService.getPromotionPerformance(),
            ]);

            setOverview(overviewRes.data);
            setRevenue(revenueRes.data);
            setOrderStatus(statusRes.data);
            setTopProducts(productsRes.data);
            setPromotions(promosRes.data);
        } catch (error) {
            console.error("Failed to fetch analytics data:", error);
            toast.error("Gagal memuat data analytics");
        } finally {
            setLoading(false);
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

    const handleAskAi = async (query: string): Promise<AiInsight> => {
        try {
            const res = await AnalyticsService.getAiInsights(query, 'general');
            return res.data;
        } catch (error) {
            throw error;
        }
    };

    useEffect(() => {
        fetchData();
        fetchAiSummary();
    }, []);

    useEffect(() => {
        // Refetch when filters change
        const refetch = async () => {
            try {
                const [revenueRes, productsRes] = await Promise.all([
                    AnalyticsService.getRevenueAnalytics(period),
                    AnalyticsService.getTopProducts(20, productSort),
                ]);
                setRevenue(revenueRes.data);
                setTopProducts(productsRes.data);
            } catch (error) {
                console.error("Failed to refetch:", error);
            }
        };
        if (!loading) {
            refetch();
        }
    }, [period, productSort]);

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
                <Skeleton className="h-8 w-48 mb-6" />
                <div className="grid gap-4 md:grid-cols-4 mb-6">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
                <Skeleton className="h-96" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BarChart3 className="h-6 w-6" />
                        Analytics & AI Insights
                    </h1>
                    <p className="text-muted-foreground">
                        Analisa mendalam performa bisnis dengan bantuan AI
                    </p>
                </div>
                <Button variant="outline" onClick={() => fetchData()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Summary Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <StatsCard
                    title="Total Revenue (IDR)"
                    value={formatCurrency(revenue?.summary.total_idr || 0)}
                    icon={DollarSign}
                    trend={{ value: overview?.revenue.idr_growth || 0 }}
                    className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
                />
                <StatsCard
                    title="Total Revenue (USD)"
                    value={formatCurrency(revenue?.summary.total_usd || 0, 'USD')}
                    icon={DollarSign}
                    trend={{ value: overview?.revenue.usd_growth || 0 }}
                    className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
                />
                <StatsCard
                    title="Total Order"
                    value={revenue?.summary.total_orders || 0}
                    icon={Package}
                    subtitle="periode ini"
                />
                <StatsCard
                    title="Rata-rata Order"
                    value={formatCurrency(revenue?.summary.avg_order_value || 0)}
                    icon={TrendingUp}
                    subtitle="per transaksi"
                />
            </div>

            {/* AI Insights Panel */}
            <div className="mb-6">
                <AiInsightsPanel
                    summary={aiSummary}
                    summaryLoading={aiLoading}
                    onRefreshSummary={fetchAiSummary}
                    onAskAi={handleAskAi}
                />
            </div>

            {/* Tabs for different analytics views */}
            <Tabs defaultValue="revenue" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="revenue">Revenue</TabsTrigger>
                    <TabsTrigger value="products">Produk</TabsTrigger>
                    <TabsTrigger value="promotions">Promosi</TabsTrigger>
                </TabsList>

                {/* Revenue Tab */}
                <TabsContent value="revenue" className="space-y-6">
                    <RevenueChart
                        data={revenue?.chart || []}
                        period={period}
                        onPeriodChange={setPeriod}
                    />

                    <div className="grid gap-6 lg:grid-cols-2">
                        <OrderStatusChart data={orderStatus} />

                        {/* Revenue Summary Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Ringkasan Revenue</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                        <span className="text-sm font-medium">Total IDR</span>
                                        <span className="text-lg font-bold text-blue-700">
                                            {formatCurrency(revenue?.summary.total_idr || 0)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                        <span className="text-sm font-medium">Total USD</span>
                                        <span className="text-lg font-bold text-green-700">
                                            {formatCurrency(revenue?.summary.total_usd || 0, 'USD')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                                        <span className="text-sm font-medium">Total Order</span>
                                        <span className="text-lg font-bold text-purple-700">
                                            {revenue?.summary.total_orders || 0}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                                        <span className="text-sm font-medium">Rata-rata Order</span>
                                        <span className="text-lg font-bold text-amber-700">
                                            {formatCurrency(revenue?.summary.avg_order_value || 0)}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Products Tab */}
                <TabsContent value="products" className="space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Performa Produk</CardTitle>
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-muted-foreground" />
                                <Select value={productSort} onValueChange={(v) => setProductSort(v as ProductSortBy)}>
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sales">Terlaris</SelectItem>
                                        <SelectItem value="revenue">Revenue Tertinggi</SelectItem>
                                        <SelectItem value="views">Most Viewed</SelectItem>
                                        <SelectItem value="rating">Rating Tertinggi</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">#</TableHead>
                                        <TableHead>Produk</TableHead>
                                        <TableHead>Kategori</TableHead>
                                        <TableHead className="text-right">Terjual</TableHead>
                                        <TableHead className="text-right">Views</TableHead>
                                        <TableHead className="text-right">Rating</TableHead>
                                        <TableHead className="text-right">Revenue (Est.)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {topProducts.map((product, index) => (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-medium">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="relative w-10 h-10 rounded overflow-hidden bg-muted">
                                                        {product.image ? (
                                                            <Image
                                                                src={product.image}
                                                                alt={product.name}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Package className="h-4 w-4 text-muted-foreground" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Link
                                                        href={`/admin/products/${product.id}/edit`}
                                                        className="font-medium hover:underline"
                                                    >
                                                        {product.name}
                                                    </Link>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{product.category}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {product.total_sold}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Eye className="h-3 w-3 text-muted-foreground" />
                                                    {product.total_views.toLocaleString()}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {product.avg_rating ? (
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                        {product.avg_rating.toFixed(1)}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(product.estimated_revenue_idr)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Promotions Tab */}
                <TabsContent value="promotions" className="space-y-6">
                    <PromotionPerformanceCard data={promotions} />

                    {/* Promotion Comparison Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Perbandingan Promosi</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama Promosi</TableHead>
                                        <TableHead>Diskon</TableHead>
                                        <TableHead className="text-right">Produk</TableHead>
                                        <TableHead className="text-right">Terjual</TableHead>
                                        <TableHead className="text-right">Revenue</TableHead>
                                        <TableHead className="text-right">Total Diskon</TableHead>
                                        <TableHead className="text-right">Sisa Waktu</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {promotions.map((promo) => (
                                        <TableRow key={promo.id}>
                                            <TableCell className="font-medium">
                                                {promo.name}
                                            </TableCell>
                                            <TableCell>
                                                <Badge>{promo.discount_percentage}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {promo.product_count}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {promo.total_sold}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(promo.potential_revenue)}
                                            </TableCell>
                                            <TableCell className="text-right text-red-600">
                                                -{formatCurrency(promo.discount_given)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant={promo.days_remaining <= 3 ? "destructive" : "secondary"}>
                                                    {promo.days_remaining} hari
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
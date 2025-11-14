// app/(public)/orders/page.tsx
"use client";

import { useState } from 'react';
import { useOrderList } from '@/hooks/use-order-list';
import { useTranslation } from '@/hooks/use-translation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { OrderCard } from '@/components/order/order-card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { OrderStatus } from '@/types/order';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

export default function OrdersPage() {
    const { locale } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');

    const {
        orders,
        isLoading,
        meta,
        params,
        setStatusFilter,
        setSearch,
        goToPage,
        refresh,
    } = useOrderList();

    const handleSearch = () => {
        setSearch(searchQuery);
    };

    return (
        <ProtectedRoute>
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2">
                            {locale === 'id' ? 'Pesanan Saya' : 'My Orders'}
                        </h1>
                        <p className="text-muted-foreground">
                            {locale === 'id'
                                ? 'Lihat dan kelola pesanan Anda'
                                : 'View and manage your orders'
                            }
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        {/* Search */}
                        <div className="flex-1 flex gap-2">
                            <Input
                                placeholder={locale === 'id' ? 'Cari nomor pesanan...' : 'Search order number...'}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <Button onClick={handleSearch} variant="outline">
                                <Search className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Status Filter */}
                        <Select
                            value={params.status || 'all'}
                            onValueChange={(value) => setStatusFilter(value === 'all' ? undefined : value as OrderStatus)}
                        >
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    {locale === 'id' ? 'Semua Status' : 'All Status'}
                                </SelectItem>
                                <SelectItem value="PENDING">
                                    {locale === 'id' ? 'Menunggu Pembayaran' : 'Pending Payment'}
                                </SelectItem>
                                <SelectItem value="PAID">
                                    {locale === 'id' ? 'Sudah Dibayar' : 'Paid'}
                                </SelectItem>
                                <SelectItem value="PROCESSING">
                                    {locale === 'id' ? 'Diproses' : 'Processing'}
                                </SelectItem>
                                <SelectItem value="SHIPPED">
                                    {locale === 'id' ? 'Dikirim' : 'Shipped'}
                                </SelectItem>
                                <SelectItem value="DELIVERED">
                                    {locale === 'id' ? 'Terkirim' : 'Delivered'}
                                </SelectItem>
                                <SelectItem value="COMPLETED">
                                    {locale === 'id' ? 'Selesai' : 'Completed'}
                                </SelectItem>
                                <SelectItem value="CANCELLED">
                                    {locale === 'id' ? 'Dibatalkan' : 'Cancelled'}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Orders List */}
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-32 w-full" />
                            ))}
                        </div>
                    ) : orders.length === 0 ? (
                        <EmptyState
                            title={locale === 'id' ? 'Tidak Ada Pesanan' : 'No Orders'}
                            description={locale === 'id' ? 'Anda belum memiliki pesanan' : "You don't have any orders yet"}
                        />
                    ) : (
                        <>
                            <div className="space-y-4">
                                {orders.map((order) => (
                                    <OrderCard key={order.id} order={order} locale={locale} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {meta.totalPages > 1 && (
                                <div className="flex items-center justify-between mt-8">
                                    <p className="text-sm text-muted-foreground">
                                        {locale === 'id' ? 'Halaman' : 'Page'} {meta.page} {locale === 'id' ? 'dari' : 'of'} {meta.totalPages}
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => goToPage(meta.page - 1)}
                                            disabled={meta.page === 1}
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => goToPage(meta.page + 1)}
                                            disabled={meta.page === meta.totalPages}
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
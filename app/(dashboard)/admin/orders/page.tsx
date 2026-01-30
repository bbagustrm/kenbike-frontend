// app/(dashboard)/admin/orders/page.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { OrderService } from "@/services/order.service";
import { OrderListItem, OrderStatus } from "@/types/order";
import { OrderStatsCards } from "@/components/admin/order/order-stats-cards";
import { OrderFiltersAdmin } from "@/components/admin/order/order-filters-admin";
import { OrderManagementTable } from "@/components/admin/order/order-management-table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<OrderListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
    const [shippingTypeFilter, setShippingTypeFilter] = useState<"DOMESTIC" | "INTERNATIONAL" | "ALL">("ALL");
    const [dateFrom, setDateFrom] = useState<Date>();
    const [dateTo, setDateTo] = useState<Date>();
    const [sortBy, setSortBy] = useState<"created_at" | "total">("created_at");

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            // ✅ snake_case params for API
            const response = await OrderService.getAllOrders({
                page,
                limit: 20,
                search: searchQuery || undefined,
                status: statusFilter !== "ALL" ? statusFilter : undefined,
                shipping_type: shippingTypeFilter !== "ALL" ? shippingTypeFilter : undefined,
                date_from: dateFrom?.toISOString(),
                date_to: dateTo?.toISOString(),
                sort_by: sortBy,
                order: "desc",
            });

            setOrders(response.data);
            setTotalPages(response.meta.totalPages);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
            toast.error("Failed to load orders");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [
        page,
        searchQuery,
        statusFilter,
        shippingTypeFilter,
        dateFrom,
        dateTo,
        sortBy,
    ]);

    const handleDateRangeFilter = (from?: Date, to?: Date) => {
        setDateFrom(from);
        setDateTo(to);
        setPage(1); // Reset to first page
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Order Management</h1>
                        <p className="text-muted-foreground">
                            Manage and track all customer orders
                        </p>
                    </div>
                    <Button onClick={fetchOrders} variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <OrderStatsCards orders={orders} />
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <OrderFiltersAdmin
                    searchQuery={searchQuery}
                    selectedStatus={statusFilter}
                    selectedShippingType={shippingTypeFilter}
                    sortBy={sortBy}
                    onSearch={setSearchQuery}
                    onStatusFilter={setStatusFilter}
                    onShippingTypeFilter={setShippingTypeFilter}
                    onDateRangeFilter={handleDateRangeFilter}
                    onSortChange={setSortBy}
                />
            </motion.div>

            {/* Orders Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <OrderManagementTable orders={orders} isLoading={isLoading} />
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="flex justify-center items-center gap-2"
                >
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1 || isLoading}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                    </Button>

                    <div className="flex items-center gap-2">
                        {[...Array(totalPages)].map((_, i) => {
                            const pageNum = i + 1;
                            if (
                                pageNum === 1 ||
                                pageNum === totalPages ||
                                (pageNum >= page - 1 && pageNum <= page + 1)
                            ) {
                                return (
                                    <Button
                                        key={pageNum}
                                        variant={page === pageNum ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setPage(pageNum)}
                                        disabled={isLoading}
                                        className="w-10"
                                    >
                                        {pageNum}
                                    </Button>
                                );
                            } else if (pageNum === page - 2 || pageNum === page + 2) {
                                return (
                                    <span key={pageNum} className="px-2">
                                        ...
                                    </span>
                                );
                            }
                            return null;
                        })}
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages || isLoading}
                    >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </motion.div>
            )}
        </div>
    );
}
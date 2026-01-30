// app/(dashboard)/user/orders/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { useOrder } from "@/contexts/order-context";
import { useTranslation } from "@/hooks/use-translation";
import { OrderStatus } from "@/types/order";
import { PendingReviewItem } from "@/types/review";
import { OrderList } from "@/components/order/order-list";
import { OrderFilters } from "@/components/order/order-filters";
import { PendingReviews } from "@/components/review/pending-reviews";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

export default function OrdersPage() {
    const router = useRouter();
    const { locale } = useTranslation();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const { orders, isLoading, page, totalPages, setPage, getOrders } = useOrder();

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
    const [sortBy, setSortBy] = useState<"created_at" | "total">("created_at");

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login?redirect=/user/orders");
        }
    }, [authLoading, isAuthenticated, router]);

    // Fetch orders when filters change
    useEffect(() => {
        if (isAuthenticated) {
            getOrders({
                search: searchQuery || undefined,
                status: statusFilter !== "ALL" ? statusFilter : undefined,
                sort_by: sortBy,
                order: "desc",
            });
        }
    }, [isAuthenticated, searchQuery, statusFilter, sortBy, page, getOrders]);

    // Handle click on pending review item - navigate to order detail with review param
    const handlePendingReviewClick = (item: PendingReviewItem) => {
        router.push(`/user/orders/${item.orderNumber}?review=${item.product.id}`);
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // Will redirect
    }

    return (
        <div className="min-h-screen bg-muted/30">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold mb-2">
                        {locale === "id" ? "Pesanan Saya" : "My Orders"}
                    </h1>
                    <p className="text-muted-foreground">
                        {locale === "id"
                            ? "Lihat dan kelola riwayat pesanan Anda"
                            : "View and manage your order history"}
                    </p>
                </motion.div>

                {/* Pending Reviews Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="mb-6"
                >
                    <PendingReviews
                        onReviewClick={handlePendingReviewClick}
                        limit={5}
                        showHeader={true}
                    />
                </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mb-6"
                >
                    <OrderFilters
                        searchQuery={searchQuery}
                        selectedStatus={statusFilter}
                        sortBy={sortBy}
                        onSearch={setSearchQuery}
                        onStatusFilter={setStatusFilter}
                        onSortChange={setSortBy}
                    />
                </motion.div>

                {/* Order List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <OrderList orders={orders} isLoading={isLoading} />
                </motion.div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="mt-8 flex justify-center items-center gap-2"
                    >
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1 || isLoading}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            {locale === "id" ? "Sebelumnya" : "Previous"}
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
                                    return <span key={pageNum} className="px-2">...</span>;
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
                            {locale === "id" ? "Selanjutnya" : "Next"}
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
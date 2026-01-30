// components/review/pending-reviews.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ReviewService } from "@/services/review.service";
import { PendingReviewItem } from "@/types/review";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Star, ChevronRight, Package } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { motion } from "framer-motion";

interface PendingReviewsProps {
    onReviewClick?: (item: PendingReviewItem) => void;
    limit?: number;
    showHeader?: boolean;
}

export function PendingReviews({
                                   onReviewClick,
                                   limit,
                                   showHeader = true,
                               }: PendingReviewsProps) {
    const router = useRouter();
    const { locale } = useTranslation();
    const [pendingReviews, setPendingReviews] = useState<PendingReviewItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPendingReviews = async () => {
            try {
                const response = await ReviewService.getPendingReviews();
                const data = limit ? response.data.slice(0, limit) : response.data;
                setPendingReviews(data);
            } catch (error) {
                console.error("Failed to fetch pending reviews:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPendingReviews();
    }, [limit]);

    const handleClick = (item: PendingReviewItem) => {
        if (onReviewClick) {
            onReviewClick(item);
        } else {
            // Navigate to order detail page with review section
            router.push(`/user/orders/${item.orderNumber}?review=${item.product.id}`);
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString(
            locale === "id" ? "id-ID" : "en-US",
            {
                day: "numeric",
                month: "short",
                year: "numeric",
            }
        );
    };

    if (isLoading) {
        return (
            <Card>
                {showHeader && (
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                )}
                <CardContent className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-4">
                            <Skeleton className="h-16 w-16 rounded-md" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (pendingReviews.length === 0) {
        return (
            <Card>
                {showHeader && (
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Star className="h-5 w-5" />
                            {locale === "id" ? "Ulasan Menunggu" : "Pending Reviews"}
                        </CardTitle>
                    </CardHeader>
                )}
                <CardContent>
                    <EmptyState
                        icon={<Package className="h-12 w-12 text-muted-foreground" />}
                        title={
                            locale === "id"
                                ? "Tidak ada ulasan yang menunggu"
                                : "No pending reviews"
                        }
                        description={
                            locale === "id"
                                ? "Anda sudah memberikan ulasan untuk semua pesanan yang selesai"
                                : "You've reviewed all your completed orders"
                        }
                    />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            {showHeader && (
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5" />
                        {locale === "id" ? "Ulasan Menunggu" : "Pending Reviews"}
                        <Badge variant="secondary" className="ml-2">
                            {pendingReviews.length}
                        </Badge>
                    </CardTitle>
                    <CardDescription>
                        {locale === "id"
                            ? "Bagikan pengalaman Anda dengan produk-produk ini"
                            : "Share your experience with these products"}
                    </CardDescription>
                </CardHeader>
            )}
            <CardContent className="space-y-3">
                {pendingReviews.map((item, index) => (
                    <motion.div
                        key={`${item.orderId}-${item.product.id}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <button
                            onClick={() => handleClick(item)}
                            className="w-full flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left"
                        >
                            {/* Product Image */}
                            <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted shrink-0">
                                <Image
                                    src={item.product.imageUrl || "/placeholder.png"}
                                    alt={item.product.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                                <p className="font-medium line-clamp-1">
                                    {item.product.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {locale === "id" ? "Pesanan" : "Order"} #{item.orderNumber.slice(-8)}
                                </p>
                                {item.completedAt && (
                                    <p className="text-xs text-muted-foreground">
                                        {locale === "id" ? "Selesai" : "Completed"} {formatDate(item.completedAt)}
                                    </p>
                                )}
                            </div>

                            {/* Action */}
                            <div className="flex items-center gap-2 shrink-0">
                                <Badge variant="outline" className="gap-1">
                                    <Star className="w-3 h-3" />
                                    {locale === "id" ? "Tulis Ulasan" : "Write Review"}
                                </Badge>
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </div>
                        </button>
                    </motion.div>
                ))}
            </CardContent>
        </Card>
    );
}
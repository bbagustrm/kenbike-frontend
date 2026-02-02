// components/review/review-list.tsx
"use client";

import { useState, useEffect } from "react";
import { ReviewService } from "@/services/review.service";
import { Review, ReviewSummary as ReviewSummaryType, QueryReviewsParams } from "@/types/review";
import { ReviewSummary } from "./review-summary";
import { ReviewItem } from "./review-item";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Star, MessageSquare } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { toast } from "sonner";

interface ReviewListProps {
    productSlug: string;
}

export function ReviewList({ productSlug }: ReviewListProps) {
    const { t, locale } = useTranslation();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [summary, setSummary] = useState<ReviewSummaryType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [totalReviews, setTotalReviews] = useState(0);

    // Filters
    const [ratingFilter, setRatingFilter] = useState<string>("all");
    const [sortBy, setSortBy] = useState<QueryReviewsParams["sortBy"]>("createdAt");
    const [order, setOrder] = useState<QueryReviewsParams["order"]>("desc");

    const fetchReviews = async (pageNum: number, append: boolean = false) => {
        try {
            if (pageNum === 1) {
                setIsLoading(true);
            } else {
                setIsLoadingMore(true);
            }

            const params: QueryReviewsParams = {
                page: pageNum,
                limit: 10,
                sortBy,
                order,
            };

            if (ratingFilter !== "all") {
                params.rating = parseInt(ratingFilter);
            }

            const response = await ReviewService.getProductReviews(productSlug, params);

            if (append) {
                setReviews((prev) => [...prev, ...response.data]);
            } else {
                setReviews(response.data);
            }

            setSummary(response.summary);
            setHasMore(response.meta.hasNextPage);
            setTotalReviews(response.meta.total);
        } catch (error) {
            console.error("Failed to fetch reviews:", error);
            toast.error(locale === "id" ? "Gagal memuat ulasan" : "Failed to load reviews");
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        setPage(1);
        fetchReviews(1, false);
    }, [productSlug, ratingFilter, sortBy, order]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchReviews(nextPage, true);
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                {/* Summary Skeleton */}
                <div className="flex items-center gap-8 pb-6 border-b">
                    <div className="text-center">
                        <Skeleton className="h-12 w-16 mx-auto mb-2" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="flex-1 space-y-2">
                        {[5, 4, 3, 2, 1].map((i) => (
                            <Skeleton key={i} className="h-2 w-full" />
                        ))}
                    </div>
                </div>
                {/* Reviews Skeleton */}
                {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-3">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div>
                                <Skeleton className="h-4 w-24 mb-1" />
                                <Skeleton className="h-3 w-20" />
                            </div>
                        </div>
                        <Skeleton className="h-16 w-full" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary */}
            {summary && <ReviewSummary summary={summary} />}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                {/* Rating Filter */}
                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                    <SelectTrigger className="w-full sm:w-[180px] border border-border rounded-md">
                        <SelectValue placeholder={locale === "id" ? "Filter rating" : "Filter by rating"} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">
                            {locale === "id" ? "Semua rating" : "All ratings"} 1-5
                        </SelectItem>
                        {[5, 4, 3, 2, 1].map((rating) => (
                            <SelectItem key={rating} value={rating.toString()}>
                                <div className="flex items-center gap-1">
                                    {rating}
                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Sort */}
                <Select
                    value={`${sortBy}-${order}`}
                    onValueChange={(value) => {
                        const [newSortBy, newOrder] = value.split("-") as [QueryReviewsParams["sortBy"], QueryReviewsParams["order"]];
                        setSortBy(newSortBy);
                        setOrder(newOrder);
                    }}
                >
                    <SelectTrigger className="w-full sm:w-[180px] border border-border rounded-md">
                        Sort by : <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="createdAt-desc">
                            {locale === "id" ? "Terbaru" : "Newest"}
                        </SelectItem>
                        <SelectItem value="createdAt-asc">
                            {locale === "id" ? "Terlama" : "Oldest"}
                        </SelectItem>
                        <SelectItem value="rating-desc">
                            {locale === "id" ? "Rating tertinggi" : "Highest rating"}
                        </SelectItem>
                        <SelectItem value="rating-asc">
                            {locale === "id" ? "Rating terendah" : "Lowest rating"}
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>


            {/* Reviews List */}
            {reviews.length > 0 ? (
                <div className="space-y-6 pt-4">
                    {reviews.map((review) => (
                        <ReviewItem key={review.id} review={review} />
                    ))}

                    {/* Load More */}
                    {hasMore && (
                        <div className="text-center pt-4">
                            <Button
                                variant="outline"
                                onClick={handleLoadMore}
                                disabled={isLoadingMore}
                            >
                                {isLoadingMore ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        {locale === "id" ? "Memuat..." : "Loading..."}
                                    </>
                                ) : (
                                    locale === "id" ? "Muat lebih banyak" : "Load more"
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            ) : (
                <EmptyState
                    icon={<MessageSquare className="h-12 w-12 text-muted-foreground" />}
                    title={t.productDetail.noReviewsYet}
                    description={t.productDetail.beFirstToReview}
                />
            )}
        </div>
    );
}
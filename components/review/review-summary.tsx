// components/review/review-summary.tsx
"use client";

import { ReviewSummary as ReviewSummaryType } from "@/types/review";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";

interface ReviewSummaryProps {
    summary: ReviewSummaryType;
}

export function ReviewSummary({ summary }: ReviewSummaryProps) {
    const { t } = useTranslation();
    const { avgRating, totalReviews, distribution } = summary;

    // Calculate percentage for each rating
    const getPercentage = (count: number) => {
        if (totalReviews === 0) return 0;
        return Math.round((count / totalReviews) * 100);
    };

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 pb-6 border-b border-border">
            {/* Average Rating */}
            <div className="text-center sm:text-left">
                <div className="text-5xl font-bold mb-2">
                    {avgRating.toFixed(1)}
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            className={cn(
                                "w-5 h-5",
                                star <= Math.round(avgRating)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted"
                            )}
                        />
                    ))}
                </div>
                <div className="text-sm text-muted-foreground">
                    {t.productDetail.reviewsCount.replace("{count}", totalReviews.toString())}
                </div>
            </div>

            {/* Rating Distribution */}
            <div className="flex-1 w-full space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                    const count = distribution[rating as keyof typeof distribution];
                    const percentage = getPercentage(count);

                    return (
                        <div key={rating} className="flex items-center gap-2">
                            <div className="flex items-center gap-1 w-12">
                                <span className="text-sm">{rating}</span>
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            </div>
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <span className="text-sm text-muted-foreground w-12 text-right">
                                {count}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
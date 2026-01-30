// components/review/review-item.tsx
"use client";

import { Review } from "@/types/review";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, CheckCircle2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";

interface ReviewItemProps {
    review: Review;
}

export function ReviewItem({ review }: ReviewItemProps) {
    const { locale } = useTranslation();

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(
            locale === "id" ? "id-ID" : "en-US",
            {
                day: "numeric",
                month: "long",
                year: "numeric",
            }
        );
    };

    return (
        <div className="border-b border-border pb-6 last:border-0 last:pb-0">
            {/* Review Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                        <AvatarImage src={review.user.profileImage || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {getInitials(review.user.name || review.user.username)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold">
                                {review.user.name || review.user.username}
                            </span>
                            {review.isVerified && (
                                <Badge variant="secondary" className="gap-1 text-xs">
                                    <CheckCircle2 className="w-3 h-3" />
                                    {locale === "id" ? "Pembelian Terverifikasi" : "Verified Purchase"}
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={cn(
                                            "w-4 h-4",
                                            star <= review.rating
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-muted"
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <span className="text-sm text-muted-foreground">
                    {formatDate(review.createdAt)}
                </span>
            </div>

            {/* Review Content */}
            {review.comment && (
                <p className="text-foreground leading-relaxed mb-4 pl-13">
                    {review.comment}
                </p>
            )}

            {/* Review Images */}
            {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mb-4 pl-13 overflow-x-auto">
                    {review.images.map((image) => (
                        <div
                            key={image.id}
                            className="w-20 h-20 rounded-md overflow-hidden bg-muted shrink-0"
                        >
                            <img
                                src={image.imageUrl}
                                alt="Review"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Admin Replies */}
            {review.replies && review.replies.length > 0 && (
                <div className="mt-4 pl-13 space-y-3">
                    {review.replies.map((reply) => (
                        <div
                            key={reply.id}
                            className="bg-muted/50 rounded-lg p-4 border-l-4 border-primary"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Avatar className="w-6 h-6">
                                    <AvatarImage src={reply.user.profileImage || undefined} />
                                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                        {getInitials(reply.user.name || reply.user.username)}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="font-semibold text-sm">
                                    {reply.user.name || reply.user.username}
                                </span>
                                {(reply.user.role === "ADMIN" || reply.user.role === "OWNER") && (
                                    <Badge variant="default" className="gap-1 text-xs">
                                        <ShieldCheck className="w-3 h-3" />
                                        {reply.user.role === "OWNER" ? "Owner" : "Admin"}
                                    </Badge>
                                )}
                                <span className="text-xs text-muted-foreground ml-auto">
                                    {formatDate(reply.createdAt)}
                                </span>
                            </div>
                            <p className="text-sm text-foreground">{reply.content}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
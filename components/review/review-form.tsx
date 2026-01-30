// components/review/review-form.tsx
"use client";

import { useState } from "react";
import { ReviewService } from "@/services/review.service";
import { CreateReviewData } from "@/types/review";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Star, Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface ReviewFormProps {
    productId: string;
    orderId: string;
    productName: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function ReviewForm({
                               productId,
                               orderId,
                               productName,
                               onSuccess,
                               onCancel,
                           }: ReviewFormProps) {
    const { locale } = useTranslation();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const ratingLabels = {
        1: locale === "id" ? "Sangat Buruk" : "Very Bad",
        2: locale === "id" ? "Buruk" : "Bad",
        3: locale === "id" ? "Cukup" : "Average",
        4: locale === "id" ? "Bagus" : "Good",
        5: locale === "id" ? "Sangat Bagus" : "Excellent",
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error(
                locale === "id"
                    ? "Silakan pilih rating"
                    : "Please select a rating"
            );
            return;
        }

        if (comment.length > 0 && comment.length < 10) {
            toast.error(
                locale === "id"
                    ? "Komentar minimal 10 karakter"
                    : "Comment must be at least 10 characters"
            );
            return;
        }

        setIsSubmitting(true);
        try {
            const data: CreateReviewData = {
                productId,
                orderId,
                rating,
            };

            if (comment.trim()) {
                data.comment = comment.trim();
            }

            await ReviewService.createReview(data);
            toast.success(
                locale === "id"
                    ? "Ulasan berhasil dikirim!"
                    : "Review submitted successfully!"
            );
            onSuccess?.();
        } catch (error: unknown) {
            console.error("Failed to submit review:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to submit review";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const displayRating = hoverRating || rating;

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {locale === "id" ? "Tulis Ulasan" : "Write a Review"}
                </CardTitle>
                <CardDescription>
                    {locale === "id"
                        ? `Bagikan pengalaman Anda dengan ${productName}`
                        : `Share your experience with ${productName}`}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Star Rating */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">
                        {locale === "id" ? "Rating Anda" : "Your Rating"}
                        <span className="text-destructive"> *</span>
                    </label>
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <motion.button
                                key={star}
                                type="button"
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="p-1 focus:outline-none"
                            >
                                <Star
                                    className={cn(
                                        "w-8 h-8 transition-colors",
                                        star <= displayRating
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-muted hover:text-yellow-400"
                                    )}
                                />
                            </motion.button>
                        ))}
                        {displayRating > 0 && (
                            <span className="ml-2 text-sm text-muted-foreground">
                                {ratingLabels[displayRating as keyof typeof ratingLabels]}
                            </span>
                        )}
                    </div>
                </div>

                {/* Comment */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">
                        {locale === "id" ? "Komentar (opsional)" : "Comment (optional)"}
                    </label>
                    <Textarea
                        placeholder={
                            locale === "id"
                                ? "Ceritakan pengalaman Anda dengan produk ini..."
                                : "Tell us about your experience with this product..."
                        }
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                        maxLength={1000}
                    />
                    <p className="text-xs text-muted-foreground text-right">
                        {comment.length}/1000
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end">
                    {onCancel && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={isSubmitting}
                        >
                            {locale === "id" ? "Batal" : "Cancel"}
                        </Button>
                    )}
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || rating === 0}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {locale === "id" ? "Mengirim..." : "Submitting..."}
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-2" />
                                {locale === "id" ? "Kirim Ulasan" : "Submit Review"}
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
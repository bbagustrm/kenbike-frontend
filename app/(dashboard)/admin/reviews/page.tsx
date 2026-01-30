// app/(dashboard)/admin/reviews/page.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ReviewService } from "@/services/review.service";
import { AdminReview } from "@/types/review";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    Search,
    Star,
    MessageSquare,
    Trash2,
    ExternalLink,
    CheckCircle,
    Reply,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";

export default function AdminReviewsPage() {
    const { t } = useTranslation();
    const [reviews, setReviews] = useState<AdminReview[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [total, setTotal] = useState(0);

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [ratingFilter, setRatingFilter] = useState<string>("ALL");
    const [hasReplyFilter, setHasReplyFilter] = useState<string>("ALL");
    const [sortBy, setSortBy] = useState<"createdAt" | "rating">("createdAt");

    // Reply Dialog
    const [replyDialogOpen, setReplyDialogOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState<AdminReview | null>(null);
    const [replyContent, setReplyContent] = useState("");
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);

    // Delete Dialog
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState<AdminReview | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchReviews = async () => {
        setIsLoading(true);
        try {
            const response = await ReviewService.getAdminReviews({
                page,
                limit: 15,
                search: searchQuery || undefined,
                rating: ratingFilter !== "ALL" ? parseInt(ratingFilter) : undefined,
                hasReply: hasReplyFilter === "ALL" ? undefined : hasReplyFilter === "YES",
                sortBy,
                order: "desc",
            });

            setReviews(response.data);
            setTotalPages(response.meta.totalPages);
            setTotal(response.meta.total);
        } catch (error) {
            console.error("Failed to fetch reviews:", error);
            toast.error(t.adminReviews?.fetchError || "Failed to load reviews");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [page, searchQuery, ratingFilter, hasReplyFilter, sortBy]);

    // Handle Reply
    const openReplyDialog = (review: AdminReview) => {
        setSelectedReview(review);
        setReplyContent("");
        setReplyDialogOpen(true);
    };

    const handleSubmitReply = async () => {
        if (!selectedReview || !replyContent.trim()) return;

        setIsSubmittingReply(true);
        try {
            await ReviewService.replyToReview(selectedReview.id, replyContent.trim());
            toast.success(t.adminReviews?.replySuccess || "Reply submitted successfully");
            setReplyDialogOpen(false);
            setSelectedReview(null);
            setReplyContent("");
            fetchReviews();
        } catch (error) {
            console.error("Failed to submit reply:", error);
            toast.error(t.adminReviews?.replyError || "Failed to submit reply");
        } finally {
            setIsSubmittingReply(false);
        }
    };

    // Handle Delete
    const openDeleteDialog = (review: AdminReview) => {
        setReviewToDelete(review);
        setDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!reviewToDelete) return;

        setIsDeleting(true);
        try {
            await ReviewService.adminDeleteReview(reviewToDelete.id);
            toast.success(t.adminReviews?.deleteSuccess || "Review deleted successfully");
            setDeleteDialogOpen(false);
            setReviewToDelete(null);
            fetchReviews();
        } catch (error) {
            console.error("Failed to delete review:", error);
            toast.error(t.adminReviews?.deleteError || "Failed to delete review");
        } finally {
            setIsDeleting(false);
        }
    };

    // Render stars
    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-4 w-4 ${
                            star <= rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                        }`}
                    />
                ))}
            </div>
        );
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
                        <h1 className="text-3xl font-bold">
                            {t.adminReviews?.title || "Review Management"}
                        </h1>
                        <p className="text-muted-foreground">
                            {t.adminReviews?.description || "Manage product reviews and responses"}
                        </p>
                    </div>
                    <Button onClick={fetchReviews} variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        {t.common?.refresh || "Refresh"}
                    </Button>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {t.adminReviews?.totalReviews || "Total Reviews"}
                        </CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {t.adminReviews?.fiveStarReviews || "5 Star Reviews"}
                        </CardTitle>
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {reviews.filter((r) => r.rating === 5).length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {t.adminReviews?.withReplies || "With Replies"}
                        </CardTitle>
                        <Reply className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {reviews.filter((r) => r._count.replies > 0).length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {t.adminReviews?.needsReply || "Needs Reply"}
                        </CardTitle>
                        <MessageSquare className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-500">
                            {reviews.filter((r) => r._count.replies === 0).length}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={t.adminReviews?.searchPlaceholder || "Search by user, product, or comment..."}
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setPage(1);
                                    }}
                                    className="pl-10"
                                />
                            </div>

                            {/* Rating Filter */}
                            <Select
                                value={ratingFilter}
                                onValueChange={(value) => {
                                    setRatingFilter(value);
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger className="w-full md:w-[150px]">
                                    <SelectValue placeholder={t.adminReviews?.filterByRating || "Rating"} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">
                                        {t.adminReviews?.allRatings || "All Ratings"}
                                    </SelectItem>
                                    <SelectItem value="5">⭐⭐⭐⭐⭐ (5)</SelectItem>
                                    <SelectItem value="4">⭐⭐⭐⭐ (4)</SelectItem>
                                    <SelectItem value="3">⭐⭐⭐ (3)</SelectItem>
                                    <SelectItem value="2">⭐⭐ (2)</SelectItem>
                                    <SelectItem value="1">⭐ (1)</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Has Reply Filter */}
                            <Select
                                value={hasReplyFilter}
                                onValueChange={(value) => {
                                    setHasReplyFilter(value);
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder={t.adminReviews?.filterByReply || "Reply Status"} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">
                                        {t.adminReviews?.allReplyStatus || "All Status"}
                                    </SelectItem>
                                    <SelectItem value="YES">
                                        {t.adminReviews?.hasReply || "Has Reply"}
                                    </SelectItem>
                                    <SelectItem value="NO">
                                        {t.adminReviews?.noReply || "No Reply"}
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Sort By */}
                            <Select
                                value={sortBy}
                                onValueChange={(value: "createdAt" | "rating") => {
                                    setSortBy(value);
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger className="w-full md:w-[150px]">
                                    <SelectValue placeholder={t.adminReviews?.sortBy || "Sort By"} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="createdAt">
                                        {t.adminReviews?.sortByDate || "Newest"}
                                    </SelectItem>
                                    <SelectItem value="rating">
                                        {t.adminReviews?.sortByRating || "Rating"}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Reviews Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <Card>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="p-6 space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <Skeleton key={i} className="h-16 w-full" />
                                ))}
                            </div>
                        ) : reviews.length === 0 ? (
                            <EmptyState
                                icon={<MessageSquare className="h-12 w-12" />}
                                title={t.adminReviews?.noReviews || "No reviews found"}
                                description={t.adminReviews?.noReviewsDesc || "Try adjusting your filters"}
                            />
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t.adminReviews?.product || "Product"}</TableHead>
                                        <TableHead>{t.adminReviews?.user || "User"}</TableHead>
                                        <TableHead>{t.adminReviews?.rating || "Rating"}</TableHead>
                                        <TableHead className="max-w-[300px]">
                                            {t.adminReviews?.comment || "Comment"}
                                        </TableHead>
                                        <TableHead>{t.adminReviews?.status || "Status"}</TableHead>
                                        <TableHead>{t.adminReviews?.date || "Date"}</TableHead>
                                        <TableHead className="text-right">
                                            {t.adminReviews?.actions || "Actions"}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reviews.map((review) => (
                                        <TableRow key={review.id}>
                                            <TableCell>
                                                <Link
                                                    href={`/products/${review.product.slug}`}
                                                    target="_blank"
                                                    className="flex items-center gap-2 hover:underline text-primary"
                                                >
                                                    <span className="font-medium line-clamp-1 max-w-[150px]">
                                                        {review.product.name}
                                                    </span>
                                                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{review.user.username}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {review.user.email}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>{renderStars(review.rating)}</TableCell>
                                            <TableCell className="max-w-[300px]">
                                                <p className="line-clamp-2 text-sm">
                                                    {review.comment || (
                                                        <span className="text-muted-foreground italic">
                                                            {t.adminReviews?.noComment || "No comment"}
                                                        </span>
                                                    )}
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    {review.isVerified && (
                                                        <Badge variant="secondary" className="w-fit">
                                                            <CheckCircle className="h-3 w-3 mr-1" />
                                                            {t.adminReviews?.verified || "Verified"}
                                                        </Badge>
                                                    )}
                                                    {review._count.replies > 0 ? (
                                                        <Badge variant="outline" className="w-fit text-green-600">
                                                            <Reply className="h-3 w-3 mr-1" />
                                                            {t.adminReviews?.replied || "Replied"}
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="w-fit text-orange-500">
                                                            {t.adminReviews?.pending || "Pending"}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-muted-foreground">
                                                    {format(new Date(review.createdAt), "dd MMM yyyy")}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => openReplyDialog(review)}
                                                    >
                                                        <Reply className="h-4 w-4 mr-1" />
                                                        {t.adminReviews?.reply || "Reply"}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => openDeleteDialog(review)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
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
                        {t.common?.previous || "Previous"}
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
                        {t.common?.next || "Next"}
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </motion.div>
            )}

            {/* Reply Dialog */}
            <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {t.adminReviews?.replyToReview || "Reply to Review"}
                        </DialogTitle>
                        <DialogDescription>
                            {t.adminReviews?.replyDescription || "Your reply will be visible to all customers"}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedReview && (
                        <div className="space-y-4">
                            {/* Original Review */}
                            <div className="bg-muted p-4 rounded-lg space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">{selectedReview.user.username}</span>
                                    {renderStars(selectedReview.rating)}
                                </div>
                                <p className="text-sm">
                                    {selectedReview.comment || (
                                        <span className="text-muted-foreground italic">
                                            {t.adminReviews?.noComment || "No comment"}
                                        </span>
                                    )}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {t.adminReviews?.product || "Product"}: {selectedReview.product.name}
                                </p>
                            </div>

                            {/* Existing Replies */}
                            {selectedReview.replies && selectedReview.replies.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">
                                        {t.adminReviews?.existingReplies || "Existing Replies"}:
                                    </p>
                                    {selectedReview.replies.map((reply) => (
                                        <div
                                            key={reply.id}
                                            className="bg-primary/5 p-3 rounded-lg text-sm"
                                        >
                                            <p className="font-medium text-primary">
                                                {reply.user.username} ({reply.user.role})
                                            </p>
                                            <p>{reply.content}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Reply Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    {t.adminReviews?.yourReply || "Your Reply"}
                                </label>
                                <Textarea
                                    placeholder={t.adminReviews?.replyPlaceholder || "Write your reply..."}
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    rows={4}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setReplyDialogOpen(false)}
                            disabled={isSubmittingReply}
                        >
                            {t.common?.cancel || "Cancel"}
                        </Button>
                        <Button
                            onClick={handleSubmitReply}
                            disabled={!replyContent.trim() || isSubmittingReply}
                        >
                            {isSubmittingReply
                                ? t.common?.loading || "Loading..."
                                : t.adminReviews?.submitReply || "Submit Reply"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t.adminReviews?.deleteReviewTitle || "Delete Review"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t.adminReviews?.deleteReviewDesc ||
                                "Are you sure you want to delete this review? This action cannot be undone."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    {reviewToDelete && (
                        <div className="bg-muted p-4 rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="font-medium">{reviewToDelete.user.username}</span>
                                {renderStars(reviewToDelete.rating)}
                            </div>
                            <p className="text-sm line-clamp-2">
                                {reviewToDelete.comment || "No comment"}
                            </p>
                        </div>
                    )}
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                            {t.common?.cancel || "Cancel"}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting
                                ? t.common?.loading || "Loading..."
                                : t.common?.delete || "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
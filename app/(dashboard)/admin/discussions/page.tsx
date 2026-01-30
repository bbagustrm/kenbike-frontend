// app/(dashboard)/admin/discussions/page.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DiscussionService } from "@/services/discussion.service";
import { AdminDiscussion } from "@/types/discussion";
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    Search,
    MessageCircle,
    Trash2,
    ExternalLink,
    ThumbsUp,
    MessagesSquare,
    HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";

export default function AdminDiscussionsPage() {
    const { t } = useTranslation();
    const [discussions, setDiscussions] = useState<AdminDiscussion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [total, setTotal] = useState(0);

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [hasRepliesFilter, setHasRepliesFilter] = useState<string>("ALL");
    const [sortBy, setSortBy] = useState<"createdAt" | "likesCount">("createdAt");

    // Delete Dialog
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [discussionToDelete, setDiscussionToDelete] = useState<AdminDiscussion | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchDiscussions = async () => {
        setIsLoading(true);
        try {
            const response = await DiscussionService.getAdminDiscussions({
                page,
                limit: 15,
                search: searchQuery || undefined,
                hasReplies: hasRepliesFilter === "ALL" ? undefined : hasRepliesFilter === "YES",
                sortBy,
                order: "desc",
            });

            setDiscussions(response.data);
            setTotalPages(response.meta.totalPages);
            setTotal(response.meta.total);
        } catch (error) {
            console.error("Failed to fetch discussions:", error);
            toast.error(t.adminDiscussions?.fetchError || "Failed to load discussions");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDiscussions();
    }, [page, searchQuery, hasRepliesFilter, sortBy]);

    // Handle Delete
    const openDeleteDialog = (discussion: AdminDiscussion) => {
        setDiscussionToDelete(discussion);
        setDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!discussionToDelete) return;

        setIsDeleting(true);
        try {
            await DiscussionService.adminDeleteDiscussion(discussionToDelete.id);
            toast.success(t.adminDiscussions?.deleteSuccess || "Discussion deleted successfully");
            setDeleteDialogOpen(false);
            setDiscussionToDelete(null);
            fetchDiscussions();
        } catch (error) {
            console.error("Failed to delete discussion:", error);
            toast.error(t.adminDiscussions?.deleteError || "Failed to delete discussion");
        } finally {
            setIsDeleting(false);
        }
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
                            {t.adminDiscussions?.title || "Discussion Management"}
                        </h1>
                        <p className="text-muted-foreground">
                            {t.adminDiscussions?.description || "Manage product Q&A discussions"}
                        </p>
                    </div>
                    <Button onClick={fetchDiscussions} variant="outline">
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
                            {t.adminDiscussions?.totalQuestions || "Total Questions"}
                        </CardTitle>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {t.adminDiscussions?.withReplies || "With Replies"}
                        </CardTitle>
                        <MessagesSquare className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">
                            {discussions.filter((d) => d.repliesCount > 0).length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {t.adminDiscussions?.unanswered || "Unanswered"}
                        </CardTitle>
                        <MessageCircle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-500">
                            {discussions.filter((d) => d.repliesCount === 0).length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {t.adminDiscussions?.totalLikes || "Total Likes"}
                        </CardTitle>
                        <ThumbsUp className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-500">
                            {discussions.reduce((sum, d) => sum + d.likesCount, 0)}
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
                                    placeholder={t.adminDiscussions?.searchPlaceholder || "Search by user, product, or question..."}
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setPage(1);
                                    }}
                                    className="pl-10"
                                />
                            </div>

                            {/* Has Replies Filter */}
                            <Select
                                value={hasRepliesFilter}
                                onValueChange={(value) => {
                                    setHasRepliesFilter(value);
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder={t.adminDiscussions?.filterByReplies || "Reply Status"} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">
                                        {t.adminDiscussions?.allStatus || "All Status"}
                                    </SelectItem>
                                    <SelectItem value="YES">
                                        {t.adminDiscussions?.answered || "Answered"}
                                    </SelectItem>
                                    <SelectItem value="NO">
                                        {t.adminDiscussions?.unanswered || "Unanswered"}
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Sort By */}
                            <Select
                                value={sortBy}
                                onValueChange={(value: "createdAt" | "likesCount") => {
                                    setSortBy(value);
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger className="w-full md:w-[150px]">
                                    <SelectValue placeholder={t.adminDiscussions?.sortBy || "Sort By"} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="createdAt">
                                        {t.adminDiscussions?.sortByDate || "Newest"}
                                    </SelectItem>
                                    <SelectItem value="likesCount">
                                        {t.adminDiscussions?.sortByLikes || "Most Liked"}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Discussions Table */}
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
                        ) : discussions.length === 0 ? (
                            <EmptyState
                                icon={<MessageCircle className="h-12 w-12" />}
                                title={t.adminDiscussions?.noDiscussions || "No discussions found"}
                                description={t.adminDiscussions?.noDiscussionsDesc || "Try adjusting your filters"}
                            />
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t.adminDiscussions?.product || "Product"}</TableHead>
                                        <TableHead>{t.adminDiscussions?.user || "User"}</TableHead>
                                        <TableHead className="max-w-[350px]">
                                            {t.adminDiscussions?.question || "Question"}
                                        </TableHead>
                                        <TableHead className="text-center">
                                            {t.adminDiscussions?.replies || "Replies"}
                                        </TableHead>
                                        <TableHead className="text-center">
                                            {t.adminDiscussions?.likes || "Likes"}
                                        </TableHead>
                                        <TableHead>{t.adminDiscussions?.date || "Date"}</TableHead>
                                        <TableHead className="text-right">
                                            {t.adminDiscussions?.actions || "Actions"}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {discussions.map((discussion) => (
                                        <TableRow key={discussion.id}>
                                            <TableCell>
                                                <Link
                                                    href={`/products/${discussion.product.slug}`}
                                                    target="_blank"
                                                    className="flex items-center gap-2 hover:underline text-primary"
                                                >
                                                    <span className="font-medium line-clamp-1 max-w-[150px]">
                                                        {discussion.product.name}
                                                    </span>
                                                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{discussion.user.username}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {discussion.user.email}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-[350px]">
                                                <p className="line-clamp-2 text-sm">{discussion.question}</p>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge
                                                    variant={discussion.repliesCount > 0 ? "default" : "secondary"}
                                                    className="min-w-[40px]"
                                                >
                                                    <MessagesSquare className="h-3 w-3 mr-1" />
                                                    {discussion.repliesCount}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="outline" className="min-w-[40px]">
                                                    <ThumbsUp className="h-3 w-3 mr-1" />
                                                    {discussion.likesCount}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-muted-foreground">
                                                    {format(new Date(discussion.createdAt), "dd MMM yyyy")}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={`/products/${discussion.product.slug}#discussion`}
                                                            target="_blank"
                                                        >
                                                            <ExternalLink className="h-4 w-4 mr-1" />
                                                            {t.adminDiscussions?.view || "View"}
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => openDeleteDialog(discussion)}
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

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t.adminDiscussions?.deleteTitle || "Delete Discussion"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t.adminDiscussions?.deleteDesc ||
                                "Are you sure you want to delete this discussion? This will also delete all replies. This action cannot be undone."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    {discussionToDelete && (
                        <div className="bg-muted p-4 rounded-lg space-y-2">
                            <p className="font-medium">{discussionToDelete.user.username}</p>
                            <p className="text-sm line-clamp-2">{discussionToDelete.question}</p>
                            <div className="flex gap-2 text-xs text-muted-foreground">
                                <span>{discussionToDelete.repliesCount} replies</span>
                                <span>•</span>
                                <span>{discussionToDelete.likesCount} likes</span>
                            </div>
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
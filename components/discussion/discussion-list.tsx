// components/discussion/discussion-list.tsx
"use client";

import { useState, useEffect } from "react";
import { DiscussionService } from "@/services/discussion.service";
import { Discussion, QueryDiscussionsParams } from "@/types/discussion";
import { DiscussionForm } from "./discussion-form";
import { DiscussionItem } from "./discussion-item";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, MessageSquare, HelpCircle } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { toast } from "sonner";

interface DiscussionListProps {
    productId: string;
    productSlug: string;
}

export function DiscussionList({ productId, productSlug }: DiscussionListProps) {
    const { locale } = useTranslation();
    const [discussions, setDiscussions] = useState<Discussion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [totalDiscussions, setTotalDiscussions] = useState(0);

    // Sort options
    const [sortBy, setSortBy] = useState<QueryDiscussionsParams["sortBy"]>("createdAt");
    const [order, setOrder] = useState<QueryDiscussionsParams["order"]>("desc");

    const fetchDiscussions = async (pageNum: number, append: boolean = false) => {
        try {
            if (pageNum === 1) {
                setIsLoading(true);
            } else {
                setIsLoadingMore(true);
            }

            const response = await DiscussionService.getProductDiscussions(productSlug, {
                page: pageNum,
                limit: 10,
                sortBy,
                order,
            });

            if (append) {
                setDiscussions((prev) => [...prev, ...response.data]);
            } else {
                setDiscussions(response.data);
            }

            setHasMore(response.meta.hasNextPage);
            setTotalDiscussions(response.meta.total);
        } catch (error) {
            console.error("Failed to fetch discussions:", error);
            toast.error(locale === "id" ? "Gagal memuat diskusi" : "Failed to load discussions");
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        setPage(1);
        fetchDiscussions(1, false);
    }, [productSlug, sortBy, order]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchDiscussions(nextPage, true);
    };

    const handleNewDiscussion = (newDiscussion: Discussion) => {
        setDiscussions((prev) => [newDiscussion, ...prev]);
        setTotalDiscussions((prev) => prev + 1);
    };

    const handleUpdate = () => {
        setPage(1);
        fetchDiscussions(1, false);
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                {/* Form Skeleton */}
                <Skeleton className="h-24 w-full" />
                {/* Discussions Skeleton */}
                {[1, 2, 3].map((i) => (
                    <div key={i} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div>
                                <Skeleton className="h-4 w-24 mb-1" />
                                <Skeleton className="h-3 w-20" />
                            </div>
                        </div>
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-8 w-32" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Ask Question Form */}
            <DiscussionForm productId={productId} onSuccess={handleNewDiscussion} />

            {/* Header & Sort */}
            {totalDiscussions > 0 && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        <span className="font-medium">
                            {totalDiscussions} {locale === "id" ? "Pertanyaan" : "Questions"}
                        </span>
                    </div>

                    {/* Sort */}
                    <Select
                        value={`${sortBy}-${order}`}
                        onValueChange={(value) => {
                            const [newSortBy, newOrder] = value.split("-") as [QueryDiscussionsParams["sortBy"], QueryDiscussionsParams["order"]];
                            setSortBy(newSortBy);
                            setOrder(newOrder);
                        }}
                    >
                        <SelectTrigger className="w-full sm:w-[180px] border border-border">
                            Sort by : <SelectValue placeholder={locale === "id" ? "Urutkan" : "Sort by"} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="createdAt-desc">
                                {locale === "id" ? "Terbaru" : "Newest"}
                            </SelectItem>
                            <SelectItem value="createdAt-asc">
                                {locale === "id" ? "Terlama" : "Oldest"}
                            </SelectItem>
                            <SelectItem value="likesCount-desc">
                                {locale === "id" ? "Paling Disukai" : "Most Liked"}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Discussions List */}
            {discussions.length > 0 ? (
                <div className="space-y-4">
                    {discussions.map((discussion) => (
                        <DiscussionItem
                            key={discussion.id}
                            discussion={discussion}
                            onUpdate={handleUpdate}
                        />
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
                    icon={<HelpCircle className="h-12 w-12 text-muted-foreground" />}
                    title={locale === "id" ? "Belum ada pertanyaan" : "No questions yet"}
                    description={
                        locale === "id"
                            ? "Jadilah yang pertama bertanya tentang produk ini"
                            : "Be the first to ask about this product"
                    }
                />
            )}
        </div>
    );
}
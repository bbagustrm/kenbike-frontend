"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Loader2, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ProductCard } from "@/components/product/product-card";
import { FilterSidebar, FilterValues } from "@/components/search/filter-sidebar";
import { SortSelect } from "@/components/search/sort-select";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { ProductService } from "@/services/product.service";
import { ProductListItem } from "@/types/product";
import { useTranslation } from "@/hooks/use-translation";
import { handleApiError } from "@/lib/api-client";
import { getTotalStock } from "@/lib/check-stock";
import { toast } from "sonner";

function SearchPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t } = useTranslation();

    const [products, setProducts] = useState<ProductListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(0);
    const [total, setTotal] = useState(0);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // Get params from URL
    const searchQuery = searchParams.get("search") || "";
    const categorySlug = searchParams.get("category") || undefined;
    const tagSlug = searchParams.get("tag") || undefined;
    const promotionId = searchParams.get("promotion") || undefined;
    const minPrice = searchParams.get("minPrice") ? parseInt(searchParams.get("minPrice")!) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? parseInt(searchParams.get("maxPrice")!) : undefined;
    const hasPromotion = searchParams.get("hasPromotion") === "true" || undefined;
    const isFeatured = searchParams.get("isFeatured") === "true" || undefined;
    const sortParam = searchParams.get("sort") || "totalSold-desc";
    const page = parseInt(searchParams.get("page") || "1");

    const [searchInput, setSearchInput] = useState(searchQuery);
    const [filters, setFilters] = useState<FilterValues>({
        categorySlug,
        tagSlug,
        promotionId,
        minPrice,
        maxPrice,
        availableOnly: false,
    });

    // Parse sort param
    const [sortBy, order] = sortParam.split("-") as [
            "name" | "idPrice" | "enPrice" | "totalSold" | "totalView" | "avgRating" | "createdAt",
            "asc" | "desc"
    ];

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const response = await ProductService.getProducts({
                    page,
                    limit: 20,
                    search: searchQuery || undefined,
                    categorySlug: filters.categorySlug,
                    tagSlug: filters.tagSlug,
                    minPrice: filters.minPrice,
                    maxPrice: filters.maxPrice,
                    hasPromotion: hasPromotion || (promotionId ? true : undefined),
                    isFeatured,
                    sortBy,
                    order,
                });

                let filteredProducts = response.data;

                // Filter by promotion ID if specified
                if (promotionId) {
                    filteredProducts = filteredProducts.filter(
                        (p) => p.promotion?.id === promotionId
                    );
                }

                // Client-side filter for available stock only
                if (filters.availableOnly) {
                    filteredProducts = filteredProducts.filter(
                        (p) => getTotalStock(p.variants) > 0
                    );
                }

                setProducts(filteredProducts);
                setTotal(response.meta.total);
                setTotalPages(response.meta.totalPages);
            } catch (error) {
                const errorResult = handleApiError(error);
                toast.error(errorResult.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, [searchQuery, filters, sortParam, page, hasPromotion, isFeatured, promotionId, sortBy, order]);

    const updateURL = (params: Record<string, string | undefined>) => {
        const newParams = new URLSearchParams(searchParams.toString());

        Object.entries(params).forEach(([key, value]) => {
            if (value) {
                newParams.set(key, value);
            } else {
                newParams.delete(key);
            }
        });

        // Reset to page 1 when filters change
        if (!params.page) {
            newParams.set("page", "1");
        }

        router.push(`/search?${newParams.toString()}`);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        updateURL({ search: searchInput || undefined });
    };

    const handleFilterChange = (newFilters: FilterValues) => {
        setFilters(newFilters);
        updateURL({
            category: newFilters.categorySlug,
            tag: newFilters.tagSlug,
            promotion: newFilters.promotionId,
            minPrice: newFilters.minPrice?.toString(),
            maxPrice: newFilters.maxPrice?.toString(),
        });
    };

    const handleSortChange = (value: string) => {
        updateURL({ sort: value });
    };

    const handlePageChange = (newPage: number) => {
        updateURL({ page: newPage.toString() });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const getPaginationItems = () => {
        const items = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                items.push(
                    <PaginationItem key={i}>
                        <PaginationLink
                            isActive={page === i}
                            onClick={() => handlePageChange(i)}
                            className="cursor-pointer"
                        >
                            {i}
                        </PaginationLink>
                    </PaginationItem>
                );
            }
        } else {
            items.push(
                <PaginationItem key={1}>
                    <PaginationLink
                        isActive={page === 1}
                        onClick={() => handlePageChange(1)}
                        className="cursor-pointer"
                    >
                        1
                    </PaginationLink>
                </PaginationItem>
            );

            if (page > 3) {
                items.push(
                    <PaginationItem key="ellipsis-start">
                        <PaginationEllipsis />
                    </PaginationItem>
                );
            }

            const startPage = Math.max(2, page - 1);
            const endPage = Math.min(totalPages - 1, page + 1);

            for (let i = startPage; i <= endPage; i++) {
                items.push(
                    <PaginationItem key={i}>
                        <PaginationLink
                            isActive={page === i}
                            onClick={() => handlePageChange(i)}
                            className="cursor-pointer"
                        >
                            {i}
                        </PaginationLink>
                    </PaginationItem>
                );
            }

            if (page < totalPages - 2) {
                items.push(
                    <PaginationItem key="ellipsis-end">
                        <PaginationEllipsis />
                    </PaginationItem>
                );
            }

            items.push(
                <PaginationItem key={totalPages}>
                    <PaginationLink
                        isActive={page === totalPages}
                        onClick={() => handlePageChange(totalPages)}
                        className="cursor-pointer"
                    >
                        {totalPages}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        return items;
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Search Bar & Sort */}
            <div className="mb-6 space-y-4">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={t.search.placeholder}
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button type="submit">{t.search.searchButton || "Cari"}</Button>
                </form>

                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        {isLoading ? (
                            <span>{t.common.loading}</span>
                        ) : (
                            <span>
                {t.search.resultsFound.replace("{count}", total.toString())}
              </span>
                        )}
                    </p>

                    <div className="flex items-center gap-2">
                        {/* Mobile Filter Button */}
                        <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="sm" className="lg:hidden">
                                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                                    {t.search.filters}
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                                <SheetHeader>
                                    <SheetTitle>{t.search.filters}</SheetTitle>
                                </SheetHeader>
                                <div className="mt-6">
                                    <FilterSidebar
                                        filters={filters}
                                        onFilterChange={handleFilterChange}
                                        onClose={() => setIsMobileFilterOpen(false)}
                                    />
                                </div>
                            </SheetContent>
                        </Sheet>

                        <SortSelect value={sortParam} onChange={handleSortChange} />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Desktop Filter Sidebar */}
                <aside className="hidden lg:block">
                    <div className="sticky top-24">
                        <FilterSidebar
                            filters={filters}
                            onFilterChange={handleFilterChange}
                        />
                    </div>
                </aside>

                {/* Product Grid */}
                <div className="lg:col-span-3">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : products.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-8 flex justify-center">
                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    onClick={() => handlePageChange(page - 1)}
                                                    className={
                                                        page === 1
                                                            ? "pointer-events-none opacity-50"
                                                            : "cursor-pointer"
                                                    }
                                                />
                                            </PaginationItem>
                                            {getPaginationItems()}
                                            <PaginationItem>
                                                <PaginationNext
                                                    onClick={() => handlePageChange(page + 1)}
                                                    className={
                                                        page === totalPages
                                                            ? "pointer-events-none opacity-50"
                                                            : "cursor-pointer"
                                                    }
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            )}
                        </>
                    ) : (
                        <EmptyState
                            title={t.search.noResults}
                            description="Coba sesuaikan filter atau kata kunci pencarian Anda"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense
            fallback={
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                </div>
            }
        >
            <SearchPageContent />
        </Suspense>
    );
}
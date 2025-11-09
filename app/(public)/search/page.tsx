"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    const [isFilterVisible, setIsFilterVisible] = useState(true);

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
                    limit: 24,
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

                if (promotionId) {
                    filteredProducts = filteredProducts.filter(
                        (p) => p.promotion?.id === promotionId
                    );
                }

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

        if (!params.page) {
            newParams.set("page", "1");
        }

        router.push(`/search?${newParams.toString()}`);
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
            {/* Main Content - Two Column Layout */}
            <div className="flex">
                {/* Desktop Filter Sidebar - Collapsible */}
                <aside
                    className={`hidden lg:block mr-12 transition-all duration-300 ${
                        isFilterVisible ? 'w-64 opacity-100' : 'w-0 opacity-0 overflow-hidden'
                    }`}
                >
                    <div className="sticky top-24">
                        <FilterSidebar
                            filters={filters}
                            onFilterChange={handleFilterChange}
                        />
                    </div>
                </aside>

                {/* Right Content Area */}
                <div className="flex-1">
                    {/* Header with Filter Toggle, Title and Sort */}
                    <div className="mb-6">
                        <div className="flex items-start justify-between gap-4">
                            {/* Left Side: Filter Toggle + Title */}
                            <div className="flex items-start gap-3 flex-1">
                                {/* Desktop Filter Toggle */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsFilterVisible(!isFilterVisible)}
                                    className="hidden lg:flex mt-1 shrink-0"
                                >
                                    {isFilterVisible ? (
                                        <X className="h-4 w-4" />
                                    ) : (
                                        <SlidersHorizontal className="h-4 w-4" />
                                    )}
                                </Button>

                                {/* Mobile Filter Toggle */}
                                <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
                                    <SheetTrigger asChild>
                                        <Button variant="outline" size="sm" className="lg:hidden mt-1 shrink-0">
                                            <SlidersHorizontal className="h-4 w-4 mr-2" />
                                            Filters
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-card">
                                        <SheetHeader>
                                            <SheetTitle>Filters</SheetTitle>
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

                                {/* Title and Count */}
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-2xl lg:text-3xl font-bold mb-2 text-foreground">
                                        {searchQuery
                                            ? `Search results for "${searchQuery}"`
                                            : "All Products"}
                                    </h1>

                                    {/* Active Filters Badges */}
                                    {(filters.categorySlug || filters.tagSlug || filters.promotionId || hasPromotion) && (
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {filters.categorySlug && (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                                                    Category: {filters.categorySlug.replace(/-/g, ' ')}
                                                </span>
                                            )}
                                            {filters.tagSlug && (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 border border-blue-500/20">
                                                    Tag: {filters.tagSlug.replace(/-/g, ' ')}
                                                </span>
                                            )}
                                            {(filters.promotionId || hasPromotion) && (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20">
                                                    🎉 Special Promotion
                                                </span>
                                            )}
                                            {(filters.minPrice || filters.maxPrice) && (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600 border border-green-500/20">
                                                    Price Range Applied
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <p className="text-sm text-muted-foreground">
                                        {isLoading ? (
                                            <span>{t.common.loading}</span>
                                        ) : (
                                            <span>
                                                {total} {total === 1 ? "product" : "products"} found
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Right Side: Sort Select */}
                            <div className="shrink-0">
                                <SortSelect value={sortParam} onChange={handleSortChange} />
                            </div>
                        </div>
                    </div>

                    {/* Product Grid */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : products.length > 0 ? (
                        <>
                            <div className={`grid gap-4 ${
                                isFilterVisible
                                    ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
                                    : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
                            }`}>
                                {products.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="mt-12 flex justify-center">
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
                            title="No products found"
                            description="Try adjusting your filters or search terms"
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
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                </div>
            }
        >
            <SearchPageContent />
        </Suspense>
    );
}
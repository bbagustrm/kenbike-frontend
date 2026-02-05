// app/(public)/search/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ProductCard } from "@/components/product/product-card";
import { FilterSidebar, FilterValues } from "@/components/search/filter-sidebar";
import { SortSelect } from "@/components/search/sort-select";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductGridSkeleton } from "@/components/product/product-card-skeleton";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { ProductService } from "@/services/product.service";
import { ProductListItem } from "@/types/product";
import { useTranslation } from "@/hooks/use-translation";
import { handleApiError } from "@/lib/api-client";
import { getTotalStock } from "@/lib/check-stock";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FadeInView } from "@/components/animations/fade-in-view";

function SearchPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t, locale } = useTranslation();

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

    const [sortBy, order] = sortParam.split("-") as [
            "name" | "idPrice" | "enPrice" | "totalSold" | "totalView" | "avgRating" | "createdAt",
            "asc" | "desc"
    ];

    const adjustedSortBy = sortBy === "idPrice" || sortBy === "enPrice"
        ? (locale === "id" ? "idPrice" : "enPrice") as typeof sortBy
        : sortBy;

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
                    sortBy: adjustedSortBy,
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
    }, [searchQuery, filters, sortParam, page, hasPromotion, isFeatured, promotionId, adjustedSortBy, order]);

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
        <div className="container mx-auto px-4 py-6 md:pt-8 md:pb-24">
            <div className="flex gap-12 lg:gap-16">
                {/* Desktop Filter Sidebar */}
                <AnimatePresence>
                    {isFilterVisible && (
                        <motion.aside
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: "256px", opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="hidden lg:block shrink-0"
                        >
                            <div className="sticky top-24">
                                <FilterSidebar
                                    filters={filters}
                                    onFilterChange={handleFilterChange}
                                />
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <motion.div
                        className="mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex items-start justify-between gap-3 md:gap-4 mb-8">
                            {/* Left: Filter Toggle + Title */}
                            <div className="flex items-start gap-2 md:gap-3 flex-1 min-w-0">

                                {/* Mobile Filter */}
                                <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
                                    <SheetTrigger asChild>
                                        <motion.div whileTap={{ scale: 0.95 }}>
                                            <Button variant="secondary" size="sm" className="lg:hidden mt-1 shrink-0 bg-accent">
                                                <SlidersHorizontal className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
                                                <span className="hidden md:inline">{t.search.filters}</span>
                                            </Button>
                                        </motion.div>
                                    </SheetTrigger>
                                    <SheetContent side="left" className="w-[280px] sm:w-[350px] bg-accent">
                                        <SheetHeader>
                                            <SheetTitle>{t.search.filters}</SheetTitle>
                                        </SheetHeader>
                                        <div>
                                            <FilterSidebar
                                                filters={filters}
                                                onFilterChange={handleFilterChange}
                                                onClose={() => setIsMobileFilterOpen(false)}
                                            />
                                        </div>
                                    </SheetContent>
                                </Sheet>

                                {/* Title */}
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-lg md:text-2xl lg:text-3xl font-bold mb-2 text-foreground truncate">
                                        {searchQuery
                                            ? `"${searchQuery}"`
                                            : t.search?.allProducts || "All Products"}
                                    </h1>

                                    <div className="flex items-center gap-2">
                                        <p className="text-xs md:text-sm text-muted-foreground">
                                            {isLoading ? (
                                                <span>{t.common.loading}</span>
                                            ) : (
                                                <span>
                                                    {total} {total === 1 ? (t.search?.product || "product") : (t.search?.productPlural || "products")}
                                                </span>
                                            )}
                                        </p>
                                        {/* Active Filters */}
                                        {(filters.categorySlug || filters.tagSlug || filters.promotionId || hasPromotion) && (
                                            <div className="flex flex-wrap gap-1.5 md:gap-2">
                                                {filters.categorySlug && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        {filters.categorySlug.replace(/-/g, ' ')}
                                                    </Badge>
                                                )}
                                                {filters.tagSlug && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {filters.tagSlug.replace(/-/g, ' ')}
                                                    </Badge>
                                                )}
                                                {(filters.promotionId || hasPromotion) && (
                                                    <Badge variant="promotion" className="text-xs">
                                                        {t.search?.promo || "Promo"}
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                    </div>


                                </div>
                            </div>

                            {/* Right: Sort */}
                            <div className="shrink-0">
                                <SortSelect value={sortParam} onChange={handleSortChange} />
                            </div>
                        </div>
                    </motion.div>

                    {/* Product Grid */}
                    {isLoading ? (
                        <ProductGridSkeleton
                            count={24}
                            columns={isFilterVisible ? 4 : 4}
                        />
                    ) : products.length > 0 ? (
                        <>
                            <div className={`grid gap-3 md:gap-4 ${
                                isFilterVisible
                                    ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4'
                                    : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
                            }`}>
                                {products.map((product, index) => (
                                    <FadeInView key={product.id} delay={index * 0.02}>
                                        <ProductCard product={product} locale={locale} />
                                    </FadeInView>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <motion.div
                                    className="mt-8 md:mt-12 flex justify-center"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
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
                                </motion.div>
                            )}
                        </>
                    ) : (
                        <EmptyState
                            title={t.search?.noProductsFound || "No products found"}
                            description={t.search?.tryAdjustingFilters || "Try adjusting your filters or search terms"}
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
                    <ProductGridSkeleton count={24} />
                </div>
            }
        >
            <SearchPageContent />
        </Suspense>
    );
}
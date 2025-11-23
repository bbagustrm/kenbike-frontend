"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PriceRangeSlider } from "@/components/ui/price-range-slider";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/hooks/use-translation";
import { CategoryService } from "@/services/category.service";
import { TagService } from "@/services/tag.service";
import { PromotionService } from "@/services/promotion.service";
import { Category } from "@/types/category";
import { Tag } from "@/types/tag";
import { Promotion } from "@/types/promotion";
import { formatCurrency } from "@/lib/format-currency";
import { cn } from "@/lib/utils";

export interface FilterValues {
    categorySlug?: string;
    tagSlug?: string;
    promotionId?: string;
    minPrice?: number;
    maxPrice?: number;
    availableOnly: boolean;
}

interface FilterSidebarProps {
    filters: FilterValues;
    onFilterChange: (filters: FilterValues) => void;
    className?: string;
    onClose?: () => void;
}

const PRICE_RANGES = {
    IDR: {
        MIN: 0,
        MAX: 5000000,
        STEP: 50000,
    },
    USD: {
        MIN: 0,
        MAX: 500,
        STEP: 10,
    },
};

export function FilterSidebar({
    filters,
    onFilterChange,
    className,
    onClose,
}: FilterSidebarProps) {
    const { t, locale } = useTranslation();
    const currency = locale === "id" ? "IDR" : "USD";
    const priceConfig = PRICE_RANGES[currency];

    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [priceRange, setPriceRange] = useState<[number, number]>([
        filters.minPrice || priceConfig.MIN,
        filters.maxPrice || priceConfig.MAX,
    ]);

    useEffect(() => {
        setPriceRange([
            filters.minPrice || priceConfig.MIN,
            filters.maxPrice || priceConfig.MAX,
        ]);
    }, [filters.minPrice, filters.maxPrice, priceConfig.MIN, priceConfig.MAX]);

    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const [categoriesRes, tagsRes, promotionsRes] = await Promise.all([
                    CategoryService.getCategories({ isActive: true, limit: 100 }),
                    TagService.getTags({ isActive: true, limit: 100 }),
                    PromotionService.getActivePromotions(),
                ]);

                setCategories(categoriesRes.data);
                setTags(tagsRes.data);
                setPromotions(promotionsRes.data);
            } catch (error) {
                console.error("Failed to fetch filters:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFilters();
    }, []);

    const handleCategoryChange = (value: string) => {
        onFilterChange({
            ...filters,
            categorySlug: value === "all" ? undefined : value,
        });
    };

    const handleTagChange = (value: string) => {
        onFilterChange({
            ...filters,
            tagSlug: value === "all" ? undefined : value,
        });
    };

    const handlePromotionChange = (value: string) => {
        onFilterChange({
            ...filters,
            promotionId: value === "all" ? undefined : value,
        });
    };

    const handlePriceRangeChange = (values: number[]) => {
        if (values.length === 2) {
            setPriceRange([values[0], values[1]]);
        }
    };

    const handlePriceRangeCommit = (values: number[]) => {
        if (values.length === 2) {
            onFilterChange({
                ...filters,
                minPrice: values[0] === priceConfig.MIN ? undefined : values[0],
                maxPrice: values[1] === priceConfig.MAX ? undefined : values[1],
            });
        }
    };

    const handleAvailableOnlyChange = (checked: boolean) => {
        onFilterChange({
            ...filters,
            availableOnly: checked,
        });
    };

    const handleClearFilters = () => {
        setPriceRange([priceConfig.MIN, priceConfig.MAX]);
        onFilterChange({
            availableOnly: false,
        });
    };

    const hasActiveFilters =
        filters.categorySlug ||
        filters.tagSlug ||
        filters.promotionId ||
        filters.minPrice ||
        filters.maxPrice ||
        filters.availableOnly;

    return (
        <div className={cn("space-y-6 px-4 md:py-4 md:bg-card md:border md:border-border md:rounded-sm", className)}>
            {/* Desktop Header (no close button) */}
            {!onClose && (
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">{t.search.filters}</h2>
                    {hasActiveFilters && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearFilters}
                            className="text-xs"
                        >
                            {t.search.clearFilters}
                        </Button>
                    )}
                </div>
            )}
            {isLoading ? (
                <div className="space-y-6">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Category Filter */}
                    {categories.length > 0 && (
                        <div className="space-y-3">
                            <Label className="text-sm font-bold">{t.search.category}</Label>
                            <RadioGroup
                                value={filters.categorySlug || "all"}
                                onValueChange={handleCategoryChange}
                                className="space-y-2"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="all" id="category-all" />
                                    <Label htmlFor="category-all" className="font-normal cursor-pointer text-sm">
                                        {t.search.allCategories}
                                    </Label>
                                </div>
                                {categories.map((category) => (
                                    <div key={category.id} className="flex items-center space-x-2">
                                        <RadioGroupItem value={category.slug} id={`category-${category.id}`} />
                                        <Label
                                            htmlFor={`category-${category.id}`}
                                            className="font-normal cursor-pointer text-sm"
                                        >
                                            {category.name}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                    )}

                    {/* Tag Filter */}
                    {tags.length > 0 && (
                        <div className="space-y-3">
                            <Label className="text-sm font-bold">{t.search.tags}</Label>
                            <RadioGroup
                                value={filters.tagSlug || "all"}
                                onValueChange={handleTagChange}
                                className="space-y-2"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="all" id="tag-all" />
                                    <Label htmlFor="tag-all" className="font-normal cursor-pointer text-sm">
                                        {t.search.allTags}
                                    </Label>
                                </div>
                                {tags.map((tag) => (
                                    <div key={tag.id} className="flex items-center space-x-2">
                                        <RadioGroupItem value={tag.slug} id={`tag-${tag.id}`} />
                                        <Label htmlFor={`tag-${tag.id}`} className="font-normal cursor-pointer text-sm">
                                            {tag.name}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                    )}

                    {/* Promotion Filter */}
                    {promotions.length > 0 && (
                        <div className="space-y-3">
                            <Label className="text-sm font-bold">{t.search.promotion}</Label>
                            <RadioGroup
                                value={filters.promotionId || "all"}
                                onValueChange={handlePromotionChange}
                                className="space-y-2"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="all" id="promotion-all" />
                                    <Label htmlFor="promotion-all" className="font-normal cursor-pointer text-sm">
                                        {t.search.allPromotions}
                                    </Label>
                                </div>
                                {promotions.map((promotion) => (
                                    <div key={promotion.id} className="flex items-center space-x-2">
                                        <RadioGroupItem value={promotion.id} id={`promotion-${promotion.id}`} />
                                        <Label
                                            htmlFor={`promotion-${promotion.id}`}
                                            className="font-normal cursor-pointer text-sm"
                                        >
                                            {promotion.name} (-{Math.round(promotion.discount * 100)}%)
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                    )}

                    {/* Price Range Filter */}
                    <div className="space-y-4">
                        <Label className="text-sm font-bold">{t.search.priceRange}</Label>
                        <div className="px-2 py-6">
                            <PriceRangeSlider
                                min={priceConfig.MIN}
                                max={priceConfig.MAX}
                                step={priceConfig.STEP}
                                value={[priceRange[0], priceRange[1]]}
                                onValueChange={handlePriceRangeChange}
                                onValueCommit={handlePriceRangeCommit}
                                className="w-full"
                            />
                        </div>
                        <div className="flex items-center justify-between text-xs gap-2">
                            <div className="flex flex-col">
                                <span className="text-muted-foreground mb-1">Min</span>
                                <span className="text-foreground font-medium">
                                    {formatCurrency(priceRange[0], currency)}
                                </span>
                            </div>
                            <span className="text-muted-foreground">-</span>
                            <div className="flex flex-col text-right">
                                <span className="text-muted-foreground mb-1">Max</span>
                                <span className="text-foreground font-medium">
                                    {formatCurrency(priceRange[1], currency)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Available Only Switch */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                        <Label htmlFor="available-only" className="text-sm font-semibold cursor-pointer">
                            {t.search.availableOnly}
                        </Label>
                        <Switch
                            id="available-only"
                            checked={filters.availableOnly}
                            onCheckedChange={handleAvailableOnlyChange}
                        />
                    </div>

                    {/* Clear Filters Button (Mobile only) */}
                    {onClose && hasActiveFilters && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearFilters}
                            className="w-full"
                        >
                            {t.search.clearFilters}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
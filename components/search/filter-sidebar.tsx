"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
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

const PRICE_MIN = 0;
const PRICE_MAX = 500000;

export function FilterSidebar({
    filters,
    onFilterChange,
    className,
    onClose,
}: FilterSidebarProps) {
    const { t } = useTranslation();

    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [priceRange, setPriceRange] = useState([
        filters.minPrice || PRICE_MIN,
        filters.maxPrice || PRICE_MAX,
    ]);

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
        setPriceRange(values);
    };

    const handlePriceRangeCommit = (values: number[]) => {
        onFilterChange({
            ...filters,
            minPrice: values[0] === PRICE_MIN ? undefined : values[0],
            maxPrice: values[1] === PRICE_MAX ? undefined : values[1],
        });
    };

    const handleAvailableOnlyChange = (checked: boolean) => {
        onFilterChange({
            ...filters,
            availableOnly: checked,
        });
    };

    const handleClearFilters = () => {
        setPriceRange([PRICE_MIN, PRICE_MAX]);
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
        <div className={cn("space-y-6", className)}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{t.search.filters}</h2>
                <div className="flex items-center gap-2">
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearFilters}
                            className="text-xs"
                        >
                            {t.search.clearFilters}
                        </Button>
                    )}
                    {onClose && (
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-6">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
            ) : (
                <>
                    {/* Category Filter */}
                    {categories.length > 0 && (
                        <div className="space-y-3">
                            <Label className="text-sm font-semibold">{t.search.category}</Label>
                            <RadioGroup
                                value={filters.categorySlug || "all"}
                                onValueChange={handleCategoryChange}
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="all" id="category-all" />
                                    <Label htmlFor="category-all" className="font-normal cursor-pointer">
                                        {t.search.allCategories || "Semua Kategori"}
                                    </Label>
                                </div>
                                {categories.map((category) => (
                                    <div key={category.id} className="flex items-center space-x-2">
                                        <RadioGroupItem value={category.slug} id={`category-${category.id}`} />
                                        <Label
                                            htmlFor={`category-${category.id}`}
                                            className="font-normal cursor-pointer"
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
                            <Label className="text-sm font-semibold">{t.search.tags}</Label>
                            <RadioGroup
                                value={filters.tagSlug || "all"}
                                onValueChange={handleTagChange}
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="all" id="tag-all" />
                                    <Label htmlFor="tag-all" className="font-normal cursor-pointer">
                                        {t.search.allTags || "Semua Tag"}
                                    </Label>
                                </div>
                                {tags.map((tag) => (
                                    <div key={tag.id} className="flex items-center space-x-2">
                                        <RadioGroupItem value={tag.slug} id={`tag-${tag.id}`} />
                                        <Label htmlFor={`tag-${tag.id}`} className="font-normal cursor-pointer">
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
                            <Label className="text-sm font-semibold">{t.search.promotion}</Label>
                            <RadioGroup
                                value={filters.promotionId || "all"}
                                onValueChange={handlePromotionChange}
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="all" id="promotion-all" />
                                    <Label htmlFor="promotion-all" className="font-normal cursor-pointer">
                                        {t.search.allPromotions || "Semua Promosi"}
                                    </Label>
                                </div>
                                {promotions.map((promotion) => (
                                    <div key={promotion.id} className="flex items-center space-x-2">
                                        <RadioGroupItem value={promotion.id} id={`promotion-${promotion.id}`} />
                                        <Label
                                            htmlFor={`promotion-${promotion.id}`}
                                            className="font-normal cursor-pointer"
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
                        <Label className="text-sm font-semibold">{t.search.priceRange}</Label>
                        <div className="px-2 py-6">
                            <Slider
                                min={PRICE_MIN}
                                max={PRICE_MAX}
                                step={50000}
                                value={priceRange}
                                onValueChange={handlePriceRangeChange}
                                onValueCommit={handlePriceRangeCommit}
                                className="w-full"
                                minStepsBetweenThumbs={1}
                            />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground font-medium">
                                {formatCurrency(priceRange[0])}
                            </span>
                            <span className="text-muted-foreground font-medium">
                                {formatCurrency(priceRange[1])}
                            </span>
                        </div>
                    </div>

                    {/* Available Only Switch */}
                    <div className="flex items-center justify-between pt-2 border-t">
                        <Label htmlFor="available-only" className="text-sm font-semibold cursor-pointer">
                            {t.search.availableOnly}
                        </Label>
                        <Switch
                            id="available-only"
                            checked={filters.availableOnly}
                            onCheckedChange={handleAvailableOnlyChange}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
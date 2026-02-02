"use client";

import { useState, useEffect } from "react";
import {Minus} from "lucide-react";
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
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

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
        <div className={cn("space-y-2", className)}>
            {/* Desktop Header */}
            {!onClose && (
                <div className="flex items-center justify-end">
                    {hasActiveFilters && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearFilters}
                            className="w-full text-xs my-2 py-0 px-2.5 mb-4 "
                        >
                            <Minus />
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
                <Accordion
                    type="multiple"
                    defaultValue={["category","promotion", "price"]}
                    className="px-2 md:px-0 py-0"
                >
                    {/* Category */}
                    {categories.length > 0 && (
                        <AccordionItem value="category" className="border-0 overflow-auto py-0">
                            <AccordionTrigger className="font-semibold py-0 pb-2 px-4 cursor-pointer hover:no-underline">
                                {t.search.category}
                            </AccordionTrigger>
                            <AccordionContent className="p-4">
                                <RadioGroup
                                    value={filters.categorySlug || "all"}
                                    onValueChange={handleCategoryChange}
                                    className="gap-4 px-4"
                                >
                                    <div className="flex items-center space-x-3">
                                        <RadioGroupItem value="all" id="category-all" />
                                        <Label htmlFor="category-all" className=" cursor-pointer font-normal">
                                            {t.search.allCategories}
                                        </Label>
                                    </div>

                                    {categories.map((category) => (
                                        <div
                                            key={category.id}
                                            className="flex items-center space-x-3"
                                        >
                                            <RadioGroupItem
                                                value={category.slug}
                                                id={`category-${category.id}`}
                                            />
                                            <Label
                                                htmlFor={`category-${category.id}`}
                                                className=" cursor-pointer font-normal"
                                            >
                                                {category.name}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </AccordionContent>
                        </AccordionItem>
                    )}

                    {/* Tags */}
                    {tags.length > 0 && (
                        <AccordionItem value="tag" className="border-0">
                            <AccordionTrigger className=" font-semibold pt-3 pb-2 px-4 cursor-pointer hover:no-underline">
                                {t.search.tags}
                            </AccordionTrigger>
                            <AccordionContent className="p-4">
                                <RadioGroup
                                    value={filters.tagSlug || "all"}
                                    onValueChange={handleTagChange}
                                    className="gap-4 px-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="all" id="tag-all" />
                                        <Label htmlFor="tag-all" className="font-normal cursor-pointer">
                                            {t.search.allTags}
                                        </Label>
                                    </div>

                                    {tags.map((tag) => (
                                        <div key={tag.id} className="flex items-center space-x-2 ">
                                            <RadioGroupItem
                                                value={tag.slug}
                                                id={`tag-${tag.id}`}
                                            />
                                            <Label
                                                htmlFor={`tag-${tag.id}`}
                                                className="font-normal cursor-pointer"
                                            >
                                                {tag.name}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </AccordionContent>
                        </AccordionItem>
                    )}

                    {/* Promotion */}
                    {promotions.length > 0 && (
                        <AccordionItem value="promotion" className="border-0">
                            <AccordionTrigger className="font-semibold pt-3 pb-2 px-4 cursor-pointer hover:no-underline">
                                {t.search.promotion}
                            </AccordionTrigger>
                            <AccordionContent className="p-4">
                                <RadioGroup
                                    value={filters.promotionId || "all"}
                                    onValueChange={handlePromotionChange}
                                    className="gap-4 px-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="all" id="tag-all" />
                                        <Label htmlFor="tag-all" className="font-normal cursor-pointer">
                                            {t.search.allPromotions}
                                        </Label>
                                    </div>

                                    {promotions.map((promotion) => (
                                        <div key={promotion.id} className="flex items-center space-x-2 ">
                                            <RadioGroupItem
                                                value={promotion.id}
                                                id={`promotion-${promotion.id}`}
                                            />
                                            <Label
                                                htmlFor={`promotion-${promotion.id}`}
                                                className="font-normal cursor-pointer"
                                            >
                                                {promotion.name} (-{Math.round(promotion.discount * 100)}%)
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </AccordionContent>
                        </AccordionItem>
                    )}

                    {/* Price Range */}
                    <AccordionItem value="price" className="border-0">
                        <AccordionTrigger className="font-semibold pt-3 pb-2 px-4 cursor-pointer hover:no-underline">
                            {t.search.priceRange}
                        </AccordionTrigger>
                        <AccordionContent className="p-4 space-y-4">
                            <PriceRangeSlider
                                min={priceConfig.MIN}
                                max={priceConfig.MAX}
                                step={priceConfig.STEP}
                                value={[priceRange[0], priceRange[1]]}
                                onValueChange={handlePriceRangeChange}
                                onValueCommit={handlePriceRangeCommit}
                                className="px-4 py-2"
                            />

                            <div className="flex justify-between text-xs px-2">
                                <span>{formatCurrency(priceRange[0], currency)}</span>
                                <span>{formatCurrency(priceRange[1], currency)}</span>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Available Only */}
                    <div className="flex items-center justify-between p-4">
                        <Label className=" font-semibold cursor-pointer hover:no-underline">
                            {t.search.availableOnly}
                        </Label>
                        <Switch
                            checked={filters.availableOnly}
                            onCheckedChange={handleAvailableOnlyChange}
                            className="bg-border"
                        />
                    </div>

                    {/* Mobile Clear */}
                    {onClose && hasActiveFilters && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearFilters}
                            className="w-full mt-4"
                        >
                            {t.search.clearFilters}
                        </Button>
                    )}
                </Accordion>
            )}
        </div>
    );
}
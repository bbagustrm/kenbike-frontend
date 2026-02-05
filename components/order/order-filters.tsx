// components/order/order-filters.tsx
"use client";

import { useState, useEffect } from "react";
import { OrderStatus } from "@/types/order";
import { useTranslation } from "@/hooks/use-translation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search, X, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

interface OrderFiltersProps {
    onSearch: (query: string) => void;
    onStatusFilter: (status: OrderStatus | "ALL") => void;
    onSortChange: (sort: "created_at" | "total") => void;
    searchQuery?: string;
    selectedStatus?: OrderStatus | "ALL";
    sortBy?: "created_at" | "total";
    isLoading?: boolean;
}

const SEARCH_DEBOUNCE_DELAY = 500;
const MIN_SEARCH_CHARS = 2;

export function OrderFilters({
                                 onSearch,
                                 onStatusFilter,
                                 onSortChange,
                                 searchQuery = "",
                                 selectedStatus = "ALL",
                                 sortBy = "created_at",
                                 isLoading = false,
                             }: OrderFiltersProps) {
    const { t, locale } = useTranslation();
    const [localSearch, setLocalSearch] = useState(searchQuery);

    const debouncedSearch = useDebounce(localSearch, SEARCH_DEBOUNCE_DELAY);

    const isSearchPending =
        localSearch !== debouncedSearch && localSearch.length >= MIN_SEARCH_CHARS;

    // Status options with translations
    const STATUS_OPTIONS: Array<{ value: OrderStatus | "ALL"; label: string }> = [
        { value: "ALL", label: t.orders?.filter?.all || "All Orders" },
        { value: "PENDING", label: t.orders?.filter?.pending || "Pending Payment" },
        { value: "PAID", label: t.orders?.filter?.paid || "Paid" },
        { value: "PROCESSING", label: t.orders?.filter?.processing || "Processing" },
        { value: "SHIPPED", label: t.orders?.filter?.shipped || "Shipped" },
        { value: "DELIVERED", label: t.orders?.filter?.delivered || "Delivered" },
        { value: "COMPLETED", label: t.orders?.filter?.completed || "Completed" },
        { value: "CANCELLED", label: t.orders?.filter?.cancelled || "Cancelled" },
        { value: "FAILED", label: t.orders?.filter?.failed || "Failed" },
    ];

    // Sort options with translations
    const SORT_OPTIONS = [
        { value: "created_at", label: t.orders?.sort?.newestFirst || "Newest First" },
        { value: "total", label: t.orders?.sort?.highestAmount || "Highest Amount" },
    ];

    useEffect(() => {
        if (debouncedSearch === "" || debouncedSearch.length >= MIN_SEARCH_CHARS) {
            onSearch(debouncedSearch);
        }
    }, [debouncedSearch, onSearch]);

    useEffect(() => {
        if (searchQuery !== localSearch) {
            setLocalSearch(searchQuery);
        }
    }, [searchQuery]);

    const handleSearchChange = (value: string) => {
        setLocalSearch(value);
    };

    const handleClearSearch = () => {
        setLocalSearch("");
        onSearch("");
    };

    const searchPlaceholder = (t.orders?.filter?.searchPlaceholder || "Search by order number (min {min} chars)...")
        .replace("{min}", MIN_SEARCH_CHARS.toString());

    const typeMinCharsText = (t.orders?.filter?.typeMinChars || "Type at least {min} characters to search")
        .replace("{min}", MIN_SEARCH_CHARS.toString());

    return (
        <div className="space-y-4">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder={searchPlaceholder}
                    value={localSearch}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-9 pr-9"
                />
                {(isSearchPending || isLoading) && localSearch && (
                    <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
                {localSearch && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                        onClick={handleClearSearch}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {localSearch.length > 0 && localSearch.length < MIN_SEARCH_CHARS && (
                <p className="text-xs text-muted-foreground">
                    {typeMinCharsText}
                </p>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <Select
                    value={selectedStatus}
                    onValueChange={(value) =>
                        onStatusFilter(value as OrderStatus | "ALL")
                    }
                >
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder={t.common?.filter || "Filter by status"} />
                    </SelectTrigger>
                    <SelectContent>
                        {STATUS_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={sortBy}
                    onValueChange={(value) =>
                        onSortChange(value as "created_at" | "total")
                    }
                >
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder={t.common?.sort || "Sort by"} />
                    </SelectTrigger>
                    <SelectContent>
                        {SORT_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
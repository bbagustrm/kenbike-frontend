// components/admin/order/order-filters-admin.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { OrderStatus } from "@/types/order";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Search, X, Calendar as CalendarIcon, Filter, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useDebounce, useDebouncedCallback } from "@/hooks/use-debounce";

interface OrderFiltersAdminProps {
    onSearch: (query: string) => void;
    onStatusFilter: (status: OrderStatus | "ALL") => void;
    onShippingTypeFilter: (type: "DOMESTIC" | "INTERNATIONAL" | "ALL") => void;
    onDateRangeFilter: (from?: Date, to?: Date) => void;
    onSortChange: (sort: "created_at" | "total") => void; // ✅ snake_case
    searchQuery?: string;
    selectedStatus?: OrderStatus | "ALL";
    selectedShippingType?: "DOMESTIC" | "INTERNATIONAL" | "ALL";
    sortBy?: "created_at" | "total"; // ✅ snake_case
    isLoading?: boolean;
}

const STATUS_OPTIONS: Array<{ value: OrderStatus | "ALL"; label: string }> = [
    { value: "ALL", label: "All Status" },
    { value: "PENDING", label: "Pending Payment" },
    { value: "PAID", label: "Paid" },
    { value: "PROCESSING", label: "Processing" },
    { value: "SHIPPED", label: "Shipped" },
    { value: "DELIVERED", label: "Delivered" },
    { value: "COMPLETED", label: "Completed" },
    { value: "CANCELLED", label: "Cancelled" },
    { value: "FAILED", label: "Failed" },
];

const SHIPPING_TYPE_OPTIONS = [
    { value: "ALL", label: "All Types" },
    { value: "DOMESTIC", label: "Domestic" },
    { value: "INTERNATIONAL", label: "International" },
];

// ✅ snake_case values for API compatibility
const SORT_OPTIONS = [
    { value: "created_at", label: "Newest First" },
    { value: "total", label: "Highest Amount" },
];

// Debounce delays
const SEARCH_DEBOUNCE_DELAY = 500;
const DATE_DEBOUNCE_DELAY = 300;
const MIN_SEARCH_CHARS = 2;

export function OrderFiltersAdmin({
                                      onSearch,
                                      onStatusFilter,
                                      onShippingTypeFilter,
                                      onDateRangeFilter,
                                      onSortChange,
                                      searchQuery = "",
                                      selectedStatus = "ALL",
                                      selectedShippingType = "ALL",
                                      sortBy = "created_at", // ✅ snake_case default
                                      isLoading = false,
                                  }: OrderFiltersAdminProps) {
    const [localSearch, setLocalSearch] = useState(searchQuery);
    const [dateFrom, setDateFrom] = useState<Date>();
    const [dateTo, setDateTo] = useState<Date>();
    const [showFilters, setShowFilters] = useState(false);

    // Debounce search input
    const debouncedSearch = useDebounce(localSearch, SEARCH_DEBOUNCE_DELAY);

    // Track if we're waiting for debounce
    const isSearchPending =
        localSearch !== debouncedSearch && localSearch.length >= MIN_SEARCH_CHARS;

    // Debounced date range filter
    const [debouncedDateFilter, , isDatePending] = useDebouncedCallback(
        (from?: Date, to?: Date) => {
            onDateRangeFilter(from, to);
        },
        DATE_DEBOUNCE_DELAY
    );

    // Trigger search when debounced value changes
    useEffect(() => {
        if (debouncedSearch === "" || debouncedSearch.length >= MIN_SEARCH_CHARS) {
            onSearch(debouncedSearch);
        }
    }, [debouncedSearch, onSearch]);

    // Sync external searchQuery prop with local state
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

    // Handle date changes with debounce
    const handleDateFromChange = useCallback(
        (date: Date | undefined) => {
            setDateFrom(date);
            // Auto-apply with debounce when date changes
            debouncedDateFilter(date, dateTo);
        },
        [dateTo, debouncedDateFilter]
    );

    const handleDateToChange = useCallback(
        (date: Date | undefined) => {
            setDateTo(date);
            // Auto-apply with debounce when date changes
            debouncedDateFilter(dateFrom, date);
        },
        [dateFrom, debouncedDateFilter]
    );

    const handleDateRangeClear = () => {
        setDateFrom(undefined);
        setDateTo(undefined);
        onDateRangeFilter(undefined, undefined);
    };

    // Quick date presets
    const applyDatePreset = (preset: "today" | "week" | "month") => {
        const now = new Date();
        let from: Date;

        switch (preset) {
            case "today":
                from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case "week":
                from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case "month":
                from = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
        }

        setDateFrom(from);
        setDateTo(now);
        onDateRangeFilter(from, now);
    };

    return (
        <div className="space-y-4">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder={`Search by order number, customer name, email (min ${MIN_SEARCH_CHARS} chars)...`}
                    value={localSearch}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-9 pr-9"
                />
                {/* Show loading indicator while debouncing or fetching */}
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

            {/* Show hint for minimum characters */}
            {localSearch.length > 0 && localSearch.length < MIN_SEARCH_CHARS && (
                <p className="text-xs text-muted-foreground">
                    Type at least {MIN_SEARCH_CHARS} characters to search
                </p>
            )}

            {/* Toggle Advanced Filters */}
            <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full sm:w-auto"
            >
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? "Hide" : "Show"} Advanced Filters
            </Button>

            {/* Advanced Filters */}
            {showFilters && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/50">
                    {/* Status Filter */}
                    <div className="space-y-2">
                        <Label>Status</Label>
                        <Select
                            value={selectedStatus}
                            onValueChange={(value) =>
                                onStatusFilter(value as OrderStatus | "ALL")
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {STATUS_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Shipping Type Filter */}
                    <div className="space-y-2">
                        <Label>Shipping Type</Label>
                        <Select
                            value={selectedShippingType}
                            onValueChange={(value) =>
                                onShippingTypeFilter(
                                    value as "DOMESTIC" | "INTERNATIONAL" | "ALL"
                                )
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {SHIPPING_TYPE_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date From */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            Date From
                            {isDatePending && (
                                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                            )}
                        </Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !dateFrom && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={dateFrom}
                                    onSelect={handleDateFromChange}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Date To */}
                    <div className="space-y-2">
                        <Label>Date To</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !dateTo && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateTo ? format(dateTo, "PPP") : "Pick a date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={dateTo}
                                    onSelect={handleDateToChange}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Sort By */}
                    <div className="space-y-2">
                        <Label>Sort By</Label>
                        <Select
                            value={sortBy}
                            onValueChange={(value) =>
                                onSortChange(value as "created_at" | "total") // ✅ snake_case
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
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

                    {/* Quick Date Presets */}
                    <div className="space-y-2">
                        <Label>Quick Filters</Label>
                        <div className="flex gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => applyDatePreset("today")}
                                className="flex-1 text-xs"
                            >
                                Today
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => applyDatePreset("week")}
                                className="flex-1 text-xs"
                            >
                                7 Days
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => applyDatePreset("month")}
                                className="flex-1 text-xs"
                            >
                                Month
                            </Button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-end gap-2">
                        <Button
                            variant="outline"
                            onClick={handleDateRangeClear}
                            className="flex-1"
                        >
                            Clear Dates
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
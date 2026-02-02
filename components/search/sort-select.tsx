"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/hooks/use-translation";

interface SortSelectProps {
    value: string;
    onChange: (value: string) => void;
}

export function SortSelect({ value, onChange }: SortSelectProps) {
    const { t } = useTranslation();

    const sortOptions = [
        { value: "totalSold-desc", label: t.search.sortOptions.mostSold },
        { value: "idPrice-asc", label: t.search.sortOptions.priceLowHigh },
        { value: "idPrice-desc", label: t.search.sortOptions.priceHighLow },
        { value: "totalView-desc", label: t.search.sortOptions.mostViewed },
        { value: "createdAt-desc", label: t.search.sortOptions.newest },
        { value: "createdAt-asc", label: t.search.sortOptions.oldest },
    ];

    return (
        <Select value={value} onValueChange={onChange} >
            <SelectTrigger className="space-x-2 cursor-pointer border border-border bg-transparent">
                Sorted by:
                <SelectValue placeholder={t.search.sortBy} />
            </SelectTrigger>
            <SelectContent className="md:w-[200px]">
                {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
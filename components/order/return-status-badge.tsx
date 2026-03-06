// components/order/return-status-badge.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { ReturnStatus, RETURN_STATUS_LABELS } from "@/types/return";
import { useTranslation } from "@/hooks/use-translation";

interface ReturnStatusBadgeProps {
    status: ReturnStatus;
    size?: "default" | "sm";
}

const STATUS_STYLES: Record<ReturnStatus, string> = {
    REQUESTED:     "bg-yellow-100 text-yellow-800 border-yellow-200",
    APPROVED:      "bg-blue-100 text-blue-800 border-blue-200",
    REJECTED:      "bg-red-100 text-red-800 border-red-200",
    ITEM_SENT:     "bg-purple-100 text-purple-800 border-purple-200",
    ITEM_RECEIVED: "bg-indigo-100 text-indigo-800 border-indigo-200",
    REFUNDED:      "bg-green-100 text-green-800 border-green-200",
    CANCELLED:     "bg-gray-100 text-gray-600 border-gray-200",
};

export function ReturnStatusBadge({ status, size = "default" }: ReturnStatusBadgeProps) {
    const { locale } = useTranslation();
    const label = RETURN_STATUS_LABELS[status]?.[locale === "id" ? "id" : "en"] || status;

    return (
        <Badge
            variant="outline"
            className={`${STATUS_STYLES[status]} ${size === "sm" ? "text-xs px-2 py-0" : ""}`}
        >
            {label}
        </Badge>
    );
}
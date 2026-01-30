// components/ui/empty-state.tsx
import { PackageOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

interface EmptyStateProps {
    title?: string;
    description?: string;
    icon?: React.ReactNode;
    className?: string;
    children?: React.ReactNode;
}

export function EmptyState({
    title = "No items found",
    description = "Try adjusting your filters or search query",
    icon,
    className,
    children,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center py-12 text-center",
                className
            )}
        >
            <div className="mb-4 rounded-full bg-muted p-4">
                {icon || <PackageOpen className="h-10 w-10 text-muted-foreground" />}
            </div>
            <h3 className="mb-2 text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-md">{description}</p>
            {children && <div className="mt-4">{children}</div>} {/* ✅ Render children */}
        </div>
    );
}
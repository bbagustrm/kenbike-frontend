"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BulkActionBarProps {
    selectedCount: number;
    onDelete?: () => void;
    onRestore?: () => void;
    onClearSelection: () => void;
    isDeleted?: boolean;
    className?: string;
}

export function BulkActionBar({
    selectedCount,
    onDelete,
    onRestore,
    onClearSelection,
    isDeleted = false,
    className,
}: BulkActionBarProps) {
    if (selectedCount === 0) return null;

    return (
        <div
            className={cn(
                "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
                "bg-primary text-primary-foreground rounded-lg shadow-lg",
                "flex items-center gap-4 px-6 py-3",
                "animate-in slide-in-from-bottom-5",
                className
            )}
        >
      <span className="text-sm font-medium">
        {selectedCount} {selectedCount === 1 ? "item" : "items"} selected
      </span>

            <div className="flex items-center gap-2">
                {isDeleted ? (
                    onRestore && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={onRestore}
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Restore
                        </Button>
                    )
                ) : (
                    onDelete && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={onDelete}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    )
                )}

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearSelection}
                    className="text-primary-foreground hover:text-primary-foreground/80 hover:bg-primary-foreground/10"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
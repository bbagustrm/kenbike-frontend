// components/discussion/like-button.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface LikeButtonProps {
    isLiked: boolean;
    likesCount: number;
    onToggle: () => Promise<void>;
    disabled?: boolean;
    size?: "sm" | "default";
}

export function LikeButton({
                               isLiked,
                               likesCount,
                               onToggle,
                               disabled = false,
                               size = "sm",
                           }: LikeButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [optimisticLiked, setOptimisticLiked] = useState(isLiked);
    const [optimisticCount, setOptimisticCount] = useState(likesCount);

    const handleClick = async () => {
        if (isLoading || disabled) return;

        // Optimistic update
        setOptimisticLiked(!optimisticLiked);
        setOptimisticCount(optimisticLiked ? optimisticCount - 1 : optimisticCount + 1);

        setIsLoading(true);
        try {
            await onToggle();
        } catch (error) {
            // Revert on error
            setOptimisticLiked(isLiked);
            setOptimisticCount(likesCount);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant={optimisticLiked ? "default" : "ghost"}
            size={size}
            onClick={handleClick}
            disabled={disabled || isLoading}
            className={cn(
                "gap-1.5 transition-all",
                optimisticLiked && "bg-primary/10 text-primary hover:bg-primary/20"
            )}
        >
            {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <motion.div
                    key={optimisticLiked ? "liked" : "unliked"}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                >
                    <ThumbsUp
                        className={cn(
                            "w-4 h-4",
                            optimisticLiked && "fill-current"
                        )}
                    />
                </motion.div>
            )}
            <AnimatePresence mode="wait">
                <motion.span
                    key={optimisticCount}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="min-w-[1rem] text-center"
                >
                    {optimisticCount}
                </motion.span>
            </AnimatePresence>
        </Button>
    );
}
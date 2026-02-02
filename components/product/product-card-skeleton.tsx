"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="bg-accent group overflow-hidden border-2 transition-all duration-300">
                {/* Image Skeleton */}
                <div className="relative aspect-square bg-muted overflow-hidden">
                    <Skeleton className="absolute inset-0" />
                    {/* Shimmer Effect */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                        animate={{
                            x: ["-100%", "100%"],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                    />
                </div>

                {/* Content Skeleton */}
                <div className="p-3 space-y-3">
                    {/* Category Badge */}
                    <Skeleton className="h-5 w-20 rounded-full" />

                    {/* Product Name */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-4 w-16" />
                    </div>

                    {/* Rating & Sales */}
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}

// Grid of Skeletons
interface ProductGridSkeletonProps {
    count?: number;
    columns?: number;
}

export function ProductGridSkeleton({ count = 12, columns = 5 }: ProductGridSkeletonProps) {
    const gridCols = {
        2: "grid-cols-2",
        3: "grid-cols-2 sm:grid-cols-3",
        4: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
    };

    return (
        <div className={`grid ${gridCols[columns as keyof typeof gridCols] || gridCols[4]} gap-3 md:gap-4`}>
            {Array.from({ length: count }).map((_, index) => (
                <ProductCardSkeleton key={index} />
            ))}
        </div>
    );
}
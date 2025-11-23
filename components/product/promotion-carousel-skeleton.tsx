"use client";

import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export function PromotionCarouselSkeleton() {
    return (
        <div className="relative w-full bg-muted">
            {/* Main Banner Skeleton */}
            <div className="relative aspect-[21/9] md:aspect-[21/6]">
                <Skeleton className="absolute inset-0" />

                {/* Shimmer Effect */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{
                        x: ["-100%", "100%"],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />

                {/* Content Overlay Skeleton */}
                <div className="absolute inset-0 flex items-center">
                    <div className="container mx-auto px-4 md:px-8">
                        <div className="max-w-xl space-y-4">
                            <Skeleton className="h-8 w-3/4 md:h-12" />
                            <Skeleton className="h-6 w-full md:h-8" />
                            <Skeleton className="h-4 w-2/3 md:h-6" />
                            <Skeleton className="h-12 w-32 rounded-full mt-6" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Dots Skeleton */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-2 w-8 rounded-full" />
                ))}
            </div>
        </div>
    );
}
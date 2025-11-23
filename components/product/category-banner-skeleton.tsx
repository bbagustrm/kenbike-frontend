"use client";

import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export function CategoryBannerSkeleton() {
    return (
        <div className="grid grid-cols-2">
            {[1, 2, 3, 4].map((index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative aspect-[4/3] md:aspect-[16/9] bg-muted overflow-hidden"
                >
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
                            delay: index * 0.2,
                        }}
                    />

                    {/* Content Skeleton */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 space-y-2">
                        <Skeleton className="h-6 w-32 md:h-8 md:w-48" />
                        <Skeleton className="h-8 w-24 md:h-10 md:w-32 rounded-md" />
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
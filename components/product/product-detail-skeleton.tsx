"use client";

import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function ProductDetailSkeleton() {
    return (
        <div className="container mx-auto px-4 py-6">
            {/* Breadcrumb Skeleton */}
            <div className="flex items-center gap-2 mb-6">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-8 gap-8 md:gap-12 lg:gap-16">
                {/* LEFT COLUMN - Images */}
                <div className="lg:col-span-5 space-y-8">
                    {/* Image Gallery */}
                    <div className="flex gap-4">
                        {/* Thumbnails */}
                        <div className="flex flex-col gap-2">
                            {[1, 2, 3, 4].map((i) => (
                                <Skeleton key={i} className="w-20 h-20 rounded-sm" />
                            ))}
                        </div>

                        {/* Main Image */}
                        <div className="flex-1 relative aspect-square rounded-sm max-w-[500px] mx-auto">
                            <Skeleton className="absolute inset-0 rounded-sm" />
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                                animate={{
                                    x: ["-100%", "100%"],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "linear",
                                }}
                            />
                        </div>
                    </div>

                    {/* Promotion Card Skeleton */}
                    <Card>
                        <CardContent className="p-6 space-y-2">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-32" />
                        </CardContent>
                    </Card>

                    {/* Description Accordion Skeleton */}
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-full rounded-lg" />
                        <Skeleton className="h-12 w-full rounded-lg" />
                    </div>
                </div>

                {/* RIGHT COLUMN - Product Info */}
                <div className="lg:col-span-3">
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            {/* Tags */}
                            <div className="flex gap-2">
                                <Skeleton className="h-6 w-20 rounded-full" />
                                <Skeleton className="h-6 w-24 rounded-full" />
                            </div>

                            {/* Product Name */}
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-8 w-3/4" />

                            {/* Price */}
                            <div className="space-y-2">
                                <Skeleton className="h-10 w-40" />
                                <Skeleton className="h-6 w-32" />
                            </div>

                            {/* Stock */}
                            <Skeleton className="h-6 w-24 rounded-full" />

                            {/* Variants */}
                            <div className="space-y-3">
                                <Skeleton className="h-5 w-32" />
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4].map((i) => (
                                        <Skeleton key={i} className="h-8 w-8 rounded-full" />
                                    ))}
                                </div>
                            </div>

                            {/* Quantity */}
                            <div className="flex justify-between items-center">
                                <Skeleton className="h-5 w-20" />
                                <Skeleton className="h-10 w-32 rounded-lg" />
                            </div>

                            {/* Subtotal & Button */}
                            <div className="border-t pt-4 space-y-4">
                                <div className="flex justify-between">
                                    <Skeleton className="h-6 w-24" />
                                    <Skeleton className="h-8 w-32" />
                                </div>
                                <Skeleton className="h-12 w-full rounded-lg" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Related Products Skeleton */}
            <div className="mt-12">
                <Skeleton className="h-8 w-48 mb-6" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="space-y-3">
                            <Skeleton className="aspect-square rounded-lg" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-6 w-24" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
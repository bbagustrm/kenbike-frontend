"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Category } from "@/types/category";
import { cn } from "@/lib/utils";

interface CategoryCarouselProps {
    categories: Category[];
    className?: string;
}

export function CategoryCarousel({ categories, className }: CategoryCarouselProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        if (!scrollContainerRef.current) return;

        const container = scrollContainerRef.current;
        const scrollAmount = container.offsetWidth * 0.7;

        container.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    };

    if (categories.length === 0) return null;

    return (
        <div className={cn("relative group", className)}>
            {/* Navigation Buttons - Desktop Only */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 hidden lg:flex opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <Button
                    variant="secondary"
                    size="icon"
                    className="shadow-lg rounded-full h-12 w-12"
                    onClick={() => scroll("left")}
                >
                    <ChevronLeft className="h-6 w-6" />
                </Button>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden lg:flex opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <Button
                    variant="secondary"
                    size="icon"
                    className="shadow-lg rounded-full h-12 w-12"
                    onClick={() => scroll("right")}
                >
                    <ChevronRight className="h-6 w-6" />
                </Button>
            </motion.div>

            {/* Scrollable Container */}
            <div
                ref={scrollContainerRef}
                className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-4 md:px-0"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {categories.map((category, index) => (
                    <motion.div
                        key={category.id}
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{
                            duration: 0.5,
                            delay: index * 0.1,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        className="flex-none w-[280px] sm:w-[320px] md:w-[380px] lg:w-[420px] snap-start"
                    >
                        <Link
                            href={`/search?category=${category.slug}`}
                            className="group/card relative block overflow-hidden rounded-lg"
                        >
                            <motion.div
                                className="relative aspect-[4/3]"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Image
                                    src={`/banner-category/img${index + 1}.webp`}
                                    alt={category.name}
                                    fill
                                    className={cn(
                                        "object-cover transition-all duration-500",
                                        "brightness-90 group-hover/card:brightness-50"
                                    )}
                                    sizes="(max-width: 640px) 280px, (max-width: 768px) 320px, (max-width: 1024px) 380px, 420px"
                                />

                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                                {/* Category Name - Animated */}
                                <motion.div
                                    className="absolute bottom-0 left-0 right-0 p-4 md:p-6"
                                    initial={{ y: 20, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <h3 className="text-white font-bold text-lg md:text-xl lg:text-2xl uppercase tracking-wide drop-shadow-lg mb-3">
                                        {category.name}
                                    </h3>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="text-xs md:text-sm"
                                    >
                                        Shop Now
                                    </Button>
                                </motion.div>
                            </motion.div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* Hide scrollbar globally */}
            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}
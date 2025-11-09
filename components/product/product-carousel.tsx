// components/product/product-carousel.tsx (with animations)
"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "./product-card";
import { ProductListItem } from "@/types/product";
import { cn } from "@/lib/utils";

interface ProductCarouselProps {
    products: ProductListItem[];
    className?: string;
}

export function ProductCarousel({ products, className }: ProductCarouselProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        if (!scrollContainerRef.current) return;

        const container = scrollContainerRef.current;
        const scrollAmount = container.offsetWidth * 0.8;

        container.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    };

    if (products.length === 0) return null;

    return (
        <div className={cn("relative group", className)}>
            {/* Navigation Buttons */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden group-hover:flex opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <Button
                    variant="outline"
                    size="icon"
                    className="shadow-lg"
                    onClick={() => scroll("left")}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden group-hover:flex opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <Button
                    variant="outline"
                    size="icon"
                    className="shadow-lg"
                    onClick={() => scroll("right")}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </motion.div>

            {/* Scrollable Container */}
            <div
                ref={scrollContainerRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {products.map((product, index) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{
                            duration: 0.5,
                            delay: index * 0.05,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        className="flex-none w-[280px] snap-start"
                    >
                        <ProductCard product={product} />
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
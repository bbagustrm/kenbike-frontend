"use client";

import { useRef } from "react";
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
            <Button
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden group-hover:flex opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                onClick={() => scroll("left")}
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden group-hover:flex opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                onClick={() => scroll("right")}
            >
                <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Scrollable Container */}
            <div
                ref={scrollContainerRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {products.map((product) => (
                    <div
                        key={product.id}
                        className="flex-none w-[280px] snap-start"
                    >
                        <ProductCard product={product} />
                    </div>
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
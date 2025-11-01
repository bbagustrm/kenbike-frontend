"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PROMOTION_IMAGES = [
    { id: 1, src: "/promo-1.png", alt: "Promotion 1" },
    { id: 2, src: "/promo-2.png", alt: "Promotion 2" },
];

export function PromotionCarousel() {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % PROMOTION_IMAGES.length);
    }, []);

    const prevSlide = () => {
        setCurrentIndex(
            (prev) => (prev - 1 + PROMOTION_IMAGES.length) % PROMOTION_IMAGES.length
        );
    };

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    const handleClick = () => {
        router.push("/search?hasPromotion=true");
    };

    // Auto-play
    useEffect(() => {
        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, [nextSlide]);

    return (
        <div className="relative w-full rounded-lg overflow-hidden bg-muted group">
            {/* Main Image Container */}
            <div className="relative aspect-[21/9] md:aspect-[21/6] cursor-pointer" onClick={handleClick}>
                {PROMOTION_IMAGES.map((image, index) => (
                    <div
                        key={image.id}
                        className={cn(
                            "absolute inset-0 transition-opacity duration-500",
                            index === currentIndex ? "opacity-100" : "opacity-0"
                        )}
                    >
                        <Image
                            src={image.src}
                            alt={image.alt}
                            fill
                            className="object-cover"
                            priority={index === 0}
                        />
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            <Button
                variant="outline"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm"
                onClick={(e) => {
                    e.stopPropagation();
                    prevSlide();
                }}
            >
                <ChevronLeft className="h-5 w-5" />
            </Button>

            <Button
                variant="outline"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm"
                onClick={(e) => {
                    e.stopPropagation();
                    nextSlide();
                }}
            >
                <ChevronRight className="h-5 w-5" />
            </Button>

            {/* Dots Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {PROMOTION_IMAGES.map((_, index) => (
                    <button
                        key={index}
                        onClick={(e) => {
                            e.stopPropagation();
                            goToSlide(index);
                        }}
                        className={cn(
                            "h-2 rounded-full transition-all",
                            index === currentIndex
                                ? "w-8 bg-white"
                                : "w-2 bg-white/50 hover:bg-white/75"
                        )}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
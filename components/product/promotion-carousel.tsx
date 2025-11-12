// components/product/promotion-carousel.tsx (with animations)
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PROMOTION_IMAGES = [
    { id: 1, src: "/promo-1.webp", alt: "Promotion 1" },
    { id: 2, src: "/promo-2.webp", alt: "Promotion 2" },
];

const slideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 1000 : -1000,
        opacity: 0,
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1,
    },
    exit: (direction: number) => ({
        zIndex: 0,
        x: direction < 0 ? 1000 : -1000,
        opacity: 0,
    }),
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
};

export function PromotionCarousel() {
    const router = useRouter();
    const [[page, direction], setPage] = useState([0, 0]);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [isHovered, setIsHovered] = useState(false);

    const imageIndex = ((page % PROMOTION_IMAGES.length) + PROMOTION_IMAGES.length) % PROMOTION_IMAGES.length;

    const paginate = useCallback((newDirection: number) => {
        setPage([page + newDirection, newDirection]);
    }, [page]);

    const nextSlide = useCallback(() => {
        paginate(1);
    }, [paginate]);

    const prevSlide = () => {
        paginate(-1);
    };

    const goToSlide = (index: number) => {
        const newDirection = index > imageIndex ? 1 : -1;
        setPage([index, newDirection]);
    };

    const handleClick = () => {
        router.push("/search?hasPromotion=true");
    };

    // Auto-play
    useEffect(() => {
        if (!isAutoPlaying) return;

        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, [nextSlide, isAutoPlaying]);

    return (
        <div
            className="relative w-full overflow-hidden bg-muted group"
            onMouseEnter={() => {
                setIsAutoPlaying(false);
                setIsHovered(true);
            }}
            onMouseLeave={() => {
                setIsAutoPlaying(true);
                setIsHovered(false);
            }}
        >
            {/* Main Image Container */}
            <div className="relative aspect-[21/9] md:aspect-[21/8] lg:aspect-[21/6] cursor-pointer">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={page}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.3 },
                        }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={1}
                        onDragEnd={(e, { offset, velocity }) => {
                            const swipe = swipePower(offset.x, velocity.x);

                            if (swipe < -swipeConfidenceThreshold) {
                                paginate(1);
                            } else if (swipe > swipeConfidenceThreshold) {
                                paginate(-1);
                            }
                        }}
                        onClick={handleClick}
                        className="absolute inset-0"
                    >
                        <Image
                            src={PROMOTION_IMAGES[imageIndex].src}
                            alt={PROMOTION_IMAGES[imageIndex].alt}
                            fill
                            className="object-cover"
                            priority={imageIndex === 0}
                        />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation Arrows - Left */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-10"
                    >
                        <Button
                            variant="secondary"
                            size="icon"
                            className="bg-white/90 hover:bg-white backdrop-blur-sm shadow-lg rounded-full h-10 w-10"
                            onClick={(e) => {
                                e.stopPropagation();
                                prevSlide();
                            }}
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Navigation Arrows - Right */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-10"
                    >
                        <Button
                            variant="secondary"
                            size="icon"
                            className="bg-white/90 hover:bg-white backdrop-blur-sm shadow-lg rounded-full h-10 w-10"
                            onClick={(e) => {
                                e.stopPropagation();
                                nextSlide();
                            }}
                        >
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Dots Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {PROMOTION_IMAGES.map((_, index) => (
                    <motion.button
                        key={index}
                        onClick={(e) => {
                            e.stopPropagation();
                            goToSlide(index);
                        }}
                        className={cn(
                            "h-2 rounded-full transition-all",
                            index === imageIndex
                                ? "w-8 bg-white shadow-md"
                                : "w-2 bg-white/60 hover:bg-white/80"
                        )}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
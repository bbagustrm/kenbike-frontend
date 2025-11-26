"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LANDSCAPE_VIDEOS = [
    { id: 1, src: "/videos/landscape.mp4", title: "@gayaberkendara" },
];

const PORTRAIT_VIDEOS = [
    { id: 1, src: "/videos/portrait-1.mp4", title: "@kenbike.id" },
    { id: 2, src: "/videos/portrait-2.mp4", title: "@evanpramana" },
    { id: 3, src: "/videos/portrait-3.mp4", title: "@brtss_alfrits" },
    { id: 4, src: "/videos/portrait-4.mp4", title: "@evanpramana" },
];

export function VideoSection() {
    const landscapeScrollRef = useRef<HTMLDivElement>(null);
    const portraitScrollRef = useRef<HTMLDivElement>(null);

    const scrollLandscape = (direction: "left" | "right") => {
        if (!landscapeScrollRef.current) return;
        const container = landscapeScrollRef.current;
        const scrollAmount = container.offsetWidth;
        container.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    };

    const scrollPortrait = (direction: "left" | "right") => {
        if (!portraitScrollRef.current) return;
        const container = portraitScrollRef.current;
        const scrollAmount = container.offsetWidth * 0.5;
        container.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    };

    return (
        <section className="bg-background py-12 md:py-16 lg:py-20">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-8 md:mb-12"
                >
                    <h2 className="font-display text-2xl md:text-3xl lg:text-4xl mb-3">
                        Experience the Ride
                    </h2>
                    <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
                        Watch our riders explore diverse terrains with premium Kenbike components
                    </p>
                </motion.div>

                {/* Video Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
                    {/* Landscape Videos Carousel - Left side */}
                    <div className="lg:col-span-7 relative">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="relative group"
                        >
                            {/* Navigation Buttons */}
                            <Button
                                variant="secondary"
                                size="icon"
                                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg rounded-full h-10 w-10"
                                onClick={() => scrollLandscape("left")}
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>

                            <Button
                                variant="secondary"
                                size="icon"
                                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg rounded-full h-10 w-10"
                                onClick={() => scrollLandscape("right")}
                            >
                                <ChevronRight className="h-5 w-5" />
                            </Button>

                            {/* Scrollable Container */}
                            <div
                                ref={landscapeScrollRef}
                                className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
                                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                            >
                                {LANDSCAPE_VIDEOS.map((video, index) => (
                                    <div
                                        key={video.id}
                                        className="flex-none w-full snap-start relative overflow-hidden rounded-lg bg-muted group/video"
                                    >
                                        <div className="relative aspect-video">
                                            <video
                                                autoPlay
                                                loop
                                                muted
                                                playsInline
                                                className={cn(
                                                    "w-full h-full object-cover",
                                                    "transition-transform duration-500",
                                                    "group-hover/video:scale-105"
                                                )}
                                            >
                                                <source src={video.src} type="video/mp4" />
                                                Your browser does not support the video tag.
                                            </video>

                                            {/* Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/video:opacity-100 transition-opacity duration-300" />

                                            {/* Title Overlay */}
                                            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                                                <h3 className="text-white font-bold text-base md:text-lg drop-shadow-lg">
                                                    {video.title}
                                                </h3>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Portrait Videos Carousel - Right side */}
                    <div className="lg:col-span-5 relative">
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="relative group"
                        >
                            {/* Navigation Buttons */}
                            <Button
                                variant="secondary"
                                size="icon"
                                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg rounded-full h-10 w-10"
                                onClick={() => scrollPortrait("left")}
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>

                            <Button
                                variant="secondary"
                                size="icon"
                                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg rounded-full h-10 w-10"
                                onClick={() => scrollPortrait("right")}
                            >
                                <ChevronRight className="h-5 w-5" />
                            </Button>

                            {/* Scrollable Container */}
                            <div
                                ref={portraitScrollRef}
                                className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
                                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                            >
                                {PORTRAIT_VIDEOS.map((video, index) => (
                                    <div
                                        key={video.id}
                                        className="flex-none w-[calc(50%-6px)] snap-start relative overflow-hidden rounded-lg bg-muted group/video"
                                    >
                                        <div className="relative aspect-[9/16]">
                                            <video
                                                autoPlay
                                                loop
                                                muted
                                                playsInline
                                                className={cn(
                                                    "w-full h-full object-cover",
                                                    "transition-transform duration-500",
                                                    "group-hover/video:scale-105"
                                                )}
                                            >
                                                <source src={video.src} type="video/mp4" />
                                                Your browser does not support the video tag.
                                            </video>

                                            {/* Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/video:opacity-100 transition-opacity duration-300" />

                                            {/* Title Overlay */}
                                            <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                                                <h3 className="text-white font-bold text-xs md:text-sm drop-shadow-lg">
                                                    {video.title}
                                                </h3>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Hide scrollbar globally */}
            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </section>
    );
}
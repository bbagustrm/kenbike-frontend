"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";

const images = [
    { src: "/image1.webp", alt: "KEN BIKE Product 1" },
    { src: "/image2.webp", alt: "KEN BIKE Product 2" },
    { src: "/image3.webp", alt: "KEN BIKE Product 3" },
];

export function AnimatedImageSection() {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (!isLoaded) return;

        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }, 5000); // Change image every 5 seconds

        return () => clearInterval(interval);
    }, [isLoaded]);

    return (
        <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-primary via-accent to-primary">
            {/* Animated Image Carousel */}
            <div className="absolute inset-0">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentImageIndex}
                        className="absolute inset-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, scale: 1.05 }}
                        exit={{ opacity: 0 }}
                        transition={{
                            opacity: { duration: 1.5 },
                            scale: { duration: 10, ease: "easeOut" },
                        }}
                    >
                        <Image
                            src={images[currentImageIndex].src}
                            alt={images[currentImageIndex].alt}
                            fill
                            className="object-cover"
                            priority={currentImageIndex === 0}
                            quality={90}
                        />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Brightness Overlay (50% darker) */}
            <div className="absolute inset-0 bg-black/50" />

            {/* Gradient Overlay */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/70 via-primary/40 to-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
            />

            {/* Content Overlay */}
            <div className="relative z-10 flex h-full flex-col justify-center p-8 lg:p-12 text-white">
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="mb-6"
                >
                    <div className="relative w-64 h-14 mb-4">
                        <Image
                            src="/logo-white.webp"
                            alt="KEN BIKE Logo"
                            fill
                            className="object-contain object-left"
                            priority
                        />
                    </div>
                </motion.div>

                {/* Image Indicators */}
                <motion.div
                    className="flex space-x-3 mb-16"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className="group focus:outline-none"
                            aria-label={`Go to image ${index + 1}`}
                        >
                            <div
                                className={`h-1 rounded-full transition-all duration-500 ${
                                    index === currentImageIndex
                                        ? "w-16 bg-secondary shadow-lg shadow-secondary/50"
                                        : "w-8 bg-white/30 group-hover:bg-white/60 group-hover:w-12"
                                }`}
                            />
                        </button>
                    ))}
                </motion.div>

                <div className="flex flex-row gap-16">
                    {/* Animated Stats - Marketplace Ratings */}
                    <motion.div
                        className="space-y-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                    >
                        {/* Shopee */}
                        <motion.div
                            className="flex items-start space-x-4"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 }}
                        >
                            <div>
                                <p className="text-xs lg:text-sm text-white/60 uppercase tracking-wider mb-1 font-semibold">
                                    Tokopedia Store
                                </p>
                                <div className="flex items-baseline space-x-2">
                                    <p className="text-2xl lg:text-3xl font-bold text-yellow-300">5.0★</p>
                                    <p className="text-sm lg:text-base text-white/80">(3.125K reviews)</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Tokopedia */}
                        <motion.div
                            className="flex items-start space-x-4"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.9 }}
                        >
                            <div>
                                <p className="text-xs lg:text-sm text-white/60 uppercase tracking-wider mb-1 font-semibold">
                                    Shopee Store
                                </p>
                                <div className="flex items-baseline space-x-2">
                                    <p className="text-2xl lg:text-3xl font-bold text-yellow-300">4.9★</p>
                                    <p className="text-sm lg:text-base text-white/80">(1.6K reviews)</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Export */}
                    <motion.div
                        className="flex items-start space-x-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.0 }}
                    >
                        <div>
                            <p className="text-xs lg:text-sm text-white/60 uppercase tracking-wider mb-1 font-semibold">
                                Global Export
                            </p>
                            <div className="space-y-1">
                                <p className="text-2xl lg:text-3xl font-bold text-white">300+ <span className="text-sm lg:text-base text-white/80 font-normal">Order</span></p>
                                <p className="text-xs lg:text-sm text-white/80 leading-relaxed">
                                    🇫🇷 France • 🇨🇦 Canada • 🇹🇭 Thailand
                                    <br />
                                    🇦🇺 Australia • 🇯🇵 Japan • And more
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
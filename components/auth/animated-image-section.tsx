"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { FloatingShapes } from "@/components/animations/floating-shapes";
import { useState, useEffect } from "react";

const images = ["/image1.webp", "/image2.webp", "/image3.webp"];

export function AnimatedImageSection() {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }, 5000); // Change image every 5 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-primary via-accent to-primary">
            {/* Animated Image Carousel with Ken Burns Effect */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentImageIndex}
                    className="absolute inset-0"
                    initial={{ opacity: 0, scale: 1 }}
                    animate={{ opacity: 1, scale: 1.1 }}
                    exit={{ opacity: 0, scale: 1.2 }}
                    transition={{
                        opacity: { duration: 1 },
                        scale: { duration: 20, ease: "easeInOut" },
                    }}
                >
                    <Image
                        src={images[currentImageIndex]}
                        alt={`Login visual ${currentImageIndex + 1}`}
                        fill
                        className="object-cover"
                        priority={currentImageIndex === 0}
                    />
                </motion.div>
            </AnimatePresence>

            {/* Brightness Overlay (50% darker) */}
            <div className="absolute inset-0 bg-black/50" />

            {/* Gradient Overlay */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/60 via-primary/30 to-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
            />

            {/* Floating Shapes */}
            <FloatingShapes count={12} />

            {/* Content Overlay */}
            <div className="relative z-10 flex h-full flex-col justify-center p-12 text-white">
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="mb-8"
                >
                    <div className="relative w-72 h-12">
                        <Image
                            src="/logo-white.webp"
                            alt="Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <p className="text-lg text-white/90 max-w-md mt-4">
                        Sign in to continue your journey with us. Experience the best in class service and products.
                    </p>
                </motion.div>

                {/* Image Indicators */}
                <motion.div
                    className="flex space-x-2 mb-16"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className="group"
                            aria-label={`Go to image ${index + 1}`}
                        >
                            <div
                                className={`h-1 rounded-full transition-all duration-300 ${
                                    index === currentImageIndex
                                        ? "w-12 bg-secondary"
                                        : "w-8 bg-white/30 group-hover:bg-white/50"
                                }`}
                            />
                        </button>
                    ))}
                </motion.div>

                {/* Animated Stats - Marketplace Ratings */}
                <motion.div
                    className="space-y-6"
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
                        <div className="h-px w-12 bg-secondary mt-3 flex-shrink-0" />
                        <div>
                            <p className="text-sm text-white/60 uppercase tracking-wide mb-1">
                                Shopee Store
                            </p>
                            <div className="flex items-baseline space-x-2">
                                <p className="text-2xl font-bold text-secondary">4.9★</p>
                                <p className="text-sm text-white/80">(1.6K penilaian)</p>
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
                        <div className="h-px w-12 bg-accent mt-3 flex-shrink-0" />
                        <div>
                            <p className="text-sm text-white/60 uppercase tracking-wide mb-1">
                                Tokopedia Store
                            </p>
                            <div className="flex items-baseline space-x-2">
                                <p className="text-2xl font-bold text-accent">5.0★</p>
                                <p className="text-sm text-white/80">(3.125K penilaian)</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Export */}
                    <motion.div
                        className="flex items-start space-x-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.0 }}
                    >
                        <div className="h-px w-12 bg-white/50 mt-3 flex-shrink-0" />
                        <div>
                            <p className="text-sm text-white/60 uppercase tracking-wide mb-1">
                                Global Export
                            </p>
                            <div className="space-y-1">
                                <p className="text-2xl font-bold text-white">300+</p>
                                <p className="text-sm text-white/80 leading-relaxed">
                                    🇫🇷 France • 🇨🇦 Canada • 🇹🇭 Thailand
                                    <br />
                                    🇦🇺 Australia • 🇯🇵 Japan • And more
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
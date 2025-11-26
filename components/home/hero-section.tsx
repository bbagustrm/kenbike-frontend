"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
    return (
        <section className="relative bg-background py-8 md:py-12 lg:py-16">
            <div className="container mx-auto px-4">
                {/* Hero Text */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
                    className="text-center mb-8 md:mb-12 max-w-4xl mx-auto"
                >
                    <h1 className="font-display text-3xl md:text-4xl lg:text-5xl xl:text-6xl mb-4 md:mb-6 leading-tight">
                        Ride with Purpose.
                        <br />
                        Crafted for Everyday Adventures.
                    </h1>
                    <p className="text-sm md:text-base lg:text-lg text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed">
                        Discover premium bike components and accessories designed for performance, durability, and style.
                        From urban commutes to mountain trails—gear up for your next journey.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button asChild size="lg" className="button-secondary group">
                                <Link href="/search" className="flex items-center gap-2">
                                    Shop Now
                                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button asChild size="lg" variant="outline">
                                <Link href="/search?isFeatured=true">
                                    View Featured
                                </Link>
                            </Button>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Hero Image - Responsive */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] as const }}
                    className="relative w-full overflow-hidden rounded-lg"
                >
                    {/* Desktop Image */}
                    <div className="hidden lg:block relative w-full">
                        <Image
                            src="/hero/hero-desktop.webp"
                            alt="Kenbike Hero - Premium Cycling Components"
                            width={1920}
                            height={900}
                            className="w-full h-auto object-cover rounded-lg"
                            priority
                            quality={90}
                            sizes="(min-width: 1024px) 100vw"
                        />
                    </div>

                    {/* Tablet Image */}
                    <div className="hidden md:block lg:hidden relative w-full">
                        <Image
                            src="/hero/hero-tablet.webp"
                            alt="Kenbike Hero - Premium Cycling Components"
                            width={1024}
                            height={768}
                            className="w-full h-auto object-cover rounded-lg"
                            priority
                            quality={90}
                            sizes="(min-width: 768px) and (max-width: 1023px) 100vw"
                        />
                    </div>

                    {/* Mobile Image */}
                    <div className="block md:hidden relative w-full">
                        <Image
                            src="/hero/hero-mobile.webp"
                            alt="Kenbike Hero - Premium Cycling Components"
                            width={750}
                            height={1200}
                            className="w-full h-auto object-cover rounded-lg"
                            priority
                            quality={90}
                            sizes="(max-width: 767px) 100vw"
                        />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
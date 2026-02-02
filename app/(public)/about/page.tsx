"use client";

import { QuoteSection } from "@/components/home/quote-section";
import { VideoSection } from "@/components/home/video-section";
import {motion} from "framer-motion";
import {useState} from "react";
import {Category} from "@/types/category";
import {CategoryService} from "@/services/category.service";
import {handleApiError} from "@/lib/api-client";
import {toast} from "sonner";
import {ScrollReveal} from "@/components/animations/scroll-reveal";
import {ProductGridSkeleton} from "@/components/product/product-card-skeleton";
import {CategoryCarousel} from "@/components/home/category-carousel";
import {HeroSection} from "@/components/home/hero-section";

export default function AboutPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const fetchCategories = async () => {
        try {
            const response = await CategoryService.getCategories({
                limit: 10,
                isActive: true
            });
            setCategories(response.data || []);
        } catch (error) {
            const errorResult = handleApiError(error);
            toast.error(errorResult.message);
        } finally {
            setIsLoadingCategories(false);
        }
    };

    fetchCategories();

    return (
        <div className="min-h-screen bg-gradient-main">
            {/* Hero Section - Masonry Grid */}
            <HeroSection />

            {/* Video Section */}
            <VideoSection />

            {/* Quote Section */}
            <QuoteSection />


            {/* Category Carousel Section */}
            {(isLoadingCategories || categories.length > 0) && (
                <section className="border-t border-border bg-muted/10 py-8 md:py-12 lg:py-14">
                    <div className="container mx-auto px-4">
                        <ScrollReveal direction="up">
                            <motion.div
                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <div>
                                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-1 text-foreground">
                                        Shop by Category
                                    </h2>
                                    <p className="text-xs md:text-sm text-muted-foreground">
                                        Explore our wide range of bike components
                                    </p>
                                </div>
                            </motion.div>
                        </ScrollReveal>

                        {isLoadingCategories ? (
                            <ProductGridSkeleton count={4} columns={4} />
                        ) : (
                            <CategoryCarousel categories={categories} />
                        )}
                    </div>
                </section>
            )}

        </div>
    );
}
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryCarousel } from "@/components/home/category-carousel";
import { PromotionCarousel } from "@/components/product/promotion-carousel";
import { ProductCard } from "@/components/product/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import { FadeInView } from "@/components/animations/fade-in-view";
import { ProductGridSkeleton } from "@/components/product/product-card-skeleton";
import { PromotionCarouselSkeleton } from "@/components/product/promotion-carousel-skeleton";
import { ProductService } from "@/services/product.service";
import { CategoryService } from "@/services/category.service";
import { ProductListItem } from "@/types/product";
import { Category } from "@/types/category";
import { useTranslation } from "@/hooks/use-translation";
import { handleApiError } from "@/lib/api-client";
import { toast } from "sonner";

export default function HomePage() {
    const { t, locale } = useTranslation();

    const [promotionProducts, setPromotionProducts] = useState<ProductListItem[]>([]);
    const [featuredProducts, setFeaturedProducts] = useState<ProductListItem[]>([]);
    const [trendingProducts, setTrendingProducts] = useState<ProductListItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    const [isLoadingPromotion, setIsLoadingPromotion] = useState(true);
    const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);
    const [isLoadingTrending, setIsLoadingTrending] = useState(true);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);

    // Merged products
    const mergedProducts = [
        ...promotionProducts,
        ...trendingProducts.filter(
            (tp) => !promotionProducts.some((pp) => pp.id === tp.id)
        ),
    ];

    useEffect(() => {
        const fetchPromotionProducts = async () => {
            try {
                const response = await ProductService.getProducts({
                    hasPromotion: true,
                    limit: 8,
                    sortBy: "totalSold",
                    order: "desc",
                });
                setPromotionProducts(response.data);
            } catch (error) {
                const errorResult = handleApiError(error);
                toast.error(errorResult.message);
            } finally {
                setIsLoadingPromotion(false);
            }
        };

        const fetchFeaturedProducts = async () => {
            try {
                const response = await ProductService.getFeaturedProducts(12);
                setFeaturedProducts(response.data);
            } catch (error) {
                const errorResult = handleApiError(error);
                toast.error(errorResult.message);
            } finally {
                setIsLoadingFeatured(false);
            }
        };

        const fetchTrendingProducts = async () => {
            try {
                const response = await ProductService.getTrendingProducts(12, 7);
                setTrendingProducts(response.data);
            } catch (error) {
                const errorResult = handleApiError(error);
                toast.error(errorResult.message);
            } finally {
                setIsLoadingTrending(false);
            }
        };

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

        fetchPromotionProducts();
        fetchFeaturedProducts();
        fetchTrendingProducts();
        fetchCategories();
    }, []);

    const isLoadingMerged = isLoadingPromotion || isLoadingTrending;

    return (
        <div className="min-h-screen">

            {/* Promotion Banner Carousel */}
            <section className="bg-background pt-2">
                {isLoadingPromotion ? (
                    <div className="container mx-auto px-4 pb-8 md:pb-12">
                        <PromotionCarouselSkeleton />
                    </div>
                ) : (
                    <FadeInView duration={0.8} className="container mx-auto px-4">
                        <PromotionCarousel />
                    </FadeInView>
                )}
            </section>

            {/* Merged Promotion & Trending Section */}
            {(isLoadingMerged || mergedProducts.length > 0) && (
                <section className="bg-background">
                    <div className="container mx-auto px-4 py-8 md:py-12 lg:py-14">
                        <ScrollReveal direction="up">
                            <motion.div
                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <div>
                                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-1 text-foreground">
                                        Hot Deals & Trending Products
                                    </h2>
                                    <p className="text-xs md:text-sm text-muted-foreground">
                                        Special promotions and trending products this week
                                    </p>
                                </div>
                                {!isLoadingMerged && mergedProducts.length > 0 && (
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Button asChild variant="ghost" className="group hidden sm:flex shrink-0">
                                            <Link href="/search?hasPromotion=true" className="flex items-center gap-1">
                                                {t.home.seeAll}
                                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </Link>
                                        </Button>
                                    </motion.div>
                                )}
                            </motion.div>
                        </ScrollReveal>

                        {isLoadingMerged ? (
                            <div className="relative">
                                <ProductGridSkeleton count={10} columns={5} />
                            </div>
                        ) : mergedProducts.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4 pt-2 md:pt-4">
                                {mergedProducts.slice(0, 10).map((product, index) => (
                                    <FadeInView key={product.id} delay={index * 0.05}>
                                        <ProductCard product={product} locale={locale} />
                                    </FadeInView>
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                title={t.search.noResults}
                                description="No promotions available at the moment"
                            />
                        )}
                    </div>
                </section>
            )}

            {/* Category Carousel Section */}
            {(isLoadingCategories || categories.length > 0) && (
                <section className="bg-background py-8 md:py-12 lg:py-14">
                    <div className="container mx-auto px-4">
                        <ScrollReveal direction="up">
                            <motion.div
                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8 pb-4"
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

            {/* Featured Products Section */}
            <section className="bg-background">
                <div className="container mx-auto px-4 py-8 md:py-12 lg:py-14">
                    <ScrollReveal direction="up">
                        <motion.div
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div>
                                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-1 text-foreground">
                                    {t.home.featuredTitle}
                                </h2>
                                <p className="text-xs md:text-sm text-muted-foreground">
                                    Handpicked products just for you
                                </p>
                            </div>
                            {!isLoadingFeatured && featuredProducts.length > 0 && (
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button asChild variant="ghost" className="group hidden sm:flex shrink-0">
                                        <Link href="/search?isFeatured=true" className="flex items-center gap-1">
                                            {t.home.seeAll}
                                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    </Button>
                                </motion.div>
                            )}
                        </motion.div>
                    </ScrollReveal>

                    {isLoadingFeatured ? (
                        <ProductGridSkeleton count={12} columns={5} />
                    ) : featuredProducts.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4 pt-2 md:pt-4">
                            {featuredProducts.slice(0, 12).map((product, index) => (
                                <FadeInView key={product.id} delay={index * 0.05}>
                                    <ProductCard product={product} locale={locale} />
                                </FadeInView>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            title={t.search.noResults}
                            description="Belum ada produk unggulan saat ini"
                        />
                    )}
                </div>
            </section>
        </div>
    );
}
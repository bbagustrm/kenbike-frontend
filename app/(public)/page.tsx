// app/(public)/page.tsx - With Category Section
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PromotionCarousel } from "@/components/product/promotion-carousel";
import { ProductCard } from "@/components/product/product-card";
import { ProductCarousel } from "@/components/product/product-carousel";
import { EmptyState } from "@/components/ui/empty-state";
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import { FadeInView } from "@/components/animations/fade-in-view";
import { ProductService } from "@/services/product.service";
import { CategoryService } from "@/services/category.service";
import { ProductListItem } from "@/types/product";
import { Category } from "@/types/category";
import { useTranslation } from "@/hooks/use-translation";
import { handleApiError } from "@/lib/api-client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

  // Merged products: Promotion first, then Trending (excluding duplicates)
  const mergedProducts = [
    ...promotionProducts,
    ...trendingProducts.filter(
        (tp) => !promotionProducts.some((pp) => pp.id === tp.id)
    ),
  ];

  // Get first 4 categories for banner-category
  const bannerCategories = categories.slice(0, 4);

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
          limit: 4,
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
        {/* Hero Section - Full Width Promotion Banner */}
        <section className="bg-muted/30">
          <FadeInView duration={0.8}>
            <PromotionCarousel />
          </FadeInView>
        </section>

        {/* Merged Promotion & Trending Section with Carousel */}
        {(isLoadingMerged || mergedProducts.length > 0) && (
            <section className="border-t border-border bg-gradient-to-b from-muted/5 to-transparent">
              <div className="container mx-auto px-4 py-10 md:py-14">
                <ScrollReveal direction="up">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold mb-1 text-foreground">
                        🔥 Hot Deals & Trending
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Special promotions and trending products this week
                      </p>
                    </div>
                    {mergedProducts.length > 0 && (
                        <Button asChild variant="ghost" className="group hidden md:flex">
                          <Link href="/search?hasPromotion=true" className="flex items-center gap-1">
                            {t.home.seeAll}
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </Link>
                        </Button>
                    )}
                  </div>
                </ScrollReveal>

                {isLoadingMerged ? (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : mergedProducts.length > 0 ? (
                    <ProductCarousel products={mergedProducts}/>
                ) : null}
              </div>
            </section>
        )}

        {/* Category Banner Section */}
        {(isLoadingCategories || bannerCategories.length > 0) && (
            <section className="border-t border-border bg-background">
              <div className="w-full">
                {isLoadingCategories ? (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : bannerCategories.length > 0 ? (
                    <div className="grid grid-cols-2">
                      {bannerCategories.map((category, index) => (
                          <FadeInView key={category.id} delay={index * 0.1}>
                            <Link
                                href={`/search?category=${category.slug}`}
                                className="group relative block overflow-hidden aspect-[4/3] md:aspect-[16/9]"
                            >
                              <div className="relative w-full h-full">
                                <Image
                                    src={`/banner-category/img${index + 1}.webp`}
                                    alt={category.name}
                                    fill
                                    className={cn(
                                        "object-cover transition-all duration-500",
                                        "brightness-100 group-hover:brightness-50 group-hover:scale-105"
                                    )}
                                    sizes="(max-width: 768px) 50vw, 50vw"
                                />
                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                                {/* Category Name */}
                                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                                  <h3 className="text-white font-bold text-lg md:text-2xl uppercase tracking-wide drop-shadow-lg">
                                    {category.name}
                                  </h3>
                                  <div className="relative mt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-white border-white hover:bg-white/10 transition-opacity duration-300 group-hover:opacity-0"
                                    >
                                      Shop Now
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="absolute top-0 left-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                                    >
                                      Shop Now
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </FadeInView>
                      ))}
                    </div>
                ) : null}
              </div>
            </section>
        )}

        {/* Featured Products Section */}
        <section className="border-t border-border bg-muted/10">
          <div className="container mx-auto px-4 py-10 md:py-14">
            <ScrollReveal direction="up">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-1 text-foreground">
                    {t.home.featuredTitle}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Handpicked products just for you
                  </p>
                </div>
                {featuredProducts.length > 0 && (
                    <Button asChild variant="ghost" className="group hidden md:flex">
                      <Link href="/search?isFeatured=true" className="flex items-center gap-1">
                        {t.home.seeAll}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                )}
              </div>
            </ScrollReveal>

            {isLoadingFeatured ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : featuredProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                  {featuredProducts.map((product, index) => (
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
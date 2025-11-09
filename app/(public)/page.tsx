// app/(public)/page.tsx - Updated with price translation
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PromotionCarousel } from "@/components/product/promotion-carousel";
import { ProductCard } from "@/components/product/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import { FadeInView } from "@/components/animations/fade-in-view";
import { ParallaxSection } from "@/components/animations/parallax-section";
import { ProductService } from "@/services/product.service";
import { ProductListItem } from "@/types/product";
import { useTranslation } from "@/hooks/use-translation";
import { handleApiError } from "@/lib/api-client";
import { toast } from "sonner";

export default function HomePage() {
  const { t, locale } = useTranslation(); // Added locale

  const [promotionProducts, setPromotionProducts] = useState<ProductListItem[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductListItem[]>([]);
  const [bestSellers, setBestSellers] = useState<ProductListItem[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<ProductListItem[]>([]);

  const [isLoadingPromotion, setIsLoadingPromotion] = useState(true);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);
  const [isLoadingBestSellers, setIsLoadingBestSellers] = useState(true);
  const [isLoadingTrending, setIsLoadingTrending] = useState(true);

  useEffect(() => {
    const fetchPromotionProducts = async () => {
      try {
        const response = await ProductService.getProducts({
          hasPromotion: true,
          limit: 12,
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

    const fetchBestSellers = async () => {
      try {
        const response = await ProductService.getBestSellers(12);
        setBestSellers(response.data);
      } catch (error) {
        const errorResult = handleApiError(error);
        toast.error(errorResult.message);
      } finally {
        setIsLoadingBestSellers(false);
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

    fetchPromotionProducts();
    fetchFeaturedProducts();
    fetchBestSellers();
    fetchTrendingProducts();
  }, []);

  return (
      <div className="min-h-screen">
        {/* Hero Section - Full Width Promotion Banner */}
        <section className="bg-muted/30">
          <FadeInView duration={0.8}>
            <PromotionCarousel />
          </FadeInView>
        </section>

        {/* Promotion Products Section */}
        {(isLoadingPromotion || promotionProducts.length > 0) && (
            <section className="border-t border-border">
              <div className="container mx-auto px-4 py-10 md:py-14">
                <ScrollReveal direction="up">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold mb-1 text-foreground">
                        {t.home.promotionProductsTitle}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Limited time offers - Dont miss out!
                      </p>
                    </div>
                    {promotionProducts.length > 0 && (
                        <Button asChild variant="ghost" className="group hidden md:flex">
                          <Link href="/search?hasPromotion=true" className="flex items-center gap-1">
                            {t.home.seeAll}
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </Link>
                        </Button>
                    )}
                  </div>
                </ScrollReveal>

                {isLoadingPromotion ? (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : promotionProducts.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                      {promotionProducts.map((product, index) => (
                          <ScrollReveal key={product.id} delay={index * 0.05} direction="up">
                            <ProductCard product={product} locale={locale} />
                          </ScrollReveal>
                      ))}
                    </div>
                ) : null}
              </div>
            </section>
        )}

        {/* Best Sellers Section with Parallax */}
        {(isLoadingBestSellers || bestSellers.length > 0) && (
            <ParallaxSection speed={-0.2}>
              <section className="border-t border-border bg-card">
                <div className="container mx-auto px-4 py-10 md:py-14">
                  <ScrollReveal direction="up">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-2xl md:text-3xl font-bold mb-1 text-foreground">
                          Best Sellers
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Most popular products loved by our customers
                        </p>
                      </div>
                      {bestSellers.length > 0 && (
                          <Button asChild variant="ghost" className="group hidden md:flex">
                            <Link href="/search?sortBy=totalSold&order=desc" className="flex items-center gap-1">
                              {t.home.seeAll}
                              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                          </Button>
                      )}
                    </div>
                  </ScrollReveal>

                  {isLoadingBestSellers ? (
                      <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                  ) : bestSellers.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                        {bestSellers.map((product, index) => (
                            <FadeInView key={product.id} delay={index * 0.05}>
                              <ProductCard product={product} locale={locale} />
                            </FadeInView>
                        ))}
                      </div>
                  ) : null}
                </div>
              </section>
            </ParallaxSection>
        )}

        {/* Trending Products Section */}
        {(isLoadingTrending || trendingProducts.length > 0) && (
            <section className="border-t border-border bg-muted/20">
              <div className="container mx-auto px-4 py-10 md:py-14">
                <ScrollReveal direction="up">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold mb-1 text-foreground">
                        Trending Now
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Hot products trending this week
                      </p>
                    </div>
                    {trendingProducts.length > 0 && (
                        <Button asChild variant="ghost" className="group hidden md:flex">
                          <Link href="/search?sortBy=totalView&order=desc" className="flex items-center gap-1">
                            {t.home.seeAll}
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </Link>
                        </Button>
                    )}
                  </div>
                </ScrollReveal>

                {isLoadingTrending ? (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : trendingProducts.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                      {trendingProducts.map((product, index) => (
                          <ScrollReveal key={product.id} delay={index * 0.05} direction="left">
                            <ProductCard product={product} locale={locale} />
                          </ScrollReveal>
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
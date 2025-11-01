"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PromotionCarousel } from "@/components/product/promotion-carousel";
import { ProductCarousel } from "@/components/product/product-carousel";
import { ProductCard } from "@/components/product/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductService } from "@/services/product.service";
import { ProductListItem } from "@/types/product";
import { useTranslation } from "@/hooks/use-translation";
import { handleApiError } from "@/lib/api-client";
import { toast } from "sonner";

export default function HomePage() {
  const { t } = useTranslation();

  const [promotionProducts, setPromotionProducts] = useState<ProductListItem[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductListItem[]>([]);
  const [isLoadingPromotion, setIsLoadingPromotion] = useState(true);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);

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

    fetchPromotionProducts();
    fetchFeaturedProducts();
  }, []);

  return (
      <div className="min-h-screen">
        {/* Hero Section - Promotion Banner Carousel */}
        <section className="container mx-auto px-4 py-8">
          <PromotionCarousel />
        </section>

        {/* Promotion Products Section */}
        {(isLoadingPromotion || promotionProducts.length > 0) && (
            <section className="container mx-auto px-4 py-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">
                    {t.home.promotionProductsTitle}
                  </h2>
                  <p className="text-muted-foreground">
                    {t.home.promotionTitle}
                  </p>
                </div>
                {promotionProducts.length > 0 && (
                    <Button asChild variant="ghost" className="group">
                      <Link href="/search?hasPromotion=true">
                        {t.home.seeAll}
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                )}
              </div>

              {isLoadingPromotion ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
              ) : promotionProducts.length > 0 ? (
                  <ProductCarousel products={promotionProducts} />
              ) : null}
            </section>
        )}

        {/* Featured Products Section */}
        <section className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                {t.home.featuredTitle}
              </h2>
              <p className="text-muted-foreground">
                Produk pilihan terbaik untuk Anda
              </p>
            </div>
            {featuredProducts.length > 0 && (
                <Button asChild variant="ghost" className="group">
                  <Link href="/search?isFeatured=true">
                    {t.home.seeAll}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
            )}
          </div>

          {isLoadingFeatured ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
          ) : featuredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
              </div>
          ) : (
              <EmptyState
                  title={t.search.noResults}
                  description="Belum ada produk unggulan saat ini"
              />
          )}
        </section>
      </div>
  );
}
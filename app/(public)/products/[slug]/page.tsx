// app/(public)/products/[slug]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Minus, Plus, ShoppingCart, Star, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import { FadeInView } from "@/components/animations/fade-in-view";
import { cn } from "@/lib/utils";
import { ProductService } from "@/services/product.service";
import { Product, ProductListItem, ProductVariant } from "@/types/product";
import { formatCurrency } from "@/lib/format-currency";
import { useTranslation } from "@/hooks/use-translation";
import { useCart } from "@/contexts/cart-context";
import { handleApiError } from "@/lib/api-client";
import { toast } from "sonner";
import { ProductInfoDrawer } from "@/components/product/product-info-drawer";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductCard } from "@/components/product/product-card";
import { ProductDetailSkeleton } from "@/components/product/product-detail-skeleton";
import { ReviewList } from "@/components/review/review-list";
import { DiscussionList } from "@/components/discussion/discussion-list";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { CarouselApi } from "@/components/ui/carousel";

const COLOR_MAP: Record<string, string> = {
    black: "#000000",
    white: "#FFFFFF",
    chrome: "#C0C0C0",
    silver: "#C0C0C0",
    gold: "#FFD700",
    red: "#FF0000",
    blue: "#0000FF",
    green: "#00FF00",
    yellow: "#FFFF00",
    orange: "#FFA500",
    purple: "#800080",
    pink: "#FFC0CB",
    brown: "#8B4513",
    gray: "#808080",
    grey: "#808080",
};

const getColorFromVariantName = (variantName: string): string => {
    const firstWord = variantName.toLowerCase().split(" ")[0];
    return COLOR_MAP[firstWord] || "#CCCCCC";
};

interface ProductImage {
    id: string;
    imageUrl: string;
    order?: number;
}

export default function ProductDetailPage() {
    const params = useParams();
    const { t, locale } = useTranslation();
    const { addToCart, isLoading: cartLoading } = useCart();
    const slug = params.slug as string;

    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [relatedProducts, setRelatedProducts] = useState<ProductListItem[]>([]);
    const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);

    useEffect(() => {
        const fetchProduct = async () => {
            setIsLoading(true);
            try {
                const response = await ProductService.getProductBySlug(slug);
                setProduct(response.data);
                const defaultVariant = response.data.variants?.find((v) => v.isActive);
                if (defaultVariant) {
                    setSelectedVariant(defaultVariant);
                }
            } catch (error) {
                const errorResult = handleApiError(error);
                toast.error(errorResult.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProduct();
    }, [slug]);

    useEffect(() => {
        const fetchRelatedProducts = async () => {
            if (!product?.category?.slug) return;
            try {
                const response = await ProductService.getProducts({
                    categorySlug: product.category.slug,
                    limit: 4,
                });
                const filtered = response.data.filter((p) => p.id !== product.id);
                setRelatedProducts(filtered);
            } catch (error) {
                console.error("Failed to fetch related products:", error);
            }
        };
        if (product) {
            fetchRelatedProducts();
        }
    }, [product]);

    useEffect(() => {
        if (!carouselApi) return;

        const onSelect = () => {
            setSelectedImageIndex(carouselApi.selectedScrollSnap());
        };

        carouselApi.on("select", onSelect);

        return () => {
            carouselApi.off("select", onSelect);
        };
    }, [carouselApi]);

    const getAllImages = (): ProductImage[] => {
        if (!product) return [];
        const productImages = product.images || [];
        const variantImages = selectedVariant?.images || [];
        return [
            ...productImages.map((img) => ({ ...img, order: img.order || 0 })),
            ...variantImages.map((img, idx) => ({ ...img, order: productImages.length + idx })),
        ];
    };

    const allImages = getAllImages();

    const getVariantImageStartIndex = (): number => {
        return product?.images?.length || 0;
    };

    const basePrice = locale === "id" ? product?.idPrice : product?.enPrice;
    const hasActivePromotion = product?.promotion &&
        product.promotion.endDate &&
        new Date(product.promotion.endDate) > new Date();
    const discount = hasActivePromotion && product?.promotion ? product.promotion.discount : 0;
    const finalPrice = basePrice ? basePrice * (1 - discount) : 0;
    const isPreOrder = !!product?.isPreOrder;

    // Stock status helpers
    const currentStock = selectedVariant?.stock || 0;
    const isOutOfStock = currentStock === 0;
    const isLowStock = currentStock > 0 && currentStock <= 10;
    const isAvailable = currentStock > 10;

    const handleVariantSelect = (variant: ProductVariant) => {
        setSelectedVariant(variant);
        const variantStartIndex = getVariantImageStartIndex();
        setSelectedImageIndex(variantStartIndex);
    };

    const handleQuantityChange = (delta: number) => {
        const maxStock = selectedVariant?.stock || 0;
        setQuantity((prev) => Math.max(1, Math.min(prev + delta, maxStock)));
    };

    const handleAddToCart = async () => {
        if (!selectedVariant) {
            toast.error(t.productDetail?.selectVariantFirst || (locale === "id" ? "Pilih varian terlebih dahulu" : "Please select a variant"));
            return;
        }
        if (selectedVariant.stock === 0) {
            toast.error(t.products.outOfStock);
            return;
        }
        try {
            await addToCart(selectedVariant.id, quantity);
        } catch (error) {
            console.error("Failed to add to cart:", error);
        }
    };

    if (isLoading) {
        return <ProductDetailSkeleton />;
    }

    if (!product) {
        return (
            <div className="container mx-auto px-4 py-12">
                <EmptyState
                    title={t.productDetail?.productNotFound || (locale === "id" ? "Produk tidak ditemukan" : "Product not found")}
                    description={t.productDetail?.productNotFoundDesc || (locale === "id" ? "Produk yang Anda cari tidak ada." : "The product you're looking for doesn't exist.")}
                />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6 text-foreground">
            {/* Breadcrumb */}
            <FadeInView duration={0.3}>
                <Breadcrumb className="mb-6">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">{t.productDetail?.breadcrumb?.home || t.nav.home}</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/search">{t.productDetail?.breadcrumb?.product || t.nav.products}</BreadcrumbLink>
                        </BreadcrumbItem>
                        {product.category && (
                            <>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink href={`/search?category=${product.category.slug}`}>
                                        {product.category.name}
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                            </>
                        )}
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{product.name}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </FadeInView>

            {/* Main Product Section */}
            <div className="grid grid-cols-1 lg:grid-cols-8 gap-16 mb-12">
                {/* LEFT COLUMN */}
                <div className="lg:col-span-5 space-y-8">
                    {/* Main Image Gallery */}
                    <ScrollReveal direction="up">
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Desktop: Vertical Thumbnail Images */}
                            <ScrollArea className="bg-accent hidden lg:flex max-h-[500px] p-2 rounded-md">
                                <div className="flex flex-col gap-2">
                                    {allImages.map((image, index) => (
                                        <motion.button
                                            key={image.id}
                                            onClick={() => {
                                                setSelectedImageIndex(index);
                                                carouselApi?.scrollTo(index);
                                            }}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={cn(
                                                "flex-shrink-0 w-20 h-20 rounded-md overflow-hidden transition cursor-pointer",
                                                selectedImageIndex === index
                                                    ? "brightness-100"
                                                    : "brightness-80"
                                            )}
                                        >
                                            <Image
                                                src={image.imageUrl}
                                                alt={`${product.name} ${index + 1}`}
                                                width={80}
                                                height={80}
                                                className="w-full h-full object-cover"
                                            />
                                        </motion.button>
                                    ))}
                                </div>
                            </ScrollArea>

                            {/* Main Image Container */}
                            <div className="flex-1 space-y-4">
                                <Carousel
                                    className="bg-white relative aspect-square rounded-xl w-full max-w-[500px] mx-auto"
                                    opts={{
                                        align: "center",
                                        loop: allImages.length > 1,
                                    }}
                                    setApi={setCarouselApi}
                                >
                                    <CarouselContent>
                                        {allImages.map((image, index) => (
                                            <CarouselItem key={image.id}>
                                                <div className="relative aspect-square">
                                                    <Image
                                                        src={image.imageUrl}
                                                        alt={product.name}
                                                        fill
                                                        priority={index === 0}
                                                        className="object-contain"
                                                    />

                                                    {selectedVariant &&
                                                        index >= getVariantImageStartIndex() && (
                                                            <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                                                                {selectedVariant.variantName}
                                                            </div>
                                                        )}
                                                </div>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>

                                    {allImages.length > 1 && (
                                        <>
                                            <CarouselPrevious />
                                            <CarouselNext />
                                        </>
                                    )}
                                </Carousel>
                            </div>


                            {/* Mobile: Horizontal Thumbnail Images */}
                            <div className="lg:hidden flex gap-2 overflow-x-auto overflow-y-hidden pb-2 px-1">
                                {allImages.map((image, index) => (
                                    <motion.button
                                        key={image.id}
                                        onClick={() => {
                                            setSelectedImageIndex(index);
                                            carouselApi?.scrollTo(index);
                                        }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={cn(
                                            "flex-shrink-0 w-20 h-20 sm:w-16 sm:h-16 rounded-sm overflow-hidden border-4 transition",
                                            selectedImageIndex === index
                                                ? "border-accent"
                                                : "border-border hover:border-accent"
                                        )}
                                    >
                                        <Image
                                            src={image.imageUrl}
                                            alt={`${product.name} ${index + 1}`}
                                            width={100}
                                            height={100}
                                            className="w-full h-full object-cover"
                                        />
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </ScrollReveal>

                    {/* Promotion Info */}
                    {hasActivePromotion && product.promotion && (
                        <ScrollReveal direction="up" delay={0.1}>
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card className="bg-accent dark:bg-accent border-2 border-accent dark:border-accent shadow-md py-4">
                                    <CardContent className="p-0">
                                        <div className="flex items-center justify-between px-4 md:px-8">
                                            <div>
                                                <h3 className="font-bold text-lg">{product.promotion.name}</h3>
                                                <p className="text-sm">
                                                    {t.productDetail?.validUntil || (locale === "id" ? "Berlaku hingga" : "Valid until")}{" "}
                                                    {new Date(product.promotion.endDate).toLocaleDateString(
                                                        locale === "id" ? "id-ID" : "en-US",
                                                        {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric'
                                                        }
                                                    )}
                                                </p>
                                            </div>
                                            <p className="text-3xl font-bold">-{Math.round(discount * 100)}%</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </ScrollReveal>
                    )}

                    {/* Variant Selection */}
                    {product.variants && product.variants.length > 0 && (
                        <div className="space-y-3 md:hidden">
                            <div className="flex gap-2 flex-wrap">
                                {product.variants
                                    .filter((v) => v.isActive)
                                    .map((variant) => (
                                        <motion.button
                                            key={variant.id}
                                            onClick={() => handleVariantSelect(variant)}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className={cn(
                                                "flex items-center gap-2 px-2 py-2 rounded-full border-2 transition-all",
                                                selectedVariant?.id === variant.id && "border-accent"
                                            )}
                                        >
                                        <span
                                            className="w-6 h-6 rounded-full"
                                            style={{ backgroundColor: getColorFromVariantName(variant.variantName) }}
                                            title={variant.variantName}
                                            aria-label={variant.variantName}
                                        />
                                            <span className="text-sm">{variant.variantName}</span>
                                        </motion.button>
                                    ))}
                            </div>
                        </div>
                    )}

                    {/* Product Details Accordion */}
                    <ScrollReveal direction="up" delay={0.3}>
                        <Accordion type="multiple" defaultValue={["communityGallery","reviews"]} className="w-full">
                            {/* Community Gallery */}
                            <AccordionItem value="communityGallery">
                                <AccordionTrigger className="text-xl font-bold">
                                    {t.productDetail.communityGallery}
                                </AccordionTrigger>
                                <AccordionContent>
                                    {product.gallery && product.gallery.length > 0 && (
                                        <ScrollReveal direction="up" delay={0.2}>
                                            <ScrollArea className="w-full">
                                                <div className="flex gap-2 pb-4">
                                                    {product.gallery.map((image, index) => (
                                                        <motion.div
                                                            key={image.id}
                                                            initial={{ opacity: 0, x: 50 }}
                                                            whileInView={{ opacity: 1, x: 0 }}
                                                            viewport={{ once: true }}
                                                            transition={{ delay: index * 0.1 }}
                                                            className="relative w-[200px] sm:w-[240px] md:w-[280px] aspect-3/4 rounded-lg overflow-hidden bg-muted cursor-pointer flex-shrink-0"
                                                        >
                                                            <Image
                                                                src={image.imageUrl}
                                                                alt={image.caption || "Community photo"}
                                                                fill
                                                                className="object-cover"
                                                            />

                                                            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <span className="text-white font-semibold text-sm">
                                                                  {t.productDetail.communityGallery}
                                                                </span>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>

                                                {/* Scrollbar horizontal */}
                                                <ScrollBar orientation="horizontal" />
                                            </ScrollArea>
                                        </ScrollReveal>
                                    )}
                                </AccordionContent>
                            </AccordionItem>

                            {/* Description */}
                            <AccordionItem value="description">
                                <AccordionTrigger className="text-xl font-bold">
                                    {t.productDetail.description}
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div
                                        className="prose dark:prose-invert max-w-none ProseMirror"
                                        dangerouslySetInnerHTML={{
                                            __html: locale === "id" ? product.idDescription : product.enDescription,
                                        }}
                                    />
                                </AccordionContent>
                            </AccordionItem>

                            {/* Reviews - Using ReviewList Component */}
                            <AccordionItem value="reviews">
                                <AccordionTrigger className="text-xl font-bold">
                                    <div className="flex items-center gap-2">
                                        {t.productDetail.reviews}
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <ReviewList productSlug={slug} />
                                </AccordionContent>
                            </AccordionItem>

                            {/* Q&A / Discussions - Using DiscussionList Component */}
                            <AccordionItem value="discussions">
                                <AccordionTrigger className="text-xl font-bold">
                                    {t.productDetail?.qna || (locale === "id" ? "Tanya Jawab" : "Q&A")}
                                </AccordionTrigger>
                                <AccordionContent>
                                    <DiscussionList productId={product.id} productSlug={slug} />
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </ScrollReveal>
                </div>

                {/* RIGHT COLUMN: Sticky Product Info Card */}
                <div className="lg:col-span-3 hidden lg:block">
                    <ScrollReveal direction="left" delay={0.2} className="sticky top-24">
                        <Card className="bg-transparent p-0">
                            <CardContent className="space-y-4">
                                {/* Tags & Category */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    {product.category && (
                                        <Badge variant="secondary">{product.category.name}</Badge>
                                    )}
                                    {isPreOrder && (
                                        <Badge className="bg-accent text-accent-foreground gap-1">
                                            <Clock className="w-3 h-3" />
                                            {t.productDetail?.preOrder || "Pre Order"}
                                        </Badge>
                                    )}
                                    {product.tags?.map((tag) => (
                                        <Badge key={tag.id} variant="outline">
                                            {tag.name}
                                        </Badge>
                                    ))}
                                </div>

                                {/* Product Name */}
                                <h1 className="text-2xl font-bold uppercase">{product.name}</h1>

                                {/* Price */}
                                <div className="space-y-1">
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-2xl font-bold text-[#f15228]">
                                            {formatCurrency(finalPrice, locale === "id" ? "IDR" : "USD")}
                                        </span>
                                        {hasActivePromotion && (
                                            <span className="text-md text-muted-foreground line-through">
                                                {formatCurrency(basePrice!, locale === "id" ? "IDR" : "USD")}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Stock Info */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">{t.productDetail.stock}:</span>

                                        {isOutOfStock && (
                                            <Badge variant="destructive" className="gap-1.5">
                                                <AlertTriangle className="w-3.5 h-3.5" />
                                                {t.products.outOfStock}
                                            </Badge>
                                        )}

                                        {isLowStock && (
                                            <Badge variant="destructive" className="gap-1.5">
                                                <AlertTriangle className="w-3.5 h-3.5" />
                                                {t.productDetail.onlyLeftInStock.replace("{count}", currentStock.toString())}
                                            </Badge>
                                        )}

                                        {isAvailable && (
                                            <Badge variant="outline" className="gap-1.5">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                {t.products.inStock}
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Variant Selection */}
                                {product.variants && product.variants.length > 0 && (
                                    <div className="space-y-3">
                                        <label className="text-sm font-semibold block">
                                            {t.productDetail.chooseColor}:{" "}
                                            <span className="font-normal text-muted-foreground">{selectedVariant?.variantName}</span>
                                        </label>
                                        <div className="flex gap-2 flex-wrap">
                                            {product.variants
                                                .filter((v) => v.isActive)
                                                .map((variant) => (
                                                    <motion.button
                                                        key={variant.id}
                                                        onClick={() => handleVariantSelect(variant)}
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        className={cn(
                                                            "w-8 h-8 rounded-full border-2 transition-all",
                                                            selectedVariant?.id === variant.id && "ring-2 ring-accent ring-offset-2"
                                                        )}
                                                        style={{ backgroundColor: getColorFromVariantName(variant.variantName) }}
                                                        title={variant.variantName}
                                                        aria-label={variant.variantName}
                                                    />
                                                ))}
                                        </div>
                                    </div>
                                )}

                                {/* Quantity Selector */}
                                <div className="flex justify-between items-center space-x-4">
                                    <label className="text-sm font-semibold block">{t.productDetail.quantity}</label>
                                    <div className="flex items-center border border-border rounded-lg w-fit overflow-hidden">
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleQuantityChange(-1)}
                                            disabled={quantity <= 1}
                                            className="p-3 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition"
                                            aria-label="Decrease quantity"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </motion.button>
                                        <span className="px-6 font-semibold min-w-[3rem] text-center">{quantity}</span>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleQuantityChange(1)}
                                            disabled={quantity >= (selectedVariant?.stock || 0)}
                                            className="p-3 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition"
                                            aria-label="Increase quantity"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </motion.button>
                                    </div>
                                </div>

                                {/* Subtotal */}
                                <div className="border-t border-border pt-4 space-y-8">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">{t.productDetail.subtotal}</span>
                                        <span className="text-2xl font-bold">
                                            {formatCurrency(finalPrice * quantity, locale === "id" ? "IDR" : "USD")}
                                        </span>
                                    </div>
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Button
                                            onClick={handleAddToCart}
                                            size="lg"
                                            className="w-full"
                                            disabled={!selectedVariant || selectedVariant.stock === 0 || cartLoading}
                                        >
                                            <ShoppingCart className="w-5 h-5 mr-2" />
                                            {cartLoading ? t.common.loading : t.productDetail.addToCart}
                                        </Button>
                                    </motion.div>
                                </div>
                            </CardContent>
                        </Card>
                    </ScrollReveal>
                </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <ScrollReveal direction="up">
                    <div>
                        <h2 className="text-2xl font-bold mb-6">{t.productDetail.youMayAlsoLike}</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                            {relatedProducts.map((relatedProduct, index) => (
                                <motion.div
                                    key={relatedProduct.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <ProductCard product={relatedProduct} locale={locale} />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </ScrollReveal>
            )}
            <ProductInfoDrawer
                product={product}
                selectedVariant={selectedVariant}
                quantity={quantity}
                finalPrice={finalPrice}
                isPreOrder={isPreOrder}
                cartLoading={cartLoading}
                onVariantSelect={handleVariantSelect}
                onQuantityChange={handleQuantityChange}
                onAddToCart={handleAddToCart}
            />
        </div>
    );
}
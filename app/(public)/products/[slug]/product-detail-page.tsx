// app/products/[slug]/product-detail-page.tsx
"use client";

import {useEffect, useState} from "react";
import {useParams} from "next/navigation";
import Image from "next/image";
import {ChevronLeft, ChevronRight, Minus, Plus, ShoppingCart, Star} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger,} from "@/components/ui/accordion";
import {Card, CardContent} from "@/components/ui/card";
import {cn} from "@/lib/utils";
import {ProductService} from "@/services/product.service";
import {Product, ProductListItem, ProductVariant} from "@/types/product";
import {formatCurrency} from "@/lib/format-currency";
import {useTranslation} from "@/hooks/use-translation";
import {useCart} from "@/contexts/cart-context";
import {handleApiError} from "@/lib/api-client";
import {toast} from "sonner";
import {Skeleton} from "@/components/ui/skeleton";
import {EmptyState} from "@/components/ui/empty-state";
import {ProductCard} from "@/components/product/product-card";

// Review interface
interface Review {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    user?: {
        name: string;
    };
}

// Color mapping for variants (hardcoded)
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

    // Fetch product details
    useEffect(() => {
        const fetchProduct = async () => {
            setIsLoading(true);
            try {
                const response = await ProductService.getProductBySlug(slug);
                setProduct(response.data);

                // Set default variant (first active variant)
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

    // Fetch related products
    useEffect(() => {
        const fetchRelatedProducts = async () => {
            if (!product?.category?.slug) return;

            try {
                const response = await ProductService.getProducts({
                    categorySlug: product.category.slug,
                    limit: 4,
                });

                // Filter out current product
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

    // Get all images (product images + selected variant images)
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

    // Get variant-specific images start index
    const getVariantImageStartIndex = (): number => {
        return product?.images?.length || 0;
    };

    // Calculate prices
    const basePrice = locale === "id" ? product?.idPrice : product?.enPrice;
    const hasActivePromotion = product?.promotion &&
        product.promotion.endDate &&
        new Date(product.promotion.endDate) > new Date();
    const discount = hasActivePromotion && product?.promotion ? product.promotion.discount : 0;
    const finalPrice = basePrice ? basePrice * (1 - discount) : 0;

    // Stock warning
    const stockWarning = selectedVariant && selectedVariant.stock < 10 && selectedVariant.stock > 0;

    // Handlers
    const handleVariantSelect = (variant: ProductVariant) => {
        setSelectedVariant(variant);
        // Jump to first variant image
        const variantStartIndex = getVariantImageStartIndex();
        setSelectedImageIndex(variantStartIndex);
    };

    const handleQuantityChange = (delta: number) => {
        const maxStock = selectedVariant?.stock || 0;
        setQuantity((prev) => Math.max(1, Math.min(prev + delta, maxStock)));
    };

    const handlePrevImage = () => {
        setSelectedImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
    };

    const handleNextImage = () => {
        setSelectedImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
    };

    const handleAddToCart = async () => {
        if (!selectedVariant) {
            toast.error(locale === "id" ? "Pilih varian terlebih dahulu" : "Please select a variant");
            return;
        }

        if (selectedVariant.stock === 0) {
            toast.error(locale === "id" ? "Produk stok habis" : "Product out of stock");
            return;
        }

        try {
            await addToCart(selectedVariant.id, quantity);
            // Success toast is handled in cart context
        } catch (error) {
            console.error("Failed to add to cart:", error);
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Skeleton className="h-8 w-64 mb-6" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <Skeleton className="h-[500px] w-full" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container mx-auto px-4 py-12">
                <EmptyState
                    title={locale === "id" ? "Produk tidak ditemukan" : "Product not found"}
                    description={locale === "id" ? "Produk yang Anda cari tidak ada." : "The product you're looking for doesn't exist."}
                />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6 text-primary">
            {/* Breadcrumb */}
            <Breadcrumb className="mb-6">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/search">Product</BreadcrumbLink>
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

            {/* Main Product Section */}
            <div className="grid grid-cols-1 lg:grid-cols-8 gap-16 mb-12">
                {/* LEFT COLUMN: Images, Gallery, Description, Reviews (60% = 5 cols) */}
                <div className="lg:col-span-5 space-y-8">
                    {/* Main Image Gallery */}
                    <div className="flex gap-4">
                        {/* Vertical Thumbnail Images on LEFT */}
                        <div className="flex flex-col gap-2 overflow-y-auto max-h-[500px] pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                            {allImages.map((image, index) => (
                                <button
                                    key={image.id}
                                    onClick={() => setSelectedImageIndex(index)}
                                    className={cn(
                                        "flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition",
                                        selectedImageIndex === index
                                            ? "border-primary ring-2 ring-primary ring-offset-2"
                                            : "border-gray-200 hover:border-gray-300"
                                    )}
                                >
                                    <Image
                                        src={image.imageUrl}
                                        alt={`${product.name} ${index + 1}`}
                                        width={80}
                                        height={80}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>

                        {/* Main Image on RIGHT */}
                        <div className="flex-1 relative aspect-square rounded-lg max-w-[300px] sm:max-w-[400px] md:max-w-[500px] mx-auto">
                            {allImages.length > 0 && (
                                <>
                                    <Image
                                        src={allImages[selectedImageIndex].imageUrl}
                                        alt={product.name}
                                        fill
                                        className="object-contain"
                                        priority
                                    />

                                    {/* Variant Badge */}
                                    {selectedVariant && selectedImageIndex >= getVariantImageStartIndex() && (
                                        <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                                            {selectedVariant.variantName}
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Navigation Arrows */}
                            {allImages.length > 1 && (
                                <>
                                    <button
                                        onClick={handlePrevImage}
                                        className="absolute -left-16 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition"
                                        aria-label="Previous image"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={handleNextImage}
                                        className="absolute -right-16 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition"
                                        aria-label="Next image"
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Promotion Info - Separate Section */}
                    {hasActivePromotion && product.promotion && (
                        <Card className="bg-orange-500 text-white border-2 border-orange-500 shadow-md py-4">
                            <CardContent className="p-0">
                                <div className="flex items-center justify-between px-8">
                                    <div>
                                        <h3 className="font-bold text-lg">{product.promotion.name}</h3>
                                        <p className="text-sm">
                                            {locale === "id" ? "Berlaku hingga" : "Valid until"}{" "}
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
                    )}

                    {/* Community Gallery */}
                    {product.gallery && product.gallery.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold mb-4">{t.productDetail.communityGallery}</h2>
                            <div className="overflow-x-auto pb-2">
                                <div className="flex gap-4 min-w-max">
                                    {product.gallery.map((image) => (
                                        <div
                                            key={image.id}
                                            className="relative w-[200px] sm:w-[240px] md:w-[280px] aspect-square rounded-lg overflow-hidden bg-gray-100 group cursor-pointer flex-shrink-0"
                                        >
                                            <Image
                                                src={image.imageUrl}
                                                alt={image.caption || "Community photo"}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="text-white font-semibold text-sm">{t.productDetail.communityGallery}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Product Details Accordion */}
                    <Accordion type="single" collapsible defaultValue="description" className="w-full">
                        {/* Description */}
                        <AccordionItem value="description">
                            <AccordionTrigger className="text-xl font-bold">
                                {t.productDetail.description}
                            </AccordionTrigger>
                            <AccordionContent>
                                <div
                                    className="prose max-w-none"
                                    dangerouslySetInnerHTML={{
                                        __html: locale === "id" ? product.idDescription : product.enDescription,
                                    }}
                                />
                            </AccordionContent>
                        </AccordionItem>

                        {/* Reviews */}
                        <AccordionItem value="reviews">
                            <AccordionTrigger className="text-xl font-bold">
                                {t.productDetail.reviews}{" "}
                                {product.reviews && product.reviews.length > 0 && `(${product.reviews.length})`}
                            </AccordionTrigger>
                            <AccordionContent>
                                {product.reviews && product.reviews.length > 0 ? (
                                    <div className="space-y-6">
                                        {/* Rating Summary */}
                                        <div className="flex items-center gap-8 pb-6 border-b">
                                            <div className="text-center">
                                                <div className="text-5xl font-bold mb-2">{product.avgRating.toFixed(1)}</div>
                                                <div className="flex items-center justify-center gap-1 mb-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className={cn(
                                                                "w-5 h-5",
                                                                star <= product.avgRating
                                                                    ? "fill-yellow-400 text-yellow-400"
                                                                    : "text-gray-300"
                                                            )}
                                                        />
                                                    ))}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    {t.productDetail.reviewsCount.replace("{count}", product.reviews.length.toString())}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Review List */}
                                        <div className="space-y-4">
                                            {(product.reviews as Review[]).map((review) => (
                                                <div key={review.id} className="border-b pb-4 last:border-0">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <p className="font-semibold">{review.user?.name || "Anonymous"}</p>
                                                            <div className="flex items-center gap-1">
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <Star
                                                                        key={star}
                                                                        className={cn(
                                                                            "w-4 h-4",
                                                                            star <= review.rating
                                                                                ? "fill-yellow-400 text-yellow-400"
                                                                                : "text-gray-300"
                                                                        )}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <span className="text-sm text-gray-500">
                                                            {new Date(review.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-700">{review.comment}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <EmptyState
                                        title={t.productDetail.noReviewsYet}
                                        description={t.productDetail.beFirstToReview}
                                    />
                                )}
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>

                {/* RIGHT COLUMN: Sticky Product Info Card (40% = 3 cols) */}
                <div className="lg:col-span-3">
                    <Card className="sticky top-24">
                        <CardContent className="px-6 space-y-4">
                            {/* Tags & Category */}
                            <div className="flex items-center gap-2 flex-wrap">
                                {product.category && (
                                    <Badge variant="secondary">{product.category.name}</Badge>
                                )}
                                {product.tags?.map((tag) => (
                                    <Badge key={tag.id} variant="outline">
                                        {tag.name}
                                    </Badge>
                                ))}
                            </div>

                            {/* Product Name */}
                            <h1 className="text-2xl font-bold uppercase text-primary">{product.name}</h1>

                            {/* Price */}
                            <div className="space-y-1">
                                <div className="flex items-baseline gap-3">
                                    <span className="text-2xl font-bold text-orange-500">
                                        {formatCurrency(finalPrice, locale === "id" ? "IDR" : "USD")}
                                    </span>
                                    {hasActivePromotion && (
                                        <span className="text-md text-gray-500 line-through">
                                            {formatCurrency(basePrice!, locale === "id" ? "IDR" : "USD")}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Stock Info */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">{t.productDetail.stock}:</span>
                                    <span className="font-semibold">{selectedVariant?.stock || 0}</span>
                                </div>
                                {stockWarning && (
                                    <Badge variant="destructive">
                                        {t.productDetail.onlyLeftInStock.replace("{count}", selectedVariant?.stock.toString() || "0")}
                                    </Badge>
                                )}
                            </div>

                            {/* Variant Selection */}
                            {product.variants && product.variants.length > 0 && (
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold block">
                                        {t.productDetail.chooseColor}:{" "}
                                        <span className="font-normal text-gray-600">{selectedVariant?.variantName}</span>
                                    </label>
                                    <div className="flex gap-3 flex-wrap">
                                        {product.variants
                                            .filter((v) => v.isActive)
                                            .map((variant) => (
                                                <button
                                                    key={variant.id}
                                                    onClick={() => handleVariantSelect(variant)}
                                                    className={cn(
                                                        "w-8 h-8 rounded-full border-2 transition-all",
                                                        selectedVariant?.id === variant.id
                                                            ? "border-primary ring-2 ring-primary ring-offset-2"
                                                            : "border-gray-300 hover:border-gray-400"
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
                                <div className="flex items-center border rounded-lg w-fit">
                                    <button
                                        onClick={() => handleQuantityChange(-1)}
                                        disabled={quantity <= 1}
                                        className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                        aria-label="Decrease quantity"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="px-6 font-semibold min-w-[3rem] text-center">{quantity}</span>
                                    <button
                                        onClick={() => handleQuantityChange(1)}
                                        disabled={quantity >= (selectedVariant?.stock || 0)}
                                        className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                        aria-label="Increase quantity"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Subtotal */}
                            <div className="border-t pt-4 space-y-8">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">{t.productDetail.subtotal}</span>
                                    <span className="text-2xl font-bold">
                                        {formatCurrency(finalPrice * quantity, locale === "id" ? "IDR" : "USD")}
                                    </span>
                                </div>

                                {/* Add to Cart Button */}
                                <Button
                                    onClick={handleAddToCart}
                                    size="lg"
                                    className="w-full"
                                    disabled={!selectedVariant || selectedVariant.stock === 0 || cartLoading}
                                >
                                    <ShoppingCart className="w-5 h-5 mr-2" />
                                    {cartLoading ? t.common.loading : t.productDetail.addToCart}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold mb-6">{t.productDetail.youMayAlsoLike}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {relatedProducts.map((relatedProduct) => (
                            <ProductCard key={relatedProduct.id} product={relatedProduct} />
                        ))}
                    </div>
                </div>
            )}

            {/* Custom Scrollbar Styles */}
            <style jsx global>{`
                .scrollbar-thin::-webkit-scrollbar {
                    width: 6px;
                }
                .scrollbar-thin::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb {
                    background: #888;
                    border-radius: 10px;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb:hover {
                    background: #555;
                }
            `}</style>
        </div>
    );
}
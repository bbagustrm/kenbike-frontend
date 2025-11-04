export interface Product {
    id: string;
    name: string;
    slug: string;
    idDescription: string;
    enDescription: string;
    idPrice: number;
    enPrice: number;
    imageUrl: string | null;
    images?: ProductImage[];
    gallery?: GalleryImage[];
    totalSold: number;
    totalView: number;
    avgRating: number;
    weight: number;
    height: number;
    length: number;
    width: number;
    taxRate: number;
    isFeatured: boolean;
    isActive: boolean;
    isPreOrder: boolean;
    preOrderDays: number;
    categoryId: string | null;
    promotionId: string | null;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;

    // Relations
    category?: ProductCategory;
    promotion?: ProductPromotion;
    tags?: ProductTag[];
    variants?: ProductVariant[];
    reviews?: ProductReview[];
}

export interface GalleryImage {
    id: string;
    productId: string;
    imageUrl: string;
    caption?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface GalleryImageInput {
    id?: string;
    imageUrl: string;
    caption?: string;
    _action?: 'create' | 'update' | 'delete';
}

// Product List Item (lighter version for list views)
export interface ProductListItem {
    id: string;
    name: string;
    slug: string;
    idPrice: number;
    enPrice: number;
    imageUrl: string | null;
    images?: ProductImage[];
    totalSold: number;
    totalView: number;
    avgRating: number;
    isFeatured: boolean;
    isPreOrder: boolean;
    isActive?: boolean;
    deletedAt?: string | null;
    category?: ProductCategory;
    promotion?: ProductPromotion;
    tags?: ProductTag[];
    variants?: Pick<ProductVariant, 'id' | 'variantName' | 'sku' | 'stock' | 'isActive'>[];
    createdAt: string;
    updatedAt: string;
}

export interface ProductImage {
    id: string;
    productId: string;
    imageUrl: string;
    order: number;
}

// Product Category
export interface ProductCategory {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
}

// Product Promotion
export interface ProductPromotion {
    id: string;
    name: string;
    discount: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
}

// Product Tag
export interface ProductTag {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
}

// Product Variant
export interface ProductVariant {
    id: string;
    productId: string;
    variantName: string;
    sku: string;
    stock: number;
    isActive: boolean;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
    images: ProductVariantImage[];
}

// Product Variant Image
export interface ProductVariantImage {
    id: string;
    variantId: string;
    imageUrl: string;
    createdAt: string;
}

// Product Review
export interface ProductReview {
    id: string;
    productId: string;
    userId: string;
    rating: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
    user?: {
        id: string;
        username: string;
        firstName: string;
        lastName: string;
        profileImage?: string;
    };
    images?: ProductReviewImage[];
}

// Product Review Image
export interface ProductReviewImage {
    id: string;
    reviewId: string;
    imageUrl: string;
    createdAt: string;
}

// DTOs for API requests
export interface CreateProductData {
    name: string;
    slug: string;
    idDescription: string;
    enDescription: string;
    idPrice: number;
    enPrice: number;
    imageUrls: string[];
    weight: number;
    height: number;
    length: number;
    width: number;
    taxRate?: number;
    categoryId?: string;
    promotionId?: string;
    isFeatured?: boolean;
    isPreOrder?: boolean;
    preOrderDays?: number;
    variants: CreateVariantData[];
    tagIds?: string[];
    galleryImages?: GalleryImageInput[];
}

export interface CreateVariantData {
    variantName: string;
    sku: string;
    stock: number;
    isActive?: boolean;
    imageUrls: string[];
}

export interface UpdateProductData {
    name?: string;
    slug?: string;
    idDescription?: string;
    enDescription?: string;
    idPrice?: number;
    enPrice?: number;
    imageUrls?: string[];
    weight?: number;
    height?: number;
    length?: number;
    width?: number;
    taxRate?: number;
    categoryId?: string | null;
    promotionId?: string | null;
    isFeatured?: boolean;
    isActive?: boolean;
    isPreOrder?: boolean;
    preOrderDays?: number;
    variants?: UpdateVariantData[];
    tagIds?: string[];
    galleryImages?: GalleryImageInput[];
}

export interface UpdateVariantData {
    id?: string;
    variantName?: string;
    sku?: string;
    stock?: number;
    isActive?: boolean;
    imageUrls?: string[];
    _action?: 'update' | 'delete';
}

// Query parameters for fetching products
export interface GetProductsParams {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    categorySlug?: string;
    tagId?: string;
    tagSlug?: string;
    minPrice?: number;
    maxPrice?: number;
    isFeatured?: boolean;
    isPreOrder?: boolean;
    hasPromotion?: boolean;
    sortBy?: 'name' | 'idPrice' | 'enPrice' | 'totalSold' | 'totalView' | 'avgRating' | 'createdAt';
    order?: 'asc' | 'desc';
    includeDeleted?: boolean;
    onlyDeleted?: boolean;
    isActive?: boolean;
}

// API Response types
export interface ProductsResponse {
    data: ProductListItem[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

export interface ProductResponse {
    data: Product;
}

export interface ProductActionResponse {
    message: string;
    data: {
        id: string;
        [key: string]: unknown;
    };
}

export interface BulkActionResponse {
    message: string;
    data: {
        count: number;
    };
}
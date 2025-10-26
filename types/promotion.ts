// Base Promotion Interface
export interface Promotion {
    id: string;
    name: string;
    discount: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
    productCount?: number;
}

// Promotion with Products
export interface PromotionDetail extends Promotion {
    products?: Array<{
        id: string;
        name: string;
        slug: string;
        idPrice: number;
        enPrice: number;
        imageUrl: string;
    }>;
}

// DTOs for API requests
export interface CreatePromotionData {
    name: string;
    discount: number;
    startDate: string;
    endDate: string;
    isActive?: boolean;
}

export interface UpdatePromotionData {
    name?: string;
    discount?: number;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
}

// Query parameters
export interface GetPromotionsParams {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    includeExpired?: boolean;
    includeDeleted?: boolean;
    sortBy?: 'name' | 'discount' | 'startDate' | 'endDate' | 'createdAt';
    order?: 'asc' | 'desc';
}

// API Response types
export interface PromotionsResponse {
    data: Promotion[];
    meta?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

export interface PromotionResponse {
    data: Promotion;
}

export interface PromotionDetailResponse {
    data: PromotionDetail;
}

export interface PromotionActionResponse {
    message: string;
    data: {
        id: string;
        [key: string]: any;
    };
}

export interface PromotionStatistics {
    id: string;
    name: string;
    discount: number;
    startDate: string;
    endDate: string;
    totalProducts: number;
    totalRevenue: number;
    totalSales: number;
    avgDiscount: number;
    topProducts: Array<{
        id: string;
        name: string;
        slug: string;
        totalSold: number;
        revenue: number;
        discountedPrice: number;
    }>;
}

export interface AssignProductResponse {
    message: string;
    data: {
        productId: string;
        promotionId: string;
        productName: string;
        promotionName: string;
        discount: number;
    };
}
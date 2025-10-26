// Base Category Interface
export interface Category {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
    productCount?: number;
}

// DTOs for API requests
export interface CreateCategoryData {
    name: string;
    slug: string;
}

export interface UpdateCategoryData {
    name?: string;
    slug?: string;
    isActive?: boolean;
}

// Query parameters
export interface GetCategoriesParams {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    sortBy?: 'name' | 'productCount' | 'createdAt';
    order?: 'asc' | 'desc';
    includeDeleted?: boolean;
}

// API Response types
export interface CategoriesResponse {
    data: Category[];
    meta?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

export interface CategoryResponse {
    data: Category;
}

export interface CategoryActionResponse {
    message: string;
    data: {
        id: string;
        [key: string]: any;
    };
}

export interface BulkCategoryActionResponse {
    message: string;
    data: {
        count: number;
    };
}

export interface CategoryStatistics {
    id: string;
    name: string;
    slug: string;
    totalProducts: number;
    activeProducts: number;
    inactiveProducts: number;
    totalRevenue: number;
    avgProductPrice: number;
    topProducts: Array<{
        id: string;
        name: string;
        slug: string;
        totalSold: number;
        revenue: number;
    }>;
}
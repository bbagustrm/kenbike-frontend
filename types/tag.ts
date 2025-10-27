// Base Tag Interface
export interface Tag {
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
export interface CreateTagData {
    name: string;
    slug: string;
}

export interface UpdateTagData {
    name?: string;
    slug?: string;
    isActive?: boolean;
}

// Query parameters
export interface GetTagsParams {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    sortBy?: 'name' | 'productCount' | 'createdAt';
    order?: 'asc' | 'desc';
    includeDeleted?: boolean;
}

// API Response types
export interface TagsResponse {
    data: Tag[];
    meta?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

export interface TagResponse {
    data: Tag;
}

export interface TagActionResponse {
    message: string;
    data: {
        id: string;
        [key: string]: unknown;
    };
}

export interface BulkTagActionResponse {
    message: string;
    data: {
        count: number;
    };
}

export interface TagStatistics {
    id: string;
    name: string;
    slug: string;
    totalProducts: number;
    activeProducts: number;
    inactiveProducts: number;
    topProducts: Array<{
        id: string;
        name: string;
        slug: string;
        totalSold: number;
    }>;
}
// types/review.ts

// Review User Info (Public - for product detail page)
export interface ReviewUser {
    id: string;
    username: string;
    name: string;
    profileImage: string | null;
    role?: 'USER' | 'ADMIN' | 'OWNER';
}

// Review Reply (Admin response)
export interface ReviewReply {
    id: string;
    content: string;
    user: ReviewUser;
    createdAt: string;
}

// Single Review Item (Public)
export interface Review {
    id: string;
    rating: number;
    comment: string | null;
    isVerified: boolean;
    user: ReviewUser;
    replies: ReviewReply[];
    images: ReviewImage[];
    createdAt: string;
    updatedAt: string;
}

// Review Image
export interface ReviewImage {
    id: string;
    imageUrl: string;
}

// Rating Distribution
export interface RatingDistribution {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
}

// Review Summary (for product page)
export interface ReviewSummary {
    avgRating: number;
    totalReviews: number;
    distribution: RatingDistribution;
}

// Pending Review Item (orders eligible for review)
export interface PendingReviewItem {
    orderId: string;
    orderNumber: string;
    completedAt: string | null;
    product: {
        id: string;
        name: string;
        slug: string;
        imageUrl: string | null;
    };
}

// ==========================================
// DTOs
// ==========================================

export interface CreateReviewData {
    productId: string;
    orderId: string;
    rating: number;
    comment?: string;
}

export interface UpdateReviewData {
    rating?: number;
    comment?: string;
}

export interface QueryReviewsParams {
    page?: number;
    limit?: number;
    rating?: number;
    sortBy?: 'createdAt' | 'rating';
    order?: 'asc' | 'desc';
}

// ==========================================
// API Responses
// ==========================================

export interface ProductReviewsResponse {
    summary: ReviewSummary;
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
    data: Review[];
}

export interface ReviewResponse {
    message?: string;
    data: Review;
}

export interface PendingReviewsResponse {
    data: PendingReviewItem[];
}

export interface ReviewActionResponse {
    message: string;
}

// ==========================================
// Admin Types
// ==========================================

// Admin Review User (different structure from public)
export interface AdminReviewUser {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
}

// Admin Reply User
export interface AdminReplyUser {
    id: string;
    username: string;
    role: 'USER' | 'ADMIN' | 'OWNER';
}

// Admin Review Reply
export interface AdminReviewReply {
    id: string;
    content: string;
    user: AdminReplyUser;
    createdAt: string;
}

// Admin Review (separate type, not extending Review)
export interface AdminReview {
    id: string;
    rating: number;
    comment: string | null;
    isVerified: boolean;
    user: AdminReviewUser;
    product: {
        id: string;
        name: string;
        slug: string;
    };
    order: {
        id: string;
        orderNumber: string;
    };
    replies: AdminReviewReply[];
    images: ReviewImage[];
    _count: {
        replies: number;
    };
    createdAt: string;
    updatedAt: string;
}

export interface AdminReviewsResponse {
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
    data: AdminReview[];
}
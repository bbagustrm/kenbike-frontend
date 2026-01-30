// types/discussion.ts

// Discussion User Info
export interface DiscussionUser {
    id: string;
    username: string;
    name: string;
    profileImage: string | null;
    role: 'USER' | 'ADMIN' | 'OWNER';
    isAdmin: boolean;
}

// Discussion Reply
export interface DiscussionReply {
    id: string;
    content: string;
    user: DiscussionUser;
    likesCount: number;
    isLiked: boolean;
    createdAt: string;
    updatedAt: string;
}

// Single Discussion Item (Q&A)
export interface Discussion {
    id: string;
    question: string;
    user: DiscussionUser;
    likesCount: number;
    repliesCount: number;
    isLiked: boolean;
    replies: DiscussionReply[];
    createdAt: string;
    updatedAt: string;
}

// Discussion with Product (for user's questions page)
export interface DiscussionWithProduct extends Discussion {
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

export interface CreateDiscussionData {
    productId: string;
    question: string;
}

export interface UpdateDiscussionData {
    question: string;
}

export interface CreateDiscussionReplyData {
    content: string;
}

export interface UpdateDiscussionReplyData {
    content: string;
}

export interface QueryDiscussionsParams {
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'likesCount';
    order?: 'asc' | 'desc';
}

// ==========================================
// API Responses
// ==========================================

export interface ProductDiscussionsResponse {
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
    data: Discussion[];
}

export interface DiscussionResponse {
    message?: string;
    data: Discussion;
}

export interface DiscussionReplyResponse {
    message?: string;
    data: DiscussionReply;
}

export interface LikeResponse {
    message: string;
    data: {
        isLiked: boolean;
        likesCount: number;
    };
}

export interface DiscussionActionResponse {
    message: string;
}

// User's Discussions Response
export interface UserDiscussionsResponse {
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
    data: DiscussionWithProduct[];
}

// Admin Types
export interface AdminDiscussion {
    id: string;
    question: string;
    user: {
        id: string;
        username: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    product: {
        id: string;
        name: string;
        slug: string;
    };
    likesCount: number;
    repliesCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface AdminDiscussionsResponse {
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
    data: AdminDiscussion[];
}
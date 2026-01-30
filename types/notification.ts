// types/notification.ts

export type NotificationType =
    | 'ORDER_PAID'
    | 'ORDER_PROCESSING'
    | 'ORDER_SHIPPED'
    | 'ORDER_DELIVERED'
    | 'ORDER_COMPLETED'
    | 'ORDER_CANCELLED'
    | 'ORDER_FAILED'
    | 'REVIEW_REPLY'
    | 'DISCUSSION_REPLY'
    | 'PROMOTION_START'
    | 'PROMOTION_ENDING'
    | 'STOCK_LOW'
    | 'STOCK_AVAILABLE'
    | 'SYSTEM';

export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    // ✅ FIX: Match backend response (single title/message, not bilingual)
    title: string;
    message: string;
    data: Record<string, unknown> | null;
    imageUrl: string | null;
    actionUrl: string | null;
    isRead: boolean;
    readAt: string | null;
    createdAt: string;
    updatedAt?: string;
}

// ==========================================
// API Responses
// ==========================================

export interface NotificationsResponse {
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
    data: Notification[];
}

export interface UnreadCountResponse {
    data: {
        unreadCount: number;
    };
}

export interface MarkAsReadResponse {
    message: string;
    data: {
        count: number;
    };
}

export interface NotificationActionResponse {
    message: string;
}

// ==========================================
// DTOs
// ==========================================

export interface QueryNotificationsParams {
    page?: number;
    limit?: number;
    isRead?: boolean;
    type?: NotificationType;
}

export interface MarkAsReadData {
    notificationIds: string[];
}

// ==========================================
// Notification Icon/Color Mapping
// ==========================================

export const notificationConfig: Record<NotificationType, {
    icon: string;
    color: string;
    bgColor: string;
}> = {
    ORDER_PAID: {
        icon: 'CreditCard',
        color: 'text-green-600',
        bgColor: 'bg-green-50 dark:bg-green-950',
    },
    ORDER_PROCESSING: {
        icon: 'Package',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    ORDER_SHIPPED: {
        icon: 'Truck',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50 dark:bg-indigo-950',
    },
    ORDER_DELIVERED: {
        icon: 'PackageCheck',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
    ORDER_COMPLETED: {
        icon: 'CheckCircle',
        color: 'text-green-600',
        bgColor: 'bg-green-50 dark:bg-green-950',
    },
    ORDER_CANCELLED: {
        icon: 'XCircle',
        color: 'text-red-600',
        bgColor: 'bg-red-50 dark:bg-red-950',
    },
    ORDER_FAILED: {
        icon: 'AlertCircle',
        color: 'text-red-600',
        bgColor: 'bg-red-50 dark:bg-red-950',
    },
    REVIEW_REPLY: {
        icon: 'MessageSquare',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50 dark:bg-orange-950',
    },
    DISCUSSION_REPLY: {
        icon: 'MessageCircle',
        color: 'text-cyan-600',
        bgColor: 'bg-cyan-50 dark:bg-cyan-950',
    },
    PROMOTION_START: {
        icon: 'Percent',
        color: 'text-pink-600',
        bgColor: 'bg-pink-50 dark:bg-pink-950',
    },
    PROMOTION_ENDING: {
        icon: 'Clock',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    },
    STOCK_LOW: {
        icon: 'AlertCircle',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50 dark:bg-orange-950',
    },
    STOCK_AVAILABLE: {
        icon: 'CheckCircle',
        color: 'text-green-600',
        bgColor: 'bg-green-50 dark:bg-green-950',
    },
    SYSTEM: {
        icon: 'Bell',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50 dark:bg-gray-950',
    },
};
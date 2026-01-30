// services/notification.service.ts
import apiClient from "@/lib/api-client";
import {
    NotificationsResponse,
    UnreadCountResponse,
    MarkAsReadResponse,
    NotificationActionResponse,
    QueryNotificationsParams,
    MarkAsReadData,
    Notification,
} from "@/types/notification";

export class NotificationService {
    /**
     * Get user's notifications with pagination
     */
    static async getNotifications(
        params?: QueryNotificationsParams,
        signal?: AbortSignal
    ): Promise<NotificationsResponse> {
        const response = await apiClient.get<NotificationsResponse>(
            "/notifications",
            { params, signal }
        );
        return response.data;
    }

    /**
     * Get a single notification by ID
     */
    static async getNotification(id: string): Promise<{ data: Notification }> {
        const response = await apiClient.get<{ data: Notification }>(
            `/notifications/${id}`
        );
        return response.data;
    }

    /**
     * Get unread notification count
     */
    static async getUnreadCount(signal?: AbortSignal): Promise<UnreadCountResponse> {
        const response = await apiClient.get<UnreadCountResponse>(
            "/notifications/unread-count",
            { signal }
        );
        return response.data;
    }

    /**
     * Mark specific notifications as read
     * ✅ FIX: Changed from PATCH to POST
     */
    static async markAsRead(data: MarkAsReadData): Promise<MarkAsReadResponse> {
        const response = await apiClient.post<MarkAsReadResponse>(
            "/notifications/mark-read",
            data
        );
        return response.data;
    }

    /**
     * Mark all notifications as read
     * ✅ FIX: Changed from PATCH to POST
     */
    static async markAllAsRead(): Promise<MarkAsReadResponse> {
        const response = await apiClient.post<MarkAsReadResponse>(
            "/notifications/mark-all-read"
        );
        return response.data;
    }

    /**
     * Delete a notification
     */
    static async deleteNotification(
        notificationId: string
    ): Promise<NotificationActionResponse> {
        const response = await apiClient.delete<NotificationActionResponse>(
            `/notifications/${notificationId}`
        );
        return response.data;
    }

    /**
     * Delete all read notifications
     * ✅ FIX: Changed from /notifications/read to /notifications/read/all
     */
    static async deleteAllRead(): Promise<MarkAsReadResponse> {
        const response = await apiClient.delete<MarkAsReadResponse>(
            "/notifications/read/all"
        );
        return response.data;
    }
}
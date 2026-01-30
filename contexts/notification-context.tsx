// contexts/notification-context.tsx
"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    ReactNode,
    useRef,
} from "react";
import { useAuth } from "@/contexts/auth-context";
import { NotificationService } from "@/services/notification.service";
import { Notification } from "@/types/notification";
import { handleApiError } from "@/lib/api-client";

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    hasMore: boolean;
    page: number;
    // Actions
    fetchNotifications: (reset?: boolean) => Promise<void>;
    fetchUnreadCount: () => Promise<void>;
    markAsRead: (notificationIds: string[]) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (notificationId: string) => Promise<void>;
    loadMore: () => Promise<void>;
    refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
    undefined
);

// Polling interval: 30 seconds
const POLLING_INTERVAL = 30 * 1000;

export function NotificationProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated, user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);

    const pollingRef = useRef<NodeJS.Timeout | null>(null);
    const isVisibleRef = useRef(true);
    const lastFetchRef = useRef<number>(0);

    // Fetch unread count only (lightweight)
    const fetchUnreadCount = useCallback(async () => {
        if (!isAuthenticated) return;

        try {
            const response = await NotificationService.getUnreadCount();
            setUnreadCount(response.data.unreadCount);
        } catch (error) {
            console.error("Failed to fetch unread count:", error);
        }
    }, [isAuthenticated]);

    // Fetch notifications with pagination
    const fetchNotifications = useCallback(async (reset: boolean = false) => {
        if (!isAuthenticated) return;

        const targetPage = reset ? 1 : page;
        setIsLoading(true);

        try {
            const response = await NotificationService.getNotifications({
                page: targetPage,
                limit: 20,
            });

            if (reset) {
                setNotifications(response.data);
                setPage(1);
            } else {
                setNotifications((prev) => [...prev, ...response.data]);
            }

            setHasMore(response.meta.hasNextPage);
            setUnreadCount(
                response.data.filter((n) => !n.isRead).length +
                (reset ? 0 : unreadCount - notifications.filter((n) => !n.isRead).length)
            );

            lastFetchRef.current = Date.now();
        } catch (error) {
            const apiError = handleApiError(error);
            console.error("Failed to fetch notifications:", apiError.message);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, page, notifications, unreadCount]);

    // Load more (pagination)
    const loadMore = useCallback(async () => {
        if (!hasMore || isLoading) return;
        setPage((prev) => prev + 1);
    }, [hasMore, isLoading]);

    // Refresh all
    const refresh = useCallback(async () => {
        await fetchNotifications(true);
        await fetchUnreadCount();
    }, [fetchNotifications, fetchUnreadCount]);

    // Mark specific notifications as read
    const markAsRead = useCallback(async (notificationIds: string[]) => {
        if (notificationIds.length === 0) return;

        try {
            await NotificationService.markAsRead({ notificationIds });

            // Update local state
            setNotifications((prev) =>
                prev.map((n) =>
                    notificationIds.includes(n.id)
                        ? { ...n, isRead: true, readAt: new Date().toISOString() }
                        : n
                )
            );

            // Update unread count
            setUnreadCount((prev) => Math.max(0, prev - notificationIds.length));
        } catch (error) {
            console.error("Failed to mark as read:", error);
            throw error;
        }
    }, []);

    // Mark all as read
    const markAllAsRead = useCallback(async () => {
        try {
            await NotificationService.markAllAsRead();

            // Update local state
            setNotifications((prev) =>
                prev.map((n) => ({
                    ...n,
                    isRead: true,
                    readAt: n.readAt || new Date().toISOString(),
                }))
            );

            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all as read:", error);
            throw error;
        }
    }, []);

    // Delete notification
    const deleteNotification = useCallback(async (notificationId: string) => {
        try {
            await NotificationService.deleteNotification(notificationId);

            // Update local state
            const deletedNotification = notifications.find((n) => n.id === notificationId);
            setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

            // Update unread count if deleted notification was unread
            if (deletedNotification && !deletedNotification.isRead) {
                setUnreadCount((prev) => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error("Failed to delete notification:", error);
            throw error;
        }
    }, [notifications]);

    // Smart Polling: Only poll when tab is visible
    useEffect(() => {
        const handleVisibilityChange = () => {
            isVisibleRef.current = !document.hidden;

            if (!document.hidden && isAuthenticated) {
                // Resume polling when tab becomes visible
                // Also fetch immediately if more than 30 seconds since last fetch
                const timeSinceLastFetch = Date.now() - lastFetchRef.current;
                if (timeSinceLastFetch > POLLING_INTERVAL) {
                    fetchUnreadCount();
                }
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [isAuthenticated, fetchUnreadCount]);

    // Start/Stop polling based on auth state
    useEffect(() => {
        if (!isAuthenticated) {
            // Clear notifications when logged out
            setNotifications([]);
            setUnreadCount(0);
            setPage(1);

            // Stop polling
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
            }
            return;
        }

        // Initial fetch
        fetchUnreadCount();
        fetchNotifications(true);

        // Start polling
        pollingRef.current = setInterval(() => {
            if (isVisibleRef.current) {
                fetchUnreadCount();
            }
        }, POLLING_INTERVAL);

        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
            }
        };
    }, [isAuthenticated, user?.id]); // Re-run when user changes

    // Fetch more when page changes (pagination)
    useEffect(() => {
        if (page > 1) {
            fetchNotifications(false);
        }
    }, [page]);

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                isLoading,
                hasMore,
                page,
                fetchNotifications,
                fetchUnreadCount,
                markAsRead,
                markAllAsRead,
                deleteNotification,
                loadMore,
                refresh,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error(
            "useNotifications must be used within a NotificationProvider"
        );
    }
    return context;
}
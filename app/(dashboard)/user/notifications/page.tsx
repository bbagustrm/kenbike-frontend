// app/(dashboard)/user/notifications/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/contexts/notification-context";
import { useTranslation } from "@/hooks/use-translation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Bell,
    Check,
    CheckCheck,
    Trash2,
    RefreshCw,
    Loader2,
    CreditCard,
    Package,
    Truck,
    PackageCheck,
    CheckCircle,
    XCircle,
    AlertCircle,
    MessageSquare,
    MessageCircle,
    Percent,
    Clock,
    Filter,
    Inbox,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Notification, NotificationType, notificationConfig } from "@/types/notification";

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    CreditCard,
    Package,
    Truck,
    PackageCheck,
    CheckCircle,
    XCircle,
    AlertCircle,
    MessageSquare,
    MessageCircle,
    Percent,
    Clock,
    Bell,
};

type FilterType = "all" | "unread" | "read";
type TypeFilter = "all" | NotificationType;

export default function UserNotificationsPage() {
    const router = useRouter();
    const { t, locale } = useTranslation();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const {
        notifications,
        unreadCount,
        isLoading,
        hasMore,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        loadMore,
        refresh,
    } = useNotifications();

    const [filter, setFilter] = useState<FilterType>("all");
    const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isDeletingAll, setIsDeletingAll] = useState(false);

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login?redirect=/user/notifications");
        }
    }, [authLoading, isAuthenticated, router]);

    // Filter notifications
    const filteredNotifications = notifications.filter((notification) => {
        // Filter by read status
        if (filter === "unread" && notification.isRead) return false;
        if (filter === "read" && !notification.isRead) return false;

        // Filter by type
        if (typeFilter !== "all" && notification.type !== typeFilter) return false;

        return true;
    });

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await refresh();
            toast.success(t.notifications?.refreshed || "Notifications refreshed");
        } catch (error) {
            toast.error(t.common?.error || "Failed to refresh");
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            await markAsRead([id]);
        } catch (error) {
            toast.error(t.notifications?.markAsReadError || "Failed to mark as read");
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            toast.success(t.notifications?.allMarkedAsRead || "All notifications marked as read");
        } catch (error) {
            toast.error(t.notifications?.markAllError || "Failed to mark all as read");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteNotification(id);
            toast.success(t.notifications?.deleted || "Notification deleted");
        } catch (error) {
            toast.error(t.notifications?.deleteError || "Failed to delete");
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        // Mark as read
        if (!notification.isRead) {
            await markAsRead([notification.id]);
        }

        // Navigate to action URL
        if (notification.actionUrl) {
            router.push(notification.actionUrl);
        }
    };

    const getLocalizedContent = (notification: Notification) => ({
        title: notification.title,
        message: notification.message,
    });

    if (authLoading) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="space-y-4">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 px-4 max-w-4xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Bell className="h-6 w-6" />
                        {t.notifications?.title || "Notifications"}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {unreadCount > 0
                            ? `${unreadCount} ${t.notifications?.unreadNotifications || "unread notifications"}`
                            : t.notifications?.allCaughtUp || "You're all caught up!"}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                    >
                        <RefreshCw
                            className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")}
                        />
                        {t.common?.refresh || "Refresh"}
                    </Button>
                    {unreadCount > 0 && (
                        <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                            <CheckCheck className="h-4 w-4 mr-2" />
                            {t.notifications?.markAllRead || "Mark all read"}
                        </Button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardContent className="py-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Read status filter */}
                        <Tabs
                            value={filter}
                            onValueChange={(v) => setFilter(v as FilterType)}
                            className="w-full sm:w-auto"
                        >
                            <TabsList className="grid w-full grid-cols-3 sm:w-auto">
                                <TabsTrigger value="all">
                                    {t.notifications?.filterAll || "All"}
                                </TabsTrigger>
                                <TabsTrigger value="unread">
                                    {t.notifications?.filterUnread || "Unread"}
                                    {unreadCount > 0 && (
                                        <Badge variant="destructive" className="ml-2 h-5 px-1.5">
                                            {unreadCount}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="read">
                                    {t.notifications?.filterRead || "Read"}
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>

                        {/* Type filter */}
                        <Select
                            value={typeFilter}
                            onValueChange={(v) => setTypeFilter(v as TypeFilter)}
                        >
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder={t.notifications?.filterByType || "Filter by type"} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    {t.notifications?.allTypes || "All types"}
                                </SelectItem>
                                <SelectItem value="ORDER_PAID">Order Paid</SelectItem>
                                <SelectItem value="ORDER_PROCESSING">Order Processing</SelectItem>
                                <SelectItem value="ORDER_SHIPPED">Order Shipped</SelectItem>
                                <SelectItem value="ORDER_DELIVERED">Order Delivered</SelectItem>
                                <SelectItem value="ORDER_COMPLETED">Order Completed</SelectItem>
                                <SelectItem value="ORDER_CANCELLED">Order Cancelled</SelectItem>
                                <SelectItem value="REVIEW_REPLY">Review Reply</SelectItem>
                                <SelectItem value="DISCUSSION_REPLY">Discussion Reply</SelectItem>
                                <SelectItem value="PROMOTION_START">Promotion</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Notifications List */}
            <Card>
                <CardContent className="p-0">
                    {isLoading && notifications.length === 0 ? (
                        <div className="p-4 space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex gap-4 p-4">
                                    <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-3 w-full" />
                                        <Skeleton className="h-3 w-1/4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="p-12 text-center">
                            <Inbox className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">
                                {t.notifications?.noNotifications || "No notifications"}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {filter === "unread"
                                    ? t.notifications?.noUnread || "No unread notifications"
                                    : filter === "read"
                                        ? t.notifications?.noRead || "No read notifications"
                                        : t.notifications?.empty || "No notifications yet"}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {filteredNotifications.map((notification) => {
                                const config = notificationConfig[notification.type];
                                const IconComponent = iconMap[config?.icon || "Bell"] || Bell;
                                const { title, message } = getLocalizedContent(notification);

                                return (
                                    <div
                                        key={notification.id}
                                        className={cn(
                                            "p-4 cursor-pointer transition-colors relative group",
                                            notification.isRead
                                                ? "hover:bg-muted/50"
                                                : cn(config?.bgColor, "hover:opacity-90")
                                        )}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className="flex gap-4">
                                            {/* Icon */}
                                            <div
                                                className={cn(
                                                    "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-sm",
                                                    notification.isRead
                                                        ? "bg-muted"
                                                        : "bg-white dark:bg-gray-800"
                                                )}
                                            >
                                                <IconComponent
                                                    className={cn(
                                                        "h-6 w-6",
                                                        config?.color || "text-gray-600"
                                                    )}
                                                />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p
                                                        className={cn(
                                                            "text-sm",
                                                            !notification.isRead
                                                                ? "font-semibold"
                                                                : "font-medium"
                                                        )}
                                                    >
                                                        {title}
                                                    </p>
                                                    {!notification.isRead && (
                                                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-1.5" />
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {message}
                                                </p>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatDistanceToNow(
                                                            new Date(notification.createdAt),
                                                            {
                                                                addSuffix: true,
                                                                locale: locale === "id" ? idLocale : enUS,
                                                            }
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {format(
                                                            new Date(notification.createdAt),
                                                            "dd MMM yyyy, HH:mm",
                                                            { locale: locale === "id" ? idLocale : enUS }
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {!notification.isRead && (
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleMarkAsRead(notification.id);
                                                        }}
                                                        title={t.notifications?.markAsRead || "Mark as read"}
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(notification.id);
                                                    }}
                                                    title={t.common?.delete || "Delete"}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Load More */}
                    {hasMore && filteredNotifications.length > 0 && (
                        <div className="p-4 border-t">
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={loadMore}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        {t.common?.loading || "Loading..."}
                                    </>
                                ) : (
                                    t.notifications?.loadMore || "Load more"
                                )}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
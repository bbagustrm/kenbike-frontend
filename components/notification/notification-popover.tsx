// components/notification/notification-popover.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/contexts/notification-context";
import { useTranslation } from "@/hooks/use-translation";
import { Notification, notificationConfig } from "@/types/notification";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Bell,
    Check,
    CheckCheck,
    Trash2,
    ExternalLink,
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
    AlertTriangle,
    PackagePlus,
    RefreshCw,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
    AlertTriangle,
    PackagePlus,
};

interface NotificationItemProps {
    notification: Notification;
    onMarkAsRead: (id: string) => void;
    onDelete: (id: string) => void;
    onClick: (notification: Notification) => void;
}

function NotificationItem({
                              notification,
                              onMarkAsRead,
                              onDelete,
                              onClick,
                          }: NotificationItemProps) {
    const { t, locale } = useTranslation();
    const config = notificationConfig[notification.type];
    const IconComponent = iconMap[config?.icon || 'Bell'] || Bell;

    // ✅ FIX: Use single title/message from backend (not bilingual)
    const title = notification.title;
    const message = notification.message;

    const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
        addSuffix: true,
        locale: locale === 'id' ? idLocale : enUS,
    });

    return (
        <div
            className={cn(
                "p-3 rounded-lg cursor-pointer transition-colors relative group",
                notification.isRead
                    ? "bg-background hover:bg-muted"
                    : config?.bgColor || "bg-blue-50 dark:bg-blue-950",
                "hover:bg-opacity-80"
            )}
            onClick={() => onClick(notification)}
        >
            <div className="flex gap-3">
                {/* Icon */}
                <div
                    className={cn(
                        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                        notification.isRead ? "bg-muted" : "bg-white dark:bg-gray-800"
                    )}
                >
                    <IconComponent
                        className={cn("h-5 w-5", config?.color || "text-gray-600")}
                    />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <p
                        className={cn(
                            "text-sm font-medium line-clamp-1",
                            !notification.isRead && "font-semibold"
                        )}
                    >
                        {title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{timeAgo}</p>
                </div>

                {/* Unread indicator */}
                {!notification.isRead && (
                    <div className="flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                )}
            </div>

            {/* Action buttons - show on hover */}
            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                {!notification.isRead && (
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsRead(notification.id);
                        }}
                        title={t.notifications?.markAsRead || "Mark as read"}
                    >
                        <Check className="h-3 w-3" />
                    </Button>
                )}
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-destructive hover:text-destructive"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(notification.id);
                    }}
                    title={t.common?.delete || "Delete"}
                >
                    <Trash2 className="h-3 w-3" />
                </Button>
            </div>
        </div>
    );
}

export function NotificationPopover() {
    const router = useRouter();
    const { t } = useTranslation();
    const {
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refresh,
    } = useNotifications();

    const [open, setOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

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
            toast.success(t.notifications?.allMarkedAsRead || "All marked as read");
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

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await refresh();
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        // Mark as read if unread
        if (!notification.isRead) {
            await markAsRead([notification.id]);
        }

        // Navigate to action URL if exists
        if (notification.actionUrl) {
            setOpen(false);
            router.push(notification.actionUrl);
        }
    };

    const handleViewAll = () => {
        setOpen(false);
        router.push("/user/notifications");
    };

    // Take only first 10 for popover
    const displayNotifications = notifications.slice(0, 10);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    aria-label="Notifications"
                >
                    <Bell className="w-6 h-6 md:w-7 md:h-7" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0" align="end">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold">
                        {t.notifications?.title || "Notifications"}
                    </h4>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                        >
                            <RefreshCw
                                className={cn(
                                    "h-4 w-4",
                                    isRefreshing && "animate-spin"
                                )}
                            />
                        </Button>
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-8"
                                onClick={handleMarkAllAsRead}
                            >
                                <CheckCheck className="h-4 w-4 mr-1" />
                                {t.notifications?.markAllRead || "Mark all read"}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <ScrollArea className="h-[400px]">
                    {isLoading && notifications.length === 0 ? (
                        <div className="p-4 space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex gap-3">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-3 w-full" />
                                        <Skeleton className="h-3 w-1/4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : displayNotifications.length === 0 ? (
                        <div className="p-8 text-center">
                            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                            <p className="text-sm text-muted-foreground">
                                {t.notifications?.empty || "No notifications yet"}
                            </p>
                        </div>
                    ) : (
                        <div className="p-2 space-y-2">
                            {displayNotifications.map((notification) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onMarkAsRead={handleMarkAsRead}
                                    onDelete={handleDelete}
                                    onClick={handleNotificationClick}
                                />
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {/* Footer */}
                {notifications.length > 0 && (
                    <div className="p-3 border-t">
                        <Button
                            variant="outline"
                            className="w-full"
                            size="sm"
                            onClick={handleViewAll}
                        >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            {t.notifications?.viewAll || "View all notifications"}
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
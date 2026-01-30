// components/notification/notification-item.tsx
"use client";

import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import {
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
    Trash2,
    Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Notification,
    notificationConfig,
} from "@/types/notification";
import { useTranslation } from "@/hooks/use-translation";

// Icon mapping
const IconMap: Record<string, React.ComponentType<{ className?: string }>> = {
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

interface NotificationItemProps {
    notification: Notification;
    onMarkAsRead?: (id: string) => void;
    onDelete?: (id: string) => void;
    showActions?: boolean;
    compact?: boolean;
}

export function NotificationItem({
                                     notification,
                                     onMarkAsRead,
                                     onDelete,
                                     showActions = true,
                                     compact = false,
                                 }: NotificationItemProps) {
    const router = useRouter();
    const { locale } = useTranslation();

    const config = notificationConfig[notification.type] || notificationConfig.SYSTEM;
    const Icon = IconMap[config.icon] || Bell;

    // ✅ FIX: Use single title/message from backend (not bilingual)
    const title = notification.title;
    const message = notification.message;

    const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
        addSuffix: true,
        locale: locale === "id" ? idLocale : enUS,
    });

    const handleClick = () => {
        // Mark as read when clicked
        if (!notification.isRead && onMarkAsRead) {
            onMarkAsRead(notification.id);
        }

        // Navigate to action URL if available
        if (notification.actionUrl) {
            router.push(notification.actionUrl);
        }
    };

    const handleMarkAsRead = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onMarkAsRead) {
            onMarkAsRead(notification.id);
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onDelete) {
            onDelete(notification.id);
        }
    };

    if (compact) {
        return (
            <div
                onClick={handleClick}
                className={cn(
                    "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                    config.bgColor,
                    !notification.isRead && "border-l-4 border-primary"
                )}
            >
                <div
                    className={cn(
                        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                        config.color,
                        "bg-white dark:bg-gray-800"
                    )}
                >
                    <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                    <p
                        className={cn(
                            "text-sm line-clamp-1",
                            !notification.isRead ? "font-semibold" : "font-medium"
                        )}
                    >
                        {title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{timeAgo}</p>
                </div>
                {!notification.isRead && (
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2" />
                )}
            </div>
        );
    }

    return (
        <div
            onClick={handleClick}
            className={cn(
                "flex items-start gap-4 p-4 rounded-lg cursor-pointer transition-colors group",
                config.bgColor,
                !notification.isRead && "border-l-4 border-primary"
            )}
        >
            {/* Icon */}
            <div
                className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                    config.color,
                    "bg-white dark:bg-gray-800 shadow-sm"
                )}
            >
                <Icon className="w-5 h-5" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <p
                        className={cn(
                            "text-sm",
                            !notification.isRead ? "font-semibold" : "font-medium"
                        )}
                    >
                        {title}
                    </p>
                    {!notification.isRead && (
                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-1.5" />
                    )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{message}</p>
                <p className="text-xs text-muted-foreground mt-2">{timeAgo}</p>
            </div>

            {/* Actions */}
            {showActions && (
                <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notification.isRead && onMarkAsRead && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleMarkAsRead}
                            title="Mark as read"
                        >
                            <Check className="w-4 h-4" />
                        </Button>
                    )}
                    {onDelete && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={handleDelete}
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}

export default NotificationItem;
// components/notification/notification-item.tsx
"use client";

import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import {
    CreditCard, Package, Truck, PackageCheck,
    CheckCircle, XCircle, AlertCircle, MessageSquare,
    MessageCircle, Percent, Clock, Bell, Trash2, Check,
    PackagePlus, AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Notification, notificationConfig } from "@/types/notification";
import { useTranslation } from "@/hooks/use-translation";

const IconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    CreditCard, Package, Truck, PackageCheck,
    CheckCircle, XCircle, AlertCircle, MessageSquare,
    MessageCircle, Percent, Clock, Bell, PackagePlus, AlertTriangle,
};

// Light mode only — icon tint colors
const ICON_STYLE: Record<string, { bg: string; text: string }> = {
    CreditCard:    { bg: "bg-blue-50",   text: "text-blue-500" },
    Package:       { bg: "bg-orange-50", text: "text-orange-500" },
    PackagePlus:   { bg: "bg-orange-50", text: "text-orange-500" },
    Truck:         { bg: "bg-indigo-50", text: "text-indigo-500" },
    PackageCheck:  { bg: "bg-green-50",  text: "text-green-500" },
    CheckCircle:   { bg: "bg-green-50",  text: "text-green-500" },
    XCircle:       { bg: "bg-red-50",    text: "text-red-500" },
    AlertCircle:   { bg: "bg-yellow-50", text: "text-yellow-600" },
    AlertTriangle: { bg: "bg-yellow-50", text: "text-yellow-600" },
    MessageSquare: { bg: "bg-purple-50", text: "text-purple-500" },
    MessageCircle: { bg: "bg-purple-50", text: "text-purple-500" },
    Percent:       { bg: "bg-pink-50",   text: "text-pink-500" },
    Clock:         { bg: "bg-gray-100",  text: "text-gray-500" },
    Bell:          { bg: "bg-gray-100",  text: "text-gray-500" },
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
    const iconKey = config.icon || "Bell";
    const Icon = IconMap[iconKey] || Bell;
    const iconStyle = ICON_STYLE[iconKey] || ICON_STYLE.Bell;

    const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
        addSuffix: true,
        locale: locale === "id" ? idLocale : enUS,
    });

    const handleClick = () => {
        if (!notification.isRead && onMarkAsRead) onMarkAsRead(notification.id);
        if (notification.actionUrl) router.push(notification.actionUrl);
    };

    const handleMarkAsRead = (e: React.MouseEvent) => {
        e.stopPropagation();
        onMarkAsRead?.(notification.id);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete?.(notification.id);
    };

    // ── Compact (popover) ──────────────────────────────────────────
    if (compact) {
        return (
            <div
                onClick={handleClick}
                className={cn(
                    "flex items-start gap-3 px-3 py-2.5 cursor-pointer transition-colors group relative",
                    notification.isRead
                        ? "hover:bg-gray-50"
                        : "bg-blue-50/50 hover:bg-blue-50 border-l-2 border-blue-400"
                )}
            >
                {/* Icon */}
                <div className={cn(
                    "shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                    iconStyle.bg
                )}>
                    <Icon className={cn("w-3.5 h-3.5", iconStyle.text)} />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                    <p className={cn(
                        "text-sm line-clamp-1 text-gray-800",
                        notification.isRead ? "font-normal" : "font-semibold"
                    )}>
                        {notification.title}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                        {notification.message}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">{timeAgo}</p>
                </div>

                {/* Unread dot */}
                {!notification.isRead && (
                    <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500 mt-2" />
                )}

                {/* Hover actions */}
                {showActions && (
                    <div className="absolute right-2 top-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5">
                        {!notification.isRead && onMarkAsRead && (
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-gray-700" onClick={handleMarkAsRead}>
                                <Check className="w-3 h-3" />
                            </Button>
                        )}
                        {onDelete && (
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-red-500" onClick={handleDelete}>
                                <Trash2 className="w-3 h-3" />
                            </Button>
                        )}
                    </div>
                )}
            </div>
        );
    }

    // ── Full (notifications page) ──────────────────────────────────
    return (
        <div
            onClick={handleClick}
            className={cn(
                "flex items-start gap-4 px-4 py-4 rounded-xl cursor-pointer transition-colors group relative",
                notification.isRead
                    ? "bg-white hover:bg-gray-50 border border-gray-100"
                    : "bg-blue-50/60 hover:bg-blue-50 border border-blue-100 border-l-2 border-l-blue-400"
            )}
        >
            {/* Icon */}
            <div className={cn(
                "shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                iconStyle.bg
            )}>
                <Icon className={cn("w-5 h-5", iconStyle.text)} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-6">
                <p className={cn(
                    "text-sm text-gray-800",
                    notification.isRead ? "font-medium" : "font-semibold"
                )}>
                    {notification.title}
                </p>
                <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                    {notification.message}
                </p>
                <p className="text-xs text-gray-400 mt-1.5">{timeAgo}</p>
            </div>

            {/* Unread dot */}
            {!notification.isRead && (
                <div className="absolute right-4 top-4 w-2 h-2 rounded-full bg-blue-500" />
            )}

            {/* Hover actions */}
            {showActions && (
                <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5">
                    {!notification.isRead && onMarkAsRead && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-gray-700" onClick={handleMarkAsRead} title="Mark as read">
                            <Check className="w-3.5 h-3.5" />
                        </Button>
                    )}
                    {onDelete && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-500" onClick={handleDelete} title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}

export default NotificationItem;
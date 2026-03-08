// components/notification/notification-popover.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/contexts/notification-context";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell, CheckCheck, ExternalLink, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { NotificationItem } from "@/components/notification/notification-item";

export function NotificationPopover() {
    const router = useRouter();
    const { t } = useTranslation();
    const {
        notifications, unreadCount, isLoading,
        markAsRead, markAllAsRead, deleteNotification, refresh,
    } = useNotifications();

    const [open, setOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleMarkAsRead = async (id: string) => {
        try { await markAsRead([id]); }
        catch { toast.error(t.notifications?.markAsReadError || "Failed to mark as read"); }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            toast.success(t.notifications?.allMarkedAsRead || "All marked as read");
        } catch {
            toast.error(t.notifications?.markAllError || "Failed to mark all as read");
        }
    };

    const handleDelete = async (id: string) => {
        try { await deleteNotification(id); }
        catch { toast.error(t.notifications?.deleteError || "Failed to delete"); }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try { await refresh(); }
        finally { setIsRefreshing(false); }
    };

    const displayNotifications = notifications.slice(0, 10);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-semibold">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[380px] p-0 shadow-lg border border-gray-200 rounded-xl overflow-hidden" align="end">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-800">
                            {t.notifications?.title || "Notifikasi"}
                        </span>
                        {unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-blue-100 text-blue-600 text-[11px] font-semibold">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-gray-400 hover:text-gray-600"
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                        >
                            <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
                        </Button>
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-gray-500 hover:text-gray-700 gap-1"
                                onClick={handleMarkAllAsRead}
                            >
                                <CheckCheck className="h-3.5 w-3.5" />
                                {t.notifications?.markAllRead || "Tandai dibaca"}
                            </Button>
                        )}
                    </div>
                </div>

                {/* List */}
                <ScrollArea className="h-[360px] bg-white">
                    {isLoading && notifications.length === 0 ? (
                        <div className="p-3 space-y-1">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex gap-3 px-3 py-2.5">
                                    <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                                    <div className="flex-1 space-y-1.5">
                                        <Skeleton className="h-3.5 w-3/4" />
                                        <Skeleton className="h-3 w-full" />
                                        <Skeleton className="h-3 w-1/4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : displayNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full py-12">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                <Bell className="h-5 w-5 text-gray-400" />
                            </div>
                            <p className="text-sm font-medium text-gray-600">
                                {t.notifications?.empty || "Belum ada notifikasi"}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {displayNotifications.map((notification) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onMarkAsRead={handleMarkAsRead}
                                    onDelete={handleDelete}
                                    compact={true}
                                    showActions={true}
                                />
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {/* Footer */}
                {notifications.length > 0 && (
                    <div className="border-t border-gray-100 bg-gray-50">
                        <button
                            onClick={() => { setOpen(false); router.push("/user/notifications"); }}
                            className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <ExternalLink className="h-3.5 w-3.5" />
                            {t.notifications?.viewAll || "Lihat semua notifikasi"}
                        </button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
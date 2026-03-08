// app/(dashboard)/user/notifications/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/contexts/notification-context";
import { useTranslation } from "@/hooks/use-translation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Bell, CheckCheck, RefreshCw, Loader2, Filter, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Notification, NotificationType } from "@/types/notification";
import { NotificationItem } from "@/components/notification/notification-item";

type FilterType = "all" | "unread" | "read";
type TypeFilter = "all" | NotificationType;

export default function UserNotificationsPage() {
    const router = useRouter();
    const { t, locale } = useTranslation();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const {
        notifications, unreadCount, isLoading, hasMore,
        markAsRead, markAllAsRead, deleteNotification, loadMore, refresh,
    } = useNotifications();

    const [filter, setFilter] = useState<FilterType>("all");
    const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login?redirect=/user/notifications");
        }
    }, [authLoading, isAuthenticated, router]);

    const filteredNotifications = notifications.filter((n) => {
        if (filter === "unread" && n.isRead) return false;
        if (filter === "read" && !n.isRead) return false;
        if (typeFilter !== "all" && n.type !== typeFilter) return false;
        return true;
    });

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await refresh();
            toast.success(t.notifications?.refreshed || "Notifications refreshed");
        } catch {
            toast.error(t.common?.error || "Failed to refresh");
        } finally {
            setIsRefreshing(false);
        }
    };

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
        try {
            await deleteNotification(id);
            toast.success(t.notifications?.deleted || "Notification deleted");
        } catch {
            toast.error(t.notifications?.deleteError || "Failed to delete");
        }
    };

    if (authLoading) {
        return (
            <div className="container mx-auto py-8 px-4 space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-3xl">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Bell className="h-6 w-6" />
                        {t.notifications?.title || "Notifikasi"}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {unreadCount > 0
                            ? `${unreadCount} ${t.notifications?.unreadNotifications || "belum dibaca"}`
                            : t.notifications?.allCaughtUp || "Semua sudah terbaca"}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                        <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
                        {t.common?.refresh || "Refresh"}
                    </Button>
                    {unreadCount > 0 && (
                        <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                            <CheckCheck className="h-4 w-4 mr-2" />
                            {t.notifications?.markAllRead || "Tandai semua dibaca"}
                        </Button>
                    )}
                </div>
            </div>

            {/* ── Filters ── */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
                    <TabsList className="bg-gray-100">
                        <TabsTrigger value="all" className="text-xs">
                            {t.notifications?.filterAll || "Semua"}
                        </TabsTrigger>
                        <TabsTrigger value="unread" className="text-xs gap-1.5">
                            {t.notifications?.filterUnread || "Belum dibaca"}
                            {unreadCount > 0 && (
                                <span className="inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-blue-500 text-white text-[10px] font-semibold">
                                    {unreadCount}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="read" className="text-xs">
                            {t.notifications?.filterRead || "Sudah dibaca"}
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TypeFilter)}>
                    <SelectTrigger className="w-full sm:w-[190px] h-9 text-xs border-gray-200">
                        <Filter className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                        <SelectValue placeholder="Filter tipe" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua tipe</SelectItem>
                        <SelectItem value="ORDER_PAID">Order Dibayar</SelectItem>
                        <SelectItem value="ORDER_PROCESSING">Sedang Diproses</SelectItem>
                        <SelectItem value="ORDER_SHIPPED">Dikirim</SelectItem>
                        <SelectItem value="ORDER_DELIVERED">Terkirim</SelectItem>
                        <SelectItem value="ORDER_COMPLETED">Selesai</SelectItem>
                        <SelectItem value="ORDER_CANCELLED">Dibatalkan</SelectItem>
                        <SelectItem value="REVIEW_REPLY">Balasan Review</SelectItem>
                        <SelectItem value="DISCUSSION_REPLY">Balasan Diskusi</SelectItem>
                        <SelectItem value="PROMOTION_START">Promosi</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* ── List ── */}
            <div className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm">
                {isLoading && notifications.length === 0 ? (
                    <div className="p-4 space-y-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex gap-3 px-3 py-3">
                                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-3.5 w-3/4" />
                                    <Skeleton className="h-3 w-full" />
                                    <Skeleton className="h-3 w-1/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="py-16 text-center">
                        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                            <Inbox className="h-7 w-7 text-gray-400" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-700">
                            {t.notifications?.noNotifications || "Tidak ada notifikasi"}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">
                            {filter === "unread"
                                ? t.notifications?.noUnread || "Tidak ada notifikasi belum dibaca"
                                : filter === "read"
                                    ? t.notifications?.noRead || "Tidak ada notifikasi sudah dibaca"
                                    : t.notifications?.empty || "Belum ada notifikasi"}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {filteredNotifications.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onMarkAsRead={handleMarkAsRead}
                                onDelete={handleDelete}
                                compact={false}
                                showActions={true}
                            />
                        ))}
                    </div>
                )}

                {/* Load More */}
                {hasMore && filteredNotifications.length > 0 && (
                    <div className="p-3 border-t border-gray-100 bg-gray-50">
                        <Button
                            variant="ghost"
                            className="w-full h-8 text-xs text-gray-500 hover:text-gray-700"
                            onClick={loadMore}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <><Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />{t.common?.loading || "Loading..."}</>
                            ) : (
                                t.notifications?.loadMore || "Muat lebih banyak"
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
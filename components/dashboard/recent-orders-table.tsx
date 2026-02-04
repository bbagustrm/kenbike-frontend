// components/dashboard/recent-orders-table.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RecentOrder } from "@/types/analytics";
import { ShoppingCart, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface RecentOrdersTableProps {
    data: RecentOrder[];
    basePath?: string; // /admin/orders or /owner/orders
    className?: string;
}

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    PENDING: 'outline',
    PAID: 'default',
    PROCESSING: 'secondary',
    SHIPPED: 'secondary',
    DELIVERED: 'default',
    COMPLETED: 'default',
    CANCELLED: 'destructive',
    FAILED: 'destructive',
};

const STATUS_LABELS: Record<string, string> = {
    PENDING: 'Menunggu',
    PAID: 'Dibayar',
    PROCESSING: 'Diproses',
    SHIPPED: 'Dikirim',
    DELIVERED: 'Terkirim',
    COMPLETED: 'Selesai',
    CANCELLED: 'Batal',
    FAILED: 'Gagal',
};

export function RecentOrdersTable({
                                      data,
                                      basePath = '/admin/orders',
                                      className,
                                  }: RecentOrdersTableProps) {
    const formatCurrency = (value: number, currency: string) => {
        if (currency === 'USD') {
            return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
        }
        return `Rp ${value.toLocaleString('id-ID')}`;
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <Card className={cn("", className)}>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-blue-500" />
                    Order Terbaru
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                    <Link href={basePath} className="flex items-center gap-1">
                        Lihat Semua
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {data.map((order) => (
                        <Link
                            key={order.id}
                            href={`${basePath}/${order.order_number}`}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="font-mono text-sm font-medium">
                                    {order.order_number}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {order.customer_name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {formatDate(order.created_at)}
                                </p>
                            </div>
                            <div className="text-right flex-shrink-0 ml-4">
                                <p className="text-sm font-semibold">
                                    {formatCurrency(order.total, order.currency)}
                                </p>
                                <Badge
                                    variant={STATUS_VARIANTS[order.status] || 'secondary'}
                                    className="mt-1 text-xs"
                                >
                                    {STATUS_LABELS[order.status] || order.status}
                                </Badge>
                            </div>
                        </Link>
                    ))}

                    {data.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            Belum ada order
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
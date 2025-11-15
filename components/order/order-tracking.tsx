// components/order/order-tracking.tsx
"use client";

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { OrderService } from '@/services/order.service';
import { TrackingInfo } from '@/types/order';
import { Package, MapPin, Clock, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface OrderTrackingProps {
    orderNumber: string;
    locale?: 'id' | 'en';
    country?: string;
}

export function OrderTracking({ orderNumber, locale = 'en', country }: OrderTrackingProps) {
    const [tracking, setTracking] = useState<TrackingInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchTracking = useCallback(async (showLoading = true) => {
        if (showLoading) setIsLoading(true);
        else setIsRefreshing(true);

        try {
            const response = await OrderService.getTracking(orderNumber);
            setTracking(response.data);
        } catch (error: unknown) {
            let errorMessage = locale === 'id' ? 'Gagal mengambil pelacakan' : 'Failed to fetch tracking';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [orderNumber, locale]);

    useEffect(() => {
        fetchTracking();
    }, [fetchTracking]);

    // 2. LAKUKAN PENGECEKAN BERSYARAT SETELAH HOOK DIDEKLARASIKAN
    if (country !== 'Indonesia') {
        return null;
    }

    // 3. SISANYA DARI LOGIKA KOMPONEN TETAP SAMA
    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleString(
            locale === 'id' ? 'id-ID' : 'en-US',
            {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }
        );
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        {locale === 'id' ? 'Lacak Pesanan' : 'Track Order'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-32 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (!tracking) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        {locale === 'id' ? 'Lacak Pesanan' : 'Track Order'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        {locale === 'id'
                            ? 'Informasi pelacakan belum tersedia'
                            : 'Tracking information not available yet'
                        }
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        {locale === 'id' ? 'Lacak Pesanan' : 'Track Order'}
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fetchTracking(false)}
                        disabled={isRefreshing}
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Current Status */}
                <div className="p-4 bg-primary/5 rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-muted-foreground">
              {locale === 'id' ? 'Status Terkini' : 'Current Status'}
            </span>
                    </div>
                    <p className="font-semibold text-lg">{tracking.status}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Package className="w-3 h-3" />
                        <span>
              {locale === 'id' ? 'Kurir' : 'Courier'}: {tracking.courier}
            </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-mono">{tracking.trackingNumber}</span>
                    </div>
                    {tracking.estimatedDelivery && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>
                {locale === 'id' ? 'Estimasi Tiba' : 'Est. Delivery'}: {' '}
                                {new Date(tracking.estimatedDelivery).toLocaleDateString(
                                    locale === 'id' ? 'id-ID' : 'en-US',
                                    { day: 'numeric', month: 'long', year: 'numeric' }
                                )}
              </span>
                        </div>
                    )}
                </div>

                {/* Tracking History */}
                {tracking.history && tracking.history.length > 0 && (
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm">
                            {locale === 'id' ? 'Riwayat Pelacakan' : 'Tracking History'}
                        </h4>
                        <div className="space-y-3">
                            {tracking.history.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex gap-3 pb-3 border-b last:border-b-0 last:pb-0"
                                >
                                    <div className="flex flex-col items-center">
                                        <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                                        {index < tracking.history.length - 1 && (
                                            <div className="w-0.5 h-full bg-muted mt-1" />
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium">{item.status}</p>
                                        {item.note && (
                                            <p className="text-xs text-muted-foreground">{item.note}</p>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            {formatTimestamp(item.updatedAt)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
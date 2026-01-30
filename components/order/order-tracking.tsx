// components/order/order-tracking.tsx
"use client";

import { useState, useEffect } from "react";
import { useOrder } from "@/contexts/order-context";
import { TrackingInfo, TrackingHistoryItem } from "@/types/order";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, Truck, ExternalLink, Package } from "lucide-react";

interface OrderTrackingProps {
    orderNumber: string;
    trackingNumber?: string;
}

export function OrderTracking({
                                  orderNumber,
                                  trackingNumber,
                              }: OrderTrackingProps) {
    const { getTracking } = useOrder();
    const [tracking, setTracking] = useState<TrackingInfo | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchTracking = async () => {
        setIsLoading(true);
        try {
            const data = await getTracking(orderNumber);
            setTracking(data);
        } catch (error) {
            console.error("Failed to fetch tracking:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (trackingNumber) {
            fetchTracking();
        }
    }, [trackingNumber]);

    if (!trackingNumber) {
        return (
            <Card>
                <CardContent className="py-8 text-center">
                    <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                        Tracking information will be available once the order is shipped
                    </p>
                </CardContent>
            </Card>
        );
    }

    if (isLoading) {
        return (
            <Card>
                <CardContent className="py-8 flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
            </Card>
        );
    }

    if (!tracking) {
        return (
            <Card>
                <CardContent className="py-8 text-center">
                    <Button onClick={fetchTracking} variant="outline">
                        <Truck className="h-4 w-4 mr-2" />
                        Load Tracking Information
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Tracking Information
                </CardTitle>
                <CardDescription>
                    Track your shipment in real-time
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Tracking Details */}
                <div className="bg-muted p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tracking Number:</span>
                        <span className="font-mono font-semibold">{tracking.tracking_number}</span>
                    </div>
                    {tracking.courier && (
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Courier:</span>
                            <span className="font-medium">{tracking.courier}</span>
                        </div>
                    )}
                    {tracking.service && (
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Service:</span>
                            <span className="font-medium">{tracking.service}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="font-medium capitalize">{tracking.status}</span>
                    </div>
                </div>

                {/* External Tracking Link */}
                {tracking.tracking_url && (
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => window.open(tracking.tracking_url, "_blank")}
                    >
                        View on Courier Website
                        <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                )}

                {/* Tracking History */}
                {tracking.history && tracking.history.length > 0 && (
                    <>
                        <Separator />
                        <div>
                            <h4 className="font-semibold text-sm mb-3">Shipment History</h4>
                            <div className="space-y-3">
                                {tracking.history.map((item: TrackingHistoryItem, index: number) => (
                                    <div
                                        key={index}
                                        className="flex gap-3 text-sm border-l-2 border-primary pl-3"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium">{item.status}</p>
                                            <p className="text-muted-foreground text-xs">{item.note}</p>
                                            <p className="text-muted-foreground text-xs mt-1">
                                                {new Date(item.date).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* Refresh Button */}
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={fetchTracking}
                >
                    Refresh Tracking
                </Button>
            </CardContent>
        </Card>
    );
}
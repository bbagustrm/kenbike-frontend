// components/admin/order/order-tracking-admin.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { OrderService } from "@/services/order.service";
import { TrackingInfo, TrackingHistoryItem } from "@/types/order";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, Truck, ExternalLink, Package, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface OrderTrackingAdminProps {
    orderNumber: string;
    trackingNumber?: string | null;
    biteshipOrderId?: string | null;
    shippingType?: string;
}

// Helper to extract error message
function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    return 'An unexpected error occurred';
}

export function OrderTrackingAdmin({
                                       orderNumber,
                                       trackingNumber,
                                       biteshipOrderId,
                                       shippingType,
                                   }: OrderTrackingAdminProps) {
    const [tracking, setTracking] = useState<TrackingInfo | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTracking = useCallback(async () => {
        if (!trackingNumber) return;

        setIsLoading(true);
        setError(null);

        try {
            // Use admin tracking endpoint
            const response = await OrderService.getTrackingInfoAdmin(orderNumber);
            setTracking(response.data);
        } catch (err: unknown) {
            const message = getErrorMessage(err);
            console.error("Failed to fetch tracking:", err);
            setError(message);
            // Don't show toast for initial load failure, only for refresh
        } finally {
            setIsLoading(false);
        }
    }, [orderNumber, trackingNumber]);

    const handleRefresh = async () => {
        setIsLoading(true);
        try {
            const response = await OrderService.getTrackingInfoAdmin(orderNumber);
            setTracking(response.data);
            toast.success("Tracking information updated");
        } catch (err: unknown) {
            const message = getErrorMessage(err);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (trackingNumber && shippingType === "DOMESTIC" && biteshipOrderId) {
            fetchTracking();
        }
    }, [trackingNumber, shippingType, biteshipOrderId, fetchTracking]);

    // If no tracking number, show placeholder
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

    // For international orders without Biteship integration
    if (shippingType === "INTERNATIONAL") {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        Tracking Information
                    </CardTitle>
                    <CardDescription>
                        International shipment tracking
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tracking Number:</span>
                            <span className="font-mono font-semibold">{trackingNumber}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Shipping Type:</span>
                            <Badge variant="outline">International</Badge>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                        Use the tracking number above to track with the shipping carrier
                    </p>
                </CardContent>
            </Card>
        );
    }

    // Loading state
    if (isLoading && !tracking) {
        return (
            <Card>
                <CardContent className="py-8 flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
            </Card>
        );
    }

    // Error state - show basic info with retry button
    if (error && !tracking) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        Tracking Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tracking Number:</span>
                            <span className="font-mono font-semibold">{trackingNumber}</span>
                        </div>
                        {biteshipOrderId && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Biteship Order ID:</span>
                                <span className="font-mono text-xs">{biteshipOrderId}</span>
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-destructive text-center">{error}</p>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={fetchTracking}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Retry
                    </Button>
                </CardContent>
            </Card>
        );
    }

    // Success state with tracking data
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Tracking Information
                </CardTitle>
                <CardDescription>
                    Real-time shipment tracking via Biteship
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Tracking Details */}
                <div className="bg-muted p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tracking Number:</span>
                        <span className="font-mono font-semibold">
                            {tracking?.tracking_number || trackingNumber}
                        </span>
                    </div>
                    {tracking?.courier && (
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Courier:</span>
                            <span className="font-medium uppercase">{tracking.courier}</span>
                        </div>
                    )}
                    {tracking?.service && (
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Service:</span>
                            <span className="font-medium">{tracking.service}</span>
                        </div>
                    )}
                    {tracking?.status && (
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge variant="outline" className="capitalize">
                                {tracking.status}
                            </Badge>
                        </div>
                    )}
                    {biteshipOrderId && (
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Biteship ID:</span>
                            <span className="font-mono text-xs">{biteshipOrderId}</span>
                        </div>
                    )}
                </div>

                {/* External Tracking Link */}
                {tracking?.tracking_url && (
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
                {tracking?.history && tracking.history.length > 0 && (
                    <>
                        <Separator />
                        <div>
                            <h4 className="font-semibold text-sm mb-3">Shipment History</h4>
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {tracking.history.map((item: TrackingHistoryItem, index: number) => (
                                    <div
                                        key={index}
                                        className="flex gap-3 text-sm border-l-2 border-primary pl-3"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium">{item.status}</p>
                                            {item.note && (
                                                <p className="text-muted-foreground text-xs">{item.note}</p>
                                            )}
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
                    onClick={handleRefresh}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Refreshing...
                        </>
                    ) : (
                        <>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh Tracking
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
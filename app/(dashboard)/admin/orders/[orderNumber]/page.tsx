// app/(dashboard)/admin/orders/[orderNumber]/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { OrderService } from "@/services/order.service";
import { Order } from "@/types/order";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/order/order-status-badge";
import { PaymentStatusBadge } from "@/components/payment/payment-status-badge";
import { OrderDetailAdmin } from "@/components/admin/order/order-detail-admin";
import { OrderTimeline } from "@/components/order/order-timeline";
import { OrderTrackingAdmin } from "@/components/admin/order/order-tracking-admin";
import { OrderStatusUpdater } from "@/components/admin/order/order-status-updater";
import { OrderActionsAdmin } from "@/components/admin/order/order-actions-admin";
import { Loader2, Package, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
    InvoiceDownloadButtons,
    InvoiceDownloadButton,
    ShippingLabelDownloadButton
} from "@/components/invoice/invoice-download-buttons";

export default function AdminOrderDetailPage() {
    const router = useRouter();
    const params = useParams<{ orderNumber: string }>();
    const orderNumber = params.orderNumber;

    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchOrder = useCallback(async () => {
        if (!orderNumber) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await OrderService.getOrderDetailAdmin(orderNumber);
            setOrder(response.data);
        } catch (error) {
            console.error("Failed to fetch order:", error);
            toast.error("Failed to load order details");
        } finally {
            setIsLoading(false);
        }
    }, [orderNumber]);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
                <p className="text-muted-foreground mb-6">
                    The order you&apos;re looking for doesn&apos;t exist or has been
                    deleted.
                </p>
                <Button onClick={() => router.push("/admin/orders")}>
                    Back to Orders
                </Button>
            </div>
        );
    }

    // Determine payment status from order
    const paymentStatus = order.paid_at
        ? "PAID"
        : order.status === "FAILED"
            ? "FAILED"
            : order.status === "CANCELLED"
                ? "CANCELLED"
                : "PENDING";

    return (
        <div className="min-h-screen bg-muted/30">
            <div className="container mx-auto px-4 py-8">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/admin/orders")}
                    className="mb-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Orders
                </Button>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-6"
                >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">
                                Order #{order.order_number}
                            </h1>
                            <p className="text-muted-foreground">
                                Placed on{" "}
                                {new Date(order.created_at).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <OrderStatusBadge status={order.status} />
                            <PaymentStatusBadge status={paymentStatus} />

                            <InvoiceDownloadButtons
                                orderNumber={order.order_number}
                                orderStatus={order.status}
                                hasPaid={!!order.paid_at}
                                hasTrackingNumber={!!order.tracking_number}
                            />
                        </div>
                    </div>

                    {/* Admin Actions */}
                    <div className="flex flex-wrap gap-2">
                        <OrderStatusUpdater order={order} onUpdate={fetchOrder} />
                        <OrderActionsAdmin order={order} onUpdate={fetchOrder} />

                        <InvoiceDownloadButton
                            orderNumber={order.order_number}
                            orderStatus={order.status}
                            hasPaid={!!order.paid_at}
                        />
                        <ShippingLabelDownloadButton
                            orderNumber={order.order_number}
                            orderStatus={order.status}
                        />
                    </div>
                </motion.div>

                {/* Main Content - Two Column Layout */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Order Details (2/3 width) */}
                        <div className="lg:col-span-2">
                            <OrderDetailAdmin order={order} />
                        </div>

                        {/* Right Column - Timeline & Tracking (1/3 width) */}
                        <div className="space-y-6">
                            {/* Order Timeline */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Order Timeline</CardTitle>
                                    <CardDescription>
                                        Track the progress of this order
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <OrderTimeline order={order} />
                                </CardContent>
                            </Card>

                            {/* Tracking - Show if has tracking number */}
                            {order.tracking_number && (
                                <OrderTrackingAdmin
                                    orderNumber={order.order_number}
                                    trackingNumber={order.tracking_number}
                                    biteshipOrderId={order.biteship_order_id}
                                    shippingType={order.shipping.type}
                                />
                            )}

                            {/* No tracking yet message */}
                            {!order.tracking_number && order.status !== "CANCELLED" && order.status !== "FAILED" && (
                                <Card>
                                    <CardContent className="py-8 text-center">
                                        <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">
                                            {order.status === "PENDING"
                                                ? "Tracking will be available after payment is confirmed"
                                                : order.status === "PAID"
                                                    ? "Tracking number will be assigned when processing"
                                                    : "No tracking information available"
                                            }
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
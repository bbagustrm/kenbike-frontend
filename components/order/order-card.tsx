// components/order/order-card.tsx
"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { OrderListItem } from "@/types/order";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { OrderStatusBadge } from "./order-status-badge";
import { InvoiceDownloadButtons } from "@/components/invoice/invoice-download-buttons";
import { formatCurrency } from "@/lib/format-currency";
import { ChevronRight, Package } from "lucide-react";

interface OrderCardProps {
    order: OrderListItem;
    index?: number;
}

export function OrderCard({ order, index = 0 }: OrderCardProps) {
    const router = useRouter();

    const handleViewDetails = () => {
        router.push(`/user/orders/${order.order_number}`);
    };

    // Check if invoice/label can be downloaded
    const canDownload = !!order.paid_at ||
        ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED'].includes(order.status);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
        >
            <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-4">
                        <div
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={handleViewDetails}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                                <p className="font-semibold text-sm truncate">
                                    Order #{order.order_number}
                                </p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {new Date(order.created_at).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <OrderStatusBadge status={order.status} />
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Items Preview */}
                    <div
                        className="space-y-2 cursor-pointer"
                        onClick={handleViewDetails}
                    >
                        {order.items.slice(0, 2).map((item, idx) => (
                            <div key={idx} className="flex gap-3">
                                <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted shrink-0">
                                    <Image
                                        src={item.product_image || "/placeholder.png"}
                                        alt={item.product_name || "Product"}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium line-clamp-1">
                                        {item.product_name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {item.variant_name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Qty: {item.quantity} × {formatCurrency(item.price_per_item, order.currency)}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {order.items_count > 2 && (
                            <p className="text-xs text-muted-foreground pl-15">
                                +{order.items_count - 2} more item(s)
                            </p>
                        )}
                    </div>

                    <Separator />

                    {/* Shipping Info */}
                    <div
                        className="cursor-pointer"
                        onClick={handleViewDetails}
                    >
                        <p className="text-xs text-muted-foreground mb-1">Ship to:</p>
                        <p className="text-sm font-medium">{order.shipping.recipient_name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                            {order.shipping.address}, {order.shipping.city}
                        </p>
                    </div>

                    <Separator />

                    {/* Total & Actions */}
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-xs text-muted-foreground">Total</p>
                            <p className="text-lg font-bold">
                                {formatCurrency(order.total, order.currency)}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Invoice & Shipping Label Dropdown */}
                            {canDownload && (
                                <InvoiceDownloadButtons
                                    orderNumber={order.order_number}
                                    orderStatus={order.status}
                                    hasPaid={!!order.paid_at}
                                    hasTrackingNumber={!!order.tracking_number}
                                    size="sm"
                                    variant="ghost"
                                />
                            )}
                            <Button variant="outline" size="sm" onClick={handleViewDetails}>
                                Details
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
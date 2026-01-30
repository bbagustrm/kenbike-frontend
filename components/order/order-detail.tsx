// components/order/order-detail.tsx
"use client";

import Image from "next/image";
import { Order } from "@/types/order";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format-currency";
import { Package, MapPin, CreditCard, Truck } from "lucide-react";

interface OrderDetailProps {
    order: Order;
}

export function OrderDetail({ order }: OrderDetailProps) {
    return (
        <div className="space-y-6">
            {/* Order Items */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Order Items
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {order.items.map((item, index) => (
                            <div key={item.sku || `item-${index}`} className="flex gap-4">
                                <div className="relative w-20 h-20 rounded-md overflow-hidden bg-muted shrink-0">
                                    <Image
                                        src={item.product_image || "/placeholder.png"}
                                        alt={item.product_name || "Product"}
                                        fill
                                        className="object-cover"
                                    />
                                    {(item.discount ?? 0) > 0 && (
                                        <Badge
                                            variant="destructive"
                                            className="absolute top-1 right-1 text-[10px] px-1 py-0"
                                        >
                                            -{Math.round(((item.discount ?? 0) / item.price_per_item) * 100)}%
                                        </Badge>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm line-clamp-2">
                                        {item.product_name}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {item.variant_name}
                                    </p>
                                    {item.sku && (
                                        <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                                    )}

                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-sm font-semibold">
                                            {formatCurrency(
                                                item.price_per_item - (item.discount ?? 0),
                                                order.currency
                                            )}
                                        </span>
                                        {(item.discount ?? 0) > 0 && (
                                            <span className="text-xs text-muted-foreground line-through">
                                                {formatCurrency(item.price_per_item, order.currency)}
                                            </span>
                                        )}
                                        <span className="text-xs text-muted-foreground">
                                            × {item.quantity}
                                        </span>
                                    </div>
                                </div>

                                <div className="text-right shrink-0">
                                    <p className="font-semibold">
                                        {formatCurrency(item.subtotal, order.currency)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Shipping Address - Using nested shipping object */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Shipping Address
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div>
                            <p className="font-semibold">{order.shipping.recipient_name}</p>
                            {order.shipping.recipient_phone && (
                                <p className="text-sm text-muted-foreground">
                                    {order.shipping.recipient_phone}
                                </p>
                            )}
                        </div>
                        <Separator />
                        <div className="text-sm">
                            <p>{order.shipping.address}</p>
                            <p>
                                {order.shipping.city}
                                {order.shipping.province && `, ${order.shipping.province}`}
                            </p>
                            <p>
                                {order.shipping.country} {order.shipping.postal_code}
                            </p>
                        </div>
                        {order.shipping.notes && (
                            <>
                                <Separator />
                                <div className="text-sm">
                                    <p className="font-medium mb-1">Delivery Notes:</p>
                                    <p className="text-muted-foreground">{order.shipping.notes}</p>
                                </div>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Shipping Method - Only show if method exists */}
            {order.shipping.method && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Truck className="h-5 w-5" />
                            Shipping Method
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Type:</span>
                                <span className="font-medium capitalize">
                                    {order.shipping.type?.toLowerCase() ?? "-"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Method:</span>
                                <span className="font-medium">{order.shipping.method}</span>
                            </div>
                            {order.shipping.courier && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Courier:</span>
                                    <span className="font-medium">{order.shipping.courier}</span>
                                </div>
                            )}
                            {order.shipping.service && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Service:</span>
                                    <span className="font-medium">{order.shipping.service}</span>
                                </div>
                            )}
                            {order.tracking_number && (
                                <>
                                    <Separator />
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Tracking Number:</span>
                                        <span className="font-mono font-semibold">
                                            {order.tracking_number}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Payment Information - Only show if payment method exists */}
            {order.payment_method && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Payment Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Payment Method:</span>
                                <span className="font-medium">
                                    {order.payment_method === "MIDTRANS_SNAP"
                                        ? "Midtrans"
                                        : order.payment_method === "PAYPAL"
                                            ? "PayPal"
                                            : order.payment_method}
                                </span>
                            </div>
                            {order.payment_id && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Payment ID:</span>
                                    <span className="font-mono text-xs">{order.payment_id}</span>
                                </div>
                            )}
                            {order.paid_at && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Paid At:</span>
                                    <span className="font-medium">
                                        {new Date(order.paid_at).toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Order Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span className="font-medium">
                                {formatCurrency(order.subtotal, order.currency)}
                            </span>
                        </div>

                        {order.discount > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Discount</span>
                                <span className="font-medium text-green-600">
                                    -{formatCurrency(order.discount, order.currency)}
                                </span>
                            </div>
                        )}

                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Shipping</span>
                            <span className="font-medium">
                                {formatCurrency(order.shipping_cost, order.currency)}
                            </span>
                        </div>

                        {order.tax > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Tax</span>
                                <span className="font-medium">
                                    {formatCurrency(order.tax, order.currency)}
                                </span>
                            </div>
                        )}

                        <Separator />

                        <div className="flex justify-between">
                            <span className="font-semibold">Total</span>
                            <span className="font-bold text-lg">
                                {formatCurrency(order.total, order.currency)}
                            </span>
                        </div>

                        {order.exchange_rate && order.currency === "USD" && (
                            <p className="text-xs text-muted-foreground text-center">
                                Exchange rate: 1 USD = {order.exchange_rate.toFixed(2)} IDR
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
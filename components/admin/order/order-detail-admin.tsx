// components/admin/order/order-detail-admin.tsx
"use client";

import { Order } from "@/types/order";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format-currency";
import {
    Package,
    User,
    CreditCard,
    Truck,
    Database,
} from "lucide-react";

interface OrderDetailAdminProps {
    order: Order;
}

export function OrderDetailAdmin({ order }: OrderDetailAdminProps) {
    return (
        <div className="space-y-6">
            {/* Customer Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Customer Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">User ID:</span>
                        <span className="font-mono text-xs">{order.user_id}</span>
                    </div>
                    {order.user && (
                        <>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Email:</span>
                                <span className="font-medium">{order.user.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Username:</span>
                                <span className="font-medium">{order.user.username}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Name:</span>
                                <span className="font-medium">{order.user.name}</span>
                            </div>
                            {order.user.phone && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Phone:</span>
                                    <span className="font-medium">{order.user.phone}</span>
                                </div>
                            )}
                        </>
                    )}
                    <Separator />
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Recipient:</span>
                        <span className="font-medium">{order.shipping.recipient_name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Recipient Phone:</span>
                        <span className="font-medium">{order.shipping.recipient_phone}</span>
                    </div>
                </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Order Items ({order.items.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* ✅ FIX: Use item.sku as key instead of item.id (which doesn't exist) */}
                        {order.items.map((item, index) => (
                            <div key={item.sku || `item-${index}`} className="flex justify-between items-start">
                                <div className="flex-1">
                                    <p className="font-semibold text-sm">{item.product_name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {item.variant_name} • SKU: {item.sku}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {formatCurrency(item.price_per_item, order.currency)} × {item.quantity}
                                        {(item.discount ?? 0) > 0 && (
                                            <span className="text-green-600 ml-2">
                                                (-{formatCurrency(item.discount ?? 0, order.currency)} discount)
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">
                                        {formatCurrency(item.subtotal, order.currency)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Shipping Details */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        Shipping Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <Badge variant="outline">{order.shipping.type}</Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Method:</span>
                        <span className="font-medium">{order.shipping.method ?? "-"}</span>
                    </div>

                    {order.shipping.type === "DOMESTIC" && (
                        <>
                            {order.shipping.courier && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Courier:</span>
                                    <span className="font-medium uppercase">{order.shipping.courier}</span>
                                </div>
                            )}
                            {order.shipping.service && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Service:</span>
                                    <span className="font-medium">{order.shipping.service}</span>
                                </div>
                            )}
                            {order.biteship_order_id && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Biteship Order ID:</span>
                                    <span className="font-mono text-xs">{order.biteship_order_id}</span>
                                </div>
                            )}
                        </>
                    )}

                    {order.shipping.zone && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Shipping Zone:</span>
                            <span className="font-medium">{order.shipping.zone}</span>
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

                    <Separator />

                    <div>
                        <p className="text-muted-foreground mb-1">Delivery Address:</p>
                        <div className="pl-2 space-y-0.5">
                            <p className="font-medium">{order.shipping.recipient_name}</p>
                            <p>{order.shipping.address}</p>
                            <p>
                                {order.shipping.city}
                                {order.shipping.province && `, ${order.shipping.province}`}
                            </p>
                            <p>
                                {order.shipping.country} {order.shipping.postal_code}
                            </p>
                        </div>
                    </div>

                    {order.shipping.notes && (
                        <div>
                            <p className="text-muted-foreground mb-1">Delivery Notes:</p>
                            <p className="pl-2 text-sm">{order.shipping.notes}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Payment Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    {/* Handle both flat and nested payment structure */}
                    {order.payment ? (
                        <>
                            {order.payment.method && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Method:</span>
                                    <span className="font-medium">
                                        {order.payment.method === "MIDTRANS_SNAP" ? "Midtrans" : order.payment.method}
                                    </span>
                                </div>
                            )}
                            {order.payment.provider && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Provider:</span>
                                    <span className="font-medium">{order.payment.provider}</span>
                                </div>
                            )}
                            {order.payment.payment_id && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Payment ID:</span>
                                    <span className="font-mono text-xs">{order.payment.payment_id}</span>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            {order.payment_method && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Method:</span>
                                    <span className="font-medium">
                                        {order.payment_method === "MIDTRANS_SNAP" ? "Midtrans" : "PayPal"}
                                    </span>
                                </div>
                            )}
                            {order.payment_provider && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Provider:</span>
                                    <span className="font-medium">{order.payment_provider}</span>
                                </div>
                            )}
                            {order.payment_id && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Payment ID:</span>
                                    <span className="font-mono text-xs">{order.payment_id}</span>
                                </div>
                            )}
                        </>
                    )}
                    {order.paid_at && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Paid At:</span>
                            <span className="font-medium">
                                {new Date(order.paid_at).toLocaleString()}
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
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
                </CardContent>
            </Card>

            {/* System Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        System Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Order ID:</span>
                        <span className="font-mono text-xs">{order.id}</span>
                    </div>
                    {/* Handle both flat and nested timestamps */}
                    {order.timestamps ? (
                        <>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Created At:</span>
                                <span>{new Date(order.timestamps.created_at).toLocaleString()}</span>
                            </div>
                            {order.timestamps.updated_at && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Last Updated:</span>
                                    <span>{new Date(order.timestamps.updated_at).toLocaleString()}</span>
                                </div>
                            )}
                            {order.timestamps.paid_at && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Paid At:</span>
                                    <span>{new Date(order.timestamps.paid_at).toLocaleString()}</span>
                                </div>
                            )}
                            {order.timestamps.shipped_at && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shipped At:</span>
                                    <span>{new Date(order.timestamps.shipped_at).toLocaleString()}</span>
                                </div>
                            )}
                            {order.timestamps.delivered_at && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Delivered At:</span>
                                    <span>{new Date(order.timestamps.delivered_at).toLocaleString()}</span>
                                </div>
                            )}
                            {order.timestamps.completed_at && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Completed At:</span>
                                    <span>{new Date(order.timestamps.completed_at).toLocaleString()}</span>
                                </div>
                            )}
                            {order.timestamps.canceled_at && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Cancelled At:</span>
                                    <span>{new Date(order.timestamps.canceled_at).toLocaleString()}</span>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Created At:</span>
                                <span>{new Date(order.created_at).toLocaleString()}</span>
                            </div>
                            {order.updated_at && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Last Updated:</span>
                                    <span>{new Date(order.updated_at).toLocaleString()}</span>
                                </div>
                            )}
                            {order.shipped_at && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shipped At:</span>
                                    <span>{new Date(order.shipped_at).toLocaleString()}</span>
                                </div>
                            )}
                            {order.delivered_at && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Delivered At:</span>
                                    <span>{new Date(order.delivered_at).toLocaleString()}</span>
                                </div>
                            )}
                            {order.completed_at && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Completed At:</span>
                                    <span>{new Date(order.completed_at).toLocaleString()}</span>
                                </div>
                            )}
                            {order.canceled_at && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Cancelled At:</span>
                                    <span>{new Date(order.canceled_at).toLocaleString()}</span>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
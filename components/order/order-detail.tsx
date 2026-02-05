// components/order/order-detail.tsx
"use client";

import Image from "next/image";
import { Order } from "@/types/order";
import { useTranslation } from "@/hooks/use-translation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format-currency";
import { Package, MapPin, CreditCard, Truck } from "lucide-react";

interface OrderDetailProps {
    order: Order;
}

export function OrderDetail({ order }: OrderDetailProps) {
    const { t, locale } = useTranslation();

    return (
        <div className="space-y-6">
            {/* Order Items */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        {t.orders?.detail?.orderItems || (locale === "id" ? "Item Pesanan" : "Order Items")}
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
                        {t.orders?.detail?.shippingAddress || (locale === "id" ? "Alamat Pengiriman" : "Shipping Address")}
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
                                    <p className="font-medium mb-1">
                                        {t.orders?.detail?.deliveryNotes || (locale === "id" ? "Catatan Pengiriman" : "Delivery Notes")}:
                                    </p>
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
                            {t.orders?.detail?.shippingMethod || (locale === "id" ? "Metode Pengiriman" : "Shipping Method")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    {t.orders?.detail?.type || (locale === "id" ? "Tipe" : "Type")}:
                                </span>
                                <span className="font-medium capitalize">
                                    {order.shipping.type?.toLowerCase() ?? "-"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    {t.orders?.detail?.method || (locale === "id" ? "Metode" : "Method")}:
                                </span>
                                <span className="font-medium">{order.shipping.method}</span>
                            </div>
                            {order.shipping.courier && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        {t.orders?.detail?.courier || (locale === "id" ? "Kurir" : "Courier")}:
                                    </span>
                                    <span className="font-medium">{order.shipping.courier}</span>
                                </div>
                            )}
                            {order.shipping.service && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        {t.orders?.detail?.service || (locale === "id" ? "Layanan" : "Service")}:
                                    </span>
                                    <span className="font-medium">{order.shipping.service}</span>
                                </div>
                            )}
                            {order.tracking_number && (
                                <>
                                    <Separator />
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            {t.orders?.detail?.trackingNumber || (locale === "id" ? "Nomor Resi" : "Tracking Number")}:
                                        </span>
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
                            {t.orders?.detail?.paymentInfo || (locale === "id" ? "Informasi Pembayaran" : "Payment Information")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    {t.orders?.detail?.paymentMethod || (locale === "id" ? "Metode Pembayaran" : "Payment Method")}:
                                </span>
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
                                    <span className="text-muted-foreground">
                                        {t.orders?.detail?.paymentId || (locale === "id" ? "ID Pembayaran" : "Payment ID")}:
                                    </span>
                                    <span className="font-mono text-xs">{order.payment_id}</span>
                                </div>
                            )}
                            {order.paid_at && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        {t.orders?.detail?.paidAt || (locale === "id" ? "Dibayar pada" : "Paid at")}:
                                    </span>
                                    <span className="font-medium">
                                        {new Date(order.paid_at).toLocaleString(locale === "id" ? "id-ID" : "en-US")}
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
                    <CardTitle>
                        {t.orders?.detail?.orderSummary || (locale === "id" ? "Ringkasan Pesanan" : "Order Summary")}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                                {t.orders?.detail?.subtotal || (locale === "id" ? "Subtotal" : "Subtotal")}
                            </span>
                            <span className="font-medium">
                                {formatCurrency(order.subtotal, order.currency)}
                            </span>
                        </div>

                        {order.discount > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                    {t.orders?.detail?.discount || (locale === "id" ? "Diskon" : "Discount")}
                                </span>
                                <span className="font-medium text-green-600">
                                    -{formatCurrency(order.discount, order.currency)}
                                </span>
                            </div>
                        )}

                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                                {t.orders?.detail?.shipping || (locale === "id" ? "Pengiriman" : "Shipping")}
                            </span>
                            <span className="font-medium">
                                {formatCurrency(order.shipping_cost, order.currency)}
                            </span>
                        </div>

                        {order.tax > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                    {t.orders?.detail?.tax || (locale === "id" ? "Pajak" : "Tax")}
                                </span>
                                <span className="font-medium">
                                    {formatCurrency(order.tax, order.currency)}
                                </span>
                            </div>
                        )}

                        <Separator />

                        <div className="flex justify-between">
                            <span className="font-semibold">
                                {t.orders?.detail?.total || (locale === "id" ? "Total" : "Total")}
                            </span>
                            <span className="font-bold text-lg">
                                {formatCurrency(order.total, order.currency)}
                            </span>
                        </div>

                        {order.exchange_rate && order.currency === "USD" && (
                            <p className="text-xs text-muted-foreground text-center">
                                {(t.orders?.detail?.exchangeRate || "Exchange rate: 1 USD = {rate} IDR")
                                    .replace("{rate}", order.exchange_rate.toFixed(2))}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
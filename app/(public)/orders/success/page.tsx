// app/(public)/orders/success/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, Download, Package, MapPin, CreditCard, Truck, Home, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { OrderService } from '@/services/order.service';
import { Order, ShippingType } from '@/types/order';
import { formatCurrency } from '@/lib/format-currency';
// Helper to safely format currency
const formatPrice = (amount: number, currency: string): string => {
    return formatCurrency(amount, (currency as 'IDR' | 'USD'));
};
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import confetti from 'canvas-confetti';

export default function OrderSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderNumber = searchParams.get('orderNumber');

    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        if (!orderNumber) {
            router.push('/');
            return;
        }

        const fetchOrder = async () => {
            try {
                const data = await OrderService.getOrderByNumber(orderNumber);
                setOrder(data);

                // Trigger confetti
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                });
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to load order';
                toast.error(errorMessage);
                router.push('/');
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrder();
    }, [orderNumber, router]);

    const handleDownloadInvoice = async () => {
        if (!order) return;

        setIsDownloading(true);
        try {
            // TODO: Implement invoice download
            toast.info('Invoice download will be available soon');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load order';
            toast.error(errorMessage);
        } finally {
            setIsDownloading(false);
        }
    };

    const handleTrackShipment = async () => {
        if (!order || !order.trackingNumber) return;

        // Open Biteship tracking page
        window.open(`https://biteship.com/tracking/${order.trackingNumber}`, '_blank');
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    if (!order) {
        return null;
    }

    const isDomestic = order.shippingType === ShippingType.DOMESTIC;
    const canTrack = isDomestic && order.trackingNumber;

    return (
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
            {/* Success Header */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center mb-8"
            >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                    <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Payment Successful!</h1>
                <p className="text-lg text-muted-foreground">
                    Thank you for your purchase
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                    Order #{order.orderNumber}
                </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={handleDownloadInvoice}
                                disabled={isDownloading}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download Invoice
                            </Button>
                            {canTrack && (
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={handleTrackShipment}
                                >
                                    <Truck className="w-4 h-4 mr-2" />
                                    Track Shipment
                                    <ExternalLink className="w-3 h-3 ml-auto" />
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                asChild
                            >
                                <Link href="/">
                                    <Home className="w-4 h-4 mr-2" />
                                    Back to Home
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Order Summary */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>{formatPrice(order.subtotal, order.currency)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Shipping</span>
                                <span>{formatPrice(order.shippingCost, order.currency)}</span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>Discount</span>
                                    <span>-{formatPrice(order.discount, order.currency)}</span>
                                </div>
                            )}
                            <Separator />
                            <div className="flex justify-between font-semibold text-lg">
                                <span>Total Paid</span>
                                <span>{formatPrice(order.total, order.currency)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Order Details */}
            <div className="space-y-6">
                {/* Order Items */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="w-5 h-5" />
                                Order Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                            <Image
                                                src={item.productImage || '/placeholder.png'}
                                                alt={item.productName}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{item.productName}</p>
                                            <p className="text-sm text-muted-foreground">{item.variantName}</p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-sm text-muted-foreground">Qty: {item.quantity}</span>
                                                <span className="font-semibold">
                                                    {formatPrice(item.subtotal, order.currency)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Shipping & Payment Info */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Shipping Address */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <MapPin className="w-5 h-5" />
                                    Shipping Address
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <p className="font-semibold">{order.recipientName}</p>
                                    <p className="text-sm text-muted-foreground">{order.recipientPhone}</p>
                                    <p className="text-sm">{order.shippingAddress}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {order.shippingCity}, {order.shippingProvince || order.shippingCountry}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{order.shippingPostalCode}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Shipping & Payment Method */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <CreditCard className="w-5 h-5" />
                                    Shipping & Payment
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Shipping Method</p>
                                    <Badge variant="outline">
                                        {isDomestic && order.biteshipCourier && order.biteshipService
                                            ? `${order.biteshipCourier.toUpperCase()} - ${order.biteshipService.toUpperCase()}`
                                            : 'Pos Indonesia'
                                        }
                                    </Badge>
                                    {order.shippingZone && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {order.shippingZone.name} ({order.shippingZone.minDays}-{order.shippingZone.maxDays} days)
                                        </p>
                                    )}
                                </div>
                                <Separator />
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Payment Method</p>
                                    <Badge variant="secondary">
                                        {order.paymentMethod === 'MIDTRANS_SNAP' ? 'Midtrans' : 'PayPal'}
                                    </Badge>
                                </div>
                                {canTrack && order.trackingNumber && (
                                    <>
                                        <Separator />
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Tracking Number</p>
                                            <p className="text-sm font-mono">{order.trackingNumber}</p>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* What's Next */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
                        <CardHeader>
                            <CardTitle className="text-lg text-blue-900 dark:text-blue-100">
                                Whats Next?
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ol className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                                <li className="flex items-start gap-2">
                                    <span className="font-semibold">1.</span>
                                    <span>We&apos;ll send you an email confirmation with order details</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="font-semibold">2.</span>
                                    <span>Your order will be processed within 1-2 business days</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="font-semibold">3.</span>
                                    <span>You&apos;ll receive tracking information once your order ships</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="font-semibold">4.</span>
                                    <span>Estimated delivery: {isDomestic ? '2-7 days' : `${order.shippingZone?.minDays}-${order.shippingZone?.maxDays} days`}</span>
                                </li>
                            </ol>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
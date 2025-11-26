// app/(public)/orders/[orderNumber]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Package, MapPin, CreditCard, AlertCircle, ArrowLeft, X, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { OrderService } from '@/services/order.service';
import { Order, OrderStatus, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types/order';
import { formatCurrency } from '@/lib/format-currency';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

export default function OrderDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const orderNumber = params.orderNumber as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCancelling, setIsCancelling] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState<number>(0);

    // Fetch order details
    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const data = await OrderService.getOrderByNumber(orderNumber);
                setOrder(data);

                // Calculate time remaining (24 hours from creation)
                const createdAt = new Date(data.createdAt).getTime();
                const expiryTime = createdAt + (24 * 60 * 60 * 1000); // 24 hours
                const now = Date.now();
                const remaining = Math.max(0, expiryTime - now);
                setTimeRemaining(remaining);
            } catch (error: any) {
                toast.error(error.message || 'Failed to load order');
                router.push('/');
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrder();
    }, [orderNumber, router]);

    // Poll for order status updates
    useEffect(() => {
        if (!order || order.status !== OrderStatus.PENDING) return;

        const interval = setInterval(async () => {
            try {
                const updatedOrder = await OrderService.getOrderByNumber(orderNumber);
                if (updatedOrder.status !== OrderStatus.PENDING) {
                    setOrder(updatedOrder);

                    // Redirect to success page if paid
                    if (updatedOrder.status === OrderStatus.PAID) {
                        router.push(`/orders/success?orderNumber=${orderNumber}`);
                    }
                }
            } catch (error) {
                // Silently fail
            }
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(interval);
    }, [order, orderNumber, router]);

    // Countdown timer
    useEffect(() => {
        if (timeRemaining <= 0) return;

        const timer = setInterval(() => {
            setTimeRemaining((prev) => Math.max(0, prev - 1000));
        }, 1000);

        return () => clearInterval(timer);
    }, [timeRemaining]);

    const formatTimeRemaining = (ms: number): string => {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((ms % (1000 * 60)) / 1000);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleCancelOrder = async () => {
        setIsCancelling(true);
        try {
            await OrderService.cancelOrder(orderNumber);
            toast.success('Order cancelled successfully');
            router.push('/orders/failed?orderNumber=' + orderNumber);
        } catch (error: any) {
            toast.error(error.message || 'Failed to cancel order');
        } finally {
            setIsCancelling(false);
        }
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

    const isPending = order.status === OrderStatus.PENDING;

    return (
        <div className="container mx-auto px-4 py-6 md:py-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/')}
                    className="mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                </Button>
                <h1 className="text-2xl md:text-3xl font-bold">Order Details</h1>
                <p className="text-muted-foreground mt-1">Order #{order.orderNumber}</p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column - Order Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Payment Status */}
                    {isPending && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950">
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-4">
                                        <Clock className="w-12 h-12 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg text-yellow-900 dark:text-yellow-100 mb-2">
                                                Waiting for Payment
                                            </h3>
                                            <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-4">
                                                Complete your payment to process this order
                                            </p>

                                            {/* Countdown */}
                                            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 mb-4">
                                                <p className="text-sm text-muted-foreground mb-2">Time remaining:</p>
                                                <p className="text-3xl font-bold tabular-nums text-yellow-600 dark:text-yellow-400">
                                                    {formatTimeRemaining(timeRemaining)}
                                                </p>
                                            </div>

                                            {/* Payment Instructions */}
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                                                    Payment Instructions:
                                                </p>
                                                <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-800 dark:text-yellow-200">
                                                    <li>Click "Open Payment Page" below</li>
                                                    <li>Complete payment in the new tab</li>
                                                    <li>This page will auto-update when payment is confirmed</li>
                                                </ol>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Order Items */}
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
                                                    {formatCurrency(item.subtotal, order.currency)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Shipping Address */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
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
                </div>

                {/* Right Column - Summary & Actions */}
                <div className="space-y-6">
                    {/* Order Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Badge className={ORDER_STATUS_COLORS[order.status]}>
                                {ORDER_STATUS_LABELS[order.status]}
                            </Badge>
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
                                <span>{formatCurrency(order.subtotal, order.currency)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Shipping</span>
                                <span>{formatCurrency(order.shippingCost, order.currency)}</span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>Discount</span>
                                    <span>-{formatCurrency(order.discount, order.currency)}</span>
                                </div>
                            )}
                            <Separator />
                            <div className="flex justify-between font-semibold text-lg">
                                <span>Total</span>
                                <span>{formatCurrency(order.total, order.currency)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    {isPending && (
                        <div className="space-y-3">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="w-full" disabled={isCancelling}>
                                        <X className="w-4 h-4 mr-2" />
                                        Cancel Order
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. Your order will be cancelled and you'll need to create a new order.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Keep Order</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleCancelOrder}>
                                            Yes, Cancel Order
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
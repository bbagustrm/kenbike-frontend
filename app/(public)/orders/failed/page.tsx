// app/(public)/orders/failed/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, Home, ShoppingCart, HelpCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { OrderService } from '@/services/order.service';
import { Order, OrderStatus } from '@/types/order';
import { formatCurrency } from '@/lib/format-currency';
// Helper to safely format currency
const formatPrice = (amount: number, currency: string): string => {
    return formatCurrency(amount, (currency as 'IDR' | 'USD'));
};
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

export default function OrderFailedPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderNumber = searchParams.get('orderNumber');

    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!orderNumber) {
            router.push('/');
            return;
        }

        const fetchOrder = async () => {
            try {
                const data = await OrderService.getOrderByNumber(orderNumber);
                setOrder(data);
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

    const isCancelled = order.status === OrderStatus.CANCELLED;
    const isFailed = order.status === OrderStatus.FAILED;

    return (
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-2xl">
            {/* Error Header */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center mb-8"
            >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900 mb-4">
                    <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    {isCancelled ? 'Order Cancelled' : 'Payment Failed'}
                </h1>
                <p className="text-lg text-muted-foreground">
                    {isCancelled
                        ? 'Your order has been cancelled'
                        : 'We were unable to process your payment'
                    }
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                    Order #{order.orderNumber}
                </p>
            </motion.div>

            {/* Reason Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-6"
            >
                <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                                    {isCancelled ? 'Why was my order cancelled?' : 'What happened?'}
                                </h3>
                                <p className="text-sm text-red-800 dark:text-red-200">
                                    {isCancelled
                                        ? 'You chose to cancel this order. No payment was processed, and no charges were made.'
                                        : 'The payment could not be completed. This might be due to insufficient funds, incorrect card details, or a timeout. No charges were made to your account.'
                                    }
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Order Summary */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-6"
            >
                <Card>
                    <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
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
                            <span>Total</span>
                            <span>{formatPrice(order.total, order.currency)}</span>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-3"
            >
                {!isCancelled && (
                    <Button className="w-full" size="lg" asChild>
                        <Link href="/checkout">
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Try Again
                        </Link>
                    </Button>
                )}
                <Button variant="outline" className="w-full" size="lg" asChild>
                    <Link href="/">
                        <Home className="w-4 h-4 mr-2" />
                        Back to Home
                    </Link>
                </Button>
            </motion.div>

            {/* Help Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8"
            >
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <HelpCircle className="w-5 h-5" />
                            Need Help?
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 text-sm">
                            <p className="text-muted-foreground">
                                If you continue to experience issues, please contact our support team:
                            </p>
                            <div className="space-y-1">
                                <p>📧 Email: support@kenbike.com</p>
                                <p>📱 WhatsApp: +62 812-3456-7890</p>
                                <p>🕐 Business Hours: Mon-Fri, 9AM-5PM WIB</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Tips */}
            {!isCancelled && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Tips for Successful Payment</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <span>•</span>
                                    <span>Ensure you have sufficient funds in your account</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span>•</span>
                                    <span>Double-check your card details are correct</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span>•</span>
                                    <span>Complete the payment within the time limit</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span>•</span>
                                    <span>Try a different payment method if issues persist</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span>•</span>
                                    <span>Disable VPN or ad blockers that might interfere</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </div>
    );
}
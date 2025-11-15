// app/(public)/orders/[orderNumber]/page.tsx
"use client";

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useOrder } from '@/hooks/use-order';
import { useTranslation } from '@/hooks/use-translation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { OrderStatusBadge } from '@/components/order/order-status-badge';
import { OrderTimeline } from '@/components/order/order-timeline';
import { OrderTracking } from '@/components/order/order-tracking';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/payment-utils';
import { canCancelOrder, canPayOrder, hasShippingLabel } from '@/lib/order-utils';
import { ChevronLeft, Download, XCircle, CreditCard, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { PaymentService } from '@/services/payment.service';

interface OrderDetailPageProps {
    params: Promise<{ orderNumber: string }>;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
    const resolvedParams = use(params);
    const router = useRouter();
    const { locale } = useTranslation();
    const { order, isLoading, refreshOrder, cancelOrder, downloadLabel } = useOrder(resolvedParams.orderNumber);

    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);

    const handleCancelOrder = async () => {
        setIsCancelling(true);
        try {
            await cancelOrder();
            setShowCancelDialog(false);
            toast.success(locale === 'id' ? 'Pesanan berhasil dibatalkan' : 'Order successfully cancelled');
        } catch (error: unknown) {
            let errorMessage = locale === 'id' ? 'Gagal membatalkan pesanan' : 'Failed to cancel order';

            if (error instanceof Error) {
                errorMessage = error.message;
            }

            toast.error(errorMessage);
        } finally {
            setIsCancelling(false);
        }
    };

    const handlePayNow = async () => {
        if (!order) return;

        setIsRedirecting(true);
        try {
            const response = await PaymentService.createPayment({
                orderNumber: order.orderNumber,
                paymentMethod: order.currency === 'IDR' ? 'MIDTRANS_SNAP' : 'PAYPAL',
            });

            // Redirect to payment URL
            window.location.href = response.data.paymentUrl;
        } catch (error: unknown) { // Ganti any dengan unknown
            // Lakukan type guard untuk memastikan error adalah instance dari Error
            let errorMessage = locale === 'id' ? 'Gagal membuat pembayaran' : 'Failed to create payment';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            toast.error(errorMessage);
            setIsRedirecting(false);
        }
    };

    if (isLoading) {
        return (
            <ProtectedRoute>
                <div className="container mx-auto px-4 py-8">
                    <Skeleton className="h-8 w-48 mb-8" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <Skeleton className="h-64" />
                            <Skeleton className="h-48" />
                        </div>
                        <Skeleton className="h-96" />
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (!order) {
        return (
            <ProtectedRoute>
                <div className="container mx-auto px-4 py-8">
                    <p>Order not found</p>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    {/* Back Button */}
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/orders')}
                        className="mb-6"
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        {locale === 'id' ? 'Kembali ke Pesanan' : 'Back to Orders'}
                    </Button>

                    {/* Header */}
                    <div className="flex items-start justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">
                                {order.orderNumber}
                            </h1>
                            <p className="text-muted-foreground">
                                {new Date(order.createdAt).toLocaleString(
                                    locale === 'id' ? 'id-ID' : 'en-US',
                                    { dateStyle: 'long', timeStyle: 'short' }
                                )}
                            </p>
                        </div>
                        <OrderStatusBadge status={order.status} locale={locale} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Timeline */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        {locale === 'id' ? 'Status Pesanan' : 'Order Status'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <OrderTimeline order={order} locale={locale} />
                                </CardContent>
                            </Card>

                            {/* Tracking (if shipped) */}
                            {['SHIPPED', 'DELIVERED', 'COMPLETED'].includes(order.status) && (
                                <OrderTracking orderNumber={order.orderNumber} locale={locale} country={order.shippingCountry}/>
                            )}

                            {/* Items */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        {locale === 'id' ? 'Item Pesanan' : 'Order Items'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {order.items.map((item, index) => (
                                        <div key={index}>
                                            <div className="flex gap-4">
                                                <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                                                    {item.productImage ? (
                                                        <Image
                                                            src={item.productImage}
                                                            alt={item.productName}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                                            No Image
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold">{item.productName}</h3>
                                                    <p className="text-sm text-muted-foreground">{item.variantName}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {formatCurrency(item.pricePerItem, order.currency)} × {item.quantity}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold">
                                                        {formatCurrency(item.subtotal, order.currency)}
                                                    </p>
                                                </div>
                                            </div>
                                            {index < order.items.length - 1 && <Separator className="mt-4" />}
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Shipping Address */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        {locale === 'id' ? 'Alamat Pengiriman' : 'Shipping Address'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <p className="font-semibold">{order.recipientName}</p>
                                        <p className="text-sm text-muted-foreground">{order.recipientPhone}</p>
                                        <p className="text-sm">{order.shippingAddress}</p>
                                        <p className="text-sm">
                                            {order.shippingCity}, {order.shippingProvince}
                                        </p>
                                        <p className="text-sm">
                                            {order.shippingCountry} {order.shippingPostalCode}
                                        </p>
                                        {order.shippingNotes && (
                                            <p className="text-sm text-muted-foreground italic">
                                                {locale === 'id' ? 'Catatan' : 'Notes'}: {order.shippingNotes}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        {locale === 'id' ? 'Ringkasan' : 'Summary'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{locale === 'id' ? 'Subtotal' : 'Subtotal'}</span>
                                        <span>{formatCurrency(order.subtotal, order.currency)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{locale === 'id' ? 'Ongkir' : 'Shipping'}</span>
                                        <span>{formatCurrency(order.shippingCost, order.currency)}</span>
                                    </div>
                                    {order.tax > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">{locale === 'id' ? 'Pajak' : 'Tax'}</span>
                                            <span>{formatCurrency(order.tax, order.currency)}</span>
                                        </div>
                                    )}
                                    <Separator />
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>{locale === 'id' ? 'Total' : 'Total'}</span>
                                        <span className="text-primary">{formatCurrency(order.total, order.currency)}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Actions */}
                            <Card>
                                <CardContent className="pt-6 space-y-3">
                                    {canPayOrder(order.status) && (
                                        <Button
                                            onClick={handlePayNow}
                                            className="w-full"
                                            disabled={isRedirecting}
                                        >
                                            <CreditCard className="w-4 h-4 mr-2" />
                                            {isRedirecting
                                                ? (locale === 'id' ? 'Mengarahkan...' : 'Redirecting...')
                                                : (locale === 'id' ? 'Bayar Sekarang' : 'Pay Now')
                                            }
                                        </Button>
                                    )}

                                    {hasShippingLabel(order.status) && (
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={downloadLabel}
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            {locale === 'id' ? 'Unduh Label' : 'Download Label'}
                                        </Button>
                                    )}

                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => refreshOrder()}
                                    >
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        {locale === 'id' ? 'Refresh' : 'Refresh'}
                                    </Button>

                                    {canCancelOrder(order.status) && (
                                        <Button
                                            variant="destructive"
                                            className="w-full"
                                            onClick={() => setShowCancelDialog(true)}
                                        >
                                            <XCircle className="w-4 h-4 mr-2" />
                                            {locale === 'id' ? 'Batalkan Pesanan' : 'Cancel Order'}
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cancel Confirmation Dialog */}
            <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {locale === 'id' ? 'Batalkan Pesanan?' : 'Cancel Order?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {locale === 'id'
                                ? 'Apakah Anda yakin ingin membatalkan pesanan ini? Tindakan ini tidak dapat dibatalkan.'
                                : 'Are you sure you want to cancel this order? This action cannot be undone.'
                            }
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isCancelling}>
                            {locale === 'id' ? 'Batal' : 'Cancel'}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCancelOrder}
                            disabled={isCancelling}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {isCancelling
                                ? (locale === 'id' ? 'Membatalkan...' : 'Cancelling...')
                                : (locale === 'id' ? 'Ya, Batalkan' : 'Yes, Cancel')
                            }
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </ProtectedRoute>
    );
}
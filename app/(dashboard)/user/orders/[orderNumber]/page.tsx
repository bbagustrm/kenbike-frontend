// app/(dashboard)/user/orders/[orderNumber]/page.tsx
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import { OrderService } from "@/services/order.service";
import { PaymentService } from "@/services/payment.service";
import { ReviewService } from "@/services/review.service";
import { Order } from "@/types/order";
import { PaymentStatus } from "@/types/payment";
import { PendingReviewItem } from "@/types/review";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import { MidtransSnapButton } from "@/components/payment/midtrans-snap-button";
import { PayPalRedirectButton } from "@/components/payment/paypal-redirect-button";
import { PaymentStatusBadge } from "@/components/payment/payment-status-badge";
import { OrderStatusBadge } from "@/components/order/order-status-badge";
import { OrderDetail } from "@/components/order/order-detail";
import { OrderTimeline } from "@/components/order/order-timeline";
import { OrderTracking } from "@/components/order/order-tracking";
import { OrderActions } from "@/components/order/order-actions";
import { ReviewForm } from "@/components/review/review-form";
import { formatCurrency } from "@/lib/format-currency";
import { InvoiceDownloadButtons } from "@/components/invoice/invoice-download-buttons";
import { useTranslation } from "@/hooks/use-translation";
import {
    Loader2,
    Package,
    CreditCard,
    RefreshCw,
    ArrowLeft,
    Star,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function OrderDetailPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const { t, locale } = useTranslation();
    const orderNumber = params.orderNumber as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPolling, setIsPolling] = useState(false);

    // Review states
    const [pendingReviews, setPendingReviews] = useState<PendingReviewItem[]>([]);
    const [reviewedProductIds, setReviewedProductIds] = useState<Set<string>>(new Set());
    const [expandedReviewForm, setExpandedReviewForm] = useState<string | null>(null);
    const [showReviewSection, setShowReviewSection] = useState(true);

    // PayPal callback states
    const [isCapturingPayPal, setIsCapturingPayPal] = useState(false);
    const [paypalCallbackProcessed, setPaypalCallbackProcessed] = useState(false);
    const paypalCaptureAttempted = useRef(false);

    // Check if URL has review param to auto-expand
    const reviewProductId = searchParams.get('review');

    // Fetch order data
    const fetchOrder = useCallback(async () => {
        if (!orderNumber) return;

        setIsLoading(true);
        try {
            const response = await OrderService.getOrderDetail(orderNumber);
            setOrder(response.data);

            // Set payment status based on order status
            if (response.data.status === 'PAID' || response.data.paid_at) {
                setPaymentStatus('PAID');
            } else if (response.data.status === 'PENDING') {
                setPaymentStatus('PENDING');
            } else if (response.data.status === 'FAILED') {
                setPaymentStatus('FAILED');
            }

            // Fetch pending reviews if order is completed
            if (response.data.status === 'COMPLETED') {
                fetchPendingReviews();
            }
        } catch (error) {
            console.error("Failed to fetch order:", error);
            toast.error(locale === "id" ? "Gagal memuat detail pesanan" : "Failed to load order details");
        } finally {
            setIsLoading(false);
        }
    }, [orderNumber, locale]);

    // Fetch pending reviews for this order
    const fetchPendingReviews = async () => {
        try {
            const response = await ReviewService.getPendingReviews();
            // Filter to only show pending reviews for this order
            const orderPending = response.data.filter(
                (item) => item.orderNumber === orderNumber
            );
            setPendingReviews(orderPending);

            // Auto-expand if URL has review param
            if (reviewProductId && orderPending.some((p) => p.product.id === reviewProductId)) {
                setExpandedReviewForm(reviewProductId);
            }
        } catch (error) {
            console.error("Failed to fetch pending reviews:", error);
        }
    };

    // Poll payment status
    const pollPaymentStatus = useCallback(async () => {
        if (!order || !orderNumber) return;

        setIsPolling(true);
        try {
            const status = await PaymentService.getPaymentStatus(orderNumber);
            setPaymentStatus(status.payment_status);

            if (status.payment_status === "PAID") {
                toast.success(t.orders?.payment?.paymentSuccess || (locale === "id" ? "Pembayaran berhasil!" : "Payment confirmed!"));
                fetchOrder();
            }
        } catch (error) {
            console.error("Failed to check payment status:", error);
        } finally {
            setIsPolling(false);
        }
    }, [order, orderNumber, fetchOrder, t, locale]);

    // Handle PayPal callback
    const handlePayPalCallback = useCallback(async () => {
        const payment = searchParams.get('payment');
        const token = searchParams.get('token');

        if (!payment || paypalCaptureAttempted.current) return;

        paypalCaptureAttempted.current = true;

        if (payment === 'cancelled') {
            toast.error(t.orders?.payment?.paymentCancelled || (locale === "id" ? "Pembayaran dibatalkan" : "Payment was cancelled"));
            setPaypalCallbackProcessed(true);
            router.replace(`/user/orders/${orderNumber}`);
            return;
        }

        if (payment === 'success' && token) {
            setIsCapturingPayPal(true);

            try {
                await PaymentService.capturePayPalPayment({
                    order_number: orderNumber,
                    paypal_order_id: token,
                });

                toast.success(t.orders?.payment?.paymentSuccess || (locale === "id" ? "Pembayaran berhasil! Terima kasih atas pesanan Anda." : "Payment successful! Thank you for your order."));
                setPaymentStatus('PAID');
                await fetchOrder();
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : (locale === "id" ? "Gagal memproses pembayaran PayPal" : "Failed to capture PayPal payment");

                if (errorMessage.includes('already') || errorMessage.includes('PAID')) {
                    toast.success(t.orders?.payment?.paymentConfirmed || (locale === "id" ? "Pembayaran sudah dikonfirmasi!" : "Payment already confirmed!"));
                    setPaymentStatus('PAID');
                    await fetchOrder();
                } else {
                    toast.error(errorMessage);
                }
            } finally {
                setIsCapturingPayPal(false);
                setPaypalCallbackProcessed(true);
                router.replace(`/user/orders/${orderNumber}`);
            }
        }
    }, [searchParams, orderNumber, fetchOrder, router, t, locale]);

    // Handle review submission success
    const handleReviewSuccess = (productId: string) => {
        setReviewedProductIds((prev) => new Set([...prev, productId]));
        setPendingReviews((prev) => prev.filter((p) => p.product.id !== productId));
        setExpandedReviewForm(null);

        // Get product name for toast message
        const product = pendingReviews.find(p => p.product.id === productId);
        const productName = product?.product.name || "";

        toast.success(
            (t.orders?.review?.reviewSubmitted || (locale === "id"
                ? "Ulasan untuk {product} berhasil dikirim!"
                : "Review for {product} submitted!")).replace("{product}", productName)
        );
    };

    // Initial fetch
    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

    // Handle PayPal callback after order is loaded
    useEffect(() => {
        if (order && !paypalCallbackProcessed) {
            handlePayPalCallback();
        }
    }, [order, paypalCallbackProcessed, handlePayPalCallback]);

    // Auto-poll payment status every 5 seconds for pending payments
    useEffect(() => {
        if (paymentStatus === "PENDING" && order && !isCapturingPayPal) {
            const interval = setInterval(() => {
                pollPaymentStatus();
            }, 5000);

            return () => clearInterval(interval);
        }
    }, [paymentStatus, order, pollPaymentStatus, isCapturingPayPal]);

    // Show capturing state
    if (isCapturingPayPal) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2">
                        {t.orders?.payment?.processingPayment || (locale === "id" ? "Memproses Pembayaran..." : "Processing Payment...")}
                    </h2>
                    <p className="text-muted-foreground">
                        {t.orders?.payment?.processingPaymentDesc || (locale === "id"
                            ? "Mohon tunggu sementara kami mengonfirmasi pembayaran PayPal Anda."
                            : "Please wait while we confirm your PayPal payment.")}
                    </p>
                </div>
            </div>
        );
    }

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
                <h2 className="text-2xl font-bold mb-2">
                    {t.orders?.notFound?.title || (locale === "id" ? "Pesanan Tidak Ditemukan" : "Order Not Found")}
                </h2>
                <p className="text-muted-foreground mb-6">
                    {t.orders?.notFound?.description || (locale === "id"
                        ? "Pesanan yang Anda cari tidak ada atau telah dihapus."
                        : "The order you're looking for doesn't exist or has been deleted.")}
                </p>
                <Button onClick={() => router.push("/user/orders")}>
                    {t.orders?.notFound?.viewAllOrders || (locale === "id" ? "Lihat Semua Pesanan" : "View All Orders")}
                </Button>
            </div>
        );
    }

    const showPaymentButtons =
        paymentStatus === "PENDING" &&
        (order.status === "PENDING");

    const showReviewForms = order.status === "COMPLETED" && pendingReviews.length > 0;

    return (
        <div className="min-h-screen bg-muted/30">
            <div className="container mx-auto px-4 py-8">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/user/orders")}
                    className="mb-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t.orders?.backToOrders || (locale === "id" ? "Kembali ke Pesanan" : "Back to Orders")}
                </Button>

                {/* Header */}
                <ScrollReveal delay={0.1}>
                    <div className="mb-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">
                                    {t.orders?.order || (locale === "id" ? "Pesanan" : "Order")} #{order.order_number}
                                </h1>
                                <p className="text-muted-foreground">
                                    {t.orders?.placedOn || (locale === "id" ? "Dibuat pada" : "Placed on")}{" "}
                                    {new Date(order.created_at).toLocaleDateString(
                                        locale === "id" ? "id-ID" : "en-US",
                                        {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        }
                                    )}
                                </p>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                <OrderStatusBadge status={order.status} />
                                {paymentStatus && <PaymentStatusBadge status={paymentStatus} />}
                                <InvoiceDownloadButtons
                                    orderNumber={order.order_number}
                                    orderStatus={order.status}
                                    hasPaid={!!order.paid_at}
                                    hasTrackingNumber={!!order.tracking_number}
                                />
                            </div>
                        </div>
                        <OrderActions order={order} onUpdate={fetchOrder} />
                    </div>
                </ScrollReveal>

                {/* Payment Section - Only show if payment pending */}
                {showPaymentButtons && (
                    <ScrollReveal delay={0.2}>
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    {t.orders?.payment?.completePayment || (locale === "id" ? "Selesaikan Pembayaran" : "Complete Payment")}
                                </CardTitle>
                                <CardDescription>
                                    {t.orders?.payment?.completePaymentDesc || (locale === "id"
                                        ? "Pilih metode pembayaran untuk menyelesaikan pesanan"
                                        : "Choose your payment method to complete this order")}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Payment Amount */}
                                <div className="bg-muted p-4 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">
                                            {t.orders?.payment?.totalAmount || (locale === "id" ? "Total Pembayaran" : "Total Amount")}
                                        </span>
                                        <span className="text-2xl font-bold">
                                            {formatCurrency(order.total, order.currency)}
                                        </span>
                                    </div>
                                </div>

                                {/* Payment Buttons */}
                                <div className="space-y-3">
                                    {order.currency === "IDR" && (
                                        <MidtransSnapButton
                                            orderNumber={order.order_number}
                                            onSuccess={() => {
                                                fetchOrder();
                                                pollPaymentStatus();
                                            }}
                                            className="w-full"
                                        />
                                    )}

                                    {order.currency === "USD" && (
                                        <PayPalRedirectButton
                                            orderNumber={order.order_number}
                                            className="w-full"
                                        />
                                    )}
                                </div>

                                {/* Refresh Status Button */}
                                <div className="pt-4 border-t">
                                    <Button
                                        variant="outline"
                                        onClick={pollPaymentStatus}
                                        disabled={isPolling}
                                        className="w-full"
                                    >
                                        {isPolling ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                {t.orders?.payment?.checkingStatus || (locale === "id" ? "Memeriksa Status..." : "Checking Status...")}
                                            </>
                                        ) : (
                                            <>
                                                <RefreshCw className="h-4 w-4 mr-2" />
                                                {t.orders?.payment?.refreshStatus || (locale === "id" ? "Perbarui Status Pembayaran" : "Refresh Payment Status")}
                                            </>
                                        )}
                                    </Button>
                                    <p className="text-xs text-muted-foreground text-center mt-2">
                                        {t.orders?.payment?.statusAutoUpdate || (locale === "id"
                                            ? "Status diperbarui otomatis setiap 5 detik"
                                            : "Status updates automatically every 5 seconds")}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </ScrollReveal>
                )}

                {/* Review Section - Only show if order completed and has pending reviews */}
                {showReviewForms && (
                    <ScrollReveal delay={0.2}>
                        <Card className="mb-6">
                            <CardHeader
                                className="cursor-pointer"
                                onClick={() => setShowReviewSection(!showReviewSection)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Star className="h-5 w-5 text-yellow-500" />
                                        <CardTitle>
                                            {t.orders?.review?.writeReviews || (locale === "id" ? "Tulis Ulasan" : "Write Reviews")}
                                        </CardTitle>
                                        <Badge variant="secondary">{pendingReviews.length}</Badge>
                                    </div>
                                    {showReviewSection ? (
                                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                    )}
                                </div>
                                <CardDescription>
                                    {t.orders?.review?.writeReviewsDesc || (locale === "id"
                                        ? "Bagikan pengalaman Anda dengan produk yang dibeli"
                                        : "Share your experience with the products you purchased")}
                                </CardDescription>
                            </CardHeader>

                            <AnimatePresence>
                                {showReviewSection && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <CardContent className="space-y-4">
                                            {pendingReviews.map((item) => {
                                                const isExpanded = expandedReviewForm === item.product.id;
                                                const isReviewed = reviewedProductIds.has(item.product.id);

                                                if (isReviewed) {
                                                    return (
                                                        <div
                                                            key={item.product.id}
                                                            className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800"
                                                        >
                                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                            <span className="font-medium">
                                                                {(t.orders?.review?.reviewSubmitted || (locale === "id"
                                                                    ? "Ulasan untuk {product} berhasil dikirim!"
                                                                    : "Review for {product} submitted!")).replace("{product}", item.product.name)}
                                                            </span>
                                                        </div>
                                                    );
                                                }

                                                return (
                                                    <div key={item.product.id} className="border rounded-lg overflow-hidden">
                                                        {/* Product Header */}
                                                        <button
                                                            onClick={() => setExpandedReviewForm(isExpanded ? null : item.product.id)}
                                                            className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left"
                                                        >
                                                            {/* Product Image */}
                                                            <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted shrink-0">
                                                                <Image
                                                                    src={item.product.imageUrl || "/placeholder.png"}
                                                                    alt={item.product.name}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            </div>

                                                            {/* Product Info */}
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium line-clamp-1">
                                                                    {item.product.name}
                                                                </p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {t.orders?.review?.clickToWriteReview || (locale === "id"
                                                                        ? "Klik untuk menulis ulasan"
                                                                        : "Click to write a review")}
                                                                </p>
                                                            </div>

                                                            {/* Expand Icon */}
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                <Badge variant="outline" className="gap-1">
                                                                    <Star className="w-3 h-3" />
                                                                    {t.orders?.review?.writeReview || (locale === "id" ? "Tulis Ulasan" : "Write Review")}
                                                                </Badge>
                                                                {isExpanded ? (
                                                                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                                                ) : (
                                                                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                                                )}
                                                            </div>
                                                        </button>

                                                        {/* Review Form */}
                                                        <AnimatePresence>
                                                            {isExpanded && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: "auto", opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    transition={{ duration: 0.2 }}
                                                                >
                                                                    <Separator />
                                                                    <div className="p-4">
                                                                        <ReviewForm
                                                                            productId={item.product.id}
                                                                            orderId={item.orderId}
                                                                            productName={item.product.name}
                                                                            onSuccess={() => handleReviewSuccess(item.product.id)}
                                                                            onCancel={() => setExpandedReviewForm(null)}
                                                                        />
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                );
                                            })}
                                        </CardContent>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Card>
                    </ScrollReveal>
                )}

                {/* Main Content - Two Column Layout */}
                <ScrollReveal delay={0.3}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Order Details (2/3 width) */}
                        <div className="lg:col-span-2">
                            <OrderDetail order={order} />
                        </div>

                        {/* Right Column - Timeline & Tracking (1/3 width) */}
                        <div className="space-y-6">
                            {/* Order Timeline */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        {t.orders?.detail?.timeline || (locale === "id" ? "Timeline Pesanan" : "Order Timeline")}
                                    </CardTitle>
                                    <CardDescription>
                                        {t.orders?.detail?.timelineDesc || (locale === "id"
                                            ? "Pantau progres pesanan Anda"
                                            : "Track the progress of your order")}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <OrderTimeline order={order} />
                                </CardContent>
                            </Card>

                            {/* Tracking - Only show if shipped */}
                            {order.tracking_number && (
                                <OrderTracking
                                    orderNumber={order.order_number}
                                    trackingNumber={order.tracking_number}
                                />
                            )}
                        </div>
                    </div>
                </ScrollReveal>
            </div>
        </div>
    );
}
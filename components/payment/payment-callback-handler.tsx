// components/payment/payment-callback-handler.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PaymentService } from "@/services/payment.service";
import { PaymentStatusResponse } from "@/types/payment";
import { useTranslation } from "@/hooks/use-translation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
    CheckCircle2,
    XCircle,
    Loader2,
    Clock,
    AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface PaymentCallbackHandlerProps {
    orderNumber: string;
}

type PaymentState =
    | "loading"
    | "polling"
    | "success"
    | "failed"
    | "expired"
    | "pending";

// Polling configuration
const POLLING_CONFIG = {
    INTERVAL_MS: 5000, // 5 seconds (safe under 10 req/10s rate limit)
    MAX_ATTEMPTS: 36, // 36 × 5s = 3 minutes
    MAX_DISPLAY_ATTEMPTS: 36, // For progress bar
};

export function PaymentCallbackHandler({
                                           orderNumber,
                                       }: PaymentCallbackHandlerProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t, locale } = useTranslation();
    const [state, setState] = useState<PaymentState>("loading");
    const [message, setMessage] = useState("");
    const [attempts, setAttempts] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Progress percentage for polling
    const progressPercent = Math.min(
        (attempts / POLLING_CONFIG.MAX_DISPLAY_ATTEMPTS) * 100,
        100
    );

    useEffect(() => {
        const handleCallback = async () => {
            // Check if this is PayPal return
            const payment = searchParams.get("payment");
            const token = searchParams.get("token");
            const payerId = searchParams.get("PayerID");

            if (payment && token) {
                // PayPal callback
                if (payment === "success" && payerId) {
                    try {
                        // Capture PayPal payment (snake_case DTO)
                        await PaymentService.capturePayPalPayment({
                            order_number: orderNumber,
                            paypal_order_id: token,
                        });

                        setState("success");
                        setMessage(
                            t.paymentCallback?.successMessage ||
                            (locale === "id"
                                ? "Pembayaran berhasil! Pesanan Anda telah dikonfirmasi."
                                : "Payment successful! Your order is confirmed.")
                        );
                        toast.success(
                            t.paymentCallback?.paymentCompleted ||
                            (locale === "id" ? "Pembayaran berhasil" : "Payment completed successfully")
                        );

                        // Redirect to order detail after 2 seconds
                        setTimeout(() => {
                            router.push(`/user/orders/${orderNumber}`);
                        }, 2000);
                    } catch (error) {
                        setState("failed");
                        setMessage(
                            error instanceof Error
                                ? error.message
                                : (t.paymentCallback?.paypalFailed ||
                                    (locale === "id" ? "Gagal memproses pembayaran PayPal" : "Failed to process PayPal payment"))
                        );
                        toast.error(
                            t.paymentCallback?.processingFailed ||
                            (locale === "id" ? "Pemrosesan pembayaran gagal" : "Payment processing failed")
                        );
                    }
                } else if (payment === "cancelled") {
                    setState("failed");
                    setMessage(
                        t.paymentCallback?.cancelledMessage ||
                        (locale === "id" ? "Pembayaran dibatalkan. Anda dapat mencoba lagi." : "Payment was cancelled. You can try again.")
                    );
                    toast.info(
                        t.paymentCallback?.paymentCancelled ||
                        (locale === "id" ? "Pembayaran dibatalkan" : "Payment cancelled")
                    );
                }
            } else {
                // For Midtrans: Start smart polling
                startPolling();
            }
        };

        handleCallback();

        // Cleanup on unmount
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [orderNumber, searchParams, router, t, locale]);

    // Smart polling with visibility handling
    const startPolling = async () => {
        setState("polling");
        setMessage(
            t.paymentCallback?.checkingStatus ||
            (locale === "id" ? "Memeriksa status pembayaran..." : "Checking payment status...")
        );

        // Create abort controller for cancellation
        abortControllerRef.current = new AbortController();

        try {
            const result = await PaymentService.pollPaymentStatus(orderNumber, {
                intervalMs: POLLING_CONFIG.INTERVAL_MS,
                maxAttempts: POLLING_CONFIG.MAX_ATTEMPTS,
                signal: abortControllerRef.current.signal,
                onStatusChange: handleStatusChange,
                onAttempt: (attempt) => {
                    setAttempts(attempt);
                },
            });

            // Final status handling
            handleFinalStatus(result);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";

            if (errorMessage === "Polling cancelled") {
                // User left page, do nothing
                return;
            }

            console.error("Payment polling error:", error);
            setState("pending");
            setMessage(
                t.paymentCallback?.unableToVerify ||
                (locale === "id"
                    ? "Tidak dapat memverifikasi status pembayaran. Silakan periksa pesanan Anda untuk pembaruan."
                    : "Unable to verify payment status. Please check your order for updates.")
            );
        }
    };

    // Handle status changes during polling (snake_case: payment_status)
    const handleStatusChange = (status: PaymentStatusResponse) => {
        console.log("Payment status changed:", status.payment_status);

        switch (status.payment_status) {
            case "PAID":
                setState("success");
                setMessage(
                    t.paymentCallback?.successMessage ||
                    (locale === "id"
                        ? "Pembayaran berhasil! Pesanan Anda telah dikonfirmasi."
                        : "Payment successful! Your order is confirmed.")
                );
                toast.success(
                    t.paymentCallback?.paymentCompleted ||
                    (locale === "id" ? "Pembayaran berhasil" : "Payment completed successfully")
                );
                setTimeout(() => {
                    router.push(`/user/orders/${orderNumber}`);
                }, 2000);
                break;

            case "FAILED":
                setState("failed");
                setMessage(
                    t.paymentCallback?.failedMessage ||
                    (locale === "id" ? "Pembayaran gagal. Silakan coba lagi." : "Payment failed. Please try again.")
                );
                toast.error(
                    t.paymentCallback?.paymentFailed ||
                    (locale === "id" ? "Pembayaran gagal" : "Payment failed")
                );
                break;

            case "EXPIRED":
                setState("expired");
                setMessage(
                    t.paymentCallback?.expiredMessage ||
                    (locale === "id"
                        ? "Pembayaran telah kedaluwarsa. Silakan buat pesanan baru."
                        : "Payment has expired. Please create a new order.")
                );
                toast.error(
                    t.paymentCallback?.paymentExpired ||
                    (locale === "id" ? "Pembayaran kedaluwarsa" : "Payment expired")
                );
                break;
        }
    };

    // Handle final polling result (snake_case: payment_status)
    const handleFinalStatus = (status: PaymentStatusResponse) => {
        switch (status.payment_status) {
            case "PAID":
                setState("success");
                setMessage(
                    t.paymentCallback?.successMessage ||
                    (locale === "id"
                        ? "Pembayaran berhasil! Pesanan Anda telah dikonfirmasi."
                        : "Payment successful! Your order is confirmed.")
                );
                toast.success(
                    t.paymentCallback?.paymentCompleted ||
                    (locale === "id" ? "Pembayaran berhasil" : "Payment completed successfully")
                );
                setTimeout(() => {
                    router.push(`/user/orders/${orderNumber}`);
                }, 2000);
                break;

            case "PENDING":
                setState("pending");
                setMessage(
                    t.paymentCallback?.pendingMessage ||
                    (locale === "id"
                        ? "Pembayaran masih diproses. Silakan periksa kembali nanti atau selesaikan pembayaran Anda."
                        : "Payment is still being processed. Please check back later or complete your payment.")
                );
                break;

            case "FAILED":
                setState("failed");
                setMessage(
                    t.paymentCallback?.failedMessage ||
                    (locale === "id" ? "Pembayaran gagal. Silakan coba lagi." : "Payment failed. Please try again.")
                );
                break;

            case "EXPIRED":
                setState("expired");
                setMessage(
                    t.paymentCallback?.expiredMessage ||
                    (locale === "id"
                        ? "Pembayaran telah kedaluwarsa. Silakan buat pesanan baru."
                        : "Payment has expired. Please create a new order.")
                );
                break;

            default:
                setState("pending");
                setMessage(
                    t.paymentCallback?.unknownStatus ||
                    (locale === "id" ? "Tidak dapat menentukan status pembayaran." : "Unable to determine payment status.")
                );
        }
    };

    // Listen for visibility changes
    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsPaused(document.hidden);
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-card p-8 rounded-lg shadow-lg max-w-md w-full mx-4 text-center"
            >
                {/* Loading State */}
                {state === "loading" && (
                    <>
                        <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">
                            {t.paymentCallback?.processingTitle || (locale === "id" ? "Memproses Pembayaran" : "Processing Payment")}
                        </h2>
                        <p className="text-muted-foreground">
                            {t.paymentCallback?.pleaseWait || (locale === "id" ? "Mohon tunggu sementara kami memverifikasi pembayaran Anda..." : "Please wait while we verify your payment...")}
                        </p>
                    </>
                )}

                {/* Polling State */}
                {state === "polling" && (
                    <>
                        <div className="relative mb-4">
                            <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
                            {isPaused && (
                                <div className="absolute -top-2 -right-2 bg-yellow-100 rounded-full p-1">
                                    <Clock className="h-5 w-5 text-yellow-600" />
                                </div>
                            )}
                        </div>
                        <h2 className="text-2xl font-bold mb-2">
                            {t.paymentCallback?.verifyingTitle || (locale === "id" ? "Memverifikasi Pembayaran" : "Verifying Payment")}
                        </h2>
                        <p className="text-muted-foreground mb-4">
                            {isPaused
                                ? (t.paymentCallback?.verificationPaused || (locale === "id" ? "Verifikasi dijeda (tab tersembunyi)" : "Verification paused (tab hidden)"))
                                : (t.paymentCallback?.waitingConfirmation || (locale === "id" ? "Menunggu konfirmasi pembayaran..." : "Waiting for payment confirmation..."))}
                        </p>

                        {/* Progress bar */}
                        <div className="space-y-2">
                            <Progress value={progressPercent} className="h-2" />
                            <p className="text-xs text-muted-foreground">
                                {(t.paymentCallback?.attemptProgress || (locale === "id" ? "Percobaan {current} dari {max}" : "Attempt {current} of {max}"))
                                    .replace("{current}", attempts.toString())
                                    .replace("{max}", POLLING_CONFIG.MAX_ATTEMPTS.toString())}
                            </p>
                        </div>

                        <p className="text-xs text-muted-foreground mt-4">
                            {t.paymentCallback?.dontClosePage || (locale === "id" ? "Ini mungkin memerlukan beberapa saat. Mohon jangan tutup halaman ini." : "This may take a few moments. Please don't close this page.")}
                        </p>
                    </>
                )}

                {/* Success State */}
                {state === "success" && (
                    <>
                        <div className="bg-green-100 rounded-full p-4 inline-block mb-4">
                            <CheckCircle2 className="h-16 w-16 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-green-600">
                            {t.paymentCallback?.successTitle || (locale === "id" ? "Pembayaran Berhasil!" : "Payment Successful!")}
                        </h2>
                        <p className="text-muted-foreground mb-4">{message}</p>
                        <p className="text-sm text-muted-foreground">
                            {t.paymentCallback?.redirecting || (locale === "id" ? "Mengalihkan ke pesanan Anda..." : "Redirecting to your order...")}
                        </p>
                    </>
                )}

                {/* Failed State */}
                {state === "failed" && (
                    <>
                        <div className="bg-red-100 rounded-full p-4 inline-block mb-4">
                            <XCircle className="h-16 w-16 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-red-600">
                            {t.paymentCallback?.failedTitle || (locale === "id" ? "Pembayaran Gagal" : "Payment Failed")}
                        </h2>
                        <p className="text-muted-foreground mb-6">{message}</p>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => router.push(`/user/orders/${orderNumber}`)}
                                className="flex-1"
                            >
                                {t.paymentCallback?.viewOrder || (locale === "id" ? "Lihat Pesanan" : "View Order")}
                            </Button>
                            <Button
                                onClick={() => router.push("/checkout")}
                                className="flex-1"
                            >
                                {t.paymentCallback?.tryAgain || (locale === "id" ? "Coba Lagi" : "Try Again")}
                            </Button>
                        </div>
                    </>
                )}

                {/* Expired State */}
                {state === "expired" && (
                    <>
                        <div className="bg-orange-100 rounded-full p-4 inline-block mb-4">
                            <Clock className="h-16 w-16 text-orange-600" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-orange-600">
                            {t.paymentCallback?.expiredTitle || (locale === "id" ? "Pembayaran Kedaluwarsa" : "Payment Expired")}
                        </h2>
                        <p className="text-muted-foreground mb-6">{message}</p>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => router.push(`/user/orders/${orderNumber}`)}
                                className="flex-1"
                            >
                                {t.paymentCallback?.viewOrder || (locale === "id" ? "Lihat Pesanan" : "View Order")}
                            </Button>
                            <Button
                                onClick={() => router.push("/cart")}
                                className="flex-1"
                            >
                                {t.paymentCallback?.backToCart || (locale === "id" ? "Kembali ke Keranjang" : "Back to Cart")}
                            </Button>
                        </div>
                    </>
                )}

                {/* Pending State (timeout) */}
                {state === "pending" && (
                    <>
                        <div className="bg-yellow-100 rounded-full p-4 inline-block mb-4">
                            <AlertTriangle className="h-16 w-16 text-yellow-600" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-yellow-600">
                            {t.paymentCallback?.pendingTitle || (locale === "id" ? "Pembayaran Tertunda" : "Payment Pending")}
                        </h2>
                        <p className="text-muted-foreground mb-6">{message}</p>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => router.push(`/user/orders/${orderNumber}`)}
                                className="flex-1"
                            >
                                {t.paymentCallback?.viewOrder || (locale === "id" ? "Lihat Pesanan" : "View Order")}
                            </Button>
                            <Button
                                onClick={() => {
                                    setAttempts(0);
                                    startPolling();
                                }}
                                className="flex-1"
                            >
                                {t.paymentCallback?.checkAgain || (locale === "id" ? "Periksa Lagi" : "Check Again")}
                            </Button>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
}
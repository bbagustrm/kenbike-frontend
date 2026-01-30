// components/payment/payment-callback-handler.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PaymentService } from "@/services/payment.service";
import { PaymentStatusResponse } from "@/types/payment";
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
                        setMessage("Payment successful! Your order is confirmed.");
                        toast.success("Payment completed successfully");

                        // Redirect to order detail after 2 seconds
                        setTimeout(() => {
                            router.push(`/orders/${orderNumber}`);
                        }, 2000);
                    } catch (error) {
                        setState("failed");
                        setMessage(
                            error instanceof Error
                                ? error.message
                                : "Failed to process PayPal payment"
                        );
                        toast.error("Payment processing failed");
                    }
                } else if (payment === "cancelled") {
                    setState("failed");
                    setMessage("Payment was cancelled. You can try again.");
                    toast.info("Payment cancelled");
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
    }, [orderNumber, searchParams, router]);

    // Smart polling with visibility handling
    const startPolling = async () => {
        setState("polling");
        setMessage("Checking payment status...");

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
                "Unable to verify payment status. Please check your order for updates."
            );
        }
    };

    // Handle status changes during polling (snake_case: payment_status)
    const handleStatusChange = (status: PaymentStatusResponse) => {
        console.log("Payment status changed:", status.payment_status);

        switch (status.payment_status) {
            case "PAID":
                setState("success");
                setMessage("Payment successful! Your order is confirmed.");
                toast.success("Payment completed successfully");
                setTimeout(() => {
                    router.push(`/orders/${orderNumber}`);
                }, 2000);
                break;

            case "FAILED":
                setState("failed");
                setMessage("Payment failed. Please try again.");
                toast.error("Payment failed");
                break;

            case "EXPIRED":
                setState("expired");
                setMessage("Payment has expired. Please create a new order.");
                toast.error("Payment expired");
                break;
        }
    };

    // Handle final polling result (snake_case: payment_status)
    const handleFinalStatus = (status: PaymentStatusResponse) => {
        switch (status.payment_status) {
            case "PAID":
                setState("success");
                setMessage("Payment successful! Your order is confirmed.");
                toast.success("Payment completed successfully");
                setTimeout(() => {
                    router.push(`/orders/${orderNumber}`);
                }, 2000);
                break;

            case "PENDING":
                setState("pending");
                setMessage(
                    "Payment is still being processed. Please check back later or complete your payment."
                );
                break;

            case "FAILED":
                setState("failed");
                setMessage("Payment failed. Please try again.");
                break;

            case "EXPIRED":
                setState("expired");
                setMessage("Payment has expired. Please create a new order.");
                break;

            default:
                setState("pending");
                setMessage("Unable to determine payment status.");
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
                        <h2 className="text-2xl font-bold mb-2">Processing Payment</h2>
                        <p className="text-muted-foreground">
                            Please wait while we verify your payment...
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
                            Verifying Payment
                        </h2>
                        <p className="text-muted-foreground mb-4">
                            {isPaused
                                ? "Verification paused (tab hidden)"
                                : "Waiting for payment confirmation..."}
                        </p>

                        {/* Progress bar */}
                        <div className="space-y-2">
                            <Progress value={progressPercent} className="h-2" />
                            <p className="text-xs text-muted-foreground">
                                Attempt {attempts} of {POLLING_CONFIG.MAX_ATTEMPTS}
                            </p>
                        </div>

                        <p className="text-xs text-muted-foreground mt-4">
                            This may take a few moments. Please don&apos;t close this
                            page.
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
                            Payment Successful!
                        </h2>
                        <p className="text-muted-foreground mb-4">{message}</p>
                        <p className="text-sm text-muted-foreground">
                            Redirecting to your order...
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
                            Payment Failed
                        </h2>
                        <p className="text-muted-foreground mb-6">{message}</p>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => router.push(`/orders/${orderNumber}`)}
                                className="flex-1"
                            >
                                View Order
                            </Button>
                            <Button
                                onClick={() => router.push("/checkout")}
                                className="flex-1"
                            >
                                Try Again
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
                            Payment Expired
                        </h2>
                        <p className="text-muted-foreground mb-6">{message}</p>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => router.push(`/orders/${orderNumber}`)}
                                className="flex-1"
                            >
                                View Order
                            </Button>
                            <Button
                                onClick={() => router.push("/cart")}
                                className="flex-1"
                            >
                                Back to Cart
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
                            Payment Pending
                        </h2>
                        <p className="text-muted-foreground mb-6">{message}</p>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => router.push(`/orders/${orderNumber}`)}
                                className="flex-1"
                            >
                                View Order
                            </Button>
                            <Button
                                onClick={() => {
                                    setAttempts(0);
                                    startPolling();
                                }}
                                className="flex-1"
                            >
                                Check Again
                            </Button>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
}
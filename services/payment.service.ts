// services/payment.service.ts

import {
    apiClient,
    handleApiError,
    makeCancellableRequest,
    cancelRequest,
    ApiError,
} from "@/lib/api-client";
import {
    CreatePaymentDto,
    PaymentResponse,
    PaymentStatusResponse,
    CapturePayPalPaymentDto,
    PaymentApiResponse,
} from "@/types/payment";

// Request keys for cancellation
const REQUEST_KEYS = {
    CREATE_PAYMENT: "payment-create",
    GET_STATUS: "payment-status",
    CAPTURE_PAYPAL: "payment-capture-paypal",
} as const;

/**
 * Payment Service
 * Handles all payment-related API calls with cancellation support
 * All fields use snake_case to match backend API
 */
export class PaymentService {
    /**
     * Cancel all payment-related requests
     */
    static cancelAllRequests(): void {
        Object.values(REQUEST_KEYS).forEach((key) => cancelRequest(key));
    }

    /**
     * Create payment for an order
     * @param dto - CreatePaymentDto with snake_case fields
     */
    static async createPayment(dto: CreatePaymentDto): Promise<PaymentResponse> {
        try {
            const response = await makeCancellableRequest(
                REQUEST_KEYS.CREATE_PAYMENT,
                (signal) =>
                    apiClient.post<PaymentApiResponse<PaymentResponse>>(
                        "/payment/create",
                        dto, // Already snake_case: { order_number, payment_method }
                        { signal }
                    )
            );
            return response.data.data!;
        } catch (error: unknown) {
            throw handleApiError(error);
        }
    }

    /**
     * Get payment status for an order with optional signal
     * @param orderNumber - Order number to check
     * @param signal - Optional AbortSignal for cancellation
     */
    static async getPaymentStatus(
        orderNumber: string,
        signal?: AbortSignal
    ): Promise<PaymentStatusResponse> {
        try {
            const config = signal ? { signal } : {};
            const response = await apiClient.get<
                PaymentApiResponse<PaymentStatusResponse>
            >(`/payment/${orderNumber}/status`, config);
            return response.data.data!;
        } catch (error: unknown) {
            throw handleApiError(error);
        }
    }

    /**
     * Capture PayPal payment after user approval
     * @param dto - CapturePayPalPaymentDto with snake_case fields
     */
    static async capturePayPalPayment(dto: CapturePayPalPaymentDto): Promise<{
        message: string;
        data: {
            order_number: string;
            payment_method: string;
            payment_id: string;
        };
    }> {
        try {
            const response = await makeCancellableRequest(
                REQUEST_KEYS.CAPTURE_PAYPAL,
                (signal) =>
                    apiClient.post("/payment/paypal/capture", dto, { signal })
            );
            return response.data;
        } catch (error: unknown) {
            throw handleApiError(error);
        }
    }

    /**
     * Smart payment status polling
     *
     * Features:
     * - Pauses when tab is hidden
     * - Max attempts limit (default: 36 = 3 minutes)
     * - Consecutive error handling
     * - AbortController for cancellation
     * - Stop condition on status change
     *
     * @param orderNumber - Order number to poll
     * @param options - Polling options
     * @returns Promise that resolves when payment is no longer pending
     */
    static async pollPaymentStatus(
        orderNumber: string,
        options: {
            maxAttempts?: number;
            intervalMs?: number;
            onStatusChange?: (status: PaymentStatusResponse) => void;
            onAttempt?: (attempt: number) => void;
            signal?: AbortSignal;
        } = {}
    ): Promise<PaymentStatusResponse> {
        const {
            maxAttempts = 36, // 36 attempts × 5s = 3 minutes
            intervalMs = 5000, // 5 seconds (safe under 10 req/10s rate limit)
            onStatusChange,
            onAttempt,
            signal,
        } = options;

        let attempts = 0;
        let lastStatus: PaymentStatusResponse | null = null;
        let consecutiveErrors = 0;
        const maxConsecutiveErrors = 3;
        let isPaused = false;

        // Handle visibility change
        const handleVisibilityChange = () => {
            isPaused = document.hidden;
            console.log(
                `👁️ Tab ${isPaused ? "hidden" : "visible"} - Polling ${
                    isPaused ? "paused" : "resumed"
                }`
            );
        };

        // Add visibility listener
        if (typeof document !== "undefined") {
            document.addEventListener("visibilitychange", handleVisibilityChange);
        }

        try {
            while (attempts < maxAttempts) {
                // Check if aborted
                if (signal?.aborted) {
                    throw new Error("Polling cancelled");
                }

                // Skip polling while tab is hidden
                if (isPaused) {
                    await this.sleep(intervalMs);
                    continue;
                }

                attempts++;
                onAttempt?.(attempts);

                try {
                    const status = await this.getPaymentStatus(orderNumber, signal);

                    // Reset error counter on success
                    consecutiveErrors = 0;

                    // Call callback if status changed (using snake_case)
                    if (
                        onStatusChange &&
                        status.payment_status !== lastStatus?.payment_status
                    ) {
                        onStatusChange(status);
                    }

                    lastStatus = status;

                    // Stop polling if payment is no longer pending (using snake_case)
                    if (status.payment_status !== "PENDING") {
                        console.log(
                            `✅ Payment status changed to: ${status.payment_status}`
                        );
                        return status;
                    }

                    // Wait before next attempt
                    await this.sleep(intervalMs);
                } catch (error: unknown) {
                    const apiError = error as ApiError;

                    // Check if aborted
                    if (apiError?.isAborted || signal?.aborted) {
                        throw new Error("Polling cancelled");
                    }

                    consecutiveErrors++;
                    console.error(
                        `❌ Payment status check failed (attempt ${attempts}):`,
                        apiError.message
                    );

                    // Stop after too many consecutive errors
                    if (consecutiveErrors >= maxConsecutiveErrors) {
                        console.error(
                            `❌ Stopping poll after ${maxConsecutiveErrors} consecutive errors`
                        );
                        throw error;
                    }

                    await this.sleep(intervalMs);
                }
            }

            // Max attempts reached
            console.warn(
                `⏰ Payment polling timeout after ${maxAttempts} attempts`
            );

            if (lastStatus) {
                return lastStatus;
            }

            throw new Error("Payment status polling timeout");
        } finally {
            // Cleanup visibility listener
            if (typeof document !== "undefined") {
                document.removeEventListener(
                    "visibilitychange",
                    handleVisibilityChange
                );
            }
        }
    }

    /**
     * Helper: Sleep for specified milliseconds
     */
    private static sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Check if payment is expired based on order creation time
     *
     * @param createdAt - Order creation timestamp
     * @param expiryHours - Hours until expiry (default: 24 for Midtrans)
     */
    static isPaymentExpired(
        createdAt: string | Date,
        expiryHours: number = 24
    ): boolean {
        const created = new Date(createdAt);
        const now = new Date();
        const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
        return diffHours > expiryHours;
    }

    /**
     * Get remaining time for payment
     *
     * @param createdAt - Order creation timestamp
     * @param expiryHours - Hours until expiry (default: 24)
     * @returns Remaining time in milliseconds, or 0 if expired
     */
    static getRemainingTime(
        createdAt: string | Date,
        expiryHours: number = 24
    ): number {
        const created = new Date(createdAt);
        const expiresAt = new Date(
            created.getTime() + expiryHours * 60 * 60 * 1000
        );
        const remaining = expiresAt.getTime() - Date.now();
        return Math.max(0, remaining);
    }

    /**
     * Format remaining time as human readable string
     *
     * @param remainingMs - Remaining time in milliseconds
     * @returns Formatted string like "23h 45m" or "45m 30s"
     */
    static formatRemainingTime(remainingMs: number): string {
        if (remainingMs <= 0) return "Expired";

        const hours = Math.floor(remainingMs / (1000 * 60 * 60));
        const minutes = Math.floor(
            (remainingMs % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m ${seconds}s`;
    }
}
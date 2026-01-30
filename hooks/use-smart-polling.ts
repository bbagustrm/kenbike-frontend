// hooks/use-smart-polling.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseSmartPollingOptions<T> {
    /**
     * Async function to fetch data
     */
    fetcher: (signal: AbortSignal) => Promise<T>;

    /**
     * Polling interval in milliseconds (default: 5000ms)
     */
    interval?: number;

    /**
     * Maximum number of polling attempts (default: 36 = 3 minutes at 5s interval)
     */
    maxAttempts?: number;

    /**
     * Whether to start polling immediately (default: true)
     */
    enabled?: boolean;

    /**
     * Whether to pause polling when tab is hidden (default: true)
     */
    pauseOnHidden?: boolean;

    /**
     * Callback when data is fetched successfully
     */
    onSuccess?: (data: T) => void;

    /**
     * Callback when an error occurs
     */
    onError?: (error: Error) => void;

    /**
     * Callback when max attempts reached
     */
    onMaxAttemptsReached?: () => void;

    /**
     * Condition to stop polling (return true to stop)
     */
    stopCondition?: (data: T) => boolean;

    /**
     * Number of consecutive errors before stopping (default: 3)
     */
    maxConsecutiveErrors?: number;
}

interface UseSmartPollingReturn<T> {
    /**
     * Current data from the last successful fetch
     */
    data: T | null;

    /**
     * Whether polling is currently in progress
     */
    isPolling: boolean;

    /**
     * Whether the fetcher is currently loading
     */
    isLoading: boolean;

    /**
     * Current error if any
     */
    error: Error | null;

    /**
     * Number of attempts made
     */
    attempts: number;

    /**
     * Whether polling is paused (tab hidden)
     */
    isPaused: boolean;

    /**
     * Start or restart polling
     */
    start: () => void;

    /**
     * Stop polling
     */
    stop: () => void;

    /**
     * Manually trigger a fetch
     */
    refetch: () => Promise<T | null>;
}

/**
 * Smart polling hook with:
 * - Automatic pause when tab is hidden
 * - Max attempts limit
 * - Consecutive error handling
 * - AbortController for request cancellation
 * - Stop condition support
 *
 * @example
 * const {
 *   data,
 *   isPolling,
 *   isLoading,
 *   error,
 *   start,
 *   stop
 * } = useSmartPolling({
 *   fetcher: async (signal) => {
 *     const res = await fetch('/api/status', { signal });
 *     return res.json();
 *   },
 *   interval: 5000,
 *   maxAttempts: 36, // 3 minutes
 *   stopCondition: (data) => data.status === 'completed',
 *   onSuccess: (data) => console.log('Status:', data.status),
 * });
 */
export function useSmartPolling<T>({
                                       fetcher,
                                       interval = 5000,
                                       maxAttempts = 36,
                                       enabled = true,
                                       pauseOnHidden = true,
                                       onSuccess,
                                       onError,
                                       onMaxAttemptsReached,
                                       stopCondition,
                                       maxConsecutiveErrors = 3,
                                   }: UseSmartPollingOptions<T>): UseSmartPollingReturn<T> {
    const [data, setData] = useState<T | null>(null);
    const [isPolling, setIsPolling] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [attempts, setAttempts] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const abortControllerRef = useRef<AbortController | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const consecutiveErrorsRef = useRef(0);
    const isPollingRef = useRef(false);
    const isMountedRef = useRef(true);

    // Cleanup function
    const cleanup = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
    }, []);

    // Single fetch
    const fetchData = useCallback(async (): Promise<T | null> => {
        if (!isMountedRef.current) return null;

        // Abort previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        setIsLoading(true);
        setError(null);

        try {
            const result = await fetcher(abortControllerRef.current.signal);

            if (!isMountedRef.current) return null;

            setData(result);
            consecutiveErrorsRef.current = 0;
            onSuccess?.(result);

            return result;
        } catch (err: unknown) {
            if (!isMountedRef.current) return null;

            // Ignore abort errors
            const isAbortError =
                err instanceof Error &&
                (err.name === "AbortError" || (err as NodeJS.ErrnoException).code === "ERR_CANCELED");
            if (isAbortError) {
                return null;
            }

            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
            consecutiveErrorsRef.current++;
            onError?.(error);

            return null;
        } finally {
            if (isMountedRef.current) {
                setIsLoading(false);
            }
        }
    }, [fetcher, onSuccess, onError]);

    // Start polling
    const start = useCallback(() => {
        if (isPollingRef.current) return;

        cleanup();
        setAttempts(0);
        setError(null);
        consecutiveErrorsRef.current = 0;
        isPollingRef.current = true;
        setIsPolling(true);

        // Initial fetch
        fetchData().then((result) => {
            if (!isMountedRef.current || !isPollingRef.current) return;

            setAttempts(1);

            // Check stop condition
            if (result && stopCondition?.(result)) {
                isPollingRef.current = false;
                setIsPolling(false);
                return;
            }

            // Start interval
            intervalRef.current = setInterval(async () => {
                if (!isMountedRef.current || !isPollingRef.current) {
                    cleanup();
                    return;
                }

                // Check if paused
                if (isPaused) return;

                setAttempts((prev) => {
                    const newAttempts = prev + 1;

                    // Check max attempts
                    if (newAttempts >= maxAttempts) {
                        cleanup();
                        isPollingRef.current = false;
                        setIsPolling(false);
                        onMaxAttemptsReached?.();
                        return prev;
                    }

                    return newAttempts;
                });

                // Check consecutive errors
                if (consecutiveErrorsRef.current >= maxConsecutiveErrors) {
                    cleanup();
                    isPollingRef.current = false;
                    setIsPolling(false);
                    return;
                }

                const result = await fetchData();

                // Check stop condition
                if (result && stopCondition?.(result)) {
                    cleanup();
                    isPollingRef.current = false;
                    setIsPolling(false);
                }
            }, interval);
        });
    }, [
        cleanup,
        fetchData,
        interval,
        maxAttempts,
        maxConsecutiveErrors,
        onMaxAttemptsReached,
        stopCondition,
        isPaused,
    ]);

    // Stop polling
    const stop = useCallback(() => {
        cleanup();
        isPollingRef.current = false;
        setIsPolling(false);
    }, [cleanup]);

    // Manual refetch
    const refetch = useCallback(async () => {
        return fetchData();
    }, [fetchData]);

    // Handle visibility change
    useEffect(() => {
        if (!pauseOnHidden) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setIsPaused(true);
            } else {
                setIsPaused(false);
                // Immediately fetch when tab becomes visible again
                if (isPollingRef.current) {
                    fetchData();
                }
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [pauseOnHidden, fetchData]);

    // Auto-start if enabled
    useEffect(() => {
        if (enabled) {
            start();
        }

        return () => {
            cleanup();
        };
    }, [enabled]); // Only depend on enabled, not start/cleanup

    // Cleanup on unmount
    useEffect(() => {
        isMountedRef.current = true;

        return () => {
            isMountedRef.current = false;
            cleanup();
        };
    }, [cleanup]);

    return {
        data,
        isPolling,
        isLoading,
        error,
        attempts,
        isPaused,
        start,
        stop,
        refetch,
    };
}

/**
 * Payment status type for usePaymentPolling (snake_case from API)
 */
interface PaymentStatusData {
    payment_status: string;
    order_status?: string;
}

/**
 * Simplified hook for payment status polling
 * Uses snake_case fields to match backend API response
 *
 * @example
 * const { status, isPolling, error } = usePaymentPolling({
 *   orderNumber: "ORD-123",
 *   onPaid: () => router.push('/order-success'),
 *   onFailed: () => toast.error('Payment failed'),
 * });
 */
export function usePaymentPolling(options: {
    orderNumber: string;
    interval?: number;
    maxAttempts?: number;
    onPaid?: () => void;
    onFailed?: () => void;
    onExpired?: () => void;
    enabled?: boolean;
    getPaymentStatus: (orderNumber: string, signal: AbortSignal) => Promise<PaymentStatusData>;
}) {
    const {
        orderNumber,
        interval = 5000,
        maxAttempts = 36,
        onPaid,
        onFailed,
        onExpired,
        enabled = true,
        getPaymentStatus,
    } = options;

    const { data, isPolling, isLoading, error, attempts, stop } = useSmartPolling({
        fetcher: async (signal) => {
            return getPaymentStatus(orderNumber, signal);
        },
        interval,
        maxAttempts,
        enabled,
        pauseOnHidden: true,
        stopCondition: (data) => {
            // Stop polling if payment is no longer pending (snake_case)
            return data.payment_status !== "PENDING";
        },
        onSuccess: (data) => {
            // Handle status changes (snake_case)
            if (data.payment_status === "PAID") {
                onPaid?.();
            } else if (data.payment_status === "FAILED") {
                onFailed?.();
            } else if (data.payment_status === "EXPIRED") {
                onExpired?.();
            }
        },
    });

    return {
        status: data,
        isPolling,
        isLoading,
        error,
        attempts,
        stop,
    };
}
// hooks/use-debounce.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Generic callback type for debounced functions
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => any;

/**
 * Async callback type that accepts AbortSignal as first param
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AsyncCallbackWithSignal = (signal: AbortSignal, ...args: any[]) => Promise<unknown>;

/**
 * Extract rest parameters after AbortSignal
 */
type RestParams<T> = T extends (signal: AbortSignal, ...args: infer R) => Promise<unknown> ? R : never;

/**
 * Hook to debounce a value
 * Useful for search inputs, filters, etc.
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns Debounced value
 *
 * @example
 * const [search, setSearch] = useState("");
 * const debouncedSearch = useDebounce(search, 500);
 *
 * useEffect(() => {
 *   // This only runs 500ms after user stops typing
 *   fetchResults(debouncedSearch);
 * }, [debouncedSearch]);
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}

/**
 * Hook to create a debounced callback function
 * Automatically cancels pending calls when new call is made
 *
 * @param callback - The function to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns [debouncedCallback, cancel, isPending]
 *
 * @example
 * const [debouncedSearch, cancelSearch, isSearching] = useDebouncedCallback(
 *   async (query: string) => {
 *     const results = await api.search(query);
 *     setResults(results);
 *   },
 *   500
 * );
 */
export function useDebouncedCallback<T extends AnyFunction>(
    callback: T,
    delay: number = 500
): [(...args: Parameters<T>) => void, () => void, boolean] {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const callbackRef = useRef(callback);
    const [isPending, setIsPending] = useState(false);

    // Keep callback ref updated
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    const cancel = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
            setIsPending(false);
        }
    }, []);

    const debouncedCallback = useCallback(
        (...args: Parameters<T>) => {
            cancel();
            setIsPending(true);

            timeoutRef.current = setTimeout(() => {
                setIsPending(false);
                callbackRef.current(...args);
            }, delay);
        },
        [delay, cancel]
    );

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cancel();
        };
    }, [cancel]);

    return [debouncedCallback, cancel, isPending];
}

/**
 * Hook to create a debounced async callback with cancellation support
 * Uses AbortController to cancel in-flight requests
 *
 * @param callback - Async function that accepts AbortSignal as first parameter
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns [debouncedCallback, cancel, isPending]
 *
 * @example
 * const [debouncedFetch, cancelFetch, isFetching] = useDebouncedAsyncCallback(
 *   async (signal: AbortSignal, query: string) => {
 *     const results = await api.search(query, { signal });
 *     setResults(results);
 *   },
 *   500
 * );
 */
export function useDebouncedAsyncCallback<T extends AsyncCallbackWithSignal>(
    callback: T,
    delay: number = 500
): [(...args: RestParams<T>) => void, () => void, boolean] {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const callbackRef = useRef(callback);
    const [isPending, setIsPending] = useState(false);

    // Keep callback ref updated
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    const cancel = useCallback(() => {
        // Clear timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        // Abort in-flight request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }

        setIsPending(false);
    }, []);

    const debouncedCallback = useCallback(
        (...args: RestParams<T>) => {
            cancel();
            setIsPending(true);

            timeoutRef.current = setTimeout(async () => {
                // Create new abort controller for this request
                abortControllerRef.current = new AbortController();

                try {
                    await callbackRef.current(abortControllerRef.current.signal, ...args);
                } catch (error: unknown) {
                    // Ignore abort errors
                    const isAbortError =
                        error instanceof Error &&
                        (error.name === "AbortError" || (error as NodeJS.ErrnoException).code === "ERR_CANCELED");
                    if (!isAbortError) {
                        throw error;
                    }
                } finally {
                    setIsPending(false);
                }
            }, delay);
        },
        [delay, cancel]
    );

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cancel();
        };
    }, [cancel]);

    return [debouncedCallback, cancel, isPending];
}

/**
 * Hook for immediate execution with trailing debounce
 * Executes immediately on first call, then debounces subsequent calls
 *
 * @param callback - The function to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns [debouncedCallback, cancel]
 */
export function useLeadingDebounce<T extends AnyFunction>(
    callback: T,
    delay: number = 500
): [(...args: Parameters<T>) => void, () => void] {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastCallRef = useRef<number>(0);
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    const cancel = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    const debouncedCallback = useCallback(
        (...args: Parameters<T>) => {
            const now = Date.now();
            const timeSinceLastCall = now - lastCallRef.current;

            cancel();

            if (timeSinceLastCall >= delay) {
                // Execute immediately if enough time has passed
                lastCallRef.current = now;
                callbackRef.current(...args);
            } else {
                // Schedule for later
                timeoutRef.current = setTimeout(() => {
                    lastCallRef.current = Date.now();
                    callbackRef.current(...args);
                }, delay - timeSinceLastCall);
            }
        },
        [delay, cancel]
    );

    useEffect(() => {
        return () => {
            cancel();
        };
    }, [cancel]);

    return [debouncedCallback, cancel];
}
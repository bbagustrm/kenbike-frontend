// services/shipping.service.ts

import {
    apiClient,
    handleApiError,
    makeCancellableRequest,
    cancelRequest,
} from "@/lib/api-client";
import {
    CalculateShippingDto,
    CalculateShippingResponse,
    ShippingApiResponse,
    ShippingCacheKey,
    CachedShippingData,
} from "@/types/shipping";

const CACHE_KEY_PREFIX = "kenbike_shipping_";
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const REQUEST_KEY = "shipping-calculate";

/**
 * ✅ API Request DTO (snake_case for backend)
 */
interface CalculateShippingApiDto {
    country: string;
    province?: string;
    city: string;
    district?: string;
    postal_code: string;
    address: string;
    total_weight: number;
    courier?: string;
}

/**
 * Shipping Service
 * Handles shipping calculation with caching and request cancellation
 */
export class ShippingService {
    /**
     * ✅ Transform frontend DTO (camelCase) to API DTO (snake_case)
     */
    private static toApiDto(dto: CalculateShippingDto): CalculateShippingApiDto {
        return {
            country: dto.country,
            province: dto.province,
            city: dto.city,
            district: dto.district,
            postal_code: dto.postalCode,
            address: dto.address,
            total_weight: dto.totalWeight,
            courier: dto.courier,
        };
    }

    /**
     * Generate cache key from shipping parameters
     */
    private static generateCacheKey(params: ShippingCacheKey): string {
        return `${CACHE_KEY_PREFIX}${params.country}_${params.city}_${params.postalCode}_${params.weight}`;
    }

    /**
     * Get cached shipping data
     */
    private static getCachedShipping(key: string): CalculateShippingResponse | null {
        if (typeof window === "undefined") return null;

        try {
            const cached = localStorage.getItem(key);
            if (!cached) return null;

            const data: CachedShippingData = JSON.parse(cached);

            // Check if expired
            if (Date.now() > data.expiresAt) {
                localStorage.removeItem(key);
                return null;
            }

            return data.data;
        } catch (error) {
            console.error("Failed to get cached shipping:", error);
            return null;
        }
    }

    /**
     * Set cached shipping data
     */
    private static setCachedShipping(
        key: string,
        data: CalculateShippingResponse
    ): void {
        if (typeof window === "undefined") return;

        try {
            const cached: CachedShippingData = {
                key,
                data,
                timestamp: Date.now(),
                expiresAt: Date.now() + CACHE_DURATION_MS,
            };

            localStorage.setItem(key, JSON.stringify(cached));
        } catch (error) {
            console.error("Failed to cache shipping:", error);
        }
    }

    /**
     * Clear all shipping cache
     */
    static clearCache(): void {
        if (typeof window === "undefined") return;

        try {
            const keys = Object.keys(localStorage);
            keys.forEach((key) => {
                if (key.startsWith(CACHE_KEY_PREFIX)) {
                    localStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.error("Failed to clear shipping cache:", error);
        }
    }

    /**
     * ✅ Cancel any in-flight shipping calculation request
     */
    static cancelCalculation(): void {
        cancelRequest(REQUEST_KEY);
    }

    /**
     * ✅ ENHANCED: Calculate shipping costs with cancellation support
     * Uses cache to reduce API calls
     *
     * @param dto - Shipping calculation parameters
     * @param options - Additional options
     * @returns Promise with shipping options
     */
    static async calculateShipping(
        dto: CalculateShippingDto,
        options: {
            skipCache?: boolean;
            signal?: AbortSignal;
        } = {}
    ): Promise<CalculateShippingResponse> {
        const { skipCache = false, signal } = options;

        // Generate cache key
        const cacheKey = this.generateCacheKey({
            country: dto.country,
            city: dto.city,
            postalCode: dto.postalCode,
            weight: dto.totalWeight,
        });

        // Try to get from cache first
        if (!skipCache) {
            const cached = this.getCachedShipping(cacheKey);
            if (cached) {
                console.log("📦 Using cached shipping rates");
                return cached;
            }
        }

        // Fetch from API with cancellation support
        try {
            console.log("🌐 Fetching shipping rates from API", dto);

            // ✅ Transform to snake_case for API
            const apiDto = this.toApiDto(dto);

            // If signal provided, use it directly. Otherwise, use makeCancellableRequest
            if (signal) {
                const response = await apiClient.post<ShippingApiResponse>(
                    "/orders/calculate-shipping",
                    apiDto,
                    { signal }
                );

                const data = response.data.data;
                this.setCachedShipping(cacheKey, data);
                return data;
            }

            // Use built-in cancellation (cancels previous request automatically)
            const response = await makeCancellableRequest(REQUEST_KEY, (reqSignal) =>
                apiClient.post<ShippingApiResponse>(
                    "/orders/calculate-shipping",
                    apiDto,
                    { signal: reqSignal }
                )
            );

            const data = response.data.data;

            // Cache the result
            this.setCachedShipping(cacheKey, data);

            return data;
        } catch (error: unknown) {
            const apiError = handleApiError(error);

            // Don't throw if request was aborted (user changed input)
            if (apiError.isAborted) {
                console.log("📦 Shipping calculation cancelled");
                throw apiError; // Still throw so caller knows it was cancelled
            }

            throw apiError;
        }
    }

    /**
     * ✅ IMPROVED: Calculate shipping with external AbortSignal
     * Used by the debounced async callback hook
     *
     * @param signal - AbortSignal for cancellation
     * @param dto - Shipping calculation parameters
     * @param skipCache - Whether to skip cache
     */
    static async calculateShippingWithSignal(
        signal: AbortSignal,
        dto: CalculateShippingDto,
        skipCache: boolean = false
    ): Promise<CalculateShippingResponse> {
        return this.calculateShipping(dto, { skipCache, signal });
    }

    /**
     * Validate shipping address for completeness
     */
    static validateShippingAddress(dto: Partial<CalculateShippingDto>): {
        valid: boolean;
        errors: string[];
    } {
        const errors: string[] = [];

        if (!dto.country) {
            errors.push("Country is required");
        }

        if (!dto.city) {
            errors.push("City is required");
        }

        if (!dto.postalCode) {
            errors.push("Postal code is required");
        }

        if (!dto.address) {
            errors.push("Address is required");
        }

        if (!dto.totalWeight || dto.totalWeight <= 0) {
            errors.push("Total weight must be greater than 0");
        }

        // Domestic Indonesia requires province
        if (dto.country === "ID" && !dto.province) {
            errors.push("Province is required for domestic shipping");
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    }

    /**
     * Format shipping estimate text
     */
    static formatEstimate(
        min: number,
        max: number,
        locale: "en" | "id" = "en"
    ): string {
        if (min === max) {
            return locale === "en"
                ? `${min} day${min > 1 ? "s" : ""}`
                : `${min} hari`;
        }

        return locale === "en" ? `${min}-${max} days` : `${min}-${max} hari`;
    }

    /**
     * Get cheapest shipping option
     */
    static getCheapestOption(response: CalculateShippingResponse) {
        if (response.options.length === 0) return null;

        return response.options.reduce((cheapest, option) =>
            option.cost < cheapest.cost ? option : cheapest
        );
    }

    /**
     * Get fastest shipping option
     */
    static getFastestOption(response: CalculateShippingResponse) {
        if (response.options.length === 0) return null;

        return response.options.reduce((fastest, option) =>
            option.estimatedDays.max < fastest.estimatedDays.max ? option : fastest
        );
    }

    /**
     * ✅ NEW: Get shipping option by ID
     * Useful for re-selecting saved shipping method
     */
    static getOptionById(
        response: CalculateShippingResponse,
        courier?: string,
        service?: string,
        zoneId?: string
    ) {
        return response.options.find((option) => {
            if (zoneId) {
                return option.zoneId === zoneId;
            }
            return option.courier === courier && option.service === service;
        });
    }
}
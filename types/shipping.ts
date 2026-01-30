// types/shipping.types.ts

/**
 * Shipping option from API
 */
export interface ShippingOption {
    type: "DOMESTIC" | "INTERNATIONAL";

    // Common fields
    serviceName: string;
    description?: string;
    cost: number;
    estimatedDays: {
        min: number;
        max: number;
    };

    // Domestic (Biteship) fields
    courier?: string; // "jne", "tiki", "sicepat"
    service?: string; // "reg", "yes", "oke"
    biteshipPriceId?: string;
    insurance?: {
        required: boolean;
        fee: number;
    };

    // International (Zone) fields
    zoneId?: string;
    zoneName?: string;
}

/**
 * DTO for calculating shipping
 */
export interface CalculateShippingDto {
    country: string; // 2-char code: "ID", "US", "SG"
    province?: string; // Required for domestic
    city: string;
    district?: string; // Optional (domestic)
    postalCode: string;
    address: string;
    totalWeight: number; // in grams
    courier?: string; // For domestic: "jne,tiki,sicepat" or leave empty for all
}

/**
 * Shipping calculation response
 */
export interface CalculateShippingResponse {
    destination: {
        country: string;
        city: string;
        postalCode: string;
    };
    totalWeight: number;
    shippingType: "DOMESTIC" | "INTERNATIONAL";
    options: ShippingOption[];
}

/**
 * Shipping address data for forms
 */
export interface ShippingAddressData {
    recipientName: string;
    recipientPhone: string;
    address: string;
    city: string;
    province?: string;
    country: string;
    postalCode: string;
    district?: string;
    notes?: string;
}

/**
 * Selected shipping method
 */
export interface SelectedShippingMethod {
    type: "DOMESTIC" | "INTERNATIONAL";
    option: ShippingOption;
    cost: number;
}

/**
 * Shipping cache key
 */
export interface ShippingCacheKey {
    country: string;
    city: string;
    postalCode: string;
    weight: number;
}

/**
 * Cached shipping data
 */
export interface CachedShippingData {
    key: string;
    data: CalculateShippingResponse;
    timestamp: number;
    expiresAt: number;
}

/**
 * API response wrapper
 */
export interface ShippingApiResponse {
    status: "success" | "error";
    code: number;
    message: string;
    data: CalculateShippingResponse;
}
// types/shipping.ts

export type ShippingType = 'DOMESTIC' | 'INTERNATIONAL';

export interface ShippingOption {
    courierCode: string;        // "jne", "tiki", "zone1", etc
    courierName: string;        // "JNE", "TIKI", "Zone 1 - Southeast Asia"
    courierService: string;     // "REG", "YES", "standard"
    description: string;        // "Reguler", "Express", "7-14 days"
    estimatedDays: string;      // "2-3", "1-2", "7-14"
    price: number;             // in currency (IDR or USD)
}

export interface CalculateShippingDto {
    destinationType: ShippingType;
    destinationPostalCode?: string;   // For domestic
    destinationCountry?: string;      // For international
    items: ShippingItem[];
}

export interface ShippingItem {
    productId: string;
    variantId?: string;
    quantity: number;
    weight: number;  // in grams
}

export interface CalculateShippingResponse {
    status: string;
    data: {
        shippingOptions: ShippingOption[];
    };
}

// Domestic Shipping (Biteship)
export interface BiteshipCourier {
    code: string;        // "jne", "tiki", "sicepat", "jnt", "pos", "anteraja"
    name: string;        // "JNE", "TIKI", etc
    services: string[];  // ["REG", "YES", "OKE"]
}

// International Shipping Zones
export interface ShippingZone {
    id: string;
    name: string;
    countries: string[];
    baseRate: number;
    perKgRate: number;
    minDays: number;
    maxDays: number;
    currency: 'USD';
}

// Hardcoded shipping zones (from backend)
export const SHIPPING_ZONES: ShippingZone[] = [
    {
        id: 'zone1',
        name: 'Zone 1 - Southeast Asia',
        countries: ['SG', 'MY', 'TH', 'BN'],
        baseRate: 15,
        perKgRate: 5,
        minDays: 3,
        maxDays: 7,
        currency: 'USD'
    },
    {
        id: 'zone2',
        name: 'Zone 2 - Asia Pacific',
        countries: ['PH', 'VN', 'JP', 'KR', 'HK', 'TW', 'AU', 'NZ'],
        baseRate: 25,
        perKgRate: 8,
        minDays: 5,
        maxDays: 10,
        currency: 'USD'
    },
    {
        id: 'zone3',
        name: 'Zone 3 - Americas & Europe',
        countries: ['US', 'CA', 'GB', 'FR', 'DE', 'IT', 'ES', 'NL', 'BE', 'CH'],
        baseRate: 45,
        perKgRate: 12,
        minDays: 7,
        maxDays: 14,
        currency: 'USD'
    },
    {
        id: 'zone4',
        name: 'Zone 4 - Rest of World',
        countries: ['*'], // All others
        baseRate: 65,
        perKgRate: 15,
        minDays: 10,
        maxDays: 21,
        currency: 'USD'
    }
];

// Helper to get zone by country code
export function getZoneByCountry(countryCode: string): ShippingZone | null {
    // Check specific zones first
    for (const zone of SHIPPING_ZONES.slice(0, 3)) {
        if (zone.countries.includes(countryCode)) {
            return zone;
        }
    }
    // Default to Zone 4
    return SHIPPING_ZONES[3];
}

// Calculate international shipping cost
export function calculateInternationalShipping(
    zoneId: string,
    weightInGrams: number
): number {
    const zone = SHIPPING_ZONES.find(z => z.id === zoneId);
    if (!zone) return 0;

    const weightInKg = weightInGrams / 1000;
    const additionalKg = Math.max(0, Math.ceil(weightInKg) - 1);

    return zone.baseRate + (additionalKg * zone.perKgRate);
}
// lib/shipping-utils.ts

import { ShippingZone, getZoneByCountry } from '@/types/shipping';

/**
 * Country list for international shipping selector
 */
export const INTERNATIONAL_COUNTRIES = [
    // Zone 1 - Southeast Asia
    { code: 'SG', name: 'Singapore', zone: 'Zone 1 - Southeast Asia' },
    { code: 'MY', name: 'Malaysia', zone: 'Zone 1 - Southeast Asia' },
    { code: 'TH', name: 'Thailand', zone: 'Zone 1 - Southeast Asia' },
    { code: 'PH', name: 'Philippines', zone: 'Zone 1 - Southeast Asia' },
    { code: 'VN', name: 'Vietnam', zone: 'Zone 1 - Southeast Asia' },
    { code: 'BN', name: 'Brunei', zone: 'Zone 1 - Southeast Asia' },
    { code: 'KH', name: 'Cambodia', zone: 'Zone 1 - Southeast Asia' },
    { code: 'LA', name: 'Laos', zone: 'Zone 1 - Southeast Asia' },
    { code: 'MM', name: 'Myanmar', zone: 'Zone 1 - Southeast Asia' },
    { code: 'TL', name: 'Timor-Leste', zone: 'Zone 1 - Southeast Asia' },

    // Zone 2 - East Asia
    { code: 'CN', name: 'China', zone: 'Zone 2 - East Asia' },
    { code: 'HK', name: 'Hong Kong', zone: 'Zone 2 - East Asia' },
    { code: 'TW', name: 'Taiwan', zone: 'Zone 2 - East Asia' },
    { code: 'KR', name: 'South Korea', zone: 'Zone 2 - East Asia' },
    { code: 'JP', name: 'Japan', zone: 'Zone 2 - East Asia' },
    { code: 'MO', name: 'Macau', zone: 'Zone 2 - East Asia' },

    // Zone 3 - South Asia & Middle East
    { code: 'IN', name: 'India', zone: 'Zone 3 - South Asia & Middle East' },
    { code: 'PK', name: 'Pakistan', zone: 'Zone 3 - South Asia & Middle East' },
    { code: 'BD', name: 'Bangladesh', zone: 'Zone 3 - South Asia & Middle East' },
    { code: 'LK', name: 'Sri Lanka', zone: 'Zone 3 - South Asia & Middle East' },
    { code: 'NP', name: 'Nepal', zone: 'Zone 3 - South Asia & Middle East' },
    { code: 'BT', name: 'Bhutan', zone: 'Zone 3 - South Asia & Middle East' },
    { code: 'MV', name: 'Maldives', zone: 'Zone 3 - South Asia & Middle East' },
    { code: 'AE', name: 'United Arab Emirates', zone: 'Zone 3 - South Asia & Middle East' },
    { code: 'SA', name: 'Saudi Arabia', zone: 'Zone 3 - South Asia & Middle East' },
    { code: 'KW', name: 'Kuwait', zone: 'Zone 3 - South Asia & Middle East' },
    { code: 'QA', name: 'Qatar', zone: 'Zone 3 - South Asia & Middle East' },
    { code: 'BH', name: 'Bahrain', zone: 'Zone 3 - South Asia & Middle East' },
    { code: 'OM', name: 'Oman', zone: 'Zone 3 - South Asia & Middle East' },
    { code: 'JO', name: 'Jordan', zone: 'Zone 3 - South Asia & Middle East' },
    { code: 'IL', name: 'Israel', zone: 'Zone 3 - South Asia & Middle East' },
    { code: 'LB', name: 'Lebanon', zone: 'Zone 3 - South Asia & Middle East' },

    // Zone 4 - Oceania
    { code: 'AU', name: 'Australia', zone: 'Zone 4 - Oceania' },
    { code: 'NZ', name: 'New Zealand', zone: 'Zone 4 - Oceania' },
    { code: 'PG', name: 'Papua New Guinea', zone: 'Zone 4 - Oceania' },
    { code: 'FJ', name: 'Fiji', zone: 'Zone 4 - Oceania' },
    { code: 'NC', name: 'New Caledonia', zone: 'Zone 4 - Oceania' },
    { code: 'PF', name: 'French Polynesia', zone: 'Zone 4 - Oceania' },
    { code: 'WS', name: 'Samoa', zone: 'Zone 4 - Oceania' },
    { code: 'TO', name: 'Tonga', zone: 'Zone 4 - Oceania' },
    { code: 'VU', name: 'Vanuatu', zone: 'Zone 4 - Oceania' },

    // Zone 5 - Europe
    { code: 'GB', name: 'United Kingdom', zone: 'Zone 5 - Europe' },
    { code: 'FR', name: 'France', zone: 'Zone 5 - Europe' },
    { code: 'DE', name: 'Germany', zone: 'Zone 5 - Europe' },
    { code: 'IT', name: 'Italy', zone: 'Zone 5 - Europe' },
    { code: 'ES', name: 'Spain', zone: 'Zone 5 - Europe' },
    { code: 'NL', name: 'Netherlands', zone: 'Zone 5 - Europe' },
    { code: 'BE', name: 'Belgium', zone: 'Zone 5 - Europe' },
    { code: 'CH', name: 'Switzerland', zone: 'Zone 5 - Europe' },
    { code: 'AT', name: 'Austria', zone: 'Zone 5 - Europe' },
    { code: 'SE', name: 'Sweden', zone: 'Zone 5 - Europe' },
    { code: 'NO', name: 'Norway', zone: 'Zone 5 - Europe' },
    { code: 'DK', name: 'Denmark', zone: 'Zone 5 - Europe' },
    { code: 'FI', name: 'Finland', zone: 'Zone 5 - Europe' },
    { code: 'PL', name: 'Poland', zone: 'Zone 5 - Europe' },
    { code: 'CZ', name: 'Czech Republic', zone: 'Zone 5 - Europe' },
    { code: 'PT', name: 'Portugal', zone: 'Zone 5 - Europe' },
    { code: 'GR', name: 'Greece', zone: 'Zone 5 - Europe' },
    { code: 'IE', name: 'Ireland', zone: 'Zone 5 - Europe' },
    { code: 'RO', name: 'Romania', zone: 'Zone 5 - Europe' },
    { code: 'HU', name: 'Hungary', zone: 'Zone 5 - Europe' },

    // Zone 6 - Americas
    { code: 'US', name: 'United States', zone: 'Zone 6 - Americas' },
    { code: 'CA', name: 'Canada', zone: 'Zone 6 - Americas' },
    { code: 'MX', name: 'Mexico', zone: 'Zone 6 - Americas' },
    { code: 'BR', name: 'Brazil', zone: 'Zone 6 - Americas' },
    { code: 'AR', name: 'Argentina', zone: 'Zone 6 - Americas' },
    { code: 'CL', name: 'Chile', zone: 'Zone 6 - Americas' },
    { code: 'CO', name: 'Colombia', zone: 'Zone 6 - Americas' },
    { code: 'PE', name: 'Peru', zone: 'Zone 6 - Americas' },
    { code: 'VE', name: 'Venezuela', zone: 'Zone 6 - Americas' },
    { code: 'CR', name: 'Costa Rica', zone: 'Zone 6 - Americas' },
    { code: 'PA', name: 'Panama', zone: 'Zone 6 - Americas' },

    // Zone 7 - Africa
    { code: 'ZA', name: 'South Africa', zone: 'Zone 7 - Africa' },
    { code: 'EG', name: 'Egypt', zone: 'Zone 7 - Africa' },
    { code: 'NG', name: 'Nigeria', zone: 'Zone 7 - Africa' },
    { code: 'KE', name: 'Kenya', zone: 'Zone 7 - Africa' },
    { code: 'MA', name: 'Morocco', zone: 'Zone 7 - Africa' },
    { code: 'GH', name: 'Ghana', zone: 'Zone 7 - Africa' },
    { code: 'TZ', name: 'Tanzania', zone: 'Zone 7 - Africa' },
    { code: 'UG', name: 'Uganda', zone: 'Zone 7 - Africa' },
    { code: 'ET', name: 'Ethiopia', zone: 'Zone 7 - Africa' },
    { code: 'DZ', name: 'Algeria', zone: 'Zone 7 - Africa' },
];

/**
 * Get zone by country code
 */
export function getShippingZone(countryCode: string): ShippingZone | null {
    return getZoneByCountry(countryCode);
}

/**
 * Calculate international shipping cost
 */
export function calculateInternationalShipping(
    countryCode: string,
    totalWeightGrams: number
): { zone: ShippingZone; cost: number; estimatedDays: string } | null {
    const zone = getShippingZone(countryCode);
    if (!zone) return null;

    const weightKg = totalWeightGrams / 1000;
    const additionalKg = Math.max(0, Math.ceil(weightKg) - 1);
    const cost = zone.baseRate + (additionalKg * zone.perKgRate);

    return {
        zone,
        cost,
        estimatedDays: `${zone.minDays}-${zone.maxDays}`,
    };
}

/**
 * Get country name by code
 */
export function getCountryName(countryCode: string): string {
    const country = INTERNATIONAL_COUNTRIES.find(c => c.code === countryCode);
    return country ? country.name : countryCode;
}

/**
 * Format weight for display
 */
export function formatWeight(grams: number): string {
    if (grams < 1000) {
        return `${grams}g`;
    }
    return `${(grams / 1000).toFixed(2)}kg`;
}

/**
 * Validate postal code format (Indonesia)
 */
export function validatePostalCode(postalCode: string): boolean {
    // Indonesia postal code: 5 digits
    return /^\d{5}$/.test(postalCode);
}

/**
 * Format courier name for display
 */
export function formatCourierName(courierCode: string): string {
    const courierMap: Record<string, string> = {
        jne: 'JNE',
        tiki: 'TIKI',
        sicepat: 'SiCepat',
        jnt: 'J&T Express',
        pos: 'POS Indonesia',
        anteraja: 'AnterAja',
    };
    return courierMap[courierCode.toLowerCase()] || courierCode.toUpperCase();
}

/**
 * Format service name for display
 */
export function formatServiceName(serviceCode: string): string {
    const serviceMap: Record<string, string> = {
        reg: 'Regular',
        yes: 'Express',
        oke: 'Economy',
        ctc: 'City Courier',
        ons: 'Overnight',
        eco: 'Economy',
        best: 'Best',
        halu: 'Same Day',
    };
    return serviceMap[serviceCode.toLowerCase()] || serviceCode.toUpperCase();
}
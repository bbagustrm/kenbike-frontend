// services/shipping.service.ts
import { apiClient, handleApiError } from '@/lib/api-client';
import { ShippingZone } from '@/types/shipping';

export class ShippingService {
    /**
     * Get all shipping zones
     * GET /orders/shipping-zones
     */
    static async getShippingZones(): Promise<ShippingZone[]> {
        try {
            const response = await apiClient.get('/orders/shipping-zones');
            return response.data.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Get shipping zone by country
     * GET /orders/shipping-zones/by-country/:countryCode
     */
    static async getZoneByCountry(countryCode: string): Promise<ShippingZone | null> {
        try {
            const response = await apiClient.get(`/orders/shipping-zones/by-country/${countryCode}`);
            return response.data.data;
        } catch (error) {
            // Return null if zone not found
            if ((error as any).message?.includes('not found')) {
                return null;
            }
            throw handleApiError(error);
        }
    }
}
// services/invoice.service.ts

import { apiClient } from '@/lib/api-client';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';

// Response type for shipping label URL (Biteship)
interface ShippingLabelUrlResponse {
    type: 'url';
    url: string;
    message: string;
}

// Type guard function for better type narrowing
function isShippingLabelUrlResponse(value: unknown): value is ShippingLabelUrlResponse {
    return (
        typeof value === 'object' &&
        value !== null &&
        'type' in value &&
        (value as ShippingLabelUrlResponse).type === 'url' &&
        'url' in value &&
        typeof (value as ShippingLabelUrlResponse).url === 'string'
    );
}

export const InvoiceService = {
    /**
     * Get invoice download URL
     */
    getInvoiceUrl(orderNumber: string): string {
        return `${API_BASE}/invoice/${orderNumber}`;
    },

    /**
     * Get invoice preview URL (inline display)
     */
    getInvoicePreviewUrl(orderNumber: string): string {
        return `${API_BASE}/invoice/${orderNumber}/preview`;
    },

    /**
     * Get shipping label download URL
     */
    getShippingLabelUrl(orderNumber: string): string {
        return `${API_BASE}/invoice/${orderNumber}/shipping-label`;
    },

    /**
     * Get shipping label preview URL
     */
    getShippingLabelPreviewUrl(orderNumber: string): string {
        return `${API_BASE}/invoice/${orderNumber}/shipping-label/preview`;
    },

    /**
     * Download invoice as blob
     */
    async downloadInvoice(orderNumber: string): Promise<Blob> {
        const response = await apiClient.get(`/invoice/${orderNumber}`, {
            responseType: 'blob',
        });
        return response.data;
    },

    /**
     * Download shipping label
     * First try without blob to check if it's a URL response
     */
    async downloadShippingLabel(orderNumber: string): Promise<Blob | ShippingLabelUrlResponse> {
        // First, make request without responseType to check response type
        const response = await apiClient.get(`/invoice/${orderNumber}/shipping-label`);

        // Check if it's a URL response (JSON)
        if (isShippingLabelUrlResponse(response.data)) {
            return response.data;
        }

        // If not URL response, make another request with blob
        const blobResponse = await apiClient.get(`/invoice/${orderNumber}/shipping-label`, {
            responseType: 'blob',
        });
        return blobResponse.data;
    },

    /**
     * Trigger download in browser
     */
    triggerDownload(blob: Blob, filename: string): void {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    },

    /**
     * Download invoice with auth token
     * Opens in new tab or triggers download
     */
    async downloadInvoiceWithAuth(orderNumber: string, openInNewTab = false): Promise<void> {
        try {
            const blob = await this.downloadInvoice(orderNumber);

            if (openInNewTab) {
                const url = window.URL.createObjectURL(blob);
                window.open(url, '_blank');
                setTimeout(() => window.URL.revokeObjectURL(url), 60000);
            } else {
                this.triggerDownload(blob, `Invoice-${orderNumber}.pdf`);
            }
        } catch (error) {
            console.error('Failed to download invoice:', error);
            throw error;
        }
    },

    /**
     * Download shipping label with auth token
     * For domestic orders: Opens Biteship URL in new tab
     * For international orders: Downloads/opens PDF
     */
    async downloadShippingLabelWithAuth(orderNumber: string, openInNewTab = false): Promise<void> {
        try {
            const result = await this.downloadShippingLabel(orderNumber);

            // Check if it's a URL response (Biteship) using type guard
            if (isShippingLabelUrlResponse(result)) {
                // Open Biteship URL directly in new tab
                window.open(result.url, '_blank');
                return;
            }

            // It's a PDF blob - TypeScript now knows this is Blob
            const blob = result;

            if (openInNewTab) {
                const url = window.URL.createObjectURL(blob);
                window.open(url, '_blank');
                setTimeout(() => window.URL.revokeObjectURL(url), 60000);
            } else {
                this.triggerDownload(blob, `ShippingLabel-${orderNumber}.pdf`);
            }
        } catch (error) {
            console.error('Failed to download shipping label:', error);
            throw error;
        }
    },
};
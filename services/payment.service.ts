// services/payment.service.ts

import apiClient, { handleApiError } from '@/lib/api-client';
import {
    CreatePaymentDto,
    PaymentResponse,
    PaymentStatusResponse,
} from '@/types/payment';

export class PaymentService {
    /**
     * Create payment
     * POST /payment/create
     */
    static async createPayment(
        data: CreatePaymentDto
    ): Promise<PaymentResponse> {
        try {
            const response = await apiClient.post<PaymentResponse>(
                '/payment/create',
                data
            );
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Get payment status
     * GET /payment/:orderNumber/status
     */
    static async getPaymentStatus(
        orderNumber: string
    ): Promise<PaymentStatusResponse> {
        try {
            const response = await apiClient.get<PaymentStatusResponse>(
                `/payment/${orderNumber}/status`
            );
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }
}
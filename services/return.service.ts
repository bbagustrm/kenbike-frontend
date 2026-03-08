// services/return.service.ts

import { apiClient, handleApiError } from '@/lib/api-client';
import {
    ReturnRequest,
    CreateReturnDto,
    ConfirmItemSentDto,
    ApproveReturnDto,
    RejectReturnDto,
    MarkItemReceivedDto,
    MarkRefundedDto,
    QueryReturnsParams,
} from '@/types/return';
import { PaginationMeta } from '@/types/order';

export class ReturnService {

    // ============================================
    // USER METHODS
    // ============================================

    /**
     * Create a return request with image files (multipart/form-data)
     */
    static async createReturn(
        dto: CreateReturnDto,
        imageFiles: File[],
    ): Promise<{ message: string; data: ReturnRequest }> {
        try {
            const formData = new FormData();

            // Append text fields
            formData.append('order_number', dto.order_number);
            formData.append('reason', dto.reason);
            formData.append('description', dto.description);
            formData.append('refund_bank_name', dto.refund_bank_name);
            formData.append('refund_account_number', dto.refund_account_number);
            formData.append('refund_account_name', dto.refund_account_name);

            // Append image files (field name: 'images', matches FilesInterceptor)
            imageFiles.forEach((file) => {
                formData.append('images', file);
            });

            const response = await apiClient.post('/returns', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Get all returns for current user
     */
    static async getMyReturns(params?: QueryReturnsParams): Promise<{
        data: ReturnRequest[];
        meta: PaginationMeta;
    }> {
        try {
            const response = await apiClient.get('/returns/my', { params });
            return { data: response.data.data, meta: response.data.meta };
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Get return request for a specific order
     */
    static async getReturnByOrder(orderNumber: string): Promise<{ data: ReturnRequest }> {
        try {
            const response = await apiClient.get(`/returns/order/${orderNumber}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * User confirms item has been shipped back
     */
    static async confirmItemSent(
        returnId: string,
        dto: ConfirmItemSentDto,
    ): Promise<{ message: string; data: ReturnRequest }> {
        try {
            const response = await apiClient.post(`/returns/${returnId}/confirm-sent`, dto);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * User cancels return request
     */
    static async cancelReturn(
        returnId: string,
        cancelReason?: string,
    ): Promise<{ message: string; data: ReturnRequest }> {
        try {
            const response = await apiClient.post(`/returns/${returnId}/cancel`, {
                cancel_reason: cancelReason,
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    // ============================================
    // ADMIN METHODS
    // ============================================

    static async getAllReturns(params?: QueryReturnsParams): Promise<{
        data: ReturnRequest[];
        meta: PaginationMeta;
    }> {
        try {
            const response = await apiClient.get('/admin/returns', { params });
            return { data: response.data.data, meta: response.data.meta };
        } catch (error) {
            throw handleApiError(error);
        }
    }

    static async getReturnDetail(returnId: string): Promise<{ data: ReturnRequest }> {
        try {
            const response = await apiClient.get(`/admin/returns/${returnId}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    static async approveReturn(
        returnId: string,
        dto?: ApproveReturnDto,
    ): Promise<{ message: string; data: ReturnRequest }> {
        try {
            const response = await apiClient.patch(`/admin/returns/${returnId}/approve`, dto || {});
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    static async rejectReturn(
        returnId: string,
        dto: RejectReturnDto,
    ): Promise<{ message: string; data: ReturnRequest }> {
        try {
            const response = await apiClient.patch(`/admin/returns/${returnId}/reject`, dto);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    static async markItemReceived(
        returnId: string,
        dto?: MarkItemReceivedDto,
    ): Promise<{ message: string; data: ReturnRequest }> {
        try {
            const response = await apiClient.patch(`/admin/returns/${returnId}/received`, dto || {});
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    static async markRefunded(
        returnId: string,
        dto: MarkRefundedDto,
    ): Promise<{ message: string; data: ReturnRequest }> {
        try {
            const response = await apiClient.patch(`/admin/returns/${returnId}/refunded`, dto);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }
}
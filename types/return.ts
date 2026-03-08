// types/return.ts

export type ReturnStatus =
    | 'REQUESTED'
    | 'APPROVED'
    | 'REJECTED'
    | 'ITEM_SENT'
    | 'ITEM_RECEIVED'
    | 'REFUNDED'
    | 'CANCELLED';

export type ReturnReason =
    | 'DAMAGED_ITEM'
    | 'WRONG_ITEM'
    | 'NOT_AS_DESCRIBED'
    | 'MISSING_PARTS'
    | 'OTHER';

export interface ReturnRequest {
    id: string;
    order_id: string;
    status: ReturnStatus;
    reason: ReturnReason;
    description: string;

    // Refund bank info
    refund_bank_name: string;
    refund_account_number: string;
    refund_account_name: string;

    // Item shipping (filled after approved)
    return_courier?: string | null;
    return_tracking_number?: string | null;
    item_sent_at?: string | null;

    // Admin fields
    admin_notes?: string | null;
    reviewed_at?: string | null;
    reviewed_by?: string | null;

    // Received fields
    received_at?: string | null;
    received_by?: string | null;
    received_notes?: string | null;

    // Refund info
    refund_amount?: number | null;
    refund_method?: string | null;
    refund_proof?: string | null;
    refund_notes?: string | null;
    refunded_at?: string | null;
    refunded_by?: string | null;

    // Cancel
    cancel_reason?: string | null;
    cancelled_at?: string | null;

    created_at: string;
    updated_at: string;

    // Relations
    images?: string[];
    order?: {
        order_number: string;
        total: number;
        currency: string;
        payment_method?: string | null;
        items?: ReturnOrderItem[];
    };
    user?: {
        id: string;
        email: string;
        name: string;
        phone?: string | null;
    };
}

export interface ReturnOrderItem {
    product_name: string;
    variant_name: string;
    quantity: number;
    price_per_item: number;
    subtotal: number;
    product_image?: string | null;
}

// ============================================
// CREATE DTO
// ============================================

export interface CreateReturnDto {
    order_number: string;
    reason: ReturnReason;
    description: string;
    refund_bank_name: string;
    refund_account_number: string;
    refund_account_name: string;
}

// ============================================
// CONFIRM ITEM SENT DTO
// ============================================

export interface ConfirmItemSentDto {
    return_courier: string;
    return_tracking_number: string;
}

// ============================================
// ADMIN DTOs
// ============================================

export interface ApproveReturnDto {
    admin_notes?: string;
}

export interface RejectReturnDto {
    admin_notes: string;
}

export interface MarkItemReceivedDto {
    received_notes?: string;
}

export interface MarkRefundedDto {
    refund_method: string;
    refund_proof: string;
    refund_notes?: string;
}

// ============================================
// QUERY PARAMS
// ============================================

export interface QueryReturnsParams {
    page?: number;
    limit?: number;
    status?: ReturnStatus;
    search?: string;
}

// ============================================
// HELPERS
// ============================================

export const RETURN_REASON_LABELS: Record<ReturnReason, { id: string; en: string }> = {
    DAMAGED_ITEM: { id: 'Barang Rusak/Cacat', en: 'Damaged Item' },
    WRONG_ITEM: { id: 'Barang Tidak Sesuai Pesanan', en: 'Wrong Item' },
    NOT_AS_DESCRIBED: { id: 'Tidak Sesuai Deskripsi', en: 'Not As Described' },
    MISSING_PARTS: { id: 'Aksesoris/Bagian Tidak Lengkap', en: 'Missing Parts' },
    OTHER: { id: 'Lainnya', en: 'Other' },
};

export const RETURN_STATUS_LABELS: Record<ReturnStatus, { id: string; en: string }> = {
    REQUESTED: { id: 'Menunggu Review', en: 'Awaiting Review' },
    APPROVED: { id: 'Disetujui', en: 'Approved' },
    REJECTED: { id: 'Ditolak', en: 'Rejected' },
    ITEM_SENT: { id: 'Barang Dikirim', en: 'Item Sent' },
    ITEM_RECEIVED: { id: 'Barang Diterima', en: 'Item Received' },
    REFUNDED: { id: 'Refund Selesai', en: 'Refunded' },
    CANCELLED: { id: 'Dibatalkan', en: 'Cancelled' },
};

/**
 * Check if user can submit a return request
 * Order must be COMPLETED and within 7 days
 */
export function canRequestReturn(
    orderStatus: string,
    completedAt: string | null | undefined,
): { allowed: boolean; reason?: string } {
    if (orderStatus !== 'COMPLETED') {
        return { allowed: false, reason: 'Order must be completed' };
    }
    if (!completedAt) {
        return { allowed: false, reason: 'Completion date not found' };
    }
    const daysSince = Math.floor(
        (Date.now() - new Date(completedAt).getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysSince > 7) {
        return { allowed: false, reason: `Return window expired (${daysSince} days ago)` };
    }
    return { allowed: true };
}
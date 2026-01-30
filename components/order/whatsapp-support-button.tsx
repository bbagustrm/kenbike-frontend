// components/order/whatsapp-support-button.tsx
"use client";

import { Order } from "@/types/order";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface WhatsAppSupportButtonProps {
    order: Order;
    variant?: "default" | "outline" | "ghost";
    size?: "default" | "sm" | "lg" | "icon";
    className?: string;
    showIcon?: boolean;
    children?: React.ReactNode;
}

// WhatsApp number for KenBike support
const WHATSAPP_NUMBER = "6281229505919";

/**
 * Check if shipping country is Indonesia
 */
function isIndonesianCustomer(order: Order): boolean {
    const country = order.shipping?.country?.toUpperCase() || "";
    return country === "ID" || country === "INDONESIA";
}

/**
 * Format order number for display (shorter version)
 */
function formatOrderNumber(orderNumber: string): string {
    // If it's a UUID format (ORD-xxxx-xxxx-xxxx-xxxx), show shorter version
    if (orderNumber.length > 20) {
        const parts = orderNumber.split("-");
        if (parts.length >= 2) {
            // Show: ORD-615f82ad (first segment after ORD)
            return `${parts[0]}-${parts[1]}`;
        }
    }
    return orderNumber;
}

/**
 * Get human-readable status
 */
function getStatusText(status: string, isIndonesian: boolean): string {
    const statusMap: Record<string, { id: string; en: string }> = {
        PENDING: { id: "Menunggu Pembayaran", en: "Awaiting Payment" },
        PAID: { id: "Sudah Dibayar", en: "Paid" },
        PROCESSING: { id: "Sedang Diproses", en: "Processing" },
        SHIPPED: { id: "Dalam Pengiriman", en: "Shipped" },
        DELIVERED: { id: "Sudah Diterima", en: "Delivered" },
        COMPLETED: { id: "Selesai", en: "Completed" },
        CANCELLED: { id: "Dibatalkan", en: "Cancelled" },
        FAILED: { id: "Gagal", en: "Failed" },
    };

    return statusMap[status]?.[isIndonesian ? "id" : "en"] || status;
}

/**
 * Generate pre-filled WhatsApp message based on order data
 * Uses Indonesian for ID country, English for others
 */
function generateWhatsAppMessage(order: Order): string {
    const isIndonesian = isIndonesianCustomer(order);
    const orderDate = new Date(order.created_at).toLocaleDateString(
        isIndonesian ? "id-ID" : "en-US",
        { day: "numeric", month: "long", year: "numeric" }
    );

    const displayOrderNumber = formatOrderNumber(order.order_number);
    const statusText = getStatusText(order.status, isIndonesian);

    // Build product list (max 3 items to keep message short)
    const maxItems = 3;
    const productList = order.items
        .slice(0, maxItems)
        .map((item) => {
            const variant = item.variant_name ? ` - ${item.variant_name}` : "";
            return `  - ${item.product_name}${variant} (x${item.quantity})`;
        })
        .join("\n");

    const moreItems = order.items.length > maxItems
        ? `\n  + ${order.items.length - maxItems} ${isIndonesian ? "produk lainnya" : "more item(s)"}`
        : "";

    if (isIndonesian) {
        return `Halo KenBike,

Saya ingin bertanya tentang pesanan saya:

Order: ${displayOrderNumber}
Tanggal: ${orderDate}
Status: ${statusText}

Produk:
${productList}${moreItems}

Pertanyaan:
_[Tulis pertanyaan Anda di sini]_

Terima kasih.`;
    }

    // English version for international customers
    return `Hello KenBike,

I have a question about my order:

Order: ${displayOrderNumber}
Date: ${orderDate}
Status: ${statusText}

Products:
${productList}${moreItems}

Question:
_[Write your question here]_

Thank you.`;
}

/**
 * Generate WhatsApp deep link URL
 */
function generateWhatsAppUrl(order: Order): string {
    const message = generateWhatsAppMessage(order);
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
}

export function WhatsAppSupportButton({
                                          order,
                                          variant = "outline",
                                          size = "default",
                                          className = "",
                                          showIcon = true,
                                          children,
                                      }: WhatsAppSupportButtonProps) {
    const handleClick = () => {
        const url = generateWhatsAppUrl(order);
        window.open(url, "_blank", "noopener,noreferrer");
    };

    const isIndonesian = isIndonesianCustomer(order);
    const defaultText = isIndonesian ? "Hubungi Support" : "Contact Support";

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleClick}
            className={`gap-2 ${className}`}
        >
            {showIcon && <MessageCircle className="h-4 w-4" />}
            {children || defaultText}
        </Button>
    );
}

// Export utility functions for custom usage
export { generateWhatsAppMessage, generateWhatsAppUrl, WHATSAPP_NUMBER, isIndonesianCustomer };
// components/invoice/invoice-download-buttons.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InvoiceService } from "@/services/invoice.service";
import {
    FileText,
    Download,
    Loader2,
    ChevronDown,
    Eye,
    Package,
} from "lucide-react";
import { toast } from "sonner";
import { OrderStatus } from "@/types/order";
import { AxiosError } from "axios";

// Type for API error response
interface ApiErrorResponse {
    message?: string;
    error?: string;
}

interface InvoiceDownloadButtonsProps {
    orderNumber: string;
    orderStatus: OrderStatus;
    hasPaid: boolean;
    hasTrackingNumber?: boolean;
    className?: string;
    variant?: "default" | "outline" | "ghost";
    size?: "default" | "sm" | "lg" | "icon";
}

// Helper function to extract error message
function getErrorMessage(error: unknown, defaultMessage: string): string {
    if (error instanceof AxiosError) {
        const data = error.response?.data as ApiErrorResponse | undefined;
        return data?.message || data?.error || defaultMessage;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return defaultMessage;
}

export function InvoiceDownloadButtons({
                                           orderNumber,
                                           orderStatus,
                                           hasPaid,
                                           hasTrackingNumber = false,
                                           className = "",
                                           variant = "outline",
                                           size = "default",
                                       }: InvoiceDownloadButtonsProps) {
    const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);
    const [isDownloadingLabel, setIsDownloadingLabel] = useState(false);

    // Suppress unused variable warning - kept for future use
    void hasTrackingNumber;

    // Invoice available only after payment
    const canDownloadInvoice = hasPaid || ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED'].includes(orderStatus);

    // Shipping label available after order is paid
    const canDownloadShippingLabel = ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED'].includes(orderStatus);

    const handleDownloadInvoice = async (preview = false) => {
        setIsDownloadingInvoice(true);
        try {
            await InvoiceService.downloadInvoiceWithAuth(orderNumber, preview);
            if (!preview) {
                toast.success("Invoice downloaded successfully");
            }
        } catch (error: unknown) {
            console.error("Failed to download invoice:", error);
            toast.error(getErrorMessage(error, "Failed to download invoice"));
        } finally {
            setIsDownloadingInvoice(false);
        }
    };

    const handleDownloadShippingLabel = async (preview = false) => {
        setIsDownloadingLabel(true);
        try {
            await InvoiceService.downloadShippingLabelWithAuth(orderNumber, preview);
            if (!preview) {
                toast.success("Shipping label downloaded successfully");
            }
        } catch (error: unknown) {
            console.error("Failed to download shipping label:", error);
            toast.error(getErrorMessage(error, "Failed to download shipping label"));
        } finally {
            setIsDownloadingLabel(false);
        }
    };

    // If nothing is available, don't render
    if (!canDownloadInvoice && !canDownloadShippingLabel) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant={variant}
                    size={size}
                    className={className}
                    disabled={isDownloadingInvoice || isDownloadingLabel}
                >
                    {isDownloadingInvoice || isDownloadingLabel ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <Download className="h-4 w-4 mr-2" />
                    )}
                    Download
                    <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                {/* Invoice Section */}
                {canDownloadInvoice && (
                    <>
                        <DropdownMenuItem
                            onClick={() => handleDownloadInvoice(false)}
                            disabled={isDownloadingInvoice}
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            <span>Download Invoice</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => handleDownloadInvoice(true)}
                            disabled={isDownloadingInvoice}
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            <span>Preview Invoice</span>
                        </DropdownMenuItem>
                    </>
                )}

                {canDownloadInvoice && canDownloadShippingLabel && (
                    <DropdownMenuSeparator />
                )}

                {/* Shipping Label Section */}
                {canDownloadShippingLabel && (
                    <>
                        <DropdownMenuItem
                            onClick={() => handleDownloadShippingLabel(false)}
                            disabled={isDownloadingLabel}
                        >
                            <Package className="h-4 w-4 mr-2" />
                            <span>Download Shipping Label</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => handleDownloadShippingLabel(true)}
                            disabled={isDownloadingLabel}
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            <span>Preview Shipping Label</span>
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

/**
 * Simple single button for invoice download only
 */
export function InvoiceDownloadButton({
                                          orderNumber,
                                          orderStatus,
                                          hasPaid,
                                          className = "",
                                          variant = "outline",
                                          size = "sm",
                                      }: Omit<InvoiceDownloadButtonsProps, 'hasTrackingNumber'>) {
    const [isDownloading, setIsDownloading] = useState(false);

    const canDownload = hasPaid || ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED'].includes(orderStatus);

    if (!canDownload) {
        return null;
    }

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            await InvoiceService.downloadInvoiceWithAuth(orderNumber, false);
            toast.success("Invoice downloaded");
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, "Failed to download invoice"));
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleDownload}
            disabled={isDownloading}
            className={className}
        >
            {isDownloading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
                <FileText className="h-4 w-4 mr-2" />
            )}
            Invoice
        </Button>
    );
}

/**
 * Simple single button for shipping label download only
 */
export function ShippingLabelDownloadButton({
                                                orderNumber,
                                                orderStatus,
                                                className = "",
                                                variant = "outline",
                                                size = "sm",
                                            }: Pick<InvoiceDownloadButtonsProps, 'orderNumber' | 'orderStatus' | 'className' | 'variant' | 'size'>) {
    const [isDownloading, setIsDownloading] = useState(false);

    const canDownload = ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED'].includes(orderStatus);

    if (!canDownload) {
        return null;
    }

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            await InvoiceService.downloadShippingLabelWithAuth(orderNumber, false);
            toast.success("Shipping label downloaded");
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, "Failed to download shipping label"));
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleDownload}
            disabled={isDownloading}
            className={className}
        >
            {isDownloading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
                <Package className="h-4 w-4 mr-2" />
            )}
            Shipping Label
        </Button>
    );
}
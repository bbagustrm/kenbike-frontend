// components/order/shipping-label-button.tsx
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { OrderService } from '@/services/order.service';
import { toast } from 'sonner';

interface ShippingLabelButtonProps {
    orderNumber: string;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'lg';
    className?: string;
    locale?: 'id' | 'en';
    isAdmin?: boolean;
}

export function ShippingLabelButton({
    orderNumber,
    variant = 'outline',
    size = 'default',
    className,
    locale = 'en',
    isAdmin = false,
}: ShippingLabelButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleDownload = async () => {
        setIsLoading(true);
        try {
            const labelUrl = isAdmin
                ? await OrderService.getAdminShippingLabel(orderNumber)
                : await OrderService.getShippingLabel(orderNumber);

            // Open in new tab
            window.open(labelUrl, '_blank');

            toast.success(
                locale === 'id'
                    ? 'Label pengiriman dibuka di tab baru'
                    : 'Shipping label opened in new tab'
            );
        } catch (error: unknown) { // Ganti any dengan unknown
            // Lakukan type guard untuk memastikan error adalah instance dari Error
            let errorMessage = locale === 'id' ? 'Gagal mengunduh label' : 'Failed to download label';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleDownload}
            disabled={isLoading}
            variant={variant}
            size={size}
            className={className}
        >
            {isLoading ? (
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {locale === 'id' ? 'Memuat...' : 'Loading...'}
                </>
            ) : (
                <>
                    <Download className="w-4 h-4 mr-2" />
                    {locale === 'id' ? 'Unduh Label' : 'Download Label'}
                </>
            )}
        </Button>
    );
}
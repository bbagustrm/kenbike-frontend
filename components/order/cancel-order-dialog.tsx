// components/order/cancel-order-dialog.tsx
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { XCircle } from 'lucide-react';

interface CancelOrderDialogProps {
    onConfirm: () => Promise<void>;
    isLoading?: boolean;
    locale?: 'id' | 'en';
    triggerClassName?: string;
}

export function CancelOrderDialog({
                                      onConfirm,
                                      isLoading = false,
                                      locale = 'en',
                                      triggerClassName,
                                  }: CancelOrderDialogProps) {
    const [open, setOpen] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    const handleConfirm = async () => {
        setIsCancelling(true);
        try {
            await onConfirm();
            setOpen(false);
        } catch (error) {
            // Error handled by parent
        } finally {
            setIsCancelling(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="destructive"
                    className={triggerClassName}
                    disabled={isLoading}
                >
                    <XCircle className="w-4 h-4 mr-2" />
                    {locale === 'id' ? 'Batalkan Pesanan' : 'Cancel Order'}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {locale === 'id' ? 'Batalkan Pesanan?' : 'Cancel Order?'}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {locale === 'id'
                            ? 'Apakah Anda yakin ingin membatalkan pesanan ini? Tindakan ini tidak dapat dibatalkan. Stok produk akan dikembalikan.'
                            : 'Are you sure you want to cancel this order? This action cannot be undone. Product stock will be restored.'
                        }
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isCancelling}>
                        {locale === 'id' ? 'Batal' : 'Cancel'}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={isCancelling}
                        className="bg-destructive hover:bg-destructive/90"
                    >
                        {isCancelling
                            ? (locale === 'id' ? 'Membatalkan...' : 'Cancelling...')
                            : (locale === 'id' ? 'Ya, Batalkan' : 'Yes, Cancel Order')
                        }
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
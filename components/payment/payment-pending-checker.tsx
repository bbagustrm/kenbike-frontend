// components/payment/payment-pending-checker.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PaymentService } from '@/services/payment.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentPendingCheckerProps {
    orderNumber: string;
    autoCheck?: boolean;
    checkInterval?: number; // in milliseconds
    locale?: 'id' | 'en';
}

export function PaymentPendingChecker({
    orderNumber,
    autoCheck = true,
    checkInterval = 5000, // 5 seconds
    locale = 'en'
}: PaymentPendingCheckerProps) {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(false);
    const [lastChecked, setLastChecked] = useState<Date | null>(null);
    const [checkCount, setCheckCount] = useState(0);

    const checkPaymentStatus = async () => {
        setIsChecking(true);
        try {
            const response = await PaymentService.getPaymentStatus(orderNumber);
            const { paymentStatus } = response.data;

            if (paymentStatus === 'PAID') {
                toast.success(locale === 'id' ? 'Pembayaran berhasil!' : 'Payment successful!');
                router.push(`/orders/success?orderNumber=${orderNumber}`);
            } else if (paymentStatus === 'FAILED') {
                toast.error(locale === 'id' ? 'Pembayaran gagal' : 'Payment failed');
                router.push(`/orders/failed?orderNumber=${orderNumber}`);
            } else {
                setLastChecked(new Date());
                setCheckCount(prev => prev + 1);
            }
        } catch (error: Error) {
            console.error('Failed to check payment status:', error);
        } finally {
            setIsChecking(false);
        }
    };

    useEffect(() => {
        if (!autoCheck) return;

        // Initial check after 2 seconds
        const initialTimeout = setTimeout(() => {
            checkPaymentStatus();
        }, 2000);

        // Periodic checks
        const interval = setInterval(() => {
            checkPaymentStatus();
        }, checkInterval);

        // Cleanup
        return () => {
            clearTimeout(initialTimeout);
            clearInterval(interval);
        };
    }, [orderNumber, autoCheck, checkInterval]);

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {isChecking ? (
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        ) : (
                            <div className="w-5 h-5 rounded-full bg-yellow-500 animate-pulse" />
                        )}
                        <div>
                            <p className="font-semibold">
                                {locale === 'id' ? 'Memeriksa status pembayaran...' : 'Checking payment status...'}
                            </p>
                            {lastChecked && (
                                <p className="text-xs text-muted-foreground">
                                    {locale === 'id' ? 'Terakhir diperiksa' : 'Last checked'}: {lastChecked.toLocaleTimeString()}
                                    {' '}({checkCount} {locale === 'id' ? 'kali' : 'times'})
                                </p>
                            )}
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={checkPaymentStatus}
                        disabled={isChecking}
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
                        {locale === 'id' ? 'Periksa Manual' : 'Check Manually'}
                    </Button>
                </div>

                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                        {locale === 'id'
                            ? 'Status pembayaran akan otomatis diperbarui setiap 5 detik. Anda juga bisa klik tombol "Periksa Manual" untuk refresh.'
                            : 'Payment status will be automatically updated every 5 seconds. You can also click "Check Manually" to refresh.'
                        }
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
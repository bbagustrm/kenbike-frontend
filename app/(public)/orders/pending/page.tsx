// app/(public)/orders/pending/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/hooks/use-translation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PaymentPendingChecker } from '@/components/payment/payment-pending-checker';
import { Clock, CreditCard, HelpCircle } from 'lucide-react';
import { getPaymentTimeRemaining, isPaymentExpired } from '@/lib/order-utils';
import Link from 'next/link';

export default function PaymentPendingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { locale } = useTranslation();
    const orderNumber = searchParams.get('orderNumber');
    const createdAt = searchParams.get('createdAt');

    const [timeRemaining, setTimeRemaining] = useState<string>('');

    useEffect(() => {
        if (!orderNumber) {
            router.push('/orders');
            return;
        }

        if (createdAt) {
            // Update time remaining every minute
            const updateTime = () => {
                if (isPaymentExpired(createdAt)) {
                    setTimeRemaining('Expired');
                } else {
                    setTimeRemaining(getPaymentTimeRemaining(createdAt));
                }
            };

            updateTime();
            const interval = setInterval(updateTime, 60000); // Update every minute

            return () => clearInterval(interval);
        }
    }, [orderNumber, createdAt, router]);

    if (!orderNumber) {
        return null;
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white dark:from-yellow-950/20 dark:to-background py-12">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto space-y-8">
                        {/* Header Icon */}
                        <div className="flex justify-center">
                            <div className="w-24 h-24 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                                <Clock className="w-12 h-12 text-yellow-600 dark:text-yellow-400 animate-pulse" />
                            </div>
                        </div>

                        {/* Title */}
                        <div className="text-center space-y-2">
                            <h1 className="text-3xl font-bold">
                                {locale === 'id' ? 'Menunggu Pembayaran' : 'Awaiting Payment'}
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                {locale === 'id' ? 'Pesanan Anda sedang menunggu pembayaran' : 'Your order is awaiting payment'}
                            </p>
                        </div>

                        {/* Order Number */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        {locale === 'id' ? 'Nomor Pesanan' : 'Order Number'}
                                    </p>
                                    <p className="text-2xl font-mono font-bold">
                                        {orderNumber}
                                    </p>
                                    {timeRemaining && (
                                        <p className="text-sm text-muted-foreground">
                                            {locale === 'id' ? 'Waktu tersisa' : 'Time remaining'}: {' '}
                                            <span className="font-semibold text-yellow-600">
                        {timeRemaining}
                      </span>
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Auto Checker */}
                        <PaymentPendingChecker
                            orderNumber={orderNumber}
                            autoCheck={true}
                            locale={locale}
                        />

                        {/* Instructions */}
                        <Card>
                            <CardContent className="pt-6 space-y-4">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <CreditCard className="w-5 h-5" />
                                    {locale === 'id' ? 'Cara Menyelesaikan Pembayaran' : 'How to Complete Payment'}
                                </h3>
                                <ol className="space-y-3 text-sm list-decimal list-inside">
                                    <li>
                                        {locale === 'id'
                                            ? 'Selesaikan pembayaran melalui halaman payment gateway (Midtrans/PayPal)'
                                            : 'Complete payment through the payment gateway page (Midtrans/PayPal)'
                                        }
                                    </li>
                                    <li>
                                        {locale === 'id'
                                            ? 'Halaman ini akan otomatis diperbarui setelah pembayaran berhasil'
                                            : 'This page will automatically update after successful payment'
                                        }
                                    </li>
                                    <li>
                                        {locale === 'id'
                                            ? 'Atau klik tombol "Periksa Manual" untuk refresh status'
                                            : 'Or click "Check Manually" button to refresh status'
                                        }
                                    </li>
                                </ol>
                            </CardContent>
                        </Card>

                        {/* Help Section */}
                        <Card className="border-blue-200 dark:border-blue-900">
                            <CardContent className="pt-6">
                                <div className="flex gap-3">
                                    <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div className="space-y-2">
                                        <h3 className="font-semibold">
                                            {locale === 'id' ? 'Butuh Bantuan?' : 'Need Help?'}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {locale === 'id'
                                                ? 'Jika pembayaran sudah selesai tapi status belum berubah, hubungi customer service kami.'
                                                : 'If payment is completed but status hasn\'t changed, contact our customer service.'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                asChild
                            >
                                <Link href={`/orders/${orderNumber}`}>
                                    {locale === 'id' ? 'Lihat Detail Pesanan' : 'View Order Details'}
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1"
                                asChild
                            >
                                <Link href="/orders">
                                    {locale === 'id' ? 'Kembali ke Pesanan' : 'Back to Orders'}
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
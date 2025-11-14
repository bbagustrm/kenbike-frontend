// app/(public)/orders/failed/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/hooks/use-translation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, RefreshCw, HelpCircle, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { PaymentService } from '@/services/payment.service';
import { toast } from 'sonner';

export default function PaymentFailedPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { locale } = useTranslation();
    const orderNumber = searchParams.get('orderNumber');
    const [isRetrying, setIsRetrying] = useState(false);

    useEffect(() => {
        if (!orderNumber) {
            router.push('/orders');
        }
    }, [orderNumber, router]);

    const handleRetryPayment = async () => {
        if (!orderNumber) return;

        setIsRetrying(true);
        try {
            const response = await PaymentService.createPayment({
                orderNumber,
                paymentMethod: 'MIDTRANS_SNAP', // You might want to get this from order details
            });

            // Redirect to payment URL
            window.location.href = response.data.paymentUrl;
        } catch (error) { // Tidak ada anotasi tipe, TypeScript akan menganggapnya 'unknown'
            // Lakukan pemeriksaan tipe (type guard)
            if (error instanceof Error) {
                toast.error(error.message || 'Failed to retry payment');
            } else {
                // Tangani kasus di mana error bukanlah objek Error
                toast.error('An unknown error occurred while retrying payment.');
            }
            setIsRetrying(false);
        }
    };

    if (!orderNumber) {
        return null;
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-b from-red-50 to-white dark:from-red-950/20 dark:to-background py-12">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto space-y-8">
                        {/* Error Icon */}
                        <div className="flex justify-center">
                            <div className="w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
                            </div>
                        </div>

                        {/* Title */}
                        <div className="text-center space-y-2">
                            <h1 className="text-3xl font-bold text-red-600 dark:text-red-400">
                                {locale === 'id' ? 'Pembayaran Gagal' : 'Payment Failed'}
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                {locale === 'id'
                                    ? 'Pembayaran Anda tidak dapat diproses'
                                    : 'Your payment could not be processed'
                                }
                            </p>
                        </div>

                        {/* Order Number */}
                        <Card className="border-red-200 dark:border-red-900">
                            <CardContent className="pt-6">
                                <div className="text-center space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        {locale === 'id' ? 'Nomor Pesanan' : 'Order Number'}
                                    </p>
                                    <p className="text-2xl font-mono font-bold text-red-600 dark:text-red-400">
                                        {orderNumber}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Common Reasons */}
                        <Card>
                            <CardContent className="pt-6 space-y-4">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <HelpCircle className="w-5 h-5" />
                                    {locale === 'id' ? 'Kemungkinan Penyebab' : 'Possible Reasons'}
                                </h3>
                                <ul className="space-y-2 text-sm list-disc list-inside">
                                    <li>
                                        {locale === 'id'
                                            ? 'Saldo atau limit kartu tidak mencukupi'
                                            : 'Insufficient balance or card limit'
                                        }
                                    </li>
                                    <li>
                                        {locale === 'id'
                                            ? 'Detail pembayaran tidak valid'
                                            : 'Invalid payment details'
                                        }
                                    </li>
                                    <li>
                                        {locale === 'id'
                                            ? 'Transaksi ditolak oleh bank'
                                            : 'Transaction declined by bank'
                                        }
                                    </li>
                                    <li>
                                        {locale === 'id'
                                            ? 'Koneksi internet terputus saat pembayaran'
                                            : 'Internet connection lost during payment'
                                        }
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* What to Do */}
                        <Card>
                            <CardContent className="pt-6 space-y-4">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <CreditCard className="w-5 h-5" />
                                    {locale === 'id' ? 'Apa yang Harus Dilakukan?' : 'What to Do?'}
                                </h3>
                                <ol className="space-y-3 text-sm list-decimal list-inside">
                                    <li>
                                        {locale === 'id'
                                            ? 'Periksa detail kartu atau akun pembayaran Anda'
                                            : 'Check your card or payment account details'
                                        }
                                    </li>
                                    <li>
                                        {locale === 'id'
                                            ? 'Pastikan saldo atau limit mencukupi'
                                            : 'Ensure sufficient balance or limit'
                                        }
                                    </li>
                                    <li>
                                        {locale === 'id'
                                            ? 'Coba metode pembayaran lain'
                                            : 'Try a different payment method'
                                        }
                                    </li>
                                    <li>
                                        {locale === 'id'
                                            ? 'Hubungi customer service jika masalah berlanjut'
                                            : 'Contact customer service if problem persists'
                                        }
                                    </li>
                                </ol>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                className="flex-1"
                                onClick={handleRetryPayment}
                                disabled={isRetrying}
                            >
                                {isRetrying ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                        {locale === 'id' ? 'Memproses...' : 'Processing...'}
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        {locale === 'id' ? 'Coba Lagi' : 'Retry Payment'}
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1"
                                asChild
                            >
                                <Link href={`/orders/${orderNumber}`}>
                                    {locale === 'id' ? 'Lihat Detail Pesanan' : 'View Order Details'}
                                </Link>
                            </Button>
                        </div>

                        {/* Help */}
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
                                                ? 'Jika Anda terus mengalami masalah, hubungi customer service kami untuk bantuan.'
                                                : 'If you continue to experience issues, contact our customer service for assistance.'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
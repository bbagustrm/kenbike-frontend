// app/(public)/orders/success/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/hooks/use-translation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Package, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import confetti from 'canvas-confetti';

export default function PaymentSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { locale } = useTranslation();
    const orderNumber = searchParams.get('orderNumber');

    useEffect(() => {
        if (!orderNumber) {
            router.push('/orders');
            return;
        }

        // Trigger confetti animation
        const duration = 3000;
        const animationEnd = Date.now() + duration;

        const randomInRange = (min: number, max: number) => {
            return Math.random() * (max - min) + min;
        };

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                clearInterval(interval);
                return;
            }

            const particleCount = 50 * (timeLeft / duration);

            confetti({
                particleCount,
                startVelocity: 30,
                spread: 360,
                origin: {
                    x: randomInRange(0.1, 0.3),
                    y: Math.random() - 0.2,
                },
            });
            confetti({
                particleCount,
                startVelocity: 30,
                spread: 360,
                origin: {
                    x: randomInRange(0.7, 0.9),
                    y: Math.random() - 0.2,
                },
            });
        }, 250);

        return () => clearInterval(interval);
    }, [orderNumber, router]);

    if (!orderNumber) {
        return null;
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-green-950/20 dark:to-background py-12">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto space-y-8">
                        {/* Success Icon */}
                        <div className="flex justify-center">
                            <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center animate-bounce">
                                <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
                            </div>
                        </div>

                        {/* Title */}
                        <div className="text-center space-y-2">
                            <h1 className="text-3xl font-bold text-green-600 dark:text-green-400">
                                {locale === 'id' ? 'Pembayaran Berhasil!' : 'Payment Successful!'}
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                {locale === 'id'
                                    ? 'Terima kasih atas pesanan Anda'
                                    : 'Thank you for your order'
                                }
                            </p>
                        </div>

                        {/* Order Number */}
                        <Card className="border-green-200 dark:border-green-900">
                            <CardContent className="pt-6">
                                <div className="text-center space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        {locale === 'id' ? 'Nomor Pesanan' : 'Order Number'}
                                    </p>
                                    <p className="text-2xl font-mono font-bold text-green-600 dark:text-green-400">
                                        {orderNumber}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* What's Next */}
                        <Card>
                            <CardContent className="pt-6 space-y-4">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Package className="w-5 h-5" />
                                    {locale === 'id' ? 'Apa Selanjutnya?' : "What's Next?"}
                                </h3>
                                <ol className="space-y-3 text-sm list-decimal list-inside">
                                    <li>
                                        {locale === 'id'
                                            ? 'Pesanan Anda sedang diproses oleh tim kami'
                                            : 'Your order is being processed by our team'
                                        }
                                    </li>
                                    <li>
                                        {locale === 'id'
                                            ? 'Anda akan menerima email konfirmasi segera'
                                            : 'You will receive a confirmation email shortly'
                                        }
                                    </li>
                                    <li>
                                        {locale === 'id'
                                            ? 'Kami akan mengirimkan pesanan Anda dalam 1-2 hari kerja'
                                            : 'We will ship your order within 1-2 business days'
                                        }
                                    </li>
                                    <li>
                                        {locale === 'id'
                                            ? 'Anda dapat melacak status pesanan di halaman "Pesanan Saya"'
                                            : 'You can track your order status on "My Orders" page'
                                        }
                                    </li>
                                </ol>
                            </CardContent>
                        </Card>

                        {/* Success Message */}
                        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                            <CardContent className="pt-6">
                                <div className="flex gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-green-600 dark:text-green-400">
                                            {locale === 'id' ? 'Pembayaran Dikonfirmasi' : 'Payment Confirmed'}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {locale === 'id'
                                                ? 'Pembayaran Anda telah berhasil diproses. Kami akan segera memproses pesanan Anda.'
                                                : 'Your payment has been successfully processed. We will process your order shortly.'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                className="flex-1"
                                asChild
                            >
                                <Link href={`/orders/${orderNumber}`}>
                                    {locale === 'id' ? 'Lihat Detail Pesanan' : 'View Order Details'}
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1"
                                asChild
                            >
                                <Link href="/">
                                    {locale === 'id' ? 'Lanjut Belanja' : 'Continue Shopping'}
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
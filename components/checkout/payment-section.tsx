// components/checkout/payment-section.tsx
"use client";

import { CreditCard, DollarSign, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

interface PaymentSectionProps {
    country: string;
}

export function PaymentSection({ country }: PaymentSectionProps) {
    const isDomestic = country === 'Indonesia';
    const defaultTab = isDomestic ? 'midtrans' : 'paypal';

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Method
                </CardTitle>
                <CardDescription>
                    {isDomestic
                        ? 'Pay with various Indonesian payment methods via Midtrans'
                        : 'Pay securely with PayPal for international orders'
                    }
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue={defaultTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="midtrans" disabled={!isDomestic}>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Midtrans
                            {isDomestic && <Badge variant="default" className="ml-2">Active</Badge>}
                        </TabsTrigger>
                        <TabsTrigger value="paypal" disabled={isDomestic}>
                            <DollarSign className="w-4 h-4 mr-2" />
                            PayPal
                            {!isDomestic && <Badge variant="default" className="ml-2">Active</Badge>}
                        </TabsTrigger>
                    </TabsList>

                    {/* Midtrans Tab */}
                    <TabsContent value="midtrans" className="space-y-4 mt-4">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <ShieldCheck className="w-4 h-4 text-green-500" />
                                <span>Secure payment with Midtrans Snap</span>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                {/* Payment method logos */}
                                <div className="p-3 border rounded-lg flex items-center justify-center bg-card">
                                    <span className="text-xs font-medium">Bank Transfer</span>
                                </div>
                                <div className="p-3 border rounded-lg flex items-center justify-center bg-card">
                                    <span className="text-xs font-medium">Credit Card</span>
                                </div>
                                <div className="p-3 border rounded-lg flex items-center justify-center bg-card">
                                    <span className="text-xs font-medium">E-Wallet</span>
                                </div>
                                <div className="p-3 border rounded-lg flex items-center justify-center bg-card">
                                    <span className="text-xs font-medium">GoPay</span>
                                </div>
                                <div className="p-3 border rounded-lg flex items-center justify-center bg-card">
                                    <span className="text-xs font-medium">ShopeePay</span>
                                </div>
                                <div className="p-3 border rounded-lg flex items-center justify-center bg-card">
                                    <span className="text-xs font-medium">QRIS</span>
                                </div>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    💡 After clicking "Pay Now", you'll be redirected to Midtrans payment page in a new tab.
                                    You can choose from various payment methods including bank transfer, credit card, and e-wallets.
                                </p>
                            </div>
                        </div>
                    </TabsContent>

                    {/* PayPal Tab */}
                    <TabsContent value="paypal" className="space-y-4 mt-4">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <ShieldCheck className="w-4 h-4 text-green-500" />
                                <span>Secure international payment with PayPal</span>
                            </div>

                            <div className="flex items-center justify-center p-6 border rounded-lg bg-card">
                                <div className="relative w-32 h-12">
                                    <Image
                                        src="/paypal-logo.svg"
                                        alt="PayPal"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-start gap-2 text-sm">
                                    <span className="text-green-500">✓</span>
                                    <span>Pay with PayPal balance, credit card, or debit card</span>
                                </div>
                                <div className="flex items-start gap-2 text-sm">
                                    <span className="text-green-500">✓</span>
                                    <span>Buyer protection included</span>
                                </div>
                                <div className="flex items-start gap-2 text-sm">
                                    <span className="text-green-500">✓</span>
                                    <span>Support for multiple currencies</span>
                                </div>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    💡 After clicking "Pay Now", you'll be redirected to PayPal's secure payment page.
                                    You can log in to your PayPal account or pay as a guest with your card.
                                </p>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
// components/checkout/shipping-section.tsx - FINAL WITH LOCALIZED PRICES
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Package, Plane } from 'lucide-react';
import { ShippingCalculationResponse, ShippingOption } from '@/types/order';
import { useTranslation } from '@/hooks/use-translation';
import { formatCurrency, getCurrencyFromLocale } from '@/lib/format-currency';

interface ShippingSectionProps {
    isCalculating: boolean;
    calculation: ShippingCalculationResponse | null;
    selectedCourier: ShippingOption | null;
    onSelectCourier: (courier: ShippingOption) => void;
    currency: 'IDR' | 'USD';
}

export function ShippingSection({
                                    isCalculating,
                                    calculation,
                                    selectedCourier,
                                    onSelectCourier,
                                    currency,
                                }: ShippingSectionProps) {
    const { t, locale } = useTranslation();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    {t.checkout.shippingMethod}
                </CardTitle>
                <CardDescription>
                    {t.checkout.selectShipping}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isCalculating && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">{t.checkout.calculatingShipping}</span>
                        </div>
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                )}

                {!isCalculating && !calculation && (
                    <Alert>
                        <AlertDescription>
                            Shipping will be calculated after you complete your address.
                        </AlertDescription>
                    </Alert>
                )}

                {!isCalculating && calculation && (
                    <div className="space-y-4">
                        {/* Domestic Shipping Options */}
                        {calculation.shippingType === 'DOMESTIC' && calculation.options && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Package className="w-4 h-4" />
                                    {t.checkout.domesticShipping}
                                </div>

                                <RadioGroup
                                    value={selectedCourier?.service || ''}
                                    onValueChange={(value) => {
                                        const courier = calculation.options.find((r) => r.service === value);
                                        if (courier) onSelectCourier(courier);
                                    }}
                                >
                                    {calculation.options.map((option) => (
                                        <div
                                            key={`${option.courier}-${option.service}`}
                                            className="flex items-center space-x-3 space-y-0 border rounded-lg p-4 cursor-pointer hover:bg-accent"
                                            onClick={() => onSelectCourier(option)}
                                        >
                                            <RadioGroupItem value={option.service || ''} />
                                            <div className="flex-1">
                                                <Label className="font-medium cursor-pointer">
                                                    {option.serviceName}
                                                </Label>
                                                {option.description && (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {option.description}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold">
                                                    {formatCurrency(option.cost, currency)}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {option.estimatedDays.min === option.estimatedDays.max
                                                        ? `${option.estimatedDays.min} ${t.checkout.day}`
                                                        : `${option.estimatedDays.min}-${option.estimatedDays.max} ${t.checkout.days}`}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>
                        )}

                        {/* International Shipping */}
                        {calculation.shippingType === 'INTERNATIONAL' && calculation.options?.[0] && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Plane className="w-4 h-4" />
                                    {t.checkout.internationalShipping}
                                </div>

                                <div className="border rounded-lg p-4 bg-accent/50">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium">{calculation.options[0].serviceName}</p>
                                            {calculation.options[0].description && (
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {calculation.options[0].description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-lg">
                                                {formatCurrency(calculation.options[0].cost, currency)}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {t.checkout.estimatedDelivery}:{' '}
                                                {calculation.options[0].estimatedDays.min}-
                                                {calculation.options[0].estimatedDays.max} {t.checkout.days}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
// components/checkout/shipping-section.tsx
"use client";

import { Truck, Package, Loader2, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ShippingCalculationResponse, ShippingRate } from '@/types/order';
import { formatCurrency } from '@/lib/format-currency';
import Image from 'next/image';

interface ShippingSectionProps {
    isCalculating: boolean;
    calculation: ShippingCalculationResponse | null;
    selectedCourier: ShippingRate | null;
    onSelectCourier: (courier: ShippingRate) => void;
    currency: string;
}

export function ShippingSection({
                                    isCalculating,
                                    calculation,
                                    selectedCourier,
                                    onSelectCourier,
                                    currency,
                                }: ShippingSectionProps) {
    if (isCalculating) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Truck className="w-5 h-5" />
                        Shipping Method
                    </CardTitle>
                    <CardDescription>Calculating shipping rates...</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (!calculation) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Truck className="w-5 h-5" />
                        Shipping Method
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8 text-muted-foreground">
                        <Package className="w-12 h-12 mr-3" />
                        <p>Complete your address to calculate shipping</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Domestic shipping - show courier options
    if (calculation.type === 'DOMESTIC' && calculation.rates) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Truck className="w-5 h-5" />
                        Select Courier
                    </CardTitle>
                    <CardDescription>
                        Choose your preferred shipping method ({calculation.rates.length} options available)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup
                        value={selectedCourier?.service || ''}
                        onValueChange={(value) => {
                            const courier = calculation.rates!.find((r) => r.service === value);
                            if (courier) onSelectCourier(courier);
                        }}
                        className="space-y-3"
                    >
                        {calculation.rates.map((rate) => (
                            <div
                                key={`${rate.courier}-${rate.service}`}
                                className={`flex items-start space-x-3 rounded-lg border p-4 cursor-pointer transition-colors hover:bg-accent ${
                                    selectedCourier?.service === rate.service
                                        ? 'border-primary bg-accent'
                                        : 'border-border'
                                }`}
                                onClick={() => onSelectCourier(rate)}
                            >
                                <RadioGroupItem value={rate.service} id={rate.service} />
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            {rate.courierLogo && (
                                                <div className="relative w-12 h-8">
                                                    <Image
                                                        src={rate.courierLogo}
                                                        alt={rate.courierName}
                                                        fill
                                                        className="object-contain"
                                                    />
                                                </div>
                                            )}
                                            <div>
                                                <Label
                                                    htmlFor={rate.service}
                                                    className="font-semibold cursor-pointer"
                                                >
                                                    {rate.courierName} - {rate.serviceName}
                                                </Label>
                                                <p className="text-sm text-muted-foreground">
                                                    {rate.description}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="font-semibold">
                                                {formatCurrency(rate.price, currency)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="w-4 h-4" />
                                        <span>{rate.estimatedDays}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </RadioGroup>
                </CardContent>
            </Card>
        );
    }

    // International shipping - show zone cost
    if (calculation.type === 'INTERNATIONAL' && calculation.zone && calculation.cost !== undefined) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Truck className="w-5 h-5" />
                        International Shipping
                    </CardTitle>
                    <CardDescription>via Pos Indonesia</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold">{calculation.zone.name}</p>
                                    <Badge variant="outline">Pos Indonesia</Badge>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="w-4 h-4" />
                                    <span>
                                        Estimated {calculation.zone.minDays}-{calculation.zone.maxDays} days
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">Shipping Cost</p>
                                <p className="text-xl font-bold">
                                    {formatCurrency(calculation.cost, currency)}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return null;
}
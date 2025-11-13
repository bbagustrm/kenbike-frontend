// components/checkout/shipping-calculator.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Package, Clock, DollarSign } from 'lucide-react';
import { ShippingOption } from '@/types/shipping';
import { INTERNATIONAL_COUNTRIES } from '@/lib/shipping-utils';
import { formatCurrency } from '@/lib/payment-utils';
import { cn } from '@/lib/utils';

interface ShippingCalculatorProps {
    shippingType: 'DOMESTIC' | 'INTERNATIONAL';
    shippingOptions: ShippingOption[];
    selectedShipping?: ShippingOption;
    isCalculating: boolean;
    locale?: 'id' | 'en';
    onShippingTypeChange: (type: 'DOMESTIC' | 'INTERNATIONAL') => void;
    onCalculate: (destination: { postalCode?: string; country?: string }) => void;
    onSelectShipping: (option: ShippingOption) => void;
}

export function ShippingCalculator({
                                       shippingType,
                                       shippingOptions,
                                       selectedShipping,
                                       isCalculating,
                                       locale = 'en',
                                       onShippingTypeChange,
                                       onCalculate,
                                       onSelectShipping,
                                   }: ShippingCalculatorProps) {
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('');

    const handleCalculate = () => {
        if (shippingType === 'DOMESTIC') {
            if (!postalCode || postalCode.length !== 5) {
                alert(locale === 'id' ? 'Masukkan kode pos 5 digit' : 'Enter 5-digit postal code');
                return;
            }
            onCalculate({ postalCode });
        } else {
            if (!country) {
                alert(locale === 'id' ? 'Pilih negara tujuan' : 'Select destination country');
                return;
            }
            onCalculate({ country });
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold mb-2">
                    {locale === 'id' ? 'Pilih Metode Pengiriman' : 'Select Shipping Method'}
                </h2>
                <p className="text-sm text-muted-foreground">
                    {locale === 'id'
                        ? 'Pilih tujuan pengiriman dan lihat opsi yang tersedia'
                        : 'Choose your destination and see available options'
                    }
                </p>
            </div>

            {/* Shipping Type Selector */}
            <Card>
                <CardContent className="pt-6">
                    <RadioGroup
                        value={shippingType}
                        onValueChange={(value) => onShippingTypeChange(value as 'DOMESTIC' | 'INTERNATIONAL')}
                        className="grid grid-cols-2 gap-4"
                    >
                        <Label
                            htmlFor="domestic"
                            className={cn(
                                "flex flex-col items-center gap-2 rounded-lg border-2 p-4 cursor-pointer transition-colors",
                                shippingType === 'DOMESTIC'
                                    ? "border-primary bg-primary/5"
                                    : "border-muted hover:border-primary/50"
                            )}
                        >
                            <RadioGroupItem value="DOMESTIC" id="domestic" className="sr-only" />
                            <Package className="w-6 h-6" />
                            <span className="font-semibold">
                {locale === 'id' ? 'Domestik' : 'Domestic'}
              </span>
                            <span className="text-xs text-muted-foreground text-center">
                {locale === 'id' ? 'Dalam Indonesia' : 'Within Indonesia'}
              </span>
                        </Label>

                        <Label
                            htmlFor="international"
                            className={cn(
                                "flex flex-col items-center gap-2 rounded-lg border-2 p-4 cursor-pointer transition-colors",
                                shippingType === 'INTERNATIONAL'
                                    ? "border-primary bg-primary/5"
                                    : "border-muted hover:border-primary/50"
                            )}
                        >
                            <RadioGroupItem value="INTERNATIONAL" id="international" className="sr-only" />
                            <Package className="w-6 h-6" />
                            <span className="font-semibold">
                {locale === 'id' ? 'Internasional' : 'International'}
              </span>
                            <span className="text-xs text-muted-foreground text-center">
                {locale === 'id' ? 'Luar Indonesia' : 'Outside Indonesia'}
              </span>
                        </Label>
                    </RadioGroup>
                </CardContent>
            </Card>

            {/* Destination Input */}
            <Card>
                <CardContent className="pt-6 space-y-4">
                    {shippingType === 'DOMESTIC' ? (
                        <div className="space-y-2">
                            <Label htmlFor="postalCode">
                                {locale === 'id' ? 'Kode Pos Tujuan' : 'Destination Postal Code'}
                            </Label>
                            <Input
                                id="postalCode"
                                placeholder="12345"
                                value={postalCode}
                                onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                                maxLength={5}
                            />
                            <p className="text-xs text-muted-foreground">
                                {locale === 'id' ? 'Masukkan 5 digit kode pos' : 'Enter 5-digit postal code'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Label htmlFor="country">
                                {locale === 'id' ? 'Negara Tujuan' : 'Destination Country'}
                            </Label>
                            <Select value={country} onValueChange={setCountry}>
                                <SelectTrigger>
                                    <SelectValue placeholder={locale === 'id' ? 'Pilih negara...' : 'Select country...'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {INTERNATIONAL_COUNTRIES.map(c => (
                                        <SelectItem key={c.code} value={c.code}>
                                            {c.name} ({c.zone})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <Button
                        onClick={handleCalculate}
                        className="w-full"
                        disabled={isCalculating}
                    >
                        {isCalculating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {locale === 'id' ? 'Menghitung...' : 'Calculating...'}
                            </>
                        ) : (
                            locale === 'id' ? 'Hitung Ongkir' : 'Calculate Shipping'
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Shipping Options */}
            {shippingOptions.length > 0 && (
                <div className="space-y-3">
                    <h3 className="font-semibold">
                        {locale === 'id' ? 'Pilih Kurir' : 'Select Courier'}
                    </h3>

                    {shippingOptions.map((option, index) => (
                        <Card
                            key={index}
                            className={cn(
                                "cursor-pointer transition-colors hover:border-primary",
                                selectedShipping?.courierCode === option.courierCode &&
                                selectedShipping?.courierService === option.courierService &&
                                "border-primary bg-primary/5"
                            )}
                            onClick={() => onSelectShipping(option)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <Package className="w-4 h-4 text-primary" />
                                            <span className="font-semibold">
                        {option.courierName} - {option.description}
                      </span>
                                        </div>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                <span>{option.estimatedDays} {locale === 'id' ? 'hari' : 'days'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-1 text-lg font-bold">
                                            <DollarSign className="w-4 h-4" />
                                            {formatCurrency(option.price, shippingType === 'DOMESTIC' ? 'IDR' : 'USD')}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
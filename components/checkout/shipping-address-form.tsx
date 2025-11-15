// components/checkout/shipping-address-form.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Define a type for the form data
interface ShippingAddressData {
    recipientName: string;
    recipientPhone: string;
    shippingAddress: string;
    shippingCity: string;
    shippingProvince: string;
    shippingCountry: string;
    shippingPostalCode: string;
    shippingNotes: string;
}

interface ShippingAddressFormProps {
    shippingType: 'DOMESTIC' | 'INTERNATIONAL';
    locale?: 'id' | 'en';
    // Replace 'any' with the proper type
    onDataChange: (data: ShippingAddressData) => void;
}

export function ShippingAddressForm({
                                        shippingType,
                                        locale = 'en',
                                        onDataChange
                                    }: ShippingAddressFormProps) {
    // Use the defined type for the form state
    const [formData, setFormData] = useState<ShippingAddressData>({
        recipientName: '',
        recipientPhone: '',
        shippingAddress: '',
        shippingCity: '',
        shippingProvince: '',
        shippingCountry: shippingType === 'DOMESTIC' ? 'Indonesia' : '',
        shippingPostalCode: '',
        shippingNotes: '',
    });

    const handleChange = (field: keyof ShippingAddressData, value: string) => {
        const newData = { ...formData, [field]: value };
        setFormData(newData);
        onDataChange(newData);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold mb-2">
                    {locale === 'id' ? 'Alamat Pengiriman' : 'Shipping Address'}
                </h2>
                <p className="text-sm text-muted-foreground">
                    {locale === 'id'
                        ? 'Masukkan detail alamat pengiriman Anda'
                        : 'Enter your shipping address details'
                    }
                </p>
            </div>

            <Card>
                <CardContent className="pt-6 space-y-4">
                    {/* Recipient Name */}
                    <div className="space-y-2">
                        <Label htmlFor="recipientName">
                            {locale === 'id' ? 'Nama Penerima' : 'Recipient Name'} *
                        </Label>
                        <Input
                            id="recipientName"
                            placeholder={locale === 'id' ? 'Nama lengkap' : 'Full name'}
                            value={formData.recipientName}
                            onChange={(e) => handleChange('recipientName', e.target.value)}
                            required
                        />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <Label htmlFor="recipientPhone">
                            {locale === 'id' ? 'Nomor Telepon' : 'Phone Number'} *
                        </Label>
                        <Input
                            id="recipientPhone"
                            type="tel"
                            placeholder="+62 812 3456 7890"
                            value={formData.recipientPhone}
                            onChange={(e) => handleChange('recipientPhone', e.target.value)}
                            required
                        />
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                        <Label htmlFor="shippingAddress">
                            {locale === 'id' ? 'Alamat Lengkap' : 'Full Address'} *
                        </Label>
                        <Textarea
                            id="shippingAddress"
                            placeholder={locale === 'id' ? 'Jl. Contoh No. 123, RT/RW 01/02' : 'Street address, apartment, etc.'}
                            value={formData.shippingAddress}
                            onChange={(e) => handleChange('shippingAddress', e.target.value)}
                            rows={3}
                            required
                        />
                    </div>

                    {/* City */}
                    <div className="space-y-2">
                        <Label htmlFor="shippingCity">
                            {locale === 'id' ? 'Kota/Kabupaten' : 'City'} *
                        </Label>
                        <Input
                            id="shippingCity"
                            placeholder={locale === 'id' ? 'Jakarta' : 'City name'}
                            value={formData.shippingCity}
                            onChange={(e) => handleChange('shippingCity', e.target.value)}
                            required
                        />
                    </div>

                    {/* Province (Domestic only) */}
                    {shippingType === 'DOMESTIC' && (
                        <div className="space-y-2">
                            <Label htmlFor="shippingProvince">
                                {locale === 'id' ? 'Provinsi' : 'Province'} *
                            </Label>
                            <Input
                                id="shippingProvince"
                                placeholder={locale === 'id' ? 'DKI Jakarta' : 'Province name'}
                                value={formData.shippingProvince}
                                onChange={(e) => handleChange('shippingProvince', e.target.value)}
                                required
                            />
                        </div>
                    )}

                    {/* Postal Code */}
                    <div className="space-y-2">
                        <Label htmlFor="shippingPostalCode">
                            {locale === 'id' ? 'Kode Pos' : 'Postal Code'} *
                        </Label>
                        <Input
                            id="shippingPostalCode"
                            placeholder="12345"
                            value={formData.shippingPostalCode}
                            onChange={(e) => handleChange('shippingPostalCode', e.target.value)}
                            required
                        />
                    </div>

                    {/* Country (International only) */}
                    {shippingType === 'INTERNATIONAL' && (
                        <div className="space-y-2">
                            <Label htmlFor="shippingCountry">
                                {locale === 'id' ? 'Negara' : 'Country'} *
                            </Label>
                            <Input
                                id="shippingCountry"
                                placeholder={locale === 'id' ? 'Nama negara' : 'Country name'}
                                value={formData.shippingCountry}
                                onChange={(e) => handleChange('shippingCountry', e.target.value)}
                                required
                            />
                        </div>
                    )}

                    {/* Notes (Optional) */}
                    <div className="space-y-2">
                        <Label htmlFor="shippingNotes">
                            {locale === 'id' ? 'Catatan (Opsional)' : 'Notes (Optional)'}
                        </Label>
                        <Textarea
                            id="shippingNotes"
                            placeholder={locale === 'id' ? 'Catatan untuk kurir...' : 'Notes for courier...'}
                            value={formData.shippingNotes}
                            onChange={(e) => handleChange('shippingNotes', e.target.value)}
                            rows={2}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
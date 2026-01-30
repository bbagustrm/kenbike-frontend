// components/checkout/shipping-address-form.tsx
"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LocationForm, LocationData } from "@/components/forms/location-form";
import { ShippingAddressData } from "@/types/shipping";
import { useEffect, useState } from "react";
import { isIndonesia, type CountryCode } from "@/lib/countries";

interface ShippingAddressFormProps {
    value: ShippingAddressData;
    onChange: (data: ShippingAddressData) => void;
    disabled?: boolean;
}

export function ShippingAddressForm({
                                        value,
                                        onChange,
                                        disabled = false,
                                    }: ShippingAddressFormProps) {
    // Convert ShippingAddressData to LocationData format
    // Country is now stored as 2-char ISO code (ID, US, GB, etc.)
    const [locationData, setLocationData] = useState<LocationData>(() => {
        // Determine country code from value
        // If country is "ID" or has province (Indonesian format), it's domestic
        const countryCode = (value.country || "ID") as CountryCode;

        return {
            country: countryCode,
            province: value.province,
            city: value.city,
            district: value.district,
            postal_code: value.postalCode,
            address: value.address,
        };
    });

    // Update parent when location changes
    useEffect(() => {
        onChange({
            ...value,
            address: locationData.address || value.address,
            city: locationData.city || "",
            province: locationData.province,
            country: locationData.country, // Already a 2-char ISO code
            postalCode: locationData.postal_code || "",
            district: locationData.district,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [locationData]);

    return (
        <div className="space-y-4">
            {/* Recipient Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="recipientName">
                        Recipient Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="recipientName"
                        placeholder="John Doe"
                        value={value.recipientName}
                        onChange={(e) => onChange({ ...value, recipientName: e.target.value })}
                        disabled={disabled}
                        required
                        className="transition-all duration-200 focus:ring-2 focus:ring-secondary focus:shadow-lg focus:shadow-secondary/20"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="recipientPhone">
                        Phone Number <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="recipientPhone"
                        type="tel"
                        placeholder="+62 812 3456 7890"
                        value={value.recipientPhone}
                        onChange={(e) => onChange({ ...value, recipientPhone: e.target.value })}
                        disabled={disabled}
                        required
                        className="transition-all duration-200 focus:ring-2 focus:ring-secondary focus:shadow-lg focus:shadow-secondary/20"
                    />
                </div>
            </div>

            {/* Location Information */}
            <div className="space-y-2">
                <Label>Location <span className="text-destructive">*</span></Label>
                <LocationForm
                    value={locationData}
                    onChange={setLocationData}
                    disabled={disabled}
                    required
                />
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                    id="notes"
                    placeholder="E.g., leave package at front door, call upon arrival, etc."
                    value={value.notes}
                    onChange={(e) => onChange({ ...value, notes: e.target.value })}
                    disabled={disabled}
                    rows={3}
                    className="transition-all duration-200 focus:ring-2 focus:ring-secondary focus:shadow-lg focus:shadow-secondary/20"
                />
            </div>
        </div>
    );
}
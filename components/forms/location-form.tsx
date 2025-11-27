// components/location-form.tsx - FINAL WITH OPTIONAL COUNTRY
"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface LocationFormProps {
    value: LocationData;
    onChange: (data: LocationData) => void;
    disabled?: boolean;
    required?: boolean;
}

export interface LocationData {
    country?: string; // ISO 2-letter code (e.g., "ID", "US", "SG") - OPTIONAL
    // For Indonesia (ID)
    province?: string;
    city?: string;
    district?: string;
    postal_code?: string;
    // For all countries
    address?: string;
}

interface KodePosArea {
    code: number;
    village: string;
    district: string;
    regency: string;
    province: string;
    latitude?: number;
    longitude?: number;
    elevation?: number;
    timezone?: string;
}

// Country list with ISO codes - grouped by shipping zones
const COUNTRIES = [
    // Indonesia (special handling)
    { code: "ID", name: "Indonesia" },

    // Zone 1 - Southeast Asia
    { code: "SG", name: "Singapore" },
    { code: "MY", name: "Malaysia" },
    { code: "TH", name: "Thailand" },
    { code: "PH", name: "Philippines" },
    { code: "VN", name: "Vietnam" },
    { code: "BN", name: "Brunei" },
    { code: "KH", name: "Cambodia" },
    { code: "LA", name: "Laos" },
    { code: "MM", name: "Myanmar" },
    { code: "TL", name: "Timor-Leste" },

    // Zone 2 - East Asia
    { code: "CN", name: "China" },
    { code: "HK", name: "Hong Kong" },
    { code: "TW", name: "Taiwan" },
    { code: "KR", name: "South Korea" },
    { code: "JP", name: "Japan" },
    { code: "MO", name: "Macau" },

    // Zone 3 - South Asia & Middle East
    { code: "IN", name: "India" },
    { code: "PK", name: "Pakistan" },
    { code: "BD", name: "Bangladesh" },
    { code: "LK", name: "Sri Lanka" },
    { code: "NP", name: "Nepal" },
    { code: "BT", name: "Bhutan" },
    { code: "MV", name: "Maldives" },
    { code: "AE", name: "United Arab Emirates" },
    { code: "SA", name: "Saudi Arabia" },
    { code: "KW", name: "Kuwait" },
    { code: "QA", name: "Qatar" },
    { code: "BH", name: "Bahrain" },
    { code: "OM", name: "Oman" },
    { code: "JO", name: "Jordan" },
    { code: "IL", name: "Israel" },
    { code: "LB", name: "Lebanon" },

    // Zone 4 - Oceania
    { code: "AU", name: "Australia" },
    { code: "NZ", name: "New Zealand" },
    { code: "PG", name: "Papua New Guinea" },
    { code: "FJ", name: "Fiji" },
    { code: "NC", name: "New Caledonia" },
    { code: "PF", name: "French Polynesia" },
    { code: "WS", name: "Samoa" },
    { code: "TO", name: "Tonga" },
    { code: "VU", name: "Vanuatu" },

    // Zone 5 - Europe
    { code: "GB", name: "United Kingdom" },
    { code: "FR", name: "France" },
    { code: "DE", name: "Germany" },
    { code: "IT", name: "Italy" },
    { code: "ES", name: "Spain" },
    { code: "NL", name: "Netherlands" },
    { code: "BE", name: "Belgium" },
    { code: "CH", name: "Switzerland" },
    { code: "AT", name: "Austria" },
    { code: "SE", name: "Sweden" },
    { code: "NO", name: "Norway" },
    { code: "DK", name: "Denmark" },
    { code: "FI", name: "Finland" },
    { code: "PL", name: "Poland" },
    { code: "CZ", name: "Czech Republic" },
    { code: "PT", name: "Portugal" },
    { code: "GR", name: "Greece" },
    { code: "IE", name: "Ireland" },
    { code: "RO", name: "Romania" },
    { code: "HU", name: "Hungary" },

    // Zone 6 - Americas
    { code: "US", name: "United States" },
    { code: "CA", name: "Canada" },
    { code: "MX", name: "Mexico" },
    { code: "BR", name: "Brazil" },
    { code: "AR", name: "Argentina" },
    { code: "CL", name: "Chile" },
    { code: "CO", name: "Colombia" },
    { code: "PE", name: "Peru" },
    { code: "VE", name: "Venezuela" },
    { code: "CR", name: "Costa Rica" },
    { code: "PA", name: "Panama" },

    // Zone 7 - Africa
    { code: "ZA", name: "South Africa" },
    { code: "EG", name: "Egypt" },
    { code: "NG", name: "Nigeria" },
    { code: "KE", name: "Kenya" },
    { code: "MA", name: "Morocco" },
    { code: "GH", name: "Ghana" },
    { code: "TZ", name: "Tanzania" },
    { code: "UG", name: "Uganda" },
    { code: "ET", name: "Ethiopia" },
    { code: "DZ", name: "Algeria" },
];

// 34 Provinsi Indonesia
const INDONESIA_PROVINCES = [
    "Aceh",
    "Bali",
    "Banten",
    "Bengkulu",
    "DI Yogyakarta",
    "DKI Jakarta",
    "Gorontalo",
    "Jambi",
    "Jawa Barat",
    "Jawa Tengah",
    "Jawa Timur",
    "Kalimantan Barat",
    "Kalimantan Selatan",
    "Kalimantan Tengah",
    "Kalimantan Timur",
    "Kalimantan Utara",
    "Kepulauan Bangka Belitung",
    "Kepulauan Riau",
    "Lampung",
    "Maluku",
    "Maluku Utara",
    "Nusa Tenggara Barat",
    "Nusa Tenggara Timur",
    "Papua",
    "Papua Barat",
    "Papua Barat Daya",
    "Papua Pegunungan",
    "Papua Selatan",
    "Papua Tengah",
    "Riau",
    "Sulawesi Barat",
    "Sulawesi Selatan",
    "Sulawesi Tengah",
    "Sulawesi Tenggara",
    "Sulawesi Utara",
    "Sumatera Barat",
    "Sumatera Selatan",
    "Sumatera Utara",
];

export function LocationForm({ value, onChange, disabled, required }: LocationFormProps) {
    const [areas, setAreas] = useState<KodePosArea[]>([]);
    const [loadingAreas, setLoadingAreas] = useState(false);
    const [openAreaCombobox, setOpenAreaCombobox] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const isIndonesia = value.country === "ID";

    // Fetch areas when province is selected and user searches (Indonesia only)
    useEffect(() => {
        if (isIndonesia && value.province && searchQuery.length >= 3) {
            const timer = setTimeout(() => {
                fetchAreas(searchQuery, value.province!);
            }, 500);
            return () => clearTimeout(timer);
        } else {
            setAreas([]);
        }
    }, [searchQuery, value.province, isIndonesia]);

    const fetchAreas = async (query: string, province: string) => {
        setLoadingAreas(true);
        try {
            const response = await fetch(
                `https://kodepos.vercel.app/search/?q=${encodeURIComponent(query)}`
            );

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const result = await response.json();

            if (result.data && Array.isArray(result.data)) {
                const filteredAreas = result.data.filter(
                    (area: KodePosArea) =>
                        area.province.toLowerCase() === province.toLowerCase()
                );
                setAreas(filteredAreas);
            } else {
                setAreas([]);
            }
        } catch (error) {
            console.error("Error fetching areas:", error);
            toast.error("Failed to search location. Please try again.");
            setAreas([]);
        } finally {
            setLoadingAreas(false);
        }
    };

    const handleCountryChange = (countryCode: string) => {
        onChange({
            country: countryCode,
            // Reset all fields
            province: undefined,
            city: undefined,
            district: undefined,
            postal_code: undefined,
            address: undefined,
        });
        setSearchQuery("");
        setAreas([]);
    };

    const handleProvinceChange = (province: string) => {
        onChange({
            ...value,
            province,
            city: undefined,
            district: undefined,
            postal_code: undefined,
        });
        setSearchQuery("");
        setAreas([]);
    };

    const handleAreaSelect = (area: KodePosArea) => {
        onChange({
            ...value,
            province: area.province,
            city: area.regency,
            district: area.district,
            postal_code: area.code.toString(),
        });
        setSearchQuery("");
        setOpenAreaCombobox(false);
    };

    const selectedCountry = COUNTRIES.find(c => c.code === value.country);

    return (
        <div className="space-y-4">
            {/* Country Selection */}
            <div className="space-y-2">
                <Label htmlFor="country">
                    Country {required && <span className="text-red-500">*</span>}
                </Label>
                <Select
                    value={value.country || ''} // Handle undefined
                    onValueChange={handleCountryChange}
                    disabled={disabled}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                        {COUNTRIES.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                                {country.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {selectedCountry && (
                    <p className="text-xs text-muted-foreground">
                        Selected: {selectedCountry.name} ({value.country})
                    </p>
                )}
            </div>

            {/* Indonesia Form */}
            {isIndonesia && (
                <>
                    {/* Province */}
                    <div className="space-y-2">
                        <Label htmlFor="province">
                            Province {required && <span className="text-red-500">*</span>}
                        </Label>
                        <Select
                            value={value.province || ''}
                            onValueChange={handleProvinceChange}
                            disabled={disabled}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select province" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                                {INDONESIA_PROVINCES.map((province) => (
                                    <SelectItem key={province} value={province}>
                                        {province}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* City, District & Postal Code Search */}
                    {value.province && (
                        <div className="space-y-2">
                            <Label>
                                City, District & Postal Code {required && <span className="text-red-500">*</span>}
                            </Label>
                            <Popover open={openAreaCombobox} onOpenChange={setOpenAreaCombobox}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openAreaCombobox}
                                        className="w-full justify-between text-left font-normal"
                                        disabled={disabled}
                                    >
                                        {value.city && value.district && value.postal_code ? (
                                            <span className="truncate">
                                                {value.district}, {value.city}, {value.province} - {value.postal_code}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground">Search city or district...</span>
                                        )}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                                    <Command shouldFilter={false}>
                                        <CommandInput
                                            placeholder={`Type city or district in ${value.province}...`}
                                            value={searchQuery}
                                            onValueChange={setSearchQuery}
                                        />
                                        <CommandList>
                                            <CommandEmpty>
                                                {loadingAreas ? (
                                                    <div className="flex items-center justify-center py-6">
                                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                        <span className="text-sm text-muted-foreground">Searching...</span>
                                                    </div>
                                                ) : searchQuery.length < 3 ? (
                                                    <div className="py-6 text-center text-sm text-muted-foreground">
                                                        Type at least 3 characters to search
                                                    </div>
                                                ) : (
                                                    <div className="py-6 text-center text-sm text-muted-foreground">
                                                        No results found. Try different keywords.
                                                    </div>
                                                )}
                                            </CommandEmpty>
                                            <CommandGroup className="max-h-[300px] overflow-auto">
                                                {areas.map((area, index) => (
                                                    <CommandItem
                                                        key={`${area.code}-${area.village}-${index}`}
                                                        value={`${area.village} ${area.district} ${area.regency}`}
                                                        onSelect={() => handleAreaSelect(area)}
                                                        className="flex flex-col items-start py-3"
                                                    >
                                                        <div className="flex items-center w-full">
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4 shrink-0",
                                                                    value.district === area.district &&
                                                                    value.postal_code === area.code.toString()
                                                                        ? "opacity-100"
                                                                        : "opacity-0"
                                                                )}
                                                            />
                                                            <div className="flex-1">
                                                                <div className="font-medium">
                                                                    {area.village}, {area.district}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {area.regency}, {area.province} • {area.code}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            <p className="text-xs text-muted-foreground">
                                Type city or district name (e.g., Semarang, Menteng, Denpasar)
                            </p>
                        </div>
                    )}

                    {/* Display selected location */}
                    {value.city && value.district && value.postal_code && (
                        <div className="rounded-lg border bg-muted/50 p-3 space-y-1">
                            <div className="text-sm font-medium">Selected Location:</div>
                            <div className="text-sm text-muted-foreground">
                                <div>District: <span className="font-medium text-foreground">{value.district}</span></div>
                                <div>City: <span className="font-medium text-foreground">{value.city}</span></div>
                                <div>Province: <span className="font-medium text-foreground">{value.province}</span></div>
                                <div>Postal Code: <span className="font-medium text-foreground">{value.postal_code}</span></div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* International Form (non-Indonesia) */}
            {value.country && !isIndonesia && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="province_international">State/Province</Label>
                            <Input
                                id="province_international"
                                value={value.province || ""}
                                onChange={(e) => onChange({ ...value, province: e.target.value })}
                                placeholder="e.g., California, Ontario"
                                disabled={disabled}
                                maxLength={100}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="city_international">City</Label>
                            <Input
                                id="city_international"
                                value={value.city || ""}
                                onChange={(e) => onChange({ ...value, city: e.target.value })}
                                placeholder="e.g., Los Angeles, Toronto"
                                disabled={disabled}
                                maxLength={100}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="postal_code_international">
                            Postal/ZIP Code {required && <span className="text-red-500">*</span>}
                        </Label>
                        <Input
                            id="postal_code_international"
                            value={value.postal_code || ""}
                            onChange={(e) => onChange({ ...value, postal_code: e.target.value })}
                            placeholder="e.g., 90001, M5H 2N2"
                            disabled={disabled}
                            maxLength={10}
                        />
                    </div>
                </>
            )}

            {/* Full Address (Common for all countries) */}
            <div className="space-y-2">
                <Label htmlFor="address">
                    Full Address {required && <span className="text-red-500">*</span>}
                </Label>
                <Input
                    id="address"
                    value={value.address || ""}
                    onChange={(e) => onChange({ ...value, address: e.target.value })}
                    placeholder="Street address, building number, floor, etc."
                    disabled={disabled}
                    maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                    Complete street address including building/house number
                </p>
            </div>
        </div>
    );
}
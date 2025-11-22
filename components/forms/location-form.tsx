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
    country: "Indonesia" | "Global";
    // For Indonesia
    province?: string;
    city?: string;
    district?: string;
    postal_code?: string;
    // For Global
    country_name?: string;
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

    // Fetch areas when province is selected and user searches
    useEffect(() => {
        if (value.country === "Indonesia" && value.province && searchQuery.length >= 3) {
            const timer = setTimeout(() => {
                fetchAreas(searchQuery, value.province!);
            }, 500);
            return () => clearTimeout(timer);
        } else {
            setAreas([]);
        }
    }, [searchQuery, value.province, value.country]);

    const fetchAreas = async (query: string, province: string) => {
        setLoadingAreas(true);
        try {
            // Search by city or district name
            const response = await fetch(
                `https://kodepos.vercel.app/search/?q=${encodeURIComponent(query)}`
            );

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const result = await response.json();

            // API returns { statusCode, code, data }
            if (result.data && Array.isArray(result.data)) {
                // Filter results to only show areas from selected province
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

    const handleCountryChange = (country: "Indonesia" | "Global") => {
        onChange({
            country,
            // Reset all fields
            province: undefined,
            city: undefined,
            district: undefined,
            postal_code: undefined,
            country_name: undefined,
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

    return (
        <div className="space-y-4">
            {/* Country Selection */}
            <div className="space-y-2">
                <Label htmlFor="country">
                    Country {required && <span className="text-red-500">*</span>}
                </Label>
                <Select
                    value={value.country}
                    onValueChange={handleCountryChange}
                    disabled={disabled}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Indonesia">Indonesia</SelectItem>
                        <SelectItem value="Global">Global (Other Countries)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Indonesia Form */}
            {value.country === "Indonesia" && (
                <>
                    {/* Province */}
                    <div className="space-y-2">
                        <Label htmlFor="province">
                            Province {required && <span className="text-red-500">*</span>}
                        </Label>
                        <Select
                            value={value.province}
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

            {/* Global Form */}
            {value.country === "Global" && (
                <>
                    <div className="space-y-2">
                        <Label htmlFor="country_name">
                            Country Name {required && <span className="text-red-500">*</span>}
                        </Label>
                        <Input
                            id="country_name"
                            value={value.country_name || ""}
                            onChange={(e) => onChange({ ...value, country_name: e.target.value })}
                            placeholder="e.g., United States"
                            disabled={disabled}
                            maxLength={50}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="province_global">State/Province</Label>
                            <Input
                                id="province_global"
                                value={value.province || ""}
                                onChange={(e) => onChange({ ...value, province: e.target.value })}
                                placeholder="e.g., California"
                                disabled={disabled}
                                maxLength={100}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="city_global">City</Label>
                            <Input
                                id="city_global"
                                value={value.city || ""}
                                onChange={(e) => onChange({ ...value, city: e.target.value })}
                                placeholder="e.g., Los Angeles"
                                disabled={disabled}
                                maxLength={100}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="postal_code_global">Postal/ZIP Code</Label>
                        <Input
                            id="postal_code_global"
                            value={value.postal_code || ""}
                            onChange={(e) => onChange({ ...value, postal_code: e.target.value })}
                            placeholder="e.g., 90001"
                            disabled={disabled}
                            maxLength={10}
                        />
                    </div>
                </>
            )}

            {/* Full Address (Common for both) */}
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
            </div>
        </div>
    );
}
// components/forms/location-form.tsx
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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown} from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationFormProps {
    value: LocationData;
    onChange: (data: LocationData) => void;
    disabled?: boolean;
    required?: boolean;
}

export interface LocationData {
    country: "Indonesia" | "Global";
    // For Indonesia
    province_id?: string;
    province_name?: string;
    city_id?: string; // Tidak lagi digunakan, bisa dihapus jika mau
    city_name?: string;
    district_name?: string;
    postal_code?: string;
    // For Global
    city?: string;
    province?: string;
    country_name?: string;
    address?: string;
}

// Array statis provinsi tetap digunakan
const PROVINCES = [
    { id: "aceh-darussalam", name: "Aceh Darussalam" },
    { id: "sumatera-utara", name: "Sumatera Utara" },
    { id: "sumatera-barat", name: "Sumatera Barat" },
    { id: "riau", name: "Riau" },
    { id: "kepulauan-riau", name: "Kepulauan Riau" },
    { id: "jambi", name: "Jambi" },
    { id: "bengkulu", name: "Bengkulu" },
    { id: "sumatera-selatan", name: "Sumatera Selatan" },
    { id: "lampung", name: "Lampung" },
    { id: "bangka-belitung", name: "Kepulauan Bangka Belitung" },
    { id: "dki-jakarta", name: "DKI Jakarta" },
    { id: "jawa-barat", name: "Jawa Barat" },
    { id: "banten", name: "Banten" },
    { id: "jawa-tengah", name: "Jawa Tengah" },
    { id: "di-yogyakarta", name: "DI Yogyakarta" },
    { id: "jawa-timur", name: "Jawa Timur" },
    { id: "bali", name: "Bali" },
    { id: "nusa-tenggara-barat", name: "Nusa Tenggara Barat" },
    { id: "nusa-tenggara-timur", name: "Nusa Tenggara Timur" },
    { id: "kalimantan-barat", name: "Kalimantan Barat" },
    { id: "kalimantan-tengah", name: "Kalimantan Tengah" },
    { id: "kalimantan-selatan", name: "Kalimantan Selatan" },
    { id: "kalimantan-timur", name: "Kalimantan Timur" },
    { id: "kalimantan-utara", name: "Kalimantan Utara" },
    { id: "sulawesi-utara", name: "Sulawesi Utara" },
    { id: "gorontalo", name: "Gorontalo" },
    { id: "sulawesi-tengah", name: "Sulawesi Tengah" },
    { id: "sulawesi-barat", name: "Sulawesi Barat" },
    { id: "sulawesi-selatan", name: "Sulawesi Selatan" },
    { id: "sulawesi-tenggara", name: "Sulawesi Tenggara" },
    { id: "maluku", name: "Maluku" },
    { id: "maluku-utara", name: "Maluku Utara" },
    { id: "papua-barat", name: "Papua Barat" },
    { id: "papua", name: "Papua" },
    { id: "papua-selatan", name: "Papua Selatan" },
    { id: "papua-tengah", name: "Papua Tengah" },
    { id: "papua-pegunungan", name: "Papua Pegunungan" },
];

interface Province {
    id: string;
    name: string;
}


interface BiteshipArea {
    id: string;
    name: string;
    administrative_division_level_1_name: string;
    administrative_division_level_2_name: string;
    administrative_division_level_3_name: string;
    postal_code: number;
}

export function LocationForm({ value, onChange, disabled, required }: LocationFormProps) {
    const [provinces] = useState<Province[]>(PROVINCES);

    const [areas, setAreas] = useState<BiteshipArea[]>([]);
    const [loadingAreas, setLoadingAreas] = useState(false);
    const [openAreaCombobox, setOpenAreaCombobox] = useState(false);
    const [areaSearchQuery, setAreaSearchQuery] = useState("");

    useEffect(() => {
        if (!value.province_name || !areaSearchQuery || areaSearchQuery.length < 3) {
            setAreas([]);
            return;
        }

        const provinceName = value.province_name;
        const query = areaSearchQuery;

        const timer = setTimeout(() => {
            searchAreas(query, provinceName);
        }, 500); // Debounce 500ms

        return () => clearTimeout(timer);
    }, [areaSearchQuery, value.province_name]);

    const searchAreas = async (query: string, provinceName: string) => {
        setLoadingAreas(true);
        try {
            const biteshipApiKey = process.env.NEXT_PUBLIC_BITESHIP_API_KEY;
            const fullQuery = `${query}, ${provinceName}`;
            const response = await fetch(
                `https://api.biteship.com/v1/maps/areas?countries=ID&input=${encodeURIComponent(fullQuery)}&type=single`,
                {
                    headers: {
                        Authorization: biteshipApiKey || "",
                    },
                }
            );
            const data = await response.json();
            if (data.success && data.areas) {
                const filteredAreas = data.areas.filter(
                    (area: BiteshipArea) => area.administrative_division_level_1_name === provinceName
                );
                setAreas(filteredAreas);
            }
        } catch (error) {
            console.error("Error searching areas:", error);
        } finally {
            setLoadingAreas(false);
        }
    };

    const handleCountryChange = (country: "Indonesia" | "Global") => {
        onChange({
            country,
            province_id: undefined,
            province_name: undefined,
            city_id: undefined,
            city_name: undefined,
            district_name: undefined,
            postal_code: undefined,
            city: undefined,
            province: undefined,
            country_name: undefined,
            address: undefined,
        });
        setAreaSearchQuery("");
    };

    const handleProvinceSelect = (province: Province) => {
        onChange({
            ...value,
            province_id: province.id,
            province_name: province.name,
            city_id: undefined,
            city_name: undefined,
            district_name: undefined,
            postal_code: undefined,
        });
        // Reset query pencarian saat provinsi berubah
        setAreaSearchQuery("");
    };

    // --- PERUBAHAN: handleCitySelect dihapus, diganti handleAreaSelect ---
    const handleAreaSelect = (area: BiteshipArea) => {
        onChange({
            ...value,
            city_name: area.administrative_division_level_2_name,
            district_name: area.administrative_division_level_3_name,
            postal_code: area.postal_code.toString(),
        });
        setAreaSearchQuery(area.name); // Tampilkan nama area lengkap di input
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
                        <Label>
                            Province {required && <span className="text-red-500">*</span>}
                        </Label>
                        <Popover open={openAreaCombobox} onOpenChange={setOpenAreaCombobox}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openAreaCombobox}
                                    className="w-full justify-between"
                                    disabled={disabled}
                                >
                                    {value.province_name ? (
                                        value.province_name
                                    ) : (
                                        "Select province..."
                                    )}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <Command>
                                    <CommandInput placeholder="Search province..." />
                                    <CommandEmpty>No province found.</CommandEmpty>
                                    <CommandGroup className="max-h-64 overflow-auto">
                                        {provinces.map((province) => (
                                            <CommandItem
                                                key={province.id}
                                                value={province.name}
                                                onSelect={() => handleProvinceSelect(province)}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        value.province_id === province.id ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {province.name}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* --- PERUBAHAN: Ganti bagian City dan District dengan satu bagian Pencarian Area --- */}
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
                                    disabled={disabled || !value.province_name}
                                >
                                    {value.city_name && value.district_name && value.postal_code ? (
                                        `${value.city_name}, ${value.district_name}, ${value.postal_code}`
                                    ) : (
                                        "Search for city or district..."
                                    )}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <Command shouldFilter={false}>
                                    <CommandInput
                                        placeholder="Type city name (e.g., Bandung)..."
                                        value={areaSearchQuery}
                                        onValueChange={setAreaSearchQuery}
                                    />
                                    <CommandEmpty>
                                        {loadingAreas ? "Searching..." : "No results found. Try typing at least 3 characters."}
                                    </CommandEmpty>
                                    <CommandGroup className="max-h-64 overflow-auto">
                                        {areas.map((area) => (
                                            <CommandItem
                                                key={area.id}
                                                value={area.name}
                                                onSelect={() => handleAreaSelect(area)}
                                            >
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {area.administrative_division_level_3_name}, {area.administrative_division_level_2_name}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {area.postal_code}
                                                    </span>
                                                </div>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        <p className="text-xs text-muted-foreground">
                            Start typing to search for a city or district within {value.province_name || 'the selected province'}.
                        </p>
                    </div>
                </>
            )}

            {/* Global Form - Tidak berubah */}
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

                    <div className="space-y-2">
                        <Label htmlFor="province">State/Province</Label>
                        <Input
                            id="province"
                            value={value.province || ""}
                            onChange={(e) => onChange({ ...value, province: e.target.value })}
                            placeholder="e.g., California"
                            disabled={disabled}
                            maxLength={100}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                            id="city"
                            value={value.city || ""}
                            onChange={(e) => onChange({ ...value, city: e.target.value })}
                            placeholder="e.g., Los Angeles"
                            disabled={disabled}
                            maxLength={100}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="postal_code">Postal/ZIP Code</Label>
                        <Input
                            id="postal_code"
                            value={value.postal_code || ""}
                            onChange={(e) => onChange({ ...value, postal_code: e.target.value })}
                            placeholder="e.g., 90001"
                            disabled={disabled}
                            maxLength={10}
                        />
                    </div>
                </>
            )}

            {/* Full Address (Common for both) - Tidak berubah */}
            <div className="space-y-2">
                <Label htmlFor="address">
                    Full Address {required && <span className="text-red-500">*</span>}
                </Label>
                <Input
                    id="address"
                    value={value.address || ""}
                    onChange={(e) => onChange({ ...value, address: e.target.value })}
                    placeholder="Street address, building, floor, etc."
                    disabled={disabled}
                    maxLength={500}
                />
            </div>
        </div>
    );
}
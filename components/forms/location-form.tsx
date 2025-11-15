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

interface BiteshipArea {
    id: string;
    name: string;
    administrative_division_level_1_name: string;
    administrative_division_level_2_name: string;
    administrative_division_level_3_name: string;
    postal_code: number;
}

// 34 Provinsi Indonesia (Updated 2024)
const INDONESIA_PROVINCES = [
    "Aceh",
    "Sumatera Utara",
    "Sumatera Barat",
    "Riau",
    "Kepulauan Riau",
    "Jambi",
    "Sumatera Selatan",
    "Kepulauan Bangka Belitung",
    "Bengkulu",
    "Lampung",
    "DKI Jakarta",
    "Banten",
    "Jawa Barat",
    "Jawa Tengah",
    "DI Yogyakarta",
    "Jawa Timur",
    "Bali",
    "Nusa Tenggara Barat",
    "Nusa Tenggara Timur",
    "Kalimantan Barat",
    "Kalimantan Tengah",
    "Kalimantan Selatan",
    "Kalimantan Timur",
    "Kalimantan Utara",
    "Sulawesi Utara",
    "Gorontalo",
    "Sulawesi Tengah",
    "Sulawesi Barat",
    "Sulawesi Selatan",
    "Sulawesi Tenggara",
    "Maluku",
    "Maluku Utara",
    "Papua",
    "Papua Barat",
];

export function LocationForm({ value, onChange, disabled, required }: LocationFormProps) {
    const [biteshipAreas, setBiteshipAreas] = useState<BiteshipArea[]>([]);
    const [loadingAreas, setLoadingAreas] = useState(false);
    const [openAreaCombobox, setOpenAreaCombobox] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch Biteship areas when province is selected and user searches
    useEffect(() => {
        if (value.country === "Indonesia" && value.province && searchQuery.length >= 3) {
            const timer = setTimeout(() => {
                fetchBiteshipAreas(searchQuery, value.province!);
            }, 500);
            return () => clearTimeout(timer);
        } else {
            setBiteshipAreas([]);
        }
    }, [searchQuery, value.province, value.country]);

    const fetchBiteshipAreas = async (query: string, province: string) => {
        setLoadingAreas(true);
        try {
            const biteshipApiKey = process.env.BITESHIP_API_KEY;

            if (!biteshipApiKey) {
                console.error("Biteship API key is not configured");
                toast.error("Location search is not configured. Please contact administrator.");
                return;
            }

            // Search with province + query for more accurate results
            const searchInput = `${query}, ${province}`;

            const response = await fetch(
                `https://api.biteship.com/v1/maps/areas?countries=ID&input=${encodeURIComponent(searchInput)}&type=single`,
                {
                    headers: {
                        "Authorization": biteshipApiKey,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Invalid API key. Please check your Biteship configuration.");
                }
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();

            if (data.success && data.areas) {
                // Filter results to only show areas from selected province
                const filteredAreas = data.areas.filter(
                    (area: BiteshipArea) =>
                        area.administrative_division_level_1_name.toLowerCase() === province.toLowerCase()
                );
                setBiteshipAreas(filteredAreas);
            }
        } catch (error) {
            console.error("Error fetching Biteship areas:", error);
            if (error instanceof Error) {
                toast.error(error.message);
            }
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
        setBiteshipAreas([]);
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
        setBiteshipAreas([]);
    };

    const handleAreaSelect = (area: BiteshipArea) => {
        onChange({
            ...value,
            province: area.administrative_division_level_1_name,
            city: area.administrative_division_level_2_name,
            district: area.administrative_division_level_3_name,
            postal_code: area.postal_code.toString(),
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
                                                {biteshipAreas.map((area) => (
                                                    <CommandItem
                                                        key={area.id}
                                                        value={area.name}
                                                        onSelect={() => handleAreaSelect(area)}
                                                        className="flex flex-col items-start py-3"
                                                    >
                                                        <div className="flex items-center w-full">
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4 shrink-0",
                                                                    value.district === area.administrative_division_level_3_name &&
                                                                    value.postal_code === area.postal_code.toString()
                                                                        ? "opacity-100"
                                                                        : "opacity-0"
                                                                )}
                                                            />
                                                            <div className="flex-1">
                                                                <div className="font-medium">
                                                                    {area.administrative_division_level_3_name}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {area.administrative_division_level_2_name}, {area.administrative_division_level_1_name} • {area.postal_code}
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
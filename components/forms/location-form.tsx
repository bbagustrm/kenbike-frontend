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
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
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
    city_id?: string;
    city_name?: string;
    district_name?: string;
    postal_code?: string;
    // For Global
    city?: string;
    province?: string;
    country_name?: string;
    address?: string;
}

interface Province {
    id: string;
    name: string;
}

interface City {
    id: string;
    id_provinsi: string;
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
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [biteshipAreas, setBiteshipAreas] = useState<BiteshipArea[]>([]);

    const [loadingProvinces, setLoadingProvinces] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);
    const [loadingAreas, setLoadingAreas] = useState(false);

    const [openProvinceCombobox, setOpenProvinceCombobox] = useState(false);
    const [openCityCombobox, setOpenCityCombobox] = useState(false);
    const [openAreaCombobox, setOpenAreaCombobox] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");

    // Fetch provinces when country is Indonesia
    useEffect(() => {
        if (value.country === "Indonesia" && provinces.length === 0) {
            fetchProvinces();
        }
    }, [provinces.length, value.country]);

    // Fetch cities when province changes
    useEffect(() => {
        if (value.country === "Indonesia" && value.province_id) {
            fetchCities(value.province_id);
        } else {
            setCities([]);
            setBiteshipAreas([]);
        }
    }, [value.country, value.province_id]);

    // Fetch Biteship areas when city changes
    useEffect(() => {
        if (value.country === "Indonesia" && value.city_name && searchQuery) {
            const timer = setTimeout(() => {
                fetchBiteshipAreas(searchQuery);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [searchQuery, value.city_name, value.country]);

    const fetchProvinces = async () => {
        setLoadingProvinces(true);
        try {
            const apiKey = process.env.NEXT_PUBLIC_BINDERBYTE_API_KEY;
            const response = await fetch(`https://api.binderbyte.com/wilayah/provinsi?api_key=${apiKey}`);
            const data = await response.json();
            if (data.value) {
                setProvinces(data.value);
            }
        } catch (error) {
            console.error("Error fetching provinces:", error);
        } finally {
            setLoadingProvinces(false);
        }
    };

    const fetchCities = async (provinceId: string) => {
        setLoadingCities(true);
        try {
            const response = await fetch(
                `https://api.binderbyte.com/wilayah/kabupaten?api_key=&id_provinsi=${provinceId}`
            );
            const data = await response.json();
            if (data.value) {
                setCities(data.value);
            }
        } catch (error) {
            console.error("Error fetching cities:", error);
        } finally {
            setLoadingCities(false);
        }
    };

    const fetchBiteshipAreas = async (query: string) => {
        if (!query || query.length < 3) return;

        setLoadingAreas(true);
        try {
            const biteshipApiKey = process.env.NEXT_PUBLIC_BITESHIP_API_KEY;
            const response = await fetch(
                `https://api.biteship.com/v1/maps/areas?countries=ID&input=${encodeURIComponent(query)}&type=single`,
                {
                    headers: {
                        Authorization: biteshipApiKey || "",
                    },
                }
            );
            const data = await response.json();
            if (data.success && data.areas) {
                setBiteshipAreas(data.areas);
            }
        } catch (error) {
            console.error("Error fetching Biteship areas:", error);
        } finally {
            setLoadingAreas(false);
        }
    };

    const handleCountryChange = (country: "Indonesia" | "Global") => {
        onChange({
            country,
            // Reset all fields
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
        setOpenProvinceCombobox(false);
    };

    const handleCitySelect = (city: City) => {
        onChange({
            ...value,
            city_id: city.id,
            city_name: city.name,
            district_name: undefined,
            postal_code: undefined,
        });
        setSearchQuery(city.name);
        setOpenCityCombobox(false);
    };

    const handleAreaSelect = (area: BiteshipArea) => {
        onChange({
            ...value,
            district_name: area.administrative_division_level_3_name,
            postal_code: area.postal_code.toString(),
        });
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
                        <Popover open={openProvinceCombobox} onOpenChange={setOpenProvinceCombobox}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openProvinceCombobox}
                                    className="w-full justify-between"
                                    disabled={disabled || loadingProvinces}
                                >
                                    {loadingProvinces ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading...</>
                                    ) : value.province_name ? (
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

                    {/* City */}
                    <div className="space-y-2">
                        <Label>
                            City/Regency {required && <span className="text-red-500">*</span>}
                        </Label>
                        <Popover open={openCityCombobox} onOpenChange={setOpenCityCombobox}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openCityCombobox}
                                    className="w-full justify-between"
                                    disabled={disabled || !value.province_id || loadingCities}
                                >
                                    {loadingCities ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading...</>
                                    ) : value.city_name ? (
                                        value.city_name
                                    ) : (
                                        "Select city..."
                                    )}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <Command>
                                    <CommandInput placeholder="Search city..." />
                                    <CommandEmpty>No city found.</CommandEmpty>
                                    <CommandGroup className="max-h-64 overflow-auto">
                                        {cities.map((city) => (
                                            <CommandItem
                                                key={city.id}
                                                value={city.name}
                                                onSelect={() => handleCitySelect(city)}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        value.city_id === city.id ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {city.name}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* District & Postal Code Search */}
                    <div className="space-y-2">
                        <Label>District & Postal Code</Label>
                        <Popover open={openAreaCombobox} onOpenChange={setOpenAreaCombobox}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openAreaCombobox}
                                    className="w-full justify-between text-left font-normal"
                                    disabled={disabled || !value.city_name}
                                >
                                    {value.district_name && value.postal_code ? (
                                        `${value.district_name}, ${value.postal_code}`
                                    ) : (
                                        "Search district..."
                                    )}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <Command shouldFilter={false}>
                                    <CommandInput
                                        placeholder="Type district name..."
                                        value={searchQuery}
                                        onValueChange={setSearchQuery}
                                    />
                                    <CommandEmpty>
                                        {loadingAreas ? "Searching..." : "No results found. Try typing more..."}
                                    </CommandEmpty>
                                    <CommandGroup className="max-h-64 overflow-auto">
                                        {biteshipAreas.map((area) => (
                                            <CommandItem
                                                key={area.id}
                                                value={area.name}
                                                onSelect={() => handleAreaSelect(area)}
                                            >
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {area.administrative_division_level_3_name}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {area.administrative_division_level_2_name}, {area.administrative_division_level_1_name} - {area.postal_code}
                                                    </span>
                                                </div>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        <p className="text-xs text-muted-foreground">
                            Start typing district name to search (e.g., Semarang Tengah)
                        </p>
                    </div>
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

            {/* Full Address (Common for both) */}
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
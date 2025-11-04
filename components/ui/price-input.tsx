"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

interface PriceInputProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    type: "IDR" | "USD";
}

export function PriceInput({
    label,
    value,
    onChange,
    placeholder,
    required = false,
    disabled = false,
    type,
}: PriceInputProps) {
    const [displayValue, setDisplayValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    // Format value when component mounts or value changes from parent
    useEffect(() => {
        // Only update display if not currently focused (to avoid overwriting user input)
        if (!isFocused) {
            if (type === "IDR") {
                setDisplayValue(value ? formatIDR(value) : "");
            } else {
                setDisplayValue(value ? formatUSD(value) : "");
            }
        }
    }, [value, type, isFocused]);

    // Format IDR with thousand separator
    const formatIDR = (num: number): string => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    // Parse IDR (remove dots)
    const parseIDR = (str: string): number => {
        return parseInt(str.replace(/\./g, ""), 10) || 0;
    };

    // Format USD as decimal
    const formatUSD = (cents: number): string => {
        return (cents / 100).toFixed(2);
    };

    // Parse USD (dollars to cents)
    const parseUSD = (str: string): number => {
        return Math.round(parseFloat(str) * 100) || 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;

        if (type === "IDR") {
            // Allow only numbers and dots
            const cleaned = inputValue.replace(/[^\d.]/g, "");

            // Remove leading zeros
            const withoutLeadingZeros = cleaned.replace(/^0+/, "") || "0";

            // Parse to number
            const numValue = parseIDR(withoutLeadingZeros);

            // Update display with formatting
            setDisplayValue(numValue ? formatIDR(numValue) : "");

            // Send number to parent
            onChange(numValue);
        } else {
            // USD: Allow numbers and single decimal point
            let cleaned = inputValue.replace(/[^\d.]/g, "");

            // Ensure only one decimal point
            const parts = cleaned.split(".");
            if (parts.length > 2) {
                cleaned = parts[0] + "." + parts.slice(1).join("");
            }

            // Limit to 2 decimal places ONLY if user has typed them
            if (parts.length === 2 && parts[1].length > 2) {
                cleaned = parts[0] + "." + parts[1].slice(0, 2);
            }

            // Update display (don't auto-format while typing)
            setDisplayValue(cleaned);

            // Send cents to parent (handle empty/partial input)
            const cents = parseUSD(cleaned);
            onChange(cents);
        }
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);

        // Format properly on blur
        if (type === "USD" && displayValue) {
            const cents = parseUSD(displayValue);
            setDisplayValue(formatUSD(cents));
        } else if (type === "IDR" && displayValue) {
            // Ensure IDR formatting is clean
            const num = parseIDR(displayValue);
            setDisplayValue(num ? formatIDR(num) : "");
        }
    };

    return (
        <div className="space-y-2">
            <Label htmlFor={`price-${type}`}>
                {label} {required && <span className="text-destructive">*</span>}
            </Label>
            <div className="relative">
                {type === "IDR" && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        Rp
                    </span>
                )}
                {type === "USD" && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                    </span>
                )}
                <Input
                    id={`price-${type}`}
                    type="text"
                    inputMode="decimal"
                    placeholder={placeholder}
                    value={displayValue}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    required={required}
                    disabled={disabled}
                    className="pl-10"
                />
            </div>
            <p className="text-xs text-muted-foreground">
                {type === "IDR"
                    ? "Enter amount in Rupiah (e.g., 25.000.000)"
                    : "Enter amount in USD (e.g., 17.50)"}
            </p>
        </div>
    );
}
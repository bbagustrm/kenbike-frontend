"use client";

import { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import { cn } from "@/lib/utils";

interface OtpInputProps {
    length?: number;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    autoFocus?: boolean;
    className?: string;
}

export function OtpInput({
                             length = 6,
                             value,
                             onChange,
                             disabled = false,
                             autoFocus = true,
                             className,
                         }: OtpInputProps) {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);

    // Split value into array
    const valueArray = value.split("").slice(0, length);
    while (valueArray.length < length) {
        valueArray.push("");
    }

    useEffect(() => {
        if (autoFocus && inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [autoFocus]);

    const focusInput = (index: number) => {
        const clampedIndex = Math.max(0, Math.min(index, length - 1));
        inputRefs.current[clampedIndex]?.focus();
        setActiveIndex(clampedIndex);
    };

    const handleChange = (index: number, char: string) => {
        if (!/^\d*$/.test(char)) return; // Only allow digits

        const newValue = valueArray.slice();
        newValue[index] = char.slice(-1); // Take only last character

        const joined = newValue.join("");
        onChange(joined);

        // Move to next input if character was entered
        if (char && index < length - 1) {
            focusInput(index + 1);
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            e.preventDefault();

            if (valueArray[index]) {
                // Clear current input
                const newValue = valueArray.slice();
                newValue[index] = "";
                onChange(newValue.join(""));
            } else if (index > 0) {
                // Move to previous and clear
                const newValue = valueArray.slice();
                newValue[index - 1] = "";
                onChange(newValue.join(""));
                focusInput(index - 1);
            }
        } else if (e.key === "ArrowLeft" && index > 0) {
            e.preventDefault();
            focusInput(index - 1);
        } else if (e.key === "ArrowRight" && index < length - 1) {
            e.preventDefault();
            focusInput(index + 1);
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);

        if (pastedData) {
            onChange(pastedData);
            // Focus last filled input or last input
            focusInput(Math.min(pastedData.length, length - 1));
        }
    };

    const handleFocus = (index: number) => {
        setActiveIndex(index);
        // Select content on focus
        inputRefs.current[index]?.select();
    };

    return (
        <div className={cn("flex gap-2 sm:gap-3 justify-center", className)}>
            {valueArray.map((char, index) => (
                <input
                    key={index}
                    ref={(el) => {
                        inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="\d*"
                    maxLength={1}
                    value={char}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    onFocus={() => handleFocus(index)}
                    disabled={disabled}
                    className={cn(
                        "w-11 h-13 sm:w-12 sm:h-14 text-center text-2xl font-bold",
                        "border rounded-lg bg-accent",
                        "transition-all duration-200",
                        "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        activeIndex === index && !disabled
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-input hover:border-muted-foreground/50",
                        char && "border-primary/50 bg-primary/5"
                    )}
                    aria-label={`Digit ${index + 1}`}
                />
            ))}
        </div>
    );
}
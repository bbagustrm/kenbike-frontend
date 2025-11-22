"use client";

import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface AnimatedInputProps {
    id: string;
    label: string;
    type?: string;
    placeholder?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    required?: boolean;
    autoComplete?: string;
}

export function AnimatedInput({
    id,
    label,
    type = "text",
    placeholder,
    value,
    onChange,
    disabled,
    required,
    autoComplete,
}: AnimatedInputProps) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="space-y-2">
            <motion.div
                animate={{
                    y: isFocused || value ? -2 : 0,
                }}
                transition={{ duration: 0.2 }}
            >
                <Label htmlFor={id}>{label}</Label>
            </motion.div>
            <motion.div
                animate={{
                    scale: isFocused ? 1.01 : 1,
                }}
                transition={{ duration: 0.2 }}
            >
                <Input
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    disabled={disabled}
                    required={required}
                    autoComplete={autoComplete}
                    className={`transition-all duration-200 ${
                        isFocused
                            ? "ring-2 ring-secondary shadow-lg shadow-secondary/20"
                            : ""
                    }`}
                />
            </motion.div>
        </div>
    );
}
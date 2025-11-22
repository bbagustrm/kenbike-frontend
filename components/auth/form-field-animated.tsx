"use client";

import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface FormFieldAnimatedProps {
    id: string;
    name: string;
    label: string;
    type?: string;
    placeholder?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    required?: boolean;
    autoComplete?: string;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    title?: string;
    isPassword?: boolean;
    showRequiredAsterisk?: boolean;
    helperText?: string;
    error?: string;
}

export function FormFieldAnimated({
    id,
    name,
    label,
    type = "text",
    placeholder,
    value,
    onChange,
    disabled,
    required,
    autoComplete,
    minLength,
    maxLength,
    pattern,
    title,
    isPassword = false,
    showRequiredAsterisk = false,
    helperText,
    error,
}: FormFieldAnimatedProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    const handleFocus = () => {
        setIsFocused(true);
        setHasInteracted(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    const showError = hasInteracted && error && !isFocused;
    const showSuccess = hasInteracted && !error && value && !isFocused;

    return (
        <motion.div
            className="space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Label */}
            <motion.div
                animate={{
                    y: isFocused || value ? -2 : 0,
                    scale: isFocused || value ? 1.02 : 1,
                }}
                transition={{ duration: 0.2, ease: "easeOut" }}
            >
                <Label
                    htmlFor={id}
                    className={`transition-colors duration-200 ${
                        isFocused
                            ? "text-primary font-semibold"
                            : showError
                                ? "text-destructive"
                                : showSuccess
                                    ? "text-green-600"
                                    : ""
                    }`}
                >
                    {label}
                    {showRequiredAsterisk && required && (
                        <span className="text-destructive ml-1">*</span>
                    )}
                </Label>
            </motion.div>

            {/* Input Field */}
            <motion.div
                animate={{
                    scale: isFocused ? 1.01 : 1,
                }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="relative"
            >
                {isPassword ? (
                    <PasswordInput
                        id={id}
                        name={name}
                        placeholder={placeholder}
                        value={value}
                        onChange={onChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        disabled={disabled}
                        required={required}
                        autoComplete={autoComplete}
                        minLength={minLength}
                        maxLength={maxLength}
                        className={`transition-all duration-200 ${
                            isFocused
                                ? "ring-2 ring-secondary shadow-lg shadow-secondary/20 border-secondary"
                                : showError
                                    ? "ring-2 ring-destructive border-destructive"
                                    : showSuccess
                                        ? "ring-2 ring-green-500 border-green-500"
                                        : ""
                        }`}
                    />
                ) : (
                    <Input
                        id={id}
                        name={name}
                        type={type}
                        placeholder={placeholder}
                        value={value}
                        onChange={onChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        disabled={disabled}
                        required={required}
                        autoComplete={autoComplete}
                        minLength={minLength}
                        maxLength={maxLength}
                        pattern={pattern}
                        title={title}
                        className={`transition-all duration-200 ${
                            isFocused
                                ? "ring-2 ring-secondary shadow-lg shadow-secondary/20 border-secondary"
                                : showError
                                    ? "ring-2 ring-destructive border-destructive"
                                    : showSuccess
                                        ? "ring-2 ring-green-500 border-green-500"
                                        : ""
                        }`}
                    />
                )}

                {/* Focus Indicator Line */}
                <motion.div
                    className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-secondary via-accent to-secondary"
                    initial={{ width: 0 }}
                    animate={{
                        width: isFocused ? "100%" : "0%",
                    }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                />
            </motion.div>

            {/* Helper Text or Error */}
            {(helperText || error) && (
                <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="min-h-[20px]"
                >
                    {showError ? (
                        <motion.p
                            className="text-xs text-destructive font-medium flex items-center gap-1"
                            initial={{ x: -5 }}
                            animate={{ x: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 30,
                            }}
                        >
                            <span className="inline-block">⚠️</span>
                            {error}
                        </motion.p>
                    ) : showSuccess ? (
                        <motion.p
                            className="text-xs text-green-600 font-medium flex items-center gap-1"
                            initial={{ x: -5 }}
                            animate={{ x: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 30,
                            }}
                        >
                            <span className="inline-block">✓</span>
                            Looks good!
                        </motion.p>
                    ) : helperText ? (
                        <p className="text-xs text-muted-foreground">{helperText}</p>
                    ) : null}
                </motion.div>
            )}
        </motion.div>
    );
}

// Variant dengan validasi real-time
interface ValidatedFormFieldProps extends FormFieldAnimatedProps {
    validation?: {
        pattern?: RegExp;
        minLength?: number;
        maxLength?: number;
        customValidation?: (value: string) => string | null;
    };
}

export function ValidatedFormField({
                                       validation,
                                       ...props
                                   }: ValidatedFormFieldProps) {
    const [error, setError] = useState<string>("");

    const handleValidation = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        props.onChange(e);

        // Clear error jika empty
        if (!value) {
            setError("");
            return;
        }

        // Check pattern
        if (validation?.pattern && !validation.pattern.test(value)) {
            setError("Invalid format");
            return;
        }

        // Check minLength
        if (validation?.minLength && value.length < validation.minLength) {
            setError(`Minimum ${validation.minLength} characters`);
            return;
        }

        // Check maxLength
        if (validation?.maxLength && value.length > validation.maxLength) {
            setError(`Maximum ${validation.maxLength} characters`);
            return;
        }

        // Custom validation
        if (validation?.customValidation) {
            const customError = validation.customValidation(value);
            if (customError) {
                setError(customError);
                return;
            }
        }

        // All good
        setError("");
    };

    return (
        <FormFieldAnimated
            {...props}
            onChange={handleValidation}
            error={error}
        />
    );
}
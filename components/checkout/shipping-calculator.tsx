// components/checkout/shipping-calculator.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { ShippingService } from "@/services/shipping.service";
import {
    SelectedShippingMethod,
    ShippingOption,
    CalculateShippingResponse,
} from "@/types/shipping";
import { Currency } from "@/types/payment";
import { ShippingOptionCard } from "./shipping-option-card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, RefreshCw, Package } from "lucide-react";
import { toast } from "sonner";
import { useDebouncedAsyncCallback } from "@/hooks/use-debounce";
import { ApiError } from "@/lib/api-client";
import { isIndonesia } from "@/lib/countries";

interface ShippingCalculatorProps {
    currency: Currency;
    onSelect: (method: SelectedShippingMethod | null) => void;
    selected: SelectedShippingMethod | null;
    disabled?: boolean;
}

const DEBOUNCE_DELAY = 500;

export function ShippingCalculator({
                                       currency,
                                       onSelect,
                                       selected,
                                       disabled = false,
                                   }: ShippingCalculatorProps) {
    const { user } = useAuth();
    const { cart, guestCartWithDetails } = useCart();

    const [options, setOptions] = useState<ShippingOption[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isWaitingDebounce, setIsWaitingDebounce] = useState(false);

    // Calculate total weight from cart
    const getTotalWeight = useCallback((): number => {
        if (cart) {
            return cart.items.reduce((sum, item) => sum + item.quantity * 1000, 0);
        }
        return guestCartWithDetails.reduce(
            (sum, item) => sum + item.quantity * 1000,
            0
        );
    }, [cart, guestCartWithDetails]);

    // Check if user address is complete
    const isAddressComplete = useCallback((): boolean => {
        if (!user) return false;

        const required = [
            user.country,
            user.city,
            user.postal_code,
            user.address,
        ];

        const isDomestic = isIndonesia(user.country || "");
        if (isDomestic) {
            required.push(user.province || "");
        }

        return required.every((field) => field && field.trim().length > 0);
    }, [user]);

    // Handle successful shipping calculation
    const handleShippingSuccess = useCallback(
        (response: CalculateShippingResponse) => {
            setOptions(response.options);
            setError(null);

            if (response.options.length === 0) {
                setError("No shipping options available for this destination");
                onSelect(null);
            } else {
                // Auto-select cheapest option if nothing selected
                if (!selected) {
                    const cheapest = ShippingService.getCheapestOption(response);
                    if (cheapest) {
                        onSelect({
                            type: response.shippingType,
                            option: cheapest,
                            cost: cheapest.cost,
                        });
                    }
                } else {
                    // Verify selected option still exists
                    const stillExists = ShippingService.getOptionById(
                        response,
                        selected.option.courier,
                        selected.option.service,
                        selected.option.zoneId
                    );

                    if (!stillExists) {
                        const cheapest = ShippingService.getCheapestOption(response);
                        if (cheapest) {
                            onSelect({
                                type: response.shippingType,
                                option: cheapest,
                                cost: cheapest.cost,
                            });
                            toast.info("Your selected shipping option was updated");
                        }
                    }
                }
            }
        },
        [onSelect, selected]
    );

    // Debounced shipping calculation
    const [debouncedCalculate, cancelCalculate, isCalculating] =
        useDebouncedAsyncCallback(
            async (signal: AbortSignal, skipCache: boolean = false) => {
                setIsWaitingDebounce(false);

                if (!isAddressComplete() || !user) {
                    setError("Please complete your shipping address");
                    setOptions([]);
                    onSelect(null);
                    return;
                }

                try {
                    const totalWeight = getTotalWeight();
                    const isDomestic = isIndonesia(user.country || "");
                    const countryCode = isDomestic ? "ID" : user.country;

                    const response = await ShippingService.calculateShippingWithSignal(
                        signal,
                        {
                            country: countryCode || "",
                            province: user.province,
                            city: user.city || "",
                            district: user.district,
                            postalCode: user.postal_code || "",
                            address: user.address || "",
                            totalWeight,
                        },
                        skipCache
                    );

                    handleShippingSuccess(response);
                } catch (err: unknown) {
                    const apiError = err as ApiError;

                    if (apiError?.isAborted) {
                        return;
                    }

                    console.error("Failed to calculate shipping:", err);
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Failed to calculate shipping rates"
                    );
                    setOptions([]);
                    onSelect(null);
                    toast.error("Failed to load shipping options");
                }
            },
            DEBOUNCE_DELAY
        );

    const debouncedCalculateRef = useRef(debouncedCalculate);
    const cancelCalculateRef = useRef(cancelCalculate);

    useEffect(() => {
        debouncedCalculateRef.current = debouncedCalculate;
        cancelCalculateRef.current = cancelCalculate;
    }, [debouncedCalculate, cancelCalculate]);

    // Auto-calculate when user address is available
    useEffect(() => {
        if (!isAddressComplete()) {
            setOptions([]);
            setError(null);
            setIsWaitingDebounce(false);
            cancelCalculateRef.current();
            return;
        }

        setIsWaitingDebounce(true);
        setError(null);
        debouncedCalculateRef.current(false);
    }, [user, cart, guestCartWithDetails, isAddressComplete]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cancelCalculateRef.current();
            ShippingService.cancelCalculation();
        };
    }, []);

    const handleSelect = (option: ShippingOption) => {
        onSelect({
            type: option.type,
            option,
            cost: option.cost,
        });
    };

    const handleRefresh = () => {
        setIsWaitingDebounce(false);
        debouncedCalculateRef.current(true);
    };

    const isLoading = isWaitingDebounce || isCalculating;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {isLoading ? (
                        "Calculating shipping rates..."
                    ) : options.length > 0 ? (
                        `${options.length} shipping ${
                            options.length === 1 ? "option" : "options"
                        } available`
                    ) : (
                        "Complete your address to see shipping options"
                    )}
                </p>

                {options.length > 0 && !isLoading && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={disabled}
                        className="gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                )}
            </div>

            {/* Loading State */}
            {isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center py-8"
                >
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                            Calculating best shipping rates...
                        </p>
                    </div>
                </motion.div>
            )}

            {/* Error State */}
            {error && !isLoading && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </motion.div>
            )}

            {/* Options Grid - 2 columns on md+ */}
            {!isLoading && !error && options.length > 0 && (
                <AnimatePresence mode="popLayout">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {options.map((option, index) => (
                            <motion.div
                                key={`${option.type}-${option.courier || option.zoneId}-${
                                    option.service || ""
                                }`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <ShippingOptionCard
                                    option={option}
                                    currency={currency}
                                    selected={
                                        selected?.option.courier === option.courier &&
                                        selected?.option.service === option.service &&
                                        selected?.option.zoneId === option.zoneId
                                    }
                                    onSelect={() => handleSelect(option)}
                                    disabled={disabled}
                                />
                            </motion.div>
                        ))}
                    </div>
                </AnimatePresence>
            )}

            {/* Empty State */}
            {!isLoading && !error && options.length === 0 && !isAddressComplete() && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8"
                >
                    <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                        Complete your shipping address to see available options
                    </p>
                </motion.div>
            )}
        </div>
    );
}
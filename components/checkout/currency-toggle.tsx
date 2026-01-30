// components/checkout/currency-toggle.tsx
"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Currency } from "@/types/payment";
import { cn } from "@/lib/utils";
import { DollarSign, Banknote, Info } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface CurrencyToggleProps {
    currency: Currency;
    onChange: (currency: Currency) => void;
    disabled?: boolean;
}

export function CurrencyToggle({ currency, onChange, disabled = false }: CurrencyToggleProps) {
    const currencies: Array<{ value: Currency; label: string; icon: typeof DollarSign }> = [
        { value: "IDR", label: "Indonesian Rupiah", icon: Banknote },
        { value: "USD", label: "US Dollar", icon: DollarSign },
    ];

    return (
        <Card className={cn(disabled && "opacity-60")}>
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-semibold">Currency</Label>
                    {disabled && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="max-w-xs text-xs">
                                        Currency is automatically set based on shipping destination
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {currencies.map((curr) => {
                        const Icon = curr.icon;
                        const isSelected = currency === curr.value;

                        return (
                            <motion.button
                                key={curr.value}
                                type="button"
                                whileHover={{ scale: disabled ? 1 : 1.02 }}
                                whileTap={{ scale: disabled ? 1 : 0.98 }}
                                onClick={() => !disabled && onChange(curr.value)}
                                disabled={disabled}
                                className={cn(
                                    "relative p-4 rounded-lg border-2 transition-all text-left",
                                    isSelected
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:border-primary/50",
                                    disabled && "cursor-not-allowed"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                                            isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                                        )}
                                    >
                                        <Icon className="h-5 w-5" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm">{curr.value}</p>
                                        <p className="text-xs text-muted-foreground truncate">{curr.label}</p>
                                    </div>
                                </div>

                                {isSelected && (
                                    <Badge className="absolute top-2 right-2 text-xs px-2 py-0">
                                        Selected
                                    </Badge>
                                )}
                            </motion.button>
                        );
                    })}
                </div>

                {disabled && (
                    <p className="text-xs text-muted-foreground mt-3">
                        💡 Domestic orders (Indonesia) use IDR, international orders use USD
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
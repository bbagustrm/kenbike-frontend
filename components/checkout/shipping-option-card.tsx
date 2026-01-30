// components/checkout/shipping-option-card.tsx
"use client";

import { motion } from "framer-motion";
import { ShippingOption } from "@/types/shipping";
import { Currency } from "@/types/payment";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format-currency";
import { ShippingService } from "@/services/shipping.service";
import { Truck, Globe, CheckCircle2, Clock } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface ShippingOptionCardProps {
    option: ShippingOption;
    currency: Currency;
    selected: boolean;
    onSelect: () => void;
    disabled?: boolean;
}

export function ShippingOptionCard({
                                       option,
                                       currency,
                                       selected,
                                       onSelect,
                                       disabled = false,
                                   }: ShippingOptionCardProps) {
    const { locale } = useTranslation();

    // Get icon based on shipping type
    const Icon = option.type === "DOMESTIC" ? Truck : Globe;

    // Format estimate
    const estimate = ShippingService.formatEstimate(
        option.estimatedDays.min,
        option.estimatedDays.max,
        locale
    );

    return (
        <motion.div
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
        >
            <Card
                className={cn(
                    "cursor-pointer transition-all border-2 h-full",
                    selected && "border-primary ring-2 ring-primary ring-offset-2",
                    !selected && "hover:border-primary/50",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => !disabled && onSelect()}
            >
                <CardContent className="p-4">
                    {/* Header: Icon + Name + Price */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                            <div
                                className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                                    selected ? "bg-primary text-primary-foreground" : "bg-muted"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm line-clamp-1">
                                    {option.serviceName}
                                </h4>
                                {option.type === "DOMESTIC" && option.courier && (
                                    <p className="text-xs text-muted-foreground uppercase">
                                        {option.courier}
                                    </p>
                                )}
                            </div>
                        </div>

                        {selected && (
                            <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                        )}
                    </div>

                    {/* Price */}
                    <p className="font-bold text-lg mb-2">
                        {formatCurrency(option.cost, currency)}
                    </p>

                    {/* Estimate Badge */}
                    <Badge variant="secondary" className="gap-1">
                        <Clock className="h-3 w-3" />
                        {estimate}
                    </Badge>

                    {/* Description (truncated) */}
                    {option.description && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                            {option.description}
                        </p>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
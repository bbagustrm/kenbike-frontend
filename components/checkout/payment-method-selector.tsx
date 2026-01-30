// components/checkout/payment-method-selector.tsx
"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { PaymentMethod, Currency } from "@/types/payment";
import { getAvailablePaymentMethods } from "@/lib/payment-utils";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import Image from "next/image";

interface PaymentMethodSelectorProps {
    currency: Currency;
    selected: PaymentMethod | null;
    onSelect: (method: PaymentMethod) => void;
    disabled?: boolean;
}

export function PaymentMethodSelector({
                                          currency,
                                          selected,
                                          onSelect,
                                          disabled = false,
                                      }: PaymentMethodSelectorProps) {
    const availableMethods = getAvailablePaymentMethods(currency);

    return (
        <RadioGroup
            value={selected || ""}
            onValueChange={(value) => onSelect(value as PaymentMethod)}
            disabled={disabled}
        >
            <div className="space-y-3">
                {availableMethods.map((method) => (
                    <motion.div
                        key={method.id}
                        whileHover={{ scale: disabled ? 1 : 1.01 }}
                        whileTap={{ scale: disabled ? 1 : 0.99 }}
                    >
                        <Card
                            className={cn(
                                "cursor-pointer transition-all border-2",
                                selected === method.id && "border-primary ring-2 ring-primary ring-offset-2",
                                disabled && "opacity-50 cursor-not-allowed"
                            )}
                            onClick={() => !disabled && onSelect(method.id)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                    {/* Radio Button */}
                                    <RadioGroupItem value={method.id} id={method.id} className="shrink-0" />

                                    {/* Logo */}
                                    <div className="relative w-20 h-12 shrink-0">
                                        <Image
                                            src={method.logo}
                                            alt={method.name}
                                            fill
                                            className="object-contain"
                                            onError={(e) => {
                                                // Fallback to text if image fails
                                                (e.target as HTMLImageElement).style.display = "none";
                                            }}
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Label htmlFor={method.id} className="font-semibold cursor-pointer">
                                                {method.name}
                                            </Label>
                                            {method.popular && (
                                                <Badge variant="secondary" className="text-xs">
                                                    Popular
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                                            {method.description}
                                        </p>
                                    </div>

                                    {/* Check Icon */}
                                    <CheckCircle2
                                        className={cn(
                                            "h-5 w-5 shrink-0 transition-colors",
                                            selected === method.id ? "text-primary" : "text-muted-foreground/30"
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </RadioGroup>
    );
}
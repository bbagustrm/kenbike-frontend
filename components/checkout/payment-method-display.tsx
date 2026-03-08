// components/checkout/payment-method-display.tsx
"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Currency } from "@/types/payment";
import { CheckCircle2, CreditCard } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "@/hooks/use-translation";

interface PaymentMethodDisplayProps {
    currency: Currency;
}

export function PaymentMethodDisplay({ currency }: PaymentMethodDisplayProps) {
    const { t } = useTranslation();
    const [imgError, setImgError] = useState(false);

    const paymentMethods = {
        IDR: {
            name: "Midtrans",
            description: t.checkout?.paymentInfo?.midtrans || "Bank transfer, e-wallet, kartu kredit, dan lainnya",
            logo: "/payments/midtrans.webp",
        },
        USD: {
            name: "PayPal",
            description: t.checkout?.paymentInfo?.paypal || "Pay securely with PayPal or credit/debit card",
            logo: "/payments/paypal.webp",
        },
    };

    const method = paymentMethods[currency];

    return (
        <div className="space-y-2">
            {/* Method row */}
            <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-border bg-primary/5 cursor-pointer">
                {/* Logo */}
                <div className="shrink-0 w-12 h-8 bg-white rounded flex items-center justify-center p-1">
                    {!imgError ? (
                        <Image
                            src={method.logo}
                            alt={method.name}
                            width={48}
                            height={32}
                            className="w-full h-full object-contain"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    )}
                </div>

                {/* Name + currency */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{method.name}</span>
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{currency}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{method.description}</p>
                </div>

                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
            </div>

            {/* Auto-select note */}
            <p className="text-xs text-muted-foreground px-1">
                💡 {t.checkout?.paymentInfo?.autoSelected || "Automatically selected based on your shipping destination"}
            </p>
        </div>
    );
}
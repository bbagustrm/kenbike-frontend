// components/checkout/payment-method-display.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Currency } from "@/types/payment";
import { CheckCircle2 } from "lucide-react";
import Image from "next/image";

interface PaymentMethodDisplayProps {
    currency: Currency;
}

const paymentMethods = {
    IDR: {
        id: "MIDTRANS_SNAP",
        name: "Midtrans",
        description: "Pay with bank transfer, e-wallet, credit card, and more",
        logo: "/images/payments/midtrans.png",
    },
    USD: {
        id: "PAYPAL",
        name: "PayPal",
        description: "Pay securely with PayPal or credit/debit card",
        logo: "/images/payments/paypal.png",
    },
};

export function PaymentMethodDisplay({ currency }: PaymentMethodDisplayProps) {
    const method = paymentMethods[currency];

    return (
        <Card className="border-2 border-primary ring-2 ring-primary ring-offset-2">
            <CardContent className="p-4">
                <div className="flex items-center gap-4">
                    {/* Logo */}
                    <div className="relative w-16 h-10 shrink-0 bg-white rounded p-1">
                        <Image
                            src={method.logo}
                            alt={method.name}
                            fill
                            className="object-contain"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                            }}
                        />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">{method.name}</p>
                            <Badge variant="secondary" className="text-xs">
                                {currency}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {method.description}
                        </p>
                    </div>

                    {/* Check Icon */}
                    <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                </div>

                <p className="text-xs text-muted-foreground mt-3 pl-20">
                    💡 Payment method is automatically selected based on your shipping destination
                </p>
            </CardContent>
        </Card>
    );
}
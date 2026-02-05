// components/payment/paypal-redirect-button.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PaymentService } from "@/services/payment.service";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Image from "next/image";

interface PayPalRedirectButtonProps {
    orderNumber: string;
    disabled?: boolean;
    className?: string;
}

export function PayPalRedirectButton({
    orderNumber,
    disabled,
    className,
}: PayPalRedirectButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handlePayment = async () => {
        setIsLoading(true);

        try {
            // Create PayPal payment (snake_case DTO)
            const paymentData = await PaymentService.createPayment({
                order_number: orderNumber,
                payment_method: "PAYPAL",
            });

            // Redirect to PayPal (snake_case field: payment_url)
            if (paymentData.payment_url) {
                window.location.href = paymentData.payment_url;
            } else {
                throw new Error("PayPal payment URL not received");
            }
        } catch (error) {
            setIsLoading(false);
            const errorMsg =
                error instanceof Error ? error.message : "Failed to initiate PayPal payment";
            toast.error(errorMsg);
        }
    };

    return (
        <Button
            onClick={handlePayment}
            disabled={disabled || isLoading}
            className={className}
            size="lg"
            variant="outline"
        >
            {isLoading ? (
                <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Redirecting...
                </>
            ) : (
                <>
                    <div className="relative h-4 w-16 mr-2">
                        <Image
                            src="/paypal-logo.svg"
                            alt="PayPal"
                            fill
                            className="object-contain"
                        />
                    </div>
                    Pay with PayPal
                </>
            )}
        </Button>
    );
}
// components/payment/midtrans-snap-button.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PaymentService } from "@/services/payment.service";
import { loadMidtransSnap } from "@/lib/payment-utils";
import { PaymentLoading } from "./payment-loading";
import { toast } from "sonner";
import { CreditCard, Loader2 } from "lucide-react";
import type { MidtransSnapResult } from "@/types/payment";

interface MidtransSnapButtonProps {
    orderNumber: string;
    onSuccess?: () => void;
    onError?: (error: string) => void;
    onPending?: () => void;
    disabled?: boolean;
    className?: string;
}

export function MidtransSnapButton({
                                       orderNumber,
                                       onSuccess,
                                       onError,
                                       onPending,
                                       disabled,
                                       className,
                                   }: MidtransSnapButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePayment = async () => {
        setIsLoading(true);

        try {
            // 1. Create payment (snake_case DTO)
            const paymentData = await PaymentService.createPayment({
                order_number: orderNumber,
                payment_method: "MIDTRANS_SNAP",
            });

            // 2. Load Midtrans Snap script
            const snap = await loadMidtransSnap();

            setIsLoading(false);
            setIsProcessing(true);

            // 3. Show Snap payment modal (token from response)
            snap.pay(paymentData.token!, {
                onSuccess: (result: MidtransSnapResult) => {
                    console.log("Payment success:", result);
                    setIsProcessing(false);
                    toast.success("Payment successful!");
                    onSuccess?.();
                },
                onPending: (result: MidtransSnapResult) => {
                    console.log("Payment pending:", result);
                    setIsProcessing(false);
                    toast.info("Payment is being processed");
                    onPending?.();
                },
                onError: (result: MidtransSnapResult) => {
                    console.error("Payment error:", result);
                    setIsProcessing(false);
                    const errorMsg = result.status_message || "Payment failed";
                    toast.error(errorMsg);
                    onError?.(errorMsg);
                },
                onClose: () => {
                    console.log("Payment popup closed");
                    setIsProcessing(false);
                },
            });
        } catch (error) {
            setIsLoading(false);
            setIsProcessing(false);
            const errorMsg =
                error instanceof Error ? error.message : "Failed to initiate payment";
            toast.error(errorMsg);
            onError?.(errorMsg);
        }
    };

    return (
        <>
            <Button
                onClick={handlePayment}
                disabled={disabled || isLoading || isProcessing}
                className={className}
                size="lg"
            >
                {isLoading || isProcessing ? (
                    <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {isLoading ? "Preparing..." : "Processing..."}
                    </>
                ) : (
                    <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay with Midtrans
                    </>
                )}
            </Button>

            {isProcessing && (
                <PaymentLoading
                    message="Processing your payment"
                    submessage="Complete the payment in the Midtrans window"
                />
            )}
        </>
    );
}
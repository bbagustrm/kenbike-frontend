// app/(public)/payment/callback/[orderNumber]/page.tsx
import { PaymentCallbackHandler } from "@/components/payment/payment-callback-handler";

interface PaymentCallbackPageProps {
    params: {
        orderNumber: string;
    };
}

export default function PaymentCallbackPage({
                                                params,
                                            }: PaymentCallbackPageProps) {
    return <PaymentCallbackHandler orderNumber={params.orderNumber} />;
}
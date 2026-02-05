// components/payment/payment-loading.tsx
"use client";

import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface PaymentLoadingProps {
    message?: string;
    submessage?: string;
}

export function PaymentLoading({
    message = "Processing payment...",
    submessage = "Please wait, do not close this window",
}: PaymentLoadingProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-card p-8 rounded-lg shadow-lg max-w-md w-full mx-4 text-center"
            >
                <div className="flex justify-center mb-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{message}</h3>
                <p className="text-sm text-muted-foreground">{submessage}</p>
            </motion.div>
        </motion.div>
    );
}
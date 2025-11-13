// components/checkout/checkout-stepper.tsx
"use client";

import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

type Step = 'review' | 'shipping' | 'address';

interface CheckoutStepperProps {
    currentStep: Step;
    locale?: 'id' | 'en';
}

export function CheckoutStepper({ currentStep, locale = 'en' }: CheckoutStepperProps) {
    const steps = [
        {
            id: 'review' as Step,
            label: locale === 'id' ? 'Review Keranjang' : 'Review Cart',
            number: 1
        },
        {
            id: 'shipping' as Step,
            label: locale === 'id' ? 'Pilih Pengiriman' : 'Select Shipping',
            number: 2
        },
        {
            id: 'address' as Step,
            label: locale === 'id' ? 'Alamat Pengiriman' : 'Shipping Address',
            number: 3
        },
    ];

    const currentStepIndex = steps.findIndex(s => s.id === currentStep);

    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-between max-w-3xl mx-auto">
                {steps.map((step, index) => {
                    const isActive = index === currentStepIndex;
                    const isCompleted = index < currentStepIndex;
                    const isUpcoming = index > currentStepIndex;

                    return (
                        <div key={step.id} className="flex items-center flex-1">
                            {/* Step Circle */}
                            <div className="flex flex-col items-center">
                                <div
                                    className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                                        isCompleted && "bg-green-500 text-white",
                                        isActive && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                                        isUpcoming && "bg-muted text-muted-foreground"
                                    )}
                                >
                                    {isCompleted ? (
                                        <CheckCircle2 className="w-5 h-5" />
                                    ) : (
                                        <span className="font-semibold">{step.number}</span>
                                    )}
                                </div>

                                {/* Step Label */}
                                <span
                                    className={cn(
                                        "mt-2 text-xs font-medium text-center",
                                        isActive && "text-primary",
                                        isCompleted && "text-green-600",
                                        isUpcoming && "text-muted-foreground"
                                    )}
                                >
                  {step.label}
                </span>
                            </div>

                            {/* Connector Line */}
                            {index < steps.length - 1 && (
                                <div
                                    className={cn(
                                        "flex-1 h-0.5 mx-2 transition-colors",
                                        index < currentStepIndex ? "bg-green-500" : "bg-muted"
                                    )}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
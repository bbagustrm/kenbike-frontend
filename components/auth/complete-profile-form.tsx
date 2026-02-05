"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import {
    ArrowRight,
    ArrowLeft,
    Loader2,
    Phone,
    MapPin,
    CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useTranslation } from "@/hooks/use-translation";
import { LocationForm, LocationData } from "@/components/forms/location-form";
import { isIndonesia } from "@/lib/countries";
import { cn } from "@/lib/utils";
import { AuthService } from "@/services/auth.service";
import Cookies from "js-cookie";

// Animation variants
const pageVariants = {
    initial: (direction: number) => ({
        x: direction > 0 ? 100 : -100,
        opacity: 0,
    }),
    animate: {
        x: 0,
        opacity: 1,
        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const },
    },
    exit: (direction: number) => ({
        x: direction > 0 ? -100 : 100,
        opacity: 0,
        transition: { duration: 0.3, ease: [0.4, 0, 1, 1] as const },
    }),
};

const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined;

export default function CompleteProfileForm() {
    const { user, refreshUser } = useAuth();
    const { t, locale } = useTranslation();
    const router = useRouter();

    // Current step state
    const [currentStep, setCurrentStep] = useState(1);
    const [direction, setDirection] = useState(1);

    // Form data state
    const [phoneNumber, setPhoneNumber] = useState("");

    // Location data state
    const [locationData, setLocationData] = useState<LocationData>({
        country: "ID",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Step configuration
    const STEPS = [
        {
            id: 1,
            title: t.auth.completeProfile?.contactInfo || "Contact Information",
            description: t.auth.completeProfile?.contactInfoDesc || "How can we reach you?",
            icon: Phone,
        },
        {
            id: 2,
            title: t.auth.completeProfile?.shippingAddress || "Shipping Address",
            description: t.auth.completeProfile?.shippingAddressDesc || "Where should we deliver your orders?",
            icon: MapPin,
        },
    ];

    // Step validation
    const validateStep = (step: number): boolean => {
        switch (step) {
            case 1:
                if (!phoneNumber.trim()) {
                    toast.error(t.auth.completeProfile?.enterPhoneNumber || "Please enter your phone number", {
                        position: "top-center",
                    });
                    return false;
                }
                if (phoneNumber.length < 10) {
                    toast.error(t.auth.completeProfile?.phoneMinLength || "Phone number must be at least 10 digits", {
                        position: "top-center",
                    });
                    return false;
                }
                return true;

            case 2:
                if (isIndonesia(locationData.country)) {
                    if (!locationData.province || !locationData.city) {
                        toast.error(t.auth.completeProfile?.selectProvinceAndLocation || "Please select province and complete location", {
                            position: "top-center",
                        });
                        return false;
                    }
                } else {
                    if (!locationData.city) {
                        toast.error(t.auth.completeProfile?.enterCity || "Please enter your city", {
                            position: "top-center",
                        });
                        return false;
                    }
                }
                if (!locationData.postal_code?.trim()) {
                    toast.error(t.auth.completeProfile?.enterPostalCode || "Please enter your postal code", {
                        position: "top-center",
                    });
                    return false;
                }
                if (!locationData.address?.trim()) {
                    toast.error(t.auth.completeProfile?.enterFullAddress || "Please enter your full address", {
                        position: "top-center",
                    });
                    return false;
                }
                if (locationData.address.length < 10) {
                    toast.error(t.auth.completeProfile?.addressMinLength || "Address must be at least 10 characters", {
                        position: "top-center",
                    });
                    return false;
                }
                return true;

            default:
                return true;
        }
    };

    // Navigation handlers
    const handleNext = () => {
        if (validateStep(currentStep)) {
            setDirection(1);
            setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
        }
    };

    const handlePrev = () => {
        setDirection(-1);
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    // Form submission
    const handleSubmit = async () => {
        if (!validateStep(2)) return;

        setIsSubmitting(true);

        try {
            const response = await AuthService.completeProfile({
                phone_number: phoneNumber,
                country: locationData.country,
                province: locationData.province || "",
                city: locationData.city || "",
                district: locationData.district,
                postal_code: locationData.postal_code || "",
                address: locationData.address || "",
            });

            // Update user in cookie
            if (response.data) {
                Cookies.set("user", JSON.stringify(response.data), {
                    expires: 7,
                    sameSite: "lax",
                    ...(COOKIE_DOMAIN && { domain: COOKIE_DOMAIN }),
                });
            }

            // Refresh user context
            await refreshUser();

            toast.success(t.auth.completeProfile?.profileCompleted || "Profile completed successfully!", {
                duration: 3000,
                position: "top-center",
            });

            // Redirect based on role
            setTimeout(() => {
                if (user?.role === "ADMIN") {
                    router.push("/admin/dashboard");
                } else if (user?.role === "OWNER") {
                    router.push("/owner/dashboard");
                } else {
                    router.push("/");
                }
            }, 1000);
        } catch (err) {
            const error = err as Error;
            toast.error(error.message || t.auth.completeProfile?.failedToComplete || "Failed to complete profile", {
                duration: 5000,
                position: "top-center",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Render step content
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        {/* Welcome Message */}
                        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <span className="font-medium">
                                    {t.auth.completeProfile?.welcome || "Welcome"}, {user?.first_name}!
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {t.auth.completeProfile?.signedInWithGoogle || "You're signed in with Google. Please complete your profile to start shopping."}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone_number">
                                {t.auth.completeProfile?.phoneNumber || "Phone Number"} <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="phone_number"
                                type="tel"
                                placeholder={t.auth.completeProfile?.phonePlaceholder || "e.g., 081234567890"}
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                disabled={isSubmitting}
                                required
                                autoFocus
                            />
                            <p className="text-xs text-muted-foreground">
                                {t.auth.completeProfile?.phoneHelp || "We'll use this for order updates and delivery"}
                            </p>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-4">
                        <LocationForm
                            value={locationData}
                            onChange={setLocationData}
                            disabled={isSubmitting}
                            required
                        />
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <>
            <div className="flex items-center justify-center min-h-screen py-8 px-4">
                <div className="max-w-lg w-full space-y-8">
                    {/* Progress Indicator */}
                    <div className="flex justify-center gap-2">
                        {STEPS.map((step) => (
                            <div
                                key={step.id}
                                className={cn(
                                    "h-2 rounded-full transition-all duration-300",
                                    step.id === currentStep
                                        ? "w-8 bg-primary"
                                        : step.id < currentStep
                                            ? "w-2 bg-primary"
                                            : "w-2 bg-muted"
                                )}
                            />
                        ))}
                    </div>

                    {/* Card */}
                    <Card className="w-full bg-background rounded-lg p-8 md:p-12">
                        <CardHeader className="pb-4">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                    {t.auth.completeProfile?.step || "Step"} {currentStep} {t.auth.completeProfile?.of || "of"} {STEPS.length}
                                </div>
                                <CardTitle className="text-2xl font-semibold">
                                    {STEPS[currentStep - 1].title}
                                </CardTitle>
                                <CardDescription className="mt-1">
                                    {STEPS[currentStep - 1].description}
                                </CardDescription>
                            </motion.div>
                        </CardHeader>

                        <CardContent className="pb-6">
                            <AnimatePresence mode="wait" custom={direction}>
                                <motion.div
                                    key={currentStep}
                                    custom={direction}
                                    variants={pageVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                >
                                    {renderStepContent()}
                                </motion.div>
                            </AnimatePresence>
                        </CardContent>

                        <CardFooter className="flex flex-col gap-4">
                            {/* Navigation Buttons */}
                            <div className="flex w-full gap-3">
                                {currentStep > 1 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handlePrev}
                                        disabled={isSubmitting}
                                        className="flex-1"
                                    >
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        {t.auth.completeProfile?.back || "Back"}
                                    </Button>
                                )}

                                {currentStep < STEPS.length ? (
                                    <Button
                                        type="button"
                                        onClick={handleNext}
                                        disabled={isSubmitting}
                                        className={cn("flex-1", currentStep === 1 && "w-full")}
                                    >
                                        {t.auth.completeProfile?.continue || "Continue"}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="flex-1"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                {t.auth.completeProfile?.saving || "Saving..."}
                                            </>
                                        ) : (
                                            <>
                                                {t.auth.completeProfile?.completeProfile || "Complete Profile"}
                                                <CheckCircle className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>
            <Toaster />
        </>
    );
}
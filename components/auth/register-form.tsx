"use client";

import { useState } from "react";
import Link from "next/link";
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
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import {
    ArrowRight,
    ArrowLeft,
    Loader2,
    Check,
    X,
    User,
    Mail,
    MapPin,
    Lock, SeparatorHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useTranslation } from "@/hooks/use-translation";
import { LocationForm, LocationData } from "@/components/forms/location-form";
import { RegisterData } from "@/types/auth";
import { isIndonesia } from "@/lib/countries";
import { cn } from "@/lib/utils";
import {Separator} from "@radix-ui/react-menu";

// Step configuration
const STEPS = [
    {
        id: 1,
        title: "Personal Information",
        description: "Tell us about yourself",
        icon: User,
    },
    {
        id: 2,
        title: "Account Information",
        description: "Create your account credentials",
        icon: Mail,
    },
    {
        id: 3,
        title: "Location",
        description: "Where should we ship your orders?",
        icon: MapPin,
    },
    {
        id: 4,
        title: "Password",
        description: "Secure your account",
        icon: Lock,
    },
];

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

export default function RegisterForm() {
    const { register } = useAuth();
    const { t } = useTranslation();

    // Current step state
    const [currentStep, setCurrentStep] = useState(1);
    const [direction, setDirection] = useState(1);

    // Form data state
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        username: "",
        email: "",
        phone_number: "",
        password: "",
        confirm_password: "",
    });

    // Location data state
    const [locationData, setLocationData] = useState<LocationData>({
        country: "ID",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Password validation
    const validatePassword = (password: string): string | null => {
        const req = t.auth.register.passwordRequirements;
        if (password.length < 8) return req.length;
        if (!/[A-Z]/.test(password)) return req.uppercase;
        if (!/[a-z]/.test(password)) return req.lowercase;
        if (!/[0-9]/.test(password)) return req.number;
        if (!/[!@#$%^&*]/.test(password)) return req.special;
        return null;
    };

    // Password strength calculator
    const getPasswordStrength = () => {
        const password = formData.password;
        if (!password) return { strength: 0, label: "", color: "" };

        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[!@#$%^&*]/.test(password)) strength++;

        const labels = ["Weak", "Fair", "Good", "Strong", "Very Strong"];
        const colors = [
            "bg-destructive",
            "bg-orange-500",
            "bg-yellow-500",
            "bg-blue-500",
            "bg-green-500",
        ];

        return {
            strength,
            label: labels[strength - 1] || "",
            color: colors[strength - 1] || "",
        };
    };

    const passwordStrength = getPasswordStrength();

    // Step validation
    const validateStep = (step: number): boolean => {
        switch (step) {
            case 1:
                if (!formData.first_name.trim() || !formData.last_name.trim()) {
                    toast.error("Please fill in your first and last name", {
                        position: "top-center",
                    });
                    return false;
                }
                if (formData.first_name.length < 2 || formData.last_name.length < 2) {
                    toast.error("Names must be at least 2 characters", {
                        position: "top-center",
                    });
                    return false;
                }
                return true;

            case 2:
                if (!formData.username.trim()) {
                    toast.error("Please enter a username", { position: "top-center" });
                    return false;
                }
                if (formData.username.length < 3) {
                    toast.error("Username must be at least 3 characters", {
                        position: "top-center",
                    });
                    return false;
                }
                if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
                    toast.error(
                        "Username can only contain letters, numbers, and underscores",
                        { position: "top-center" }
                    );
                    return false;
                }
                if (!formData.email.trim()) {
                    toast.error("Please enter your email", { position: "top-center" });
                    return false;
                }
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                    toast.error("Please enter a valid email address", {
                        position: "top-center",
                    });
                    return false;
                }
                return true;

            case 3:
                if (isIndonesia(locationData.country)) {
                    if (!locationData.province || !locationData.city) {
                        toast.error("Please select province and complete location search", {
                            position: "top-center",
                        });
                        return false;
                    }
                } else {
                    if (!locationData.city) {
                        toast.error("Please enter your city", { position: "top-center" });
                        return false;
                    }
                }
                if (!locationData.address?.trim()) {
                    toast.error("Please enter your full address", {
                        position: "top-center",
                    });
                    return false;
                }
                return true;

            case 4:
                if (!formData.password) {
                    toast.error("Please enter a password", { position: "top-center" });
                    return false;
                }
                const passwordError = validatePassword(formData.password);
                if (passwordError) {
                    toast.error(passwordError, { position: "top-center" });
                    return false;
                }
                if (formData.password !== formData.confirm_password) {
                    toast.error(t.auth.register.passwordsDoNotMatch, {
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

    const goToStep = (step: number) => {
        // Only allow going back, not forward (to prevent skipping validation)
        if (step < currentStep) {
            setDirection(step < currentStep ? -1 : 1);
            setCurrentStep(step);
        }
    };

    // Form submission
    const handleSubmit = async () => {
        if (!validateStep(4)) return;

        setIsSubmitting(true);

        try {
            const { confirm_password: _, ...baseData } = formData;

            const registerData: RegisterData = {
                ...baseData,
                address: locationData.address,
                country: locationData.country,
                province: locationData.province,
                city: locationData.city,
                district: locationData.district,
                postal_code: locationData.postal_code,
            };

            await register(registerData);
            toast.success(t.auth.register.accountCreated, {
                duration: 3000,
                position: "top-center",
            });
        } catch (err) {
            const error = err as Error & { fieldErrors?: Record<string, string> };
            const errorMessage = error.message || t.auth.register.registrationFailed;
            toast.error(errorMessage, {
                duration: 5000,
                position: "top-center",
            });

            if (error.fieldErrors) {
                Object.entries(error.fieldErrors).forEach(([field, message]) => {
                    toast.error(`${field}: ${message}`, {
                        duration: 5000,
                        position: "top-center",
                    });
                });
            }
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
                        <div className="space-y-2">
                            <Label htmlFor="first_name">
                                {t.auth.register.firstNameLabel}{" "}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="first_name"
                                name="first_name"
                                placeholder={t.auth.register.placeholders.firstName}
                                value={formData.first_name}
                                onChange={handleChange}
                                disabled={isSubmitting}
                                required
                                minLength={2}
                                maxLength={50}
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="last_name">
                                {t.auth.register.lastNameLabel}{" "}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="last_name"
                                name="last_name"
                                placeholder={t.auth.register.placeholders.lastName}
                                value={formData.last_name}
                                onChange={handleChange}
                                disabled={isSubmitting}
                                required
                                minLength={2}
                                maxLength={50}
                            />
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="username">
                                {t.auth.register.usernameLabel}{" "}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="username"
                                name="username"
                                placeholder={t.auth.register.placeholders.username}
                                value={formData.username}
                                onChange={handleChange}
                                disabled={isSubmitting}
                                required
                                minLength={3}
                                maxLength={30}
                                autoFocus
                            />
                            <p className="text-xs text-muted-foreground">
                                Letters, numbers, and underscores only
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">
                                {t.auth.register.emailLabel}{" "}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder={t.auth.register.placeholders.email}
                                value={formData.email}
                                onChange={handleChange}
                                disabled={isSubmitting}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone_number">
                                {t.auth.register.phoneLabel}{" "}
                                <span className="text-muted-foreground text-xs">(Optional)</span>
                            </Label>
                            <Input
                                id="phone_number"
                                name="phone_number"
                                type="tel"
                                placeholder={t.auth.register.placeholders.phone}
                                value={formData.phone_number}
                                onChange={handleChange}
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>
                );

            case 3:
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

            case 4:
                return (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="password">
                                {t.auth.register.passwordLabel}{" "}
                                <span className="text-destructive">*</span>
                            </Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                placeholder={t.auth.register.placeholders.password}
                                value={formData.password}
                                onChange={handleChange}
                                disabled={isSubmitting}
                                required
                                autoFocus
                            />
                            {formData.password && (
                                <div className="space-y-2 mt-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                            <motion.div
                                                className={`h-full ${passwordStrength.color}`}
                                                initial={{ width: 0 }}
                                                animate={{
                                                    width: `${(passwordStrength.strength / 5) * 100}%`,
                                                }}
                                                transition={{ duration: 0.3 }}
                                            />
                                        </div>
                                        <span className="text-xs font-medium min-w-[80px] text-center">
                      {passwordStrength.label}
                    </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirm_password">
                                {t.auth.register.confirmPasswordLabel}{" "}
                                <span className="text-destructive">*</span>
                            </Label>
                            <PasswordInput
                                id="confirm_password"
                                name="confirm_password"
                                placeholder={t.auth.register.placeholders.password}
                                value={formData.confirm_password}
                                onChange={handleChange}
                                disabled={isSubmitting}
                                required
                            />
                            {formData.confirm_password && (
                                <div className="flex items-center gap-2 text-sm mt-1">
                                    {formData.password === formData.confirm_password ? (
                                        <>
                                            <Check className="h-4 w-4 text-green-500" />
                                            <span className="text-green-500">Passwords match</span>
                                        </>
                                    ) : (
                                        <>
                                            <X className="h-4 w-4 text-destructive" />
                                            <span className="text-destructive">
                        Passwords don&apos;t match
                      </span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Password Requirements */}
                        <div className="text-xs text-muted-foreground space-y-2">
                            <p className="font-medium text-foreground">
                                {t.auth.register.passwordRequirements.title}
                            </p>
                            <ul className="space-y-1">
                                {[
                                    {
                                        text: t.auth.register.passwordRequirements.length,
                                        check: formData.password.length >= 8,
                                    },
                                    {
                                        text: t.auth.register.passwordRequirements.uppercase,
                                        check: /[A-Z]/.test(formData.password),
                                    },
                                    {
                                        text: t.auth.register.passwordRequirements.lowercase,
                                        check: /[a-z]/.test(formData.password),
                                    },
                                    {
                                        text: t.auth.register.passwordRequirements.number,
                                        check: /[0-9]/.test(formData.password),
                                    },
                                    {
                                        text: t.auth.register.passwordRequirements.special,
                                        check: /[!@#$%^&*]/.test(formData.password),
                                    },
                                ].map((req, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                        {req.check ? (
                                            <Check className="h-3 w-3 text-green-500" />
                                        ) : (
                                            <X className="h-3 w-3 text-muted-foreground" />
                                        )}
                                        <span className={req.check ? "text-green-500" : ""}>
                      {req.text}
                    </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
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
                    {/* Progress Steps */}

                    {/* Card */}
                    <Card className="w-full bg-background rounded-lg p-12">
                        <CardHeader className="pb-4">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                    Step {currentStep} of {STEPS.length}
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

                        <CardFooter className="flex flex-col gap-4 ">
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
                                        Back
                                    </Button>
                                )}

                                {currentStep < STEPS.length ? (
                                    <Button
                                        type="button"
                                        onClick={handleNext}
                                        disabled={isSubmitting}
                                        className={cn("flex-1", currentStep === 1 && "w-full")}
                                    >
                                        Continue
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
                                                {t.auth.register.creatingAccount}
                                            </>
                                        ) : (
                                            <>
                                                {t.auth.register.createAccountButton}
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                            {/* Login Link */}
                            <p className="text-sm text-center text-muted-foreground pt-2">
                                {t.auth.register.hasAccount}{" "}
                                <Link
                                    href="/login"
                                    className="text-foreground font-medium hover:underline transition-colors"
                                >
                                    {t.auth.register.signInLink}
                                </Link>
                            </p>
                        </CardFooter>
                    </Card>
                </div>
            </div>
            <Toaster />
        </>
    );
}
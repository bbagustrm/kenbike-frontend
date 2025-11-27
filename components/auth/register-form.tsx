"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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
import { useAuth } from "@/contexts/auth-context";
import { ArrowRight, Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useTranslation } from "@/hooks/use-translation";
import { LocationForm, LocationData } from "@/components/forms/location-form";
import { RegisterData } from "@/types/auth";
import { AnimatedButton } from "@/components/animations/button-ripple";
import { ScrollReveal } from "@/components/animations/scroll-reveal";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4 },
    },
};

export default function RegisterForm() {
    const { register } = useAuth();
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        username: "",
        email: "",
        phone_number: "",
        password: "",
        confirm_password: "",
    });

    const [locationData, setLocationData] = useState<LocationData>({
        country: "Indonesia",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validatePassword = (password: string): string | null => {
        const req = t.auth.register.passwordRequirements;
        if (password.length < 8) return req.length;
        if (!/[A-Z]/.test(password)) return req.uppercase;
        if (!/[a-z]/.test(password)) return req.lowercase;
        if (!/[0-9]/.test(password)) return req.number;
        if (!/[!@#$%^&*]/.test(password)) return req.special;
        return null;
    };

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
            "bg-secondary",
            "bg-green-500",
        ];

        return {
            strength,
            label: labels[strength - 1] || "",
            color: colors[strength - 1] || "",
        };
    };

    const passwordStrength = getPasswordStrength();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirm_password) {
            toast.error(t.auth.register.passwordsDoNotMatch, {
                duration: 5000,
                position: "top-center",
            });
            return;
        }

        const passwordError = validatePassword(formData.password);
        if (passwordError) {
            toast.error(passwordError, {
                duration: 5000,
                position: "top-center",
            });
            return;
        }

        if (locationData.country === "Indonesia") {
            if (!locationData.province || !locationData.city) {
                toast.error("Please select province and complete location search", {
                    duration: 5000,
                    position: "top-center",
                });
                return;
            }
        } else {
            if (!locationData.country) {
                toast.error("Please enter country name", {
                    duration: 5000,
                    position: "top-center",
                });
                return;
            }
        }

        setIsSubmitting(true);

        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { confirm_password: _, ...baseData } = formData;

            const registerData: RegisterData = {
                ...baseData,
                address: locationData.address,
                country: locationData.country === "Indonesia" ? "Indonesia" : locationData.country || "",
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

    return (
        <>
            <div className="flex items-center justify-center min-h-screen bg-muted/30 px-4 py-12">
                <motion.div
                    className="w-full max-w-3xl"
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                >
                    <Card className="border-2 shadow-2xl">
                        <CardHeader>
                            <motion.div variants={itemVariants}>
                                <CardTitle className="text-3xl font-display">
                                    {t.auth.register.title}
                                </CardTitle>
                                <CardDescription className="text-base mt-2">
                                    {t.auth.register.description}
                                </CardDescription>
                            </motion.div>
                        </CardHeader>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <CardContent className="space-y-8">
                                {/* Personal Information */}
                                <ScrollReveal delay={0.1}>
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-2">
                                            <h3 className="text-xl font-bold">Personal Information</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:pl-4">
                                            <motion.div variants={itemVariants} className="space-y-2">
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
                                                    className="transition-all duration-200 focus:ring-2 focus:ring-secondary focus:shadow-lg focus:shadow-secondary/20"
                                                />
                                            </motion.div>

                                            <motion.div variants={itemVariants} className="space-y-2">
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
                                                    className="transition-all duration-200 focus:ring-2 focus:ring-secondary focus:shadow-lg focus:shadow-secondary/20"
                                                />
                                            </motion.div>
                                        </div>
                                    </div>
                                </ScrollReveal>

                                {/* Account Information */}
                                <ScrollReveal delay={0.2}>
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-2">
                                            <h3 className="text-xl font-bold">Account Information</h3>
                                        </div>
                                        <div className="space-y-4 md:pl-4">
                                            <motion.div variants={itemVariants} className="space-y-2">
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
                                                    pattern="[a-zA-Z0-9_]+"
                                                    title="Username can only contain letters, numbers, and underscores"
                                                    className="transition-all duration-200 focus:ring-2 focus:ring-secondary focus:shadow-lg focus:shadow-secondary/20"
                                                />
                                            </motion.div>

                                            <motion.div variants={itemVariants} className="space-y-2">
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
                                                    className="transition-all duration-200 focus:ring-2 focus:ring-secondary focus:shadow-lg focus:shadow-secondary/20"
                                                />
                                            </motion.div>

                                            <motion.div variants={itemVariants} className="space-y-2">
                                                <Label htmlFor="phone_number">{t.auth.register.phoneLabel}</Label>
                                                <Input
                                                    id="phone_number"
                                                    name="phone_number"
                                                    type="tel"
                                                    placeholder={t.auth.register.placeholders.phone}
                                                    value={formData.phone_number}
                                                    onChange={handleChange}
                                                    disabled={isSubmitting}
                                                    className="transition-all duration-200 focus:ring-2 focus:ring-secondary focus:shadow-lg focus:shadow-secondary/20"
                                                />
                                            </motion.div>
                                        </div>
                                    </div>
                                </ScrollReveal>

                                {/* Location Information */}
                                <ScrollReveal delay={0.3}>
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-2">
                                            <h3 className="text-xl font-bold">Location Information</h3>
                                        </div>
                                        <div className="md:pl-4">
                                            <LocationForm
                                                value={locationData}
                                                onChange={setLocationData}
                                                disabled={isSubmitting}
                                                required
                                            />
                                        </div>
                                    </div>
                                </ScrollReveal>

                                {/* Password */}
                                <ScrollReveal delay={0.4}>
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-2">
                                            <h3 className="text-xl font-bold">Password</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:pl-4">
                                            <motion.div variants={itemVariants} className="space-y-2">
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
                                                    className="transition-all duration-200 focus:ring-2 focus:ring-secondary focus:shadow-lg focus:shadow-secondary/20"
                                                />
                                                {formData.password && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="space-y-2"
                                                    >
                                                        <div className="flex items-center space-x-2">
                                                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                                                <motion.div
                                                                    className={`h-full ${passwordStrength.color}`}
                                                                    initial={{ width: 0 }}
                                                                    animate={{
                                                                        width: `${(passwordStrength.strength / 5) * 100}%`,
                                                                    }}
                                                                    transition={{ duration: 0.3 }}
                                                                />
                                                            </div>
                                                            <span className="text-xs font-medium">
                                                                {passwordStrength.label}
                                                            </span>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </motion.div>

                                            <motion.div variants={itemVariants} className="space-y-2">
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
                                                    className="transition-all duration-200 focus:ring-2 focus:ring-secondary focus:shadow-lg focus:shadow-secondary/20"
                                                />
                                                {formData.confirm_password && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="flex items-center space-x-2 text-sm"
                                                    >
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
                                                    </motion.div>
                                                )}
                                            </motion.div>
                                        </div>

                                        <motion.div
                                            variants={itemVariants}
                                            className="text-xs text-muted-foreground space-y-2 mt-4 md:pl-4 p-4 bg-muted/50 rounded-lg"
                                        >
                                            <p className="font-semibold text-foreground">
                                                {t.auth.register.passwordRequirements.title}
                                            </p>
                                            <ul className="space-y-1">
                                                {[
                                                    { text: t.auth.register.passwordRequirements.length, check: formData.password.length >= 8 },
                                                    { text: t.auth.register.passwordRequirements.uppercase, check: /[A-Z]/.test(formData.password) },
                                                    { text: t.auth.register.passwordRequirements.lowercase, check: /[a-z]/.test(formData.password) },
                                                    { text: t.auth.register.passwordRequirements.number, check: /[0-9]/.test(formData.password) },
                                                    { text: t.auth.register.passwordRequirements.special, check: /[!@#$%^&*]/.test(formData.password) },
                                                ].map((req, i) => (
                                                    <li key={i} className="flex items-center space-x-2">
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
                                        </motion.div>
                                    </div>
                                </ScrollReveal>
                            </CardContent>

                            <CardFooter className="flex flex-col space-y-4">
                                <motion.div
                                    className="w-full"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <AnimatedButton
                                        type="submit"
                                        variant="secondary"
                                        className="w-full text-base font-bold"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                {t.auth.register.creatingAccount}
                                            </>
                                        ) : (
                                            <>
                                                {t.auth.register.createAccountButton}
                                                <ArrowRight className="ml-2 h-5 w-5" />
                                            </>
                                        )}
                                    </AnimatedButton>
                                </motion.div>

                                <motion.p
                                    className="text-sm text-center text-muted-foreground"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                >
                                    {t.auth.register.hasAccount}{" "}
                                    <Link
                                        href="/login"
                                        className="text-primary hover:text-accent font-medium hover:underline transition-colors"
                                    >
                                        {t.auth.register.signInLink}
                                    </Link>
                                </motion.p>
                            </CardFooter>
                        </form>
                    </Card>
                </motion.div>
            </div>
            <Toaster />
        </>
    );
}
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { ArrowRight, Loader2} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useTranslation } from "@/hooks/use-translation";
import { AnimatedInput } from "@/components/animations/input-animation";
import { AnimatedButton } from "@/components/animations/button-ripple";

export default function LoginForm() {
    const { login } = useAuth();
    const { t } = useTranslation();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const registered = searchParams.get("registered");
    const redirect = searchParams.get("redirect");

    useEffect(() => {
        if (registered) {
            toast.success(t.auth.login.registrationSuccess, {
                duration: 5000,
                position: "top-center",
            });
        }

        if (redirect) {
            toast.info(t.auth.login.redirectMessage, {
                duration: 4000,
                position: "top-center",
            });
        }
    }, [registered, redirect, t]);

    useEffect(() => {
        if (error) {
            toast.error(error, {
                duration: 5000,
                position: "top-center",
            });
            setError(null);
        }
    }, [error]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            await login({ email, password });
            toast.success(t.auth.login.loginSuccess, {
                duration: 3000,
                position: "top-center",
            });
        } catch (err) {
            const error = err as Error & { fieldErrors?: Record<string, string> };

            const errorMessage = error.message || t.auth.login.loginFailed;
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

            setError(errorMessage);

            // Shake animation on error
            const form = event.currentTarget;
            form.classList.add("animate-shake");
            setTimeout(() => form.classList.remove("animate-shake"), 500);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card className="bg-background rounded-lg shadow-[0px_0px_7px_1px_#00000024] p-12">
                    <CardHeader>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <CardTitle className="text-3xl font-display">
                                {t.auth.login.title}
                            </CardTitle>
                            <CardDescription className="text-base mt-2">
                                {t.auth.login.description}
                            </CardDescription>
                        </motion.div>
                    </CardHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <CardContent className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <AnimatedInput
                                    id="email"
                                    label={t.auth.login.emailLabel}
                                    type="email"
                                    placeholder={t.auth.login.emailPlaceholder}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isSubmitting}
                                    required
                                    autoComplete="email"
                                />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="space-y-2"
                            >
                                <motion.div
                                    animate={{
                                        y: isFocused ? -2 : 0,
                                    }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Label htmlFor="password">
                                        {t.auth.login.passwordLabel}
                                    </Label>
                                </motion.div>
                                <motion.div
                                    animate={{
                                        scale: isFocused ? 1.01 : 1,
                                    }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <PasswordInput
                                        id="password"
                                        autoComplete="current-password"
                                        placeholder={t.auth.login.passwordPlaceholder}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => setIsFocused(true)}
                                        onBlur={() => setIsFocused(false)}
                                        disabled={isSubmitting}
                                        required
                                        className={`transition-all duration-200 ${
                                            isFocused
                                                ? "ring-2 ring-secondary shadow-lg shadow-secondary/20"
                                                : ""
                                        }`}
                                    />
                                </motion.div>
                                <div className="text-xs text-primary flex justify-between items-center pt-2">
                                    <span></span>
                                    <Link
                                        href="/forgot-password"
                                        className="hover:underline font-medium hover:text-accent transition-colors"
                                    >
                                        {t.auth.login.forgotPassword}
                                    </Link>
                                </div>
                            </motion.div>
                        </CardContent>

                        <CardFooter className="flex flex-col space-y-4 pt-4">
                            <motion.div
                                className="w-full"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <AnimatedButton
                                    type="submit"
                                    variant="default"
                                    className="w-full text-base font-bold"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            {t.auth.login.signingIn}
                                        </>
                                    ) : (
                                        <>
                                            {t.auth.login.signInButton}
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
                                {t.auth.login.noAccount}{" "}
                                <Link
                                    href="/register"
                                    className="text-primary hover:text-accent font-medium hover:underline transition-colors"
                                >
                                    {t.auth.login.signUpLink}
                                </Link>
                            </motion.p>
                        </CardFooter>
                    </form>
                </Card>
            </motion.div>
            <Toaster />
        </div>
    );
}
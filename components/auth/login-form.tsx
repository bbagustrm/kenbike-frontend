// components/auth/login-form.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import {ArrowRight, Loader2} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useTranslation } from "@/hooks/use-translation";

export default function LoginForm() {
    const { login } = useAuth();
    const { t } = useTranslation();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-2xl">{t.auth.login.title}</CardTitle>
                        <CardDescription>
                            {t.auth.login.description}
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">{t.auth.login.emailLabel}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder={t.auth.login.emailPlaceholder}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isSubmitting}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">{t.auth.login.passwordLabel}</Label>
                                <PasswordInput
                                    id="password"
                                    autoComplete="current-password"
                                    placeholder={t.auth.login.passwordPlaceholder}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isSubmitting}
                                    required
                                />
                                <div className="text-xs text-primary flex justify-between items-center">
                                    <span></span>
                                    <Link
                                        href="/forgot-password"
                                        className="hover:underline font-medium"
                                    >
                                        {t.auth.login.forgotPassword}
                                    </Link>
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="flex flex-col space-y-4">
                            <Button type="submit" variant="secondary" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        <h3 className="text-base">{t.auth.login.signingIn}</h3>
                                    </>
                                ) : (
                                    <>
                                        <h3 className="text-base">{t.auth.login.signInButton}</h3>
                                        <ArrowRight />
                                    </>
                                    )}
                            </Button>

                            <p className="text-sm text-center text-muted-foreground">
                                {t.auth.login.noAccount}{" "}
                                <Link href="/register" className="text-primary hover:underline font-medium">
                                    {t.auth.login.signUpLink}
                                </Link>
                            </p>
                        </CardFooter>
                    </form>
                </Card>
            </div>
            <Toaster />
        </>
    );
}
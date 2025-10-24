"use client";

import { useState } from "react";
import Link from "next/link";
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
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useTranslation } from "@/hooks/use-translation";

export default function RegisterForm() {
    const { register } = useAuth();
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        username: "",
        email: "",
        phone_number: "",
        country: "",
        password: "",
        confirm_password: "",
        address: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validatePassword = (password: string): string | null => {
        const req = t.auth.register.passwordRequirements;
        if (password.length < 8) {
            return req.length;
        }
        if (!/[A-Z]/.test(password)) {
            return req.uppercase;
        }
        if (!/[a-z]/.test(password)) {
            return req.lowercase;
        }
        if (!/[0-9]/.test(password)) {
            return req.number;
        }
        if (!/[!@#$%^&*]/.test(password)) {
            return req.special;
        }
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirm_password) {
            toast.error(t.auth.register.passwordsDoNotMatch);
            return;
        }

        const passwordError = validatePassword(formData.password);
        if (passwordError) {
            toast.error(passwordError);
            return;
        }

        setIsSubmitting(true);

        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { confirm_password: _, ...registerData } = formData;
            await register(registerData);
            toast.success(t.auth.register.accountCreated);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : t.auth.register.registrationFailed);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 py-8">
                <Card className="w-full max-w-2xl shadow-md">
                    <CardHeader>
                        <CardTitle className="text-2xl">{t.auth.register.title}</CardTitle>
                        <CardDescription>
                            {t.auth.register.description}
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="first_name">
                                        {t.auth.register.firstNameLabel} <span className="text-red-500">*</span>
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
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="last_name">
                                        {t.auth.register.lastNameLabel} <span className="text-red-500">*</span>
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

                            <div className="space-y-2">
                                <Label htmlFor="username">
                                    {t.auth.register.usernameLabel} <span className="text-red-500">*</span>
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
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">
                                    {t.auth.register.emailLabel} <span className="text-red-500">*</span>
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone_number">{t.auth.register.phoneLabel}</Label>
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

                                <div className="space-y-2">
                                    <Label htmlFor="country">{t.auth.register.countryLabel}</Label>
                                    <Input
                                        id="country"
                                        name="country"
                                        placeholder={t.auth.register.placeholders.country}
                                        value={formData.country}
                                        onChange={handleChange}
                                        disabled={isSubmitting}
                                        maxLength={50}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">{t.auth.register.addressLabel}</Label>
                                <Input
                                    id="address"
                                    name="address"
                                    placeholder={t.auth.register.placeholders.address}
                                    value={formData.address}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    maxLength={255}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">
                                        {t.auth.register.passwordLabel} <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder={t.auth.register.placeholders.password}
                                        value={formData.password}
                                        onChange={handleChange}
                                        disabled={isSubmitting}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirm_password">
                                        {t.auth.register.confirmPasswordLabel} <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="confirm_password"
                                        name="confirm_password"
                                        type="password"
                                        placeholder={t.auth.register.placeholders.password}
                                        value={formData.confirm_password}
                                        onChange={handleChange}
                                        disabled={isSubmitting}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="text-xs text-muted-foreground space-y-1">
                                <p>{t.auth.register.passwordRequirements.title}</p>
                                <ul className="list-disc list-inside space-y-0.5 ml-2">
                                    <li>{t.auth.register.passwordRequirements.length}</li>
                                    <li>{t.auth.register.passwordRequirements.uppercase}</li>
                                    <li>{t.auth.register.passwordRequirements.lowercase}</li>
                                    <li>{t.auth.register.passwordRequirements.number}</li>
                                    <li>{t.auth.register.passwordRequirements.special}</li>
                                </ul>
                            </div>
                        </CardContent>

                        <CardFooter className="flex flex-col space-y-4">
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {t.auth.register.creatingAccount}
                                    </>
                                ) : (
                                    t.auth.register.createAccountButton
                                )}
                            </Button>

                            <p className="text-sm text-center text-muted-foreground">
                                {t.auth.register.hasAccount}{" "}
                                <Link href="/login" className="text-primary hover:underline font-medium">
                                    {t.auth.register.signInLink}
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
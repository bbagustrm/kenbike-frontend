"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/ui/otp-input";
import { AuthService } from "@/services/auth.service";
import { handleApiError } from "@/lib/api-client";
import { Loader2, Mail, CheckCircle2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";

const RESEND_COOLDOWN = 60; // seconds

export default function VerifyEmailForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t } = useTranslation();

    const email = searchParams.get("email") || "";

    const [otp, setOtp] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [countdown, setCountdown] = useState(0);

    // Countdown timer for resend
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    // Start countdown on mount
    useEffect(() => {
        setCountdown(RESEND_COOLDOWN);
    }, []);

    // Auto-submit when OTP is complete
    useEffect(() => {
        if (otp.length === 6 && !isVerifying && !isVerified) {
            handleVerify();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [otp]);

    const handleVerify = async () => {
        if (otp.length !== 6) {
            toast.error(t.auth.verification?.enterCompleteCode || "Please enter the complete 6-digit code", {
                position: "top-center",
            });
            return;
        }

        if (!email) {
            toast.error(t.auth.verification?.emailNotFound || "Email not found. Please register again.", {
                position: "top-center",
            });
            return;
        }

        setIsVerifying(true);

        try {
            await AuthService.verifyOtp({ email, otp });

            setIsVerified(true);
            toast.success(t.auth.verification?.verificationSuccess || "Email verified successfully!", {
                position: "top-center",
            });

            // Redirect to login after short delay
            setTimeout(() => {
                router.push("/login?verified=true");
            }, 1500);

        } catch (error) {
            const apiError = handleApiError(error);
            toast.error(apiError.message || t.auth.verification?.invalidOrExpiredOtp || "Invalid or expired OTP", {
                position: "top-center",
            });
            setOtp(""); // Clear OTP on error
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async () => {
        if (countdown > 0 || isResending) return;

        if (!email) {
            toast.error(t.auth.verification?.emailNotFound || "Email not found. Please register again.", {
                position: "top-center",
            });
            return;
        }

        setIsResending(true);

        try {
            await AuthService.resendOtp({ email });
            toast.success(t.auth.verification?.newOtpSent || "New OTP sent to your email!", {
                position: "top-center",
            });
            setCountdown(RESEND_COOLDOWN);
            setOtp(""); // Clear current OTP
        } catch (error) {
            const apiError = handleApiError(error);

            if (apiError.message.includes("wait")) {
                toast.error(apiError.message, {
                    position: "top-center",
                });
            } else {
                toast.error(apiError.message || t.auth.verification?.failedToResend || "Failed to resend OTP", {
                    position: "top-center",
                });
            }
        } finally {
            setIsResending(false);
        }
    };

    // If no email in params, show error
    if (!email) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="w-full max-w-md bg-background rounded-lg p-8">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Invalid Request</CardTitle>
                        <CardDescription>
                            {t.auth.verification?.noEmailProvided || "No email address provided. Please register first."}
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="justify-center">
                        <Button asChild>
                            <Link href="/register">{t.auth.verification?.goToRegister || "Go to Register"}</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card className="bg-background rounded-lg p-8 sm:p-12">
                    <CardHeader className="text-center pb-2">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"
                        >
                            {isVerified ? (
                                <CheckCircle2 className="w-8 h-8 text-green-500" />
                            ) : (
                                <Mail className="w-8 h-8 text-primary" />
                            )}
                        </motion.div>

                        <CardTitle className="text-2xl font-semibold">
                            {isVerified ? t.auth.verification?.verificationSuccess : t.auth.verification?.title}
                        </CardTitle>
                        <CardDescription className="mt-2">
                            {isVerified ? (
                                t.auth.verification?.redirectingToLogin || "Redirecting you to login..."
                            ) : (
                                <>
                                    {t.auth.verification?.weSentCodeTo || "We've sent a 6-digit code to"}
                                    <br />
                                    <span className="font-medium text-foreground">{email}</span>
                                </>
                            )}
                        </CardDescription>
                    </CardHeader>

                    {!isVerified && (
                        <>
                            <CardContent className="space-y-6 pt-6">
                                {/* OTP Input */}
                                <div className="space-y-4">
                                    <OtpInput
                                        value={otp}
                                        onChange={setOtp}
                                        disabled={isVerifying}
                                        autoFocus
                                    />

                                    <p className="text-xs text-muted-foreground text-center">
                                        {t.auth.verification?.codeExpiresIn || "Code expires in 15 minutes"}
                                    </p>
                                </div>

                                {/* Verify Button */}
                                <Button
                                    onClick={handleVerify}
                                    disabled={otp.length !== 6 || isVerifying}
                                    className="w-full"
                                    size="lg"
                                >
                                    {isVerifying ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            {t.auth.verification?.verifying || "Verifying..."}
                                        </>
                                    ) : (
                                        t.auth.verification?.verifyButton || "Verify Email"
                                    )}
                                </Button>
                            </CardContent>

                            <CardFooter className="flex flex-col gap-4 pt-2">
                                {/* Resend Button */}
                                <div className="text-center w-full">
                                    <p className="text-sm text-muted-foreground mb-2">
                                        {t.auth.verification?.didntReceiveCode || "Didn't receive the code?"}
                                    </p>
                                    <Button
                                        variant="outline"
                                        onClick={handleResend}
                                        disabled={countdown > 0 || isResending}
                                    >
                                        {isResending ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                {t.auth.verification?.sending || "Sending..."}
                                            </>
                                        ) : countdown > 0 ? (
                                            <>
                                                <RefreshCw className="mr-2 h-4 w-4" />
                                                {t.auth.verification?.resendIn?.replace('{seconds}', String(countdown)) || `Resend in ${countdown}s`}
                                            </>
                                        ) : (
                                            <>
                                                <RefreshCw className="mr-2 h-4 w-4" />
                                                {t.auth.verification?.resendCode || "Resend Code"}
                                            </>
                                        )}
                                    </Button>
                                </div>

                            </CardFooter>
                        </>
                    )}
                </Card>
            </motion.div>
            <Toaster />
        </div>
    );
}
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined;

export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("Processing authentication...");

    useEffect(() => {
        const handleCallback = async () => {
            const success = searchParams.get("success");
            const dataParam = searchParams.get("data");
            const error = searchParams.get("error");
            const completeProfile = searchParams.get("complete_profile");

            if (success === "true" && dataParam) {
                try {
                    // Decode and parse callback data
                    const data = JSON.parse(decodeURIComponent(dataParam));
                    const { user, access_token, refresh_token } = data;

                    // Set cookies di frontend (untuk cross-origin development)
                    Cookies.set("access_token", access_token, {
                        expires: 1 / 96, // 15 minutes
                        sameSite: "lax",
                        ...(COOKIE_DOMAIN && { domain: COOKIE_DOMAIN }),
                    });

                    Cookies.set("refresh_token", refresh_token, {
                        expires: 7, // 7 days
                        sameSite: "lax",
                        ...(COOKIE_DOMAIN && { domain: COOKIE_DOMAIN }),
                    });

                    // Save user to cookie
                    Cookies.set("user", JSON.stringify(user), {
                        expires: 7,
                        sameSite: "lax",
                        ...(COOKIE_DOMAIN && { domain: COOKIE_DOMAIN }),
                    });

                    setStatus("success");
                    setMessage("Login successful! Redirecting...");

                    toast.success("Welcome! You've been signed in with Google.", {
                        duration: 3000,
                        position: "top-center",
                    });

                    // Check if user needs to complete profile
                    if (completeProfile === "true") {
                        setTimeout(() => {
                            router.push("/user/profile?complete=true");
                        }, 1500);
                        return;
                    }

                    // Redirect based on role
                    setTimeout(() => {
                        if (user.role === "ADMIN") {
                            router.push("/admin/dashboard");
                        } else if (user.role === "OWNER") {
                            router.push("/owner/dashboard");
                        } else {
                            router.push("/");
                        }
                    }, 1500);
                } catch (err) {
                    console.error("Failed to parse callback data:", err);
                    setStatus("error");
                    setMessage("Failed to process authentication data");

                    setTimeout(() => {
                        router.push("/login?error=callback_failed");
                    }, 2000);
                }
            } else if (error) {
                setStatus("error");
                setMessage(decodeURIComponent(error));

                toast.error(`Authentication failed: ${decodeURIComponent(error)}`, {
                    duration: 5000,
                    position: "top-center",
                });

                setTimeout(() => {
                    router.push("/login");
                }, 2000);
            } else {
                setStatus("error");
                setMessage("Invalid callback parameters");

                setTimeout(() => {
                    router.push("/login");
                }, 2000);
            }
        };

        handleCallback();
    }, [searchParams, router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4"
            >
                {status === "loading" && (
                    <>
                        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                        <p className="text-lg text-muted-foreground">{message}</p>
                    </>
                )}

                {status === "success" && (
                    <>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                        >
                            <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
                        </motion.div>
                        <p className="text-lg font-medium text-green-600">{message}</p>
                    </>
                )}

                {status === "error" && (
                    <>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                        >
                            <XCircle className="h-12 w-12 mx-auto text-destructive" />
                        </motion.div>
                        <p className="text-lg font-medium text-destructive">{message}</p>
                        <p className="text-sm text-muted-foreground">Redirecting to login...</p>
                    </>
                )}
            </motion.div>
        </div>
    );
}
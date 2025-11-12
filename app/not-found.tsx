// app/not-found.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    const router = useRouter();
    const [countdown, setCountdown] = useState(10);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    router.push("/");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-muted/30 to-background px-4">
            <div className="max-w-2xl w-full text-center">
                {/* 404 Number Animation */}
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="mb-8"
                >
                    <h1 className="text-[110px] md:text-[150px] font-bold leading-none bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
                        404
                    </h1>
                </motion.div>

                {/* Message */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="space-y-4 mb-8"
                >
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                        Page Not Found
                    </h2>
                    <p className="text-muted-foreground text-base max-w-md mx-auto">
                        Sorry, we couldnt find the page youre looking for. The page might have been removed or the URL might be incorrect.
                    </p>
                </motion.div>

                {/* Countdown */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mb-8"
                >
                    <p className="text-sm text-muted-foreground">
                        Redirecting to home in{" "}
                        <span className="font-bold text-primary">{countdown}</span> seconds
                    </p>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="flex flex-col sm:flex-row gap-3 justify-center items-center"
                >
                    <Button asChild size="lg" className="min-w-[160px]">
                        <Link href="/" className="flex items-center gap-2">
                            <Home className="h-4 w-4" />
                            Back to Home
                        </Link>
                    </Button>

                    <Button asChild variant="outline" size="lg" className="min-w-[160px]">
                        <Link href="/search" className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Browse Products
                        </Link>
                    </Button>
                </motion.div>

                {/* Go Back Button */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className="mt-6"
                >
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Go Back
                    </Button>
                </motion.div>

                {/* Decorative Elements */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.1 }}
                    transition={{ duration: 1, delay: 1 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 pointer-events-none"
                >
                    <div className="w-[600px] h-[600px] rounded-full bg-primary blur-[150px]" />
                </motion.div>
            </div>
        </div>
    );
}
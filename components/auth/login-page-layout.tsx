"use client";

import { AnimatedImageSection } from "@/components/auth/animated-image-section";
import LoginForm from "@/components/auth/login-form";

export default function LoginPageLayout() {
    return (
        <div className="grid lg:grid-cols-2 min-h-screen">
            {/* Left Side - Animated Image Section (50%) */}
            <div className="hidden lg:block relative">
                <AnimatedImageSection />
            </div>

            {/* Right Side - Login Form (50%) */}
            <div className="flex items-center justify-center bg-background px-6 py-8">
                <LoginForm />
            </div>
        </div>
    );
}
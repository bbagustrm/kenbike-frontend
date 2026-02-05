// app/(auth)/login/page.tsx
import LoginForm from "@/components/auth/login-form";
import { LanguageSelector } from "@/components/ui/language-selector";

export default function LoginPage() {
    return (
        <div className="min-h-screen relative">
            {/* Language Selector - Top Right */}
            <div className="absolute top-4 right-4 z-10">
                <LanguageSelector variant="select" showLabel />
            </div>

            <LoginForm />
        </div>
    );
}
// app/(auth)/register/page.tsx
import RegisterForm from "@/components/auth/register-form";
import { LanguageSelector } from "@/components/ui/language-selector";

export default function RegisterPage() {
    return (
        <div className="min-h-screen relative">
            {/* Language Selector - Top Right */}
            <div className="absolute top-4 right-4 z-10">
                <LanguageSelector variant="select" showLabel />
            </div>

            <RegisterForm />
        </div>
    );
}
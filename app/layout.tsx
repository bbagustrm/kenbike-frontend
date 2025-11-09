// app/layout.tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";
import { Lato, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/auth-context";
import { TranslationProvider } from "@/contexts/translation-context";
import { CartProvider } from "@/contexts/cart-context";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { Toaster } from "sonner";
import "./globals.css";

const druk = localFont({
    src: "../public/fonts/Druk.woff",
    variable: "--font-display",
    display: "swap",
});

const lato = Lato({
    subsets: ["latin"],
    weight: ["300", "400", "700"],
    variable: "--font-body",
});

const jetbrains = JetBrains_Mono({
    subsets: ["latin"],
    weight: ["400", "600"],
    variable: "--font-mono",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Kenbike Store",
    description: "Quality bike components for cycling enthusiasts",
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="id" className={`${druk.variable} ${lato.variable} ${jetbrains.variable}`}>
        <body className="font-body bg-white text-foreground">
        <AuthProvider>
            <CartProvider>
                <TranslationProvider>
                    <SmoothScrollProvider>
                        {children}
                    </SmoothScrollProvider>
                    <Toaster position="top-right" />
                </TranslationProvider>
            </CartProvider>
        </AuthProvider>
        </body>
        </html>
    );
}
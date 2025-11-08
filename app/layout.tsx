import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Raleway, Poppins, JetBrains_Mono } from 'next/font/google';
import { AuthProvider } from "@/contexts/auth-context";
import { TranslationProvider } from "@/contexts/translation-context";
import "./globals.css";
import { Toaster } from 'sonner';
import {CartProvider} from "@/contexts/cart-context";

const raleway = Raleway({
    subsets: ['latin'],
    weight: ['600'],
    variable: '--display-family',
});
const poppins = Poppins({
    subsets: ['latin'],
    weight: ['400'],
    variable: '--body-family',
});
const jetbrains_mono = JetBrains_Mono({
    subsets: ['latin'],
    weight: ['400'],
    variable: '--font-mono',
});

export const metadata: Metadata = {
    title: "Kenbike Store",
    description: "Quality bike components for cycling enthusiasts",
};

export default function RootLayout({ children, }: Readonly<{
    children: ReactNode;
}>) {
    return (
        <html lang="id" >
        <body className={`${raleway.variable} ${poppins.variable} ${jetbrains_mono.variable}`}>
        <AuthProvider>
            <CartProvider>
                <TranslationProvider>
                    {children}
                    <Toaster position="top-right" />
                </TranslationProvider>
            </CartProvider>
        </AuthProvider>
        </body>
        </html>
    );
}
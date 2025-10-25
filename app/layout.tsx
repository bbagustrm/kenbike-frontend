import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/auth-context";
import { TranslationProvider } from "@/contexts/translation-context";
import "./globals.css";
import { Toaster } from 'sonner';

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Kenbike Store",
    description: "Quality bike components for cycling enthusiasts",
};

export default function RootLayout({ children, }: Readonly<{
    children: ReactNode;
}>) {
    return (
        <html lang="id" className="">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <TranslationProvider>
            <AuthProvider>
                {children}
                <Toaster position="top-right" />
            </AuthProvider>
        </TranslationProvider>
        </body>
        </html>
    );
}
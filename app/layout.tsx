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
    title: "Kenbike Store | Toko Komponen & Aksesoris Sepeda Terlengkap di Indonesia",
    description:
        "Belanja online komponen, sparepart, dan aksesoris sepeda terbaik hanya di Kenbike Store. Produk original, harga bersaing, dan pengiriman cepat ke seluruh Indonesia. Temukan perlengkapan sepeda roadbike, MTB, lipat, dan lainnya di sini!",
    keywords: [
        "toko sepeda online",
        "komponen sepeda",
        "sparepart sepeda",
        "aksesoris sepeda",
        "toko sepeda Indonesia",
        "Kenbike Store",
        "sepeda roadbike",
        "sepeda MTB",
        "aksesoris sepeda murah",
        "belanja sepeda online",
    ],
    authors: [{ name: "Kenbike Store", url: "https://kenbike.com" }],
    alternates: {
        canonical: "https://kenbike.com",
    },
    openGraph: {
        title: "Kenbike Store | Toko Komponen & Aksesoris Sepeda Terlengkap di Indonesia",
        description:
            "Kenbike Store adalah toko sepeda online terpercaya yang menyediakan sparepart dan aksesoris sepeda lengkap. Dapatkan produk terbaik untuk roadbike, MTB, dan sepeda lipat dengan harga bersaing.",
        url: "https://kenbike.com",
        siteName: "Kenbike Store",
        images: [
            {
                url: "https://kenbike.com/og-image.png",
                width: 1200,
                height: 630,
                alt: "Kenbike Store - Toko Komponen & Aksesoris Sepeda Online",
            },
        ],
        locale: "id_ID",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Kenbike Store | Toko Komponen & Aksesoris Sepeda Terlengkap di Indonesia",
        description:
            "Belanja sparepart dan aksesoris sepeda dengan harga terbaik di Kenbike Store. Kualitas original dan pengiriman cepat!",
        creator: "@kenbike",
        images: ["https://kenbike.com/og-image.jpg"],
    },
    metadataBase: new URL("https://kenbike.com"),
    category: "E-commerce Sepeda",
};


export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html
            lang="id"
            className={`${druk.variable} ${lato.variable} ${jetbrains.variable}`}
        >
        <head>
            <link rel="preconnect" href="https://api.kenbike.store" crossOrigin="" />
            <link rel="dns-prefetch" href="https://api.kenbike.store" />
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
            <title>Kenbike Store</title>
        </head>
        <body className="font-body bg-white text-foreground">
        <AuthProvider>
            <CartProvider>
                <TranslationProvider>
                    <SmoothScrollProvider>{children}</SmoothScrollProvider>
                    <Toaster position="top-right" />
                </TranslationProvider>
            </CartProvider>
        </AuthProvider>
        </body>
        </html>
    );
}

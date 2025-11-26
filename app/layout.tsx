// app/layout.tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/auth-context";
import { TranslationProvider } from "@/contexts/translation-context";
import { CartProvider } from "@/contexts/cart-context";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { Toaster } from "sonner";
import "./globals.css";

// Local Font - Akira Expanded
const akiraExpanded = localFont({
    src: "../public/fonts/Akira.woff2",
    variable: "--font-display",
    display: "swap",
    weight: "900",
});

// Google Font - Plus Jakarta Sans
const plusJakartaSans = Plus_Jakarta_Sans({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700", "800"],
    variable: "--font-body",
    display: "swap",
});

// Google Font - JetBrains Mono
const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-mono",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Kenbike Store | Komponen & Aksesoris Sepeda Berkualitas",
    description:
        "Toko online sepeda terpercaya. Temukan komponen, sparepart, dan aksesoris sepeda terbaik dengan harga bersaing di Kenbike Store!",
    alternates: {
        canonical: "https://kenbike.store/",
    },
    robots: {
        index: true,
        follow: true,
        nocache: false,
    },
    other: {
        "hreflang": "id-ID",
    },
    openGraph: {
        title: "Kenbike Store | Komponen & Aksesoris Sepeda Berkualitas",
        description:
            "Belanja komponen dan aksesoris sepeda berkualitas di Kenbike Store. Produk original dan harga bersaing.",
        url: "https://kenbike.store",
        siteName: "Kenbike Store",
        locale: "id_ID",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        site: "@KenbikeStore",
        creator: "@KenbikeStore",
        title: "Kenbike Store | Komponen & Aksesoris Sepeda Berkualitas",
        description:
            "Temukan komponen sepeda terbaik di Kenbike Store. Belanja mudah & cepat!",
        images: ["https://kenbike.store/og-image.jpg"],
    },
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html
            lang="id"
            className={`${akiraExpanded.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable}`}
        >
        <head>
            <link rel="preconnect" href="https://api.kenbike.store" crossOrigin="" />
            <link rel="dns-prefetch" href="https://api.kenbike.store" />
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
            <title>Kenbike Store</title>
        </head>
        <body className="font-body bg-background text-foreground">
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
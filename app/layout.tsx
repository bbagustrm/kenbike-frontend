// app/layout.tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";
import { JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/auth-context";
import { TranslationProvider } from "@/contexts/translation-context";
import { CartProvider } from "@/contexts/cart-context";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { OrderProvider } from "@/contexts/order-context";
import { Toaster } from "sonner";
import "./globals.css";
import { NotificationProvider } from "@/contexts/notification-context";

// Local Font - Clash Display (Headings)
const clashDisplay = localFont({
    src: [
        {
            path: "../public/fonts/ClashDisplay-Regular.woff2",
            weight: "400",
            style: "normal",
        },
        {
            path: "../public/fonts/ClashDisplay-Medium.woff2",
            weight: "500",
            style: "normal",
        },
        {
            path: "../public/fonts/ClashDisplay-Semibold.woff2",
            weight: "600",
            style: "normal",
        },
        {
            path: "../public/fonts/ClashDisplay-Bold.woff2",
            weight: "700",
            style: "normal",
        },
    ],
    variable: "--font-heading",
    display: "swap",
});

// Local Font - Satoshi (Body)
const satoshi = localFont({
    src: [
        {
            path: "../public/fonts/Satoshi-Light.woff2",
            weight: "300",
            style: "normal",
        },
        {
            path: "../public/fonts/Satoshi-Regular.woff2",
            weight: "400",
            style: "normal",
        },
        {
            path: "../public/fonts/Satoshi-Medium.woff2",
            weight: "500",
            style: "normal",
        },
        {
            path: "../public/fonts/Satoshi-Bold.woff2",
            weight: "700",
            style: "normal",
        },
        {
            path: "../public/fonts/Satoshi-Black.woff2",
            weight: "900",
            style: "normal",
        },
        {
            path: "../public/fonts/Satoshi-Italic.woff2",
            weight: "400",
            style: "italic",
        },
        {
            path: "../public/fonts/Satoshi-MediumItalic.woff2",
            weight: "500",
            style: "italic",
        },
        {
            path: "../public/fonts/Satoshi-BoldItalic.woff2",
            weight: "700",
            style: "italic",
        },
    ],
    variable: "--font-body",
    display: "swap",
});

// Google Font - JetBrains Mono (Code)
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
        hreflang: "id-ID",
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
            className={`${clashDisplay.variable} ${satoshi.variable} ${jetbrainsMono.variable}`}
        >
        <head>
            <link rel="preconnect" href="https://api.kenbike.store" crossOrigin="" />
            <link rel="dns-prefetch" href="https://api.kenbike.store" />
            <title>Kenbike Store | Komponen & Aksesoris Sepeda Berkualitas</title>
        </head>
        <body className="font-body text-foreground antialiased">
        <AuthProvider>
            <NotificationProvider>
                <CartProvider>
                    <OrderProvider>
                        <TranslationProvider>
                            <SmoothScrollProvider>{children}</SmoothScrollProvider>
                            <Toaster position="top-right" />
                        </TranslationProvider>
                    </OrderProvider>
                </CartProvider>
            </NotificationProvider>
        </AuthProvider>
        </body>
        </html>
    );
}
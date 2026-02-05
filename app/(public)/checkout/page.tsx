// app/(public)/checkout/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { Loader2, ShoppingCart } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";

export default function CheckoutPage() {
    const router = useRouter();
    const { t, locale } = useTranslation();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const {
        cart,
        guestCartWithDetails,
        cartItemsCount,
        isLoading: cartLoading,
    } = useCart();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login?redirect=/checkout");
        }
    }, [authLoading, isAuthenticated, router]);

    // Redirect to home if cart is empty
    useEffect(() => {
        if (!cartLoading && cartItemsCount === 0) {
            router.push("/");
        }
    }, [cartLoading, cartItemsCount, router]);

    if (authLoading || cartLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // Will redirect
    }

    if (cartItemsCount === 0) {
        return (
            <div className="container mx-auto px-4 py-12">
                <EmptyState
                    icon={<ShoppingCart className="h-10 w-10 text-muted-foreground" />}
                    title={t.cart?.cartEmpty || (locale === "id" ? "Keranjang Kosong" : "Cart is Empty")}
                    description={t.cart?.addProductsToCheckout || (locale === "id" ? "Tambahkan produk ke keranjang untuk melanjutkan checkout" : "Add products to cart to continue checkout")}
                />
                <div className="flex justify-center mt-6">
                    <Button onClick={() => router.push("/search")}>
                        {t.cart?.shopNow || (locale === "id" ? "Belanja Sekarang" : "Shop Now")}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/30">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold mb-2">
                        {t.checkout?.title || "Checkout"}
                    </h1>
                    <p className="text-muted-foreground">
                        {t.checkout?.description || (locale === "id" ? "Lengkapi informasi pengiriman dan pembayaran" : "Complete your shipping and payment information")}
                    </p>
                </motion.div>

                {/* Checkout Form */}
                <CheckoutForm />
            </div>
        </div>
    );
}
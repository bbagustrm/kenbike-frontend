// app/(public)/layout.tsx
import type { ReactNode } from "react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { PageTransition } from "@/components/transitions/page-transition";

export default function PublicLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <main className="flex-1">
                <PageTransition>
                    {children}
                </PageTransition>
            </main>
            <Footer />
        </div>
    );
}
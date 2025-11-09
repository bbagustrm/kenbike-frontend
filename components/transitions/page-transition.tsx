// components/transitions/page-transition.tsx
"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const pageVariants: Variants = {
    initial: {
        opacity: 0,
        y: 20,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: "easeInOut",
        },
    },
    exit: {
        opacity: 0,
        y: -20,
        transition: {
            duration: 0.3,
            ease: "easeInOut",
        },
    },
};

export function PageTransition({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
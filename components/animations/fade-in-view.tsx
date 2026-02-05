// components/animations/fade-in-view.tsx
"use client";

import { motion, useInView } from "framer-motion";
import { ReactNode, useRef } from "react";

interface FadeInViewProps {
    children: ReactNode;
    delay?: number;
    duration?: number;
    className?: string;
}

export function FadeInView({
    children,
    delay = 0,
    duration = 0.5,
    className = "",
}: FadeInViewProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={
                isInView
                    ? {
                        opacity: 1,
                        scale: 1,
                    }
                    : {}
            }
            transition={{
                duration,
                delay,
                ease: "easeOut",
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
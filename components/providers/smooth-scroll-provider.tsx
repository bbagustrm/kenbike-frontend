// components/providers/smooth-scroll-provider.tsx (OPTIMIZED)
"use client";

import { ReactNode, useEffect, useState } from "react";
import Lenis from "lenis";

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
    const [isEnabled, setIsEnabled] = useState(false);

    useEffect(() => {
        // Check if device is mobile or has reduced motion preference
        const isMobile = window.innerWidth < 768;
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Disable smooth scroll on mobile or if user prefers reduced motion
        if (isMobile || prefersReducedMotion) {
            setIsEnabled(false);
            return;
        }

        setIsEnabled(true);

        // Initialize Lenis with optimized settings
        const lenis = new Lenis({
            duration: 1.0, // Reduced from 1.2 for snappier feel
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: "vertical",
            smoothWheel: true,
            wheelMultiplier: 0.8, // Reduced for more control
            touchMultiplier: 1.5, // Reduced from 2
        });

        // Optimized RAF loop with throttling
        let rafId: number;
        let lastTime = 0;
        const targetFPS = 60;
        const frameTime = 1000 / targetFPS;

        function raf(time: number) {
            const deltaTime = time - lastTime;

            // Throttle to maintain 60fps max
            if (deltaTime >= frameTime) {
                lenis.raf(time);
                lastTime = time - (deltaTime % frameTime);
            }

            rafId = requestAnimationFrame(raf);
        }

        rafId = requestAnimationFrame(raf);

        // Cleanup
        return () => {
            cancelAnimationFrame(rafId);
            lenis.destroy();
        };
    }, []);

    return <>{children}</>;
}
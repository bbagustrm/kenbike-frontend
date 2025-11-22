"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface AnimatedButtonProps {
    children: React.ReactNode;
    type?: "button" | "submit" | "reset";
    variant?: "default" | "secondary" | "outline" | "ghost";
    disabled?: boolean;
    onClick?: () => void;
    className?: string;
}

export function AnimatedButton({
    children,
    type = "button",
    variant = "secondary",
    disabled,
    onClick,
    className,
}: AnimatedButtonProps) {
    const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const newRipple = { x, y, id: Date.now() };
        setRipples([...ripples, newRipple]);

        setTimeout(() => {
            setRipples((prev) => prev.filter((ripple) => ripple.id !== newRipple.id));
        }, 600);

        if (onClick) onClick();
    };

    return (
        <motion.div
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            className="relative overflow-hidden rounded-md"
        >
            <Button
                type={type}
                variant={variant}
                disabled={disabled}
                onClick={handleClick}
                className={`relative ${className}`}
            >
                {children}
                {ripples.map((ripple) => (
                    <motion.span
                        key={ripple.id}
                        className="absolute rounded-full bg-white/30"
                        style={{
                            left: ripple.x,
                            top: ripple.y,
                            width: 0,
                            height: 0,
                        }}
                        animate={{
                            width: 400,
                            height: 400,
                            opacity: [0.5, 0],
                            x: -200,
                            y: -200,
                        }}
                        transition={{ duration: 0.6 }}
                    />
                ))}
            </Button>
        </motion.div>
    );
}
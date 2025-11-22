"use client";

import { motion } from "framer-motion";

interface FloatingShapesProps {
    count?: number;
}

export function FloatingShapes({ count = 8 }: FloatingShapesProps) {
    const shapes = Array.from({ length: count }, (_, i) => ({
        id: i,
        size: Math.random() * 60 + 20,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: Math.random() * 10 + 10,
        delay: Math.random() * 2,
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {shapes.map((shape) => (
                <motion.div
                    key={shape.id}
                    className="absolute rounded-full"
                    style={{
                        width: shape.size,
                        height: shape.size,
                        left: `${shape.x}%`,
                        top: `${shape.y}%`,
                        background: shape.id % 3 === 0
                            ? "rgba(214, 255, 93, 0.15)" // secondary
                            : shape.id % 3 === 1
                                ? "rgba(255, 151, 39, 0.15)" // accent
                                : "rgba(10, 10, 10, 0.08)", // primary
                    }}
                    animate={{
                        y: [0, -30, 0],
                        x: [0, Math.random() * 20 - 10, 0],
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: shape.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: shape.delay,
                    }}
                />
            ))}
        </div>
    );
}
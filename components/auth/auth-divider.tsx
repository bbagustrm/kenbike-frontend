"use client";

import { motion } from "framer-motion";

interface AuthDividerProps {
    text?: string;
}

export function AuthDivider({ text = "or" }: AuthDividerProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="relative py-2"
        >
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-background px-4">
          {text}
        </span>
            </div>
        </motion.div>
    );
}
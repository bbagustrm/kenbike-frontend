"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

export function QuoteSection() {
    return (
        <section className="border-y border-border bg-muted/20 py-12 md:py-16 lg:py-20">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-4xl mx-auto text-center"
                >
                    <Quote className="h-12 w-12 md:h-16 md:w-16 text-primary mx-auto mb-6 opacity-60" />
                    <blockquote className="space-y-4">
                        <p className="text-xl md:text-2xl lg:text-3xl font-body text-foreground leading-relaxed">
                            {
                                `"Every journey begins with the right gear. At Kenbike, we believe in empowering riders
                            with quality components that transform ordinary rides into extraordinary adventures."`
                            }
                        </p>
                        <footer className="text-sm md:text-base text-muted-foreground font-medium pt-4">
                            — Ken
                        </footer>
                    </blockquote>
                </motion.div>
            </div>
        </section>
    );
}
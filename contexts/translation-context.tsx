"use client";

import { createContext, useState, useEffect, ReactNode } from "react";
import { id } from "@/locales/id";
import { en } from "@/locales/en";
import { Translation, Locale } from "@/types/translation";
import Cookies from "js-cookie";

interface TranslationContextType {
    t: Translation;
    locale: Locale;
    setLocale: (locale: Locale) => void;
}

export const TranslationContext = createContext<TranslationContextType | undefined>(
    undefined
);

const translations: Record<Locale, Translation> = {
    id,
    en,
};

/**
 * Detect user's preferred language based on:
 * 1. Cookie (if previously set)
 * 2. Browser language
 * 3. Default to Indonesian
 */
function detectLocale(): Locale {
    // Check cookie first
    const savedLocale = Cookies.get("locale");
    if (savedLocale === "id" || savedLocale === "en") {
        return savedLocale;
    }

    // Check browser language
    if (typeof window !== "undefined") {
        const browserLang = navigator.language.toLowerCase();

        // Check if browser language is English
        if (browserLang.startsWith("en")) {
            return "en";
        }

        // Check if browser language is Indonesian
        if (browserLang.startsWith("id")) {
            return "id";
        }
    }

    // Default to Indonesian
    return "id";
}

export function TranslationProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>("id");
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize locale on mount
    useEffect(() => {
        async function initialize() {
            // First, try to detect from cookie/browser
            const detectedLocale = detectLocale();

            // Optionally, you can also check country via IP
            // const country = await detectCountry();
            // if (country === "ID") {
            //   setLocaleState("id");
            // } else if (country === "US" || country === "GB") {
            //   setLocaleState("en");
            // } else {
            //   setLocaleState(detectedLocale);
            // }

            setLocaleState(detectedLocale);
            setIsInitialized(true);
        }

        initialize();
    }, []);

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
        // Save to cookie for 1 year
        Cookies.set("locale", newLocale, { expires: 365 });

        // Optional: Update HTML lang attribute for SEO
        if (typeof document !== "undefined") {
            document.documentElement.lang = newLocale;
        }
    };

    // Show loading or nothing until locale is initialized
    if (!isInitialized) {
        return null;
    }

    return (
        <TranslationContext.Provider
            value={{
                t: translations[locale],
                locale,
                setLocale,
            }}
        >
            {children}
        </TranslationContext.Provider>
    );
}
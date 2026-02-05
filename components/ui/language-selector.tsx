// components/ui/language-selector.tsx
"use client";

import Image from "next/image";
import { useTranslation } from "@/hooks/use-translation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LanguageSelectorProps {
    variant?: "select" | "buttons";
    className?: string;
    showLabel?: boolean;
}

export function LanguageSelector({
                                     variant = "select",
                                     className,
                                     showLabel = false
                                 }: LanguageSelectorProps) {
    const { locale, setLocale } = useTranslation();

    if (variant === "buttons") {
        return (
            <div className={cn("flex gap-2", className)}>
                <Button
                    variant={locale === "id" ? "outline" : "ghost"}
                    size="sm"
                    onClick={() => setLocale("id")}
                    className={cn(
                        "gap-2",
                        locale === "id" && "border-primary"
                    )}
                >
                    <Image
                        src="/ic-flag-id.webp"
                        alt="ID"
                        width={20}
                        height={14}
                        className="rounded-sm"
                    />
                    {showLabel && <span>Indonesia</span>}
                </Button>
                <Button
                    variant={locale === "en" ? "outline" : "ghost"}
                    size="sm"
                    onClick={() => setLocale("en")}
                    className={cn(
                        "gap-2",
                        locale === "en" && "border-primary"
                    )}
                >
                    <Image
                        src="/ic-flag-uk.webp"
                        alt="EN"
                        width={20}
                        height={14}
                        className="rounded-sm"
                    />
                    {showLabel && <span>English</span>}
                </Button>
            </div>
        );
    }

    return (
        <Select value={locale} onValueChange={(value) => setLocale(value as "id" | "en")}>
            <SelectTrigger className={cn("w-auto gap-2 border-none bg-transparent shadow-none", className)}>
                <Image
                    src={locale === "id" ? "/ic-flag-id.webp" : "/ic-flag-uk.webp"}
                    alt={locale === "id" ? "ID" : "EN"}
                    width={20}
                    height={14}
                    className="rounded-sm"
                />
                {showLabel && <span className="text-sm">{locale === "id" ? "Indonesia" : "English"}</span>}
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="id">
                    <div className="flex items-center gap-2">
                        <Image
                            src="/ic-flag-id.webp"
                            alt="ID"
                            width={20}
                            height={14}
                            className="rounded-sm"
                        />
                        <span>Indonesia</span>
                    </div>
                </SelectItem>
                <SelectItem value="en">
                    <div className="flex items-center gap-2">
                        <Image
                            src="/ic-flag-uk.webp"
                            alt="EN"
                            width={20}
                            height={14}
                            className="rounded-sm"
                        />
                        <span>English</span>
                    </div>
                </SelectItem>
            </SelectContent>
        </Select>
    );
}
// components/checkout/shipping-option-card.tsx
"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { ShippingOption } from "@/types/shipping";
import { Currency } from "@/types/payment";
import { formatCurrency } from "@/lib/format-currency";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, Globe, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ShippingOptionCardProps {
    option: ShippingOption;
    currency: Currency;
    selected: boolean;
    onSelect: () => void;
    disabled?: boolean;
}

// ── Courier logo mapping ────────────────────────────────────────────────────
// Images stored in public/ekspedisi/*.webp
// Fallback to courier name initials if image not found
const COURIER_LOGOS: Record<string, string> = {
    // Domestic (Biteship)
    jne:        "/ekspedisi/jne.webp",
    jnt:        "/ekspedisi/jnt.webp",
    "j&t":      "/ekspedisi/jnt.webp",
    sicepat:    "/ekspedisi/sicepat.webp",
    anteraja:   "/ekspedisi/anteraja.webp",
    lion:       "/ekspedisi/lion.webp",
    "lion parcel": "/ekspedisi/lion.webp",
    sap:        "/ekspedisi/sap.webp",
    ninja:      "/ekspedisi/ninja.webp",
    "ninja xpress": "/ekspedisi/ninja.webp",
    tiki:       "/ekspedisi/tiki.webp",
    pos:        "/ekspedisi/pos.webp",
    "pos indonesia": "/ekspedisi/pos.webp",
    rpx:        "/ekspedisi/rpx.webp",
    gosend:     "/ekspedisi/gosend.webp",
    grab:       "/ekspedisi/grab.webp",
    "grab express": "/ekspedisi/grab.webp",
    paxel:      "/ekspedisi/paxel.webp",
    ide:        "/ekspedisi/ide.webp",
    "id express": "/ekspedisi/ide.webp",
    // International
    dhl:        "/ekspedisi/dhl.webp",
    fedex:      "/ekspedisi/fedex.webp",
    ups:        "/ekspedisi/ups.webp",
    tnt:        "/ekspedisi/tnt.webp",
};

const getCourierLogo = (courierName: string): string | null => {
    const key = courierName.toLowerCase();
    // Exact match first
    if (COURIER_LOGOS[key]) return COURIER_LOGOS[key];
    // Partial match
    for (const [k, v] of Object.entries(COURIER_LOGOS)) {
        if (key.includes(k) || k.includes(key)) return v;
    }
    return null;
};

// Courier display name cleanup
const formatCourierName = (courier: string): string => {
    return courier
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
};

// Estimate display — uses estimatedDays: { min, max }
const formatEta = (estimatedDays: ShippingOption["estimatedDays"] | undefined): string | null => {
    if (!estimatedDays) return null;
    const { min, max } = estimatedDays;
    if (min === max) return `${min} day${min === 1 ? "" : "s"}`;
    return `${min}–${max} days`;
};

export function ShippingOptionCard({
                                       option,
                                       currency,
                                       selected,
                                       onSelect,
                                       disabled = false,
                                   }: ShippingOptionCardProps) {
    const courierKey = option.courier?.toLowerCase() || "";
    const logoSrc = getCourierLogo(courierKey);
    const displayName = option.courier ? formatCourierName(option.courier) : "International";
    const serviceName = option.service || option.zoneName || "";
    const eta = formatEta(option.estimatedDays);
    const isInternational = option.type === "INTERNATIONAL";

    // Track image load error to show fallback icon
    const [imgError, setImgError] = useState(false);

    return (
        <motion.button
            type="button"
            onClick={onSelect}
            disabled={disabled}
            whileTap={disabled ? undefined : { scale: 0.98 }}
            className={cn(
                "w-full text-left rounded-lg border-2 px-3 py-2.5 transition-all cursor-pointer",
                "flex items-center gap-3",
                selected
                    ? "border-2 border-border bg-primary/5"
                    : "border-none bg-background",
                disabled && "opacity-50 cursor-not-allowed"
            )}
        >
            {/* Logo / Icon */}
            <div className="shrink-0 w-12 h-8 flex items-center justify-center">
                {logoSrc && !imgError ? (
                    <Image
                        src={logoSrc}
                        alt={displayName}
                        width={48}
                        height={32}
                        className="w-full h-full object-contain"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="w-10 h-7 rounded bg-muted flex items-center justify-center">
                        {isInternational
                            ? <Globe className="h-4 w-4 text-muted-foreground" />
                            : <Truck className="h-4 w-4 text-muted-foreground" />
                        }
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-semibold truncate">{displayName}</span>
                    {serviceName && (
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-normal">
                            {serviceName}
                        </Badge>
                    )}
                </div>
                {eta && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        {eta}
                    </p>
                )}
            </div>

            {/* Price + check */}
            <div className="shrink-0 text-right flex flex-col items-end gap-1">
                <span className={cn(
                    "text-sm font-bold",
                    selected ? "text-primary" : "text-foreground"
                )}>
                    {formatCurrency(option.cost, currency)}
                </span>
                {selected && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                )}
            </div>
        </motion.button>
    );
}
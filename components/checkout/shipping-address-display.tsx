// components/checkout/shipping-address-display.tsx
"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Edit, AlertCircle, Phone, User } from "lucide-react";
import { isIndonesia } from "@/lib/countries";

interface ShippingAddressDisplayProps {
    disabled?: boolean;
}

export function ShippingAddressDisplay({ disabled = false }: ShippingAddressDisplayProps) {
    const router = useRouter();
    const { user } = useAuth();
    const { t, locale } = useTranslation();

    const isDomestic = isIndonesia(user?.country || "");
    const isAddressComplete = Boolean(
        user?.address && user?.city && user?.postal_code && user?.country
    );
    const needsProvince = isDomestic && !user?.province;
    const isComplete = isAddressComplete && !needsProvince;

    const recipientName = user ? `${user.first_name} ${user.last_name}`.trim() : "";

    const addressLine = [
        user?.address,
        user?.district,
        user?.city,
        user?.province,
        user?.postal_code,
    ].filter(Boolean).join(", ");

    if (!isComplete) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between gap-3">
                    <span className="text-sm">
                        {t.checkout?.addressIncomplete?.description || "Please complete your shipping address"}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push("/user/profile?tab=address")}
                        disabled={disabled}
                        className="shrink-0"
                    >
                        <Edit className="h-3.5 w-3.5 mr-1.5" />
                        {t.checkout?.addressIncomplete?.completeButton || "Complete"}
                    </Button>
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="flex items-start justify-between gap-4 p-3 rounded-lg border border-border bg-muted/30">
            {/* Left: icon */}
            <div className="mt-0.5 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="h-4 w-4 text-primary" />
            </div>

            {/* Center: address info */}
            <div className="flex-1 min-w-0 space-y-0.5">
                {/* Recipient + badge */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{recipientName}</span>
                    <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                        {isDomestic
                            ? (t.checkout?.domestic || "Domestic")
                            : (t.checkout?.international || "International")}
                    </Badge>
                </div>

                {/* Phone */}
                {user?.phone_number && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {user.phone_number}
                    </p>
                )}

                {/* Address */}
                <p className="text-xs text-muted-foreground line-clamp-2">{addressLine}</p>
            </div>

            {/* Right: edit button */}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/user/profile?tab=address")}
                disabled={disabled}
                className="shrink-0 h-8 w-8 text-muted-foreground hover:text-foreground"
                title={t.checkout?.edit || "Edit"}
            >
                <Edit className="h-3.5 w-3.5" />
            </Button>
        </div>
    );
}
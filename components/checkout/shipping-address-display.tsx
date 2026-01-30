// components/checkout/shipping-address-display.tsx
"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Phone, MapPin, Edit, AlertCircle } from "lucide-react";
import { isIndonesia } from "@/lib/countries";

interface ShippingAddressDisplayProps {
    disabled?: boolean;
}

export function ShippingAddressDisplay({ disabled = false }: ShippingAddressDisplayProps) {
    const router = useRouter();
    const { user } = useAuth();

    // Check if address is complete
    const isAddressComplete = Boolean(
        user?.address &&
        user?.city &&
        user?.postal_code &&
        user?.country
    );

    // For Indonesia, province is also required
    const isDomestic = isIndonesia(user?.country || "");
    const needsProvince = isDomestic && !user?.province;

    const isComplete = isAddressComplete && !needsProvince;

    // Format full address
    const formatAddress = () => {
        const parts = [
            user?.address,
            user?.district,
            user?.city,
            user?.province,
            user?.postal_code,
            user?.country,
        ].filter(Boolean);
        return parts.join(", ");
    };

    // Format recipient name
    const recipientName = user ? `${user.first_name} ${user.last_name}`.trim() : "";

    if (!isComplete) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                    <span>Please complete your shipping address to continue</span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push("/user/profile?tab=address")}
                        disabled={disabled}
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Complete Address
                    </Button>
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                        {/* Recipient Name */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Recipient</p>
                                <p className="font-semibold">{recipientName || "Not set"}</p>
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Phone className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Phone Number</p>
                                <p className="font-semibold">{user?.phone_number || "Not set"}</p>
                            </div>
                        </div>

                        <Separator />

                        {/* Address */}
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <MapPin className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-xs text-muted-foreground">Shipping Address</p>
                                    <Badge variant="outline" className="text-xs">
                                        {isDomestic ? "Domestic" : "International"}
                                    </Badge>
                                </div>
                                <p className="text-sm">{formatAddress()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Edit Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push("/user/profile?tab=address")}
                        disabled={disabled}
                        className="shrink-0"
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
// components/checkout/address-section.tsx
"use client";

import Link from 'next/link';
import { MapPin, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AddressSectionProps {
    user: {
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string | null;
        country: string;
        province: string | null;
        city: string | null;
        district: string | null;
        postalCode: string | null;
        address: string | null;
    };
    hasCompleteAddress: boolean;
}

export function AddressSection({ user, hasCompleteAddress }: AddressSectionProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Shipping Address
                </CardTitle>
                <Button variant="outline" size="sm" asChild>
                    <Link href="/user/profile">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                {!hasCompleteAddress ? (
                    <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                            Please complete your address to continue checkout.
                        </p>
                        <Button asChild>
                            <Link href="/user/profile">
                                Complete Address
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div>
                            <p className="font-semibold text-lg">
                                {user.firstName} {user.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            {user.phoneNumber && (
                                <p className="text-sm text-muted-foreground">{user.phoneNumber}</p>
                            )}
                        </div>

                        <div className="pt-2 border-t">
                            <p className="text-sm">{user.address}</p>
                            {user.district && (
                                <p className="text-sm text-muted-foreground">
                                    {user.district}, {user.city}
                                </p>
                            )}
                            {user.province && (
                                <p className="text-sm text-muted-foreground">
                                    {user.province}, {user.postalCode}
                                </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline">{user.country}</Badge>
                                {user.country === 'Indonesia' && (
                                    <Badge variant="secondary">Domestic</Badge>
                                )}
                                {user.country !== 'Indonesia' && (
                                    <Badge variant="secondary">International</Badge>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
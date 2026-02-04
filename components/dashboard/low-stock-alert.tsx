// components/dashboard/low-stock-alert.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LowStockProduct } from "@/types/analytics";
import { AlertTriangle, Package, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface LowStockAlertProps {
    data: LowStockProduct[];
    className?: string;
}

export function LowStockAlert({ data, className }: LowStockAlertProps) {
    const getStockBadgeVariant = (stock: number) => {
        if (stock === 0) return 'destructive';
        if (stock <= 2) return 'destructive';
        return 'outline';
    };

    return (
        <Card className={cn("", className)}>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    Stok Menipis
                    {data.length > 0 && (
                        <Badge variant="destructive" className="ml-2">
                            {data.length}
                        </Badge>
                    )}
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/admin/products?lowStock=true" className="flex items-center gap-1">
                        Kelola
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {data.map((item) => (
                        <div
                            key={item.variant_id}
                            className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100"
                        >
                            {/* Product Image */}
                            <div className="relative w-10 h-10 rounded overflow-hidden bg-muted flex-shrink-0">
                                {item.image ? (
                                    <Image
                                        src={item.image}
                                        alt={item.product_name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Package className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                                <Link
                                    href={`/admin/products/${item.product_id}/edit`}
                                    className="font-medium text-sm hover:underline truncate block"
                                >
                                    {item.product_name}
                                </Link>
                                <p className="text-xs text-muted-foreground truncate">
                                    {item.variant_name} • {item.sku}
                                </p>
                            </div>

                            {/* Stock */}
                            <Badge
                                variant={getStockBadgeVariant(item.stock)}
                                className="flex-shrink-0"
                            >
                                {item.stock === 0 ? 'Habis' : `${item.stock} unit`}
                            </Badge>
                        </div>
                    ))}

                    {data.length === 0 && (
                        <div className="text-center py-6 text-muted-foreground">
                            <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Semua stok aman!</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
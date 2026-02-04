// components/dashboard/top-products-table.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TopProduct } from "@/types/analytics";
import { Star, TrendingUp, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TopProductsTableProps {
    data: TopProduct[];
    title?: string;
    showRevenue?: boolean;
    className?: string;
}

export function TopProductsTable({
                                     data,
                                     title = "Produk Terlaris",
                                     showRevenue = true,
                                     className,
                                 }: TopProductsTableProps) {
    const formatCurrency = (value: number) => {
        if (value >= 1000000) {
            return `Rp ${(value / 1000000).toFixed(1)}Jt`;
        }
        return `Rp ${value.toLocaleString('id-ID')}`;
    };

    return (
        <Card className={cn("", className)}>
            <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {data.map((product, index) => (
                        <div
                            key={product.id}
                            className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                            {/* Rank */}
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                                index === 0 && "bg-yellow-100 text-yellow-700",
                                index === 1 && "bg-gray-100 text-gray-700",
                                index === 2 && "bg-orange-100 text-orange-700",
                                index > 2 && "bg-muted text-muted-foreground"
                            )}>
                                {index + 1}
                            </div>

                            {/* Product Image */}
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                {product.image ? (
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                        No img
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                                <Link
                                    href={`/admin/products/${product.id}/edit`}
                                    className="font-medium text-sm hover:underline truncate block"
                                >
                                    {product.name}
                                </Link>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="secondary" className="text-xs">
                                        {product.category}
                                    </Badge>
                                    {product.avg_rating && (
                                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                            {product.avg_rating.toFixed(1)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="text-right flex-shrink-0">
                                <p className="text-sm font-semibold">
                                    {product.total_sold} terjual
                                </p>
                                {showRevenue && (
                                    <p className="text-xs text-muted-foreground">
                                        {formatCurrency(product.estimated_revenue_idr)}
                                    </p>
                                )}
                                <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground mt-1">
                                    <Eye className="h-3 w-3" />
                                    {product.total_views.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    ))}

                    {data.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            Belum ada data produk
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
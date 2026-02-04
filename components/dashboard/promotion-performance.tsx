// components/dashboard/promotion-performance.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PromotionPerformance } from "@/types/analytics";
import { Tag, Clock, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PromotionPerformanceCardProps {
    data: PromotionPerformance[];
    className?: string;
}

export function PromotionPerformanceCard({ data, className }: PromotionPerformanceCardProps) {
    const formatCurrency = (value: number) => {
        if (value >= 1000000) {
            return `Rp ${(value / 1000000).toFixed(1)}Jt`;
        }
        return `Rp ${value.toLocaleString('id-ID')}`;
    };

    return (
        <Card className={cn("", className)}>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Tag className="h-5 w-5 text-purple-500" />
                    Performa Promosi
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/owner/promotions" className="flex items-center gap-1">
                        Kelola
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {data.map((promo) => {
                        const progress = Math.max(0, Math.min(100, (1 - promo.days_remaining / 30) * 100));

                        return (
                            <div
                                key={promo.id}
                                className="p-4 rounded-lg border bg-gradient-to-r from-purple-50 to-pink-50"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h4 className="font-medium">{promo.name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="secondary">
                                                {promo.discount_percentage} OFF
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {promo.product_count} produk
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-1 text-amber-600">
                                            <Clock className="h-4 w-4" />
                                            <span className="text-sm font-medium">
                                                {promo.days_remaining} hari lagi
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3 mt-3 text-center">
                                    <div>
                                        <p className="text-lg font-bold text-green-600">
                                            {promo.total_sold}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Terjual</p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-blue-600">
                                            {formatCurrency(promo.potential_revenue)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Revenue</p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-purple-600">
                                            {formatCurrency(promo.discount_given)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Diskon</p>
                                    </div>
                                </div>

                                <div className="mt-3">
                                    <Progress value={progress} className="h-1.5" />
                                </div>
                            </div>
                        );
                    })}

                    {data.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            <Tag className="h-10 w-10 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Tidak ada promosi aktif</p>
                            <Button variant="outline" size="sm" className="mt-3" asChild>
                                <Link href="/owner/promotions/new">Buat Promosi</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
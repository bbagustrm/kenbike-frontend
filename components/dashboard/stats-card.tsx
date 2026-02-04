// components/dashboard/stats-card.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        label?: string;
    };
    className?: string;
    valueClassName?: string;
}

export function StatsCard({
                              title,
                              value,
                              subtitle,
                              icon: Icon,
                              trend,
                              className,
                              valueClassName,
                          }: StatsCardProps) {
    const getTrendIcon = () => {
        if (!trend) return null;
        if (trend.value > 0) return <TrendingUp className="h-3 w-3" />;
        if (trend.value < 0) return <TrendingDown className="h-3 w-3" />;
        return <Minus className="h-3 w-3" />;
    };

    const getTrendColor = () => {
        if (!trend) return "";
        if (trend.value > 0) return "text-green-600";
        if (trend.value < 0) return "text-red-600";
        return "text-gray-500";
    };

    return (
        <Card className={cn("", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className={cn("text-2xl font-bold", valueClassName)}>
                    {value}
                </div>
                <div className="flex items-center gap-2 mt-1">
                    {trend && (
                        <span className={cn("flex items-center gap-1 text-xs font-medium", getTrendColor())}>
                            {getTrendIcon()}
                            {trend.value > 0 ? "+" : ""}{trend.value}%
                        </span>
                    )}
                    {subtitle && (
                        <span className="text-xs text-muted-foreground">
                            {subtitle}
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
// components/dashboard/revenue-chart.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { RevenueChartData } from "@/types/analytics";
import { cn } from "@/lib/utils";

interface RevenueChartProps {
    data: RevenueChartData[];
    period: string;
    onPeriodChange?: (period: '7days' | '30days' | '90days' | '12months') => void;
    showPeriodSelector?: boolean;
    className?: string;
}

const periodOptions = [
    { value: '7days', label: '7 Hari' },
    { value: '30days', label: '30 Hari' },
    { value: '90days', label: '90 Hari' },
    { value: '12months', label: '12 Bulan' },
] as const;

export function RevenueChart({
                                 data,
                                 period,
                                 onPeriodChange,
                                 showPeriodSelector = true,
                                 className,
                             }: RevenueChartProps) {
    const formatCurrency = (value: number, currency: 'IDR' | 'USD' = 'IDR') => {
        if (currency === 'USD') {
            return `$${value.toLocaleString('en-US')}`;
        }
        // Shorten large IDR numbers
        if (value >= 1000000000) {
            return `Rp ${(value / 1000000000).toFixed(1)}M`;
        }
        if (value >= 1000000) {
            return `Rp ${(value / 1000000).toFixed(1)}Jt`;
        }
        if (value >= 1000) {
            return `Rp ${(value / 1000).toFixed(0)}Rb`;
        }
        return `Rp ${value.toLocaleString('id-ID')}`;
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border rounded-lg shadow-lg">
                    <p className="font-medium text-sm mb-2">{formatDate(label)}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: {entry.name === 'IDR'
                            ? formatCurrency(entry.value, 'IDR')
                            : formatCurrency(entry.value, 'USD')
                        }
                        </p>
                    ))}
                    <p className="text-sm text-muted-foreground mt-1">
                        Orders: {payload[0]?.payload?.orders || 0}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card className={cn("", className)}>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Trend Revenue</CardTitle>
                {showPeriodSelector && onPeriodChange && (
                    <div className="flex gap-1">
                        {periodOptions.map((opt) => (
                            <Button
                                key={opt.value}
                                variant={period === opt.value ? "default" : "ghost"}
                                size="sm"
                                onClick={() => onPeriodChange(opt.value)}
                                className="text-xs px-2 py-1 h-7"
                            >
                                {opt.label}
                            </Button>
                        ))}
                    </div>
                )}
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatDate}
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => formatCurrency(value)}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="idr"
                                name="IDR"
                                stroke="#2563eb"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="usd"
                                name="USD"
                                stroke="#16a34a"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
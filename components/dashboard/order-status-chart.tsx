// components/dashboard/order-status-chart.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Legend,
    Tooltip,
} from "recharts";
import { OrderStatusDistribution } from "@/types/analytics";
import { cn } from "@/lib/utils";

interface OrderStatusChartProps {
    data: OrderStatusDistribution[];
    className?: string;
}

const STATUS_COLORS: Record<string, string> = {
    PENDING: '#f59e0b',
    PAID: '#3b82f6',
    PROCESSING: '#8b5cf6',
    SHIPPED: '#06b6d4',
    DELIVERED: '#22c55e',
    COMPLETED: '#10b981',
    CANCELLED: '#ef4444',
    FAILED: '#dc2626',
};

const STATUS_LABELS: Record<string, string> = {
    PENDING: 'Menunggu Bayar',
    PAID: 'Dibayar',
    PROCESSING: 'Diproses',
    SHIPPED: 'Dikirim',
    DELIVERED: 'Terkirim',
    COMPLETED: 'Selesai',
    CANCELLED: 'Dibatalkan',
    FAILED: 'Gagal',
};

export function OrderStatusChart({ data, className }: OrderStatusChartProps) {
    const chartData = data.map(item => ({
        name: STATUS_LABELS[item.status] || item.status,
        value: item.count,
        status: item.status,
    }));

    const total = data.reduce((sum, item) => sum + item.count, 0);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const item = payload[0].payload;
            const percentage = ((item.value / total) * 100).toFixed(1);
            return (
                <div className="bg-white p-3 border rounded-lg shadow-lg">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                        {item.value} order ({percentage}%)
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card className={cn("", className)}>
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Status Order</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={STATUS_COLORS[entry.status] || '#6b7280'}
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                layout="horizontal"
                                verticalAlign="bottom"
                                align="center"
                                wrapperStyle={{ fontSize: '12px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="text-center mt-2">
                    <p className="text-2xl font-bold">{total}</p>
                    <p className="text-sm text-muted-foreground">Total Order</p>
                </div>
            </CardContent>
        </Card>
    );
}
// components/admin/order/order-management-table.tsx
"use client";

import { useRouter } from "next/navigation";
import { OrderListItem } from "@/types/order";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrderStatusBadge } from "@/components/order/order-status-badge";
import { formatCurrency } from "@/lib/format-currency";
import { Eye, ExternalLink } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PackageOpen } from "lucide-react";

interface OrderManagementTableProps {
    orders: OrderListItem[];
    isLoading?: boolean;
}

export function OrderManagementTable({
                                         orders,
                                         isLoading,
                                     }: OrderManagementTableProps) {
    const router = useRouter();

    if (isLoading) {
        return (
            <div className="border rounded-lg">
                <div className="h-96 flex items-center justify-center">
                    <div className="animate-pulse space-y-4 w-full p-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-16 bg-muted rounded" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="border rounded-lg p-8">
                <EmptyState
                    icon={<PackageOpen className="h-10 w-10 text-muted-foreground" />}
                    title="No orders found"
                    description="No orders match your current filters"
                />
            </div>
        );
    }

    return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Order Number</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Shipping</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.map((order) => (
                        <TableRow
                            key={order.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() =>
                                router.push(`/admin/orders/${order.order_number}`)
                            }
                        >
                            {/* Order Number - snake_case */}
                            <TableCell className="font-mono text-sm font-medium">
                                #{order.order_number}
                            </TableCell>

                            {/* Customer - snake_case nested */}
                            <TableCell>
                                <div>
                                    <p className="font-medium text-sm">
                                        {order.shipping.recipient_name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {order.shipping.city}, {order.shipping.country}
                                    </p>
                                </div>
                            </TableCell>

                            {/* Date - snake_case */}
                            <TableCell>
                                <div className="text-sm">
                                    <p>
                                        {new Date(order.created_at).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(order.created_at).toLocaleTimeString("en-US", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                </div>
                            </TableCell>

                            {/* Items - snake_case */}
                            <TableCell>
                                <Badge variant="secondary">{order.items_count} items</Badge>
                            </TableCell>

                            {/* Shipping - snake_case nested */}
                            <TableCell>
                                <div className="text-sm">
                                    <p className="font-medium capitalize">
                                        {order.shipping.type.toLowerCase()}
                                    </p>
                                    <p className="text-xs text-muted-foreground line-clamp-1">
                                        {order.shipping.method}
                                    </p>
                                    {order.tracking_number && (
                                        <p className="text-xs text-muted-foreground font-mono">
                                            {order.tracking_number}
                                        </p>
                                    )}
                                </div>
                            </TableCell>

                            {/* Total */}
                            <TableCell>
                                <p className="font-semibold">
                                    {formatCurrency(order.total, order.currency)}
                                </p>
                                {order.discount > 0 && (
                                    <p className="text-xs text-green-600">
                                        -{formatCurrency(order.discount, order.currency)} saved
                                    </p>
                                )}
                            </TableCell>

                            {/* Status */}
                            <TableCell>
                                <OrderStatusBadge status={order.status} />
                            </TableCell>

                            {/* Actions - snake_case */}
                            <TableCell className="text-right">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/admin/orders/${order.order_number}`);
                                    }}
                                >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
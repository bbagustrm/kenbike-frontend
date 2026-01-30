// components/admin/order/order-status-updater.tsx
"use client";

import { useState } from "react";
import { Order, OrderStatus } from "@/types/order";
import { OrderService } from "@/services/order.service";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Edit, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface OrderStatusUpdaterProps {
    order: Order;
    onUpdate?: () => void;
}

const STATUS_OPTIONS: Array<{ value: OrderStatus; label: string; description: string }> = [
    {
        value: "PENDING",
        label: "Pending Payment",
        description: "Order awaiting payment",
    },
    {
        value: "PAID",
        label: "Paid",
        description: "Payment confirmed",
    },
    {
        value: "PROCESSING",
        label: "Processing",
        description: "Order is being prepared",
    },
    {
        value: "SHIPPED",
        label: "Shipped",
        description: "Order has been shipped",
    },
    {
        value: "DELIVERED",
        label: "Delivered",
        description: "Order delivered to customer",
    },
    {
        value: "COMPLETED",
        label: "Completed",
        description: "Order completed successfully",
    },
    {
        value: "CANCELLED",
        label: "Cancelled",
        description: "Order cancelled",
    },
    {
        value: "FAILED",
        label: "Failed",
        description: "Order failed",
    },
];

export function OrderStatusUpdater({ order, onUpdate }: OrderStatusUpdaterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [newStatus, setNewStatus] = useState<OrderStatus>(order.status);
    // ✅ snake_case: tracking_number
    const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || "");

    // ✅ snake_case: shipping.type
    const requiresTracking =
        newStatus === "SHIPPED" &&
        order.shipping.type === "INTERNATIONAL" &&
        !trackingNumber;

    const handleUpdate = async () => {
        if (requiresTracking) {
            toast.error("Tracking number is required for international shipments");
            return;
        }

        setIsLoading(true);

        try {
            // ✅ snake_case: order_number, tracking_number in DTO
            await OrderService.updateOrderStatus(order.order_number, {
                status: newStatus,
                tracking_number: trackingNumber || undefined,
            });

            toast.success("Order status updated successfully");
            setIsOpen(false);
            onUpdate?.();
        } catch (error) {
            console.error("Failed to update order status:", error);
            toast.error(
                error instanceof Error ? error.message : "Failed to update order status"
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Update Status
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Order Status</DialogTitle>
                    <DialogDescription>
                        {/* ✅ snake_case: order_number */}
                        Change the status of order #{order.order_number}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Current Status */}
                    <div className="space-y-2">
                        <Label>Current Status</Label>
                        <div className="p-3 bg-muted rounded-md">
                            <p className="font-medium capitalize">{order.status.toLowerCase()}</p>
                        </div>
                    </div>

                    {/* New Status */}
                    <div className="space-y-2">
                        <Label htmlFor="status">New Status</Label>
                        <Select
                            value={newStatus}
                            onValueChange={(value) => setNewStatus(value as OrderStatus)}
                        >
                            <SelectTrigger id="status">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {STATUS_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        <div>
                                            <p className="font-medium">{option.label}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {option.description}
                                            </p>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Tracking Number (for SHIPPED status) */}
                    {newStatus === "SHIPPED" && (
                        <div className="space-y-2">
                            <Label htmlFor="tracking">
                                Tracking Number
                                {/* ✅ snake_case: shipping.type */}
                                {order.shipping.type === "INTERNATIONAL" && (
                                    <span className="text-destructive ml-1">*</span>
                                )}
                            </Label>
                            <Input
                                id="tracking"
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                                placeholder="Enter tracking number"
                            />
                            {order.shipping.type === "INTERNATIONAL" && (
                                <p className="text-xs text-muted-foreground">
                                    Required for international shipments
                                </p>
                            )}
                        </div>
                    )}

                    {/* Warnings */}
                    {newStatus === "SHIPPED" && order.shipping.type === "DOMESTIC" && (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                For domestic orders, tracking will be automatically provided by Biteship
                                when the order is created in their system.
                            </AlertDescription>
                        </Alert>
                    )}

                    {newStatus === "CANCELLED" || newStatus === "FAILED" ? (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                This action will mark the order as {newStatus.toLowerCase()}. This
                                cannot be easily undone.
                            </AlertDescription>
                        </Alert>
                    ) : null}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpdate}
                        disabled={isLoading || newStatus === order.status || requiresTracking}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            "Update Status"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
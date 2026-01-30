// components/admin/order/order-actions-admin.tsx
"use client";

import { useState } from "react";
import { Order } from "@/types/order";
import { OrderService } from "@/services/order.service";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    MoreVertical,
    RefreshCw,
    FileText,
    Download,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface OrderActionsAdminProps {
    order: Order;
    onUpdate?: () => void;
}

export function OrderActionsAdmin({ order, onUpdate }: OrderActionsAdminProps) {
    const [isRetrying, setIsRetrying] = useState(false);
    const [showRetryDialog, setShowRetryDialog] = useState(false);

    // ✅ snake_case: shipping.type, biteship_order_id
    const canRetryBiteship =
        order.shipping.type === "DOMESTIC" &&
        !order.biteship_order_id &&
        (order.status === "PAID" || order.status === "PROCESSING");

    // ✅ snake_case: biteship_order_id, tracking_number
    const canDownloadLabel =
        order.shipping.type === "DOMESTIC" &&
        order.biteship_order_id &&
        order.tracking_number;

    const handleRetryBiteship = async () => {
        setIsRetrying(true);
        try {
            // ✅ snake_case: order_number
            const result = await OrderService.retryBiteshipCreation(order.order_number);

            toast.success("Biteship order created successfully", {
                description: `Tracking: ${result.data.tracking_number}`,
            });

            setShowRetryDialog(false);
            onUpdate?.();
        } catch (error) {
            console.error("Failed to retry Biteship creation:", error);
            toast.error(
                error instanceof Error ? error.message : "Failed to create Biteship order"
            );
        } finally {
            setIsRetrying(false);
        }
    };

    const handleDownloadLabel = async () => {
        try {
            toast.info("Opening shipping label...");
            // ✅ snake_case: order_number
            await OrderService.downloadShippingLabel(order.order_number);
        } catch (error) {
            console.error("Failed to download label:", error);
            toast.error("Failed to download shipping label");
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Order Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {canRetryBiteship && (
                        <DropdownMenuItem onClick={() => setShowRetryDialog(true)}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Retry Biteship Creation
                        </DropdownMenuItem>
                    )}

                    {canDownloadLabel && (
                        <DropdownMenuItem onClick={handleDownloadLabel}>
                            <Download className="h-4 w-4 mr-2" />
                            Download Shipping Label
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuItem
                        onClick={() => {
                            // ✅ snake_case: order_number
                            navigator.clipboard.writeText(order.order_number);
                            toast.success("Order number copied to clipboard");
                        }}
                    >
                        <FileText className="h-4 w-4 mr-2" />
                        Copy Order Number
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Retry Biteship Dialog */}
            <AlertDialog open={showRetryDialog} onOpenChange={setShowRetryDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Retry Biteship Order Creation?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will attempt to create a Biteship order for this shipment. A
                            tracking number will be generated if successful.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isRetrying}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleRetryBiteship();
                            }}
                            disabled={isRetrying}
                        >
                            {isRetrying ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Retry Creation"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
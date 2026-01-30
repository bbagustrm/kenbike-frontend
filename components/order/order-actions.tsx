// components/order/order-actions.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Order } from "@/types/order";
import { OrderService } from "@/services/order.service";
import { useOrder } from "@/contexts/order-context";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { XCircle, Loader2, ArrowLeft, PackageCheck } from "lucide-react";
import { toast } from "sonner";
import { WhatsAppSupportButton } from "./whatsapp-support-button";

interface OrderActionsProps {
    order: Order;
    onUpdate?: () => void;
}

export function OrderActions({ order, onUpdate }: OrderActionsProps) {
    const router = useRouter();
    const { cancelOrder } = useOrder();

    // Cancel states
    const [isCancelling, setIsCancelling] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

    // Confirm delivery states
    const [isConfirming, setIsConfirming] = useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

    // User can only cancel PENDING or FAILED orders
    const canCancel = order.status === "PENDING" || order.status === "FAILED";

    // User can confirm receipt when order is DELIVERED
    const canConfirmDelivery = order.status === "DELIVERED";

    // Show WhatsApp support for active orders (not completed/cancelled)
    const showSupport = order.status !== "COMPLETED" && order.status !== "CANCELLED";

    const handleCancel = async () => {
        if (!cancelReason.trim()) {
            toast.error("Please provide a reason for cancellation");
            return;
        }

        setIsCancelling(true);
        try {
            await cancelOrder(order.order_number, cancelReason);
            setIsCancelDialogOpen(false);
            toast.success("Order cancelled successfully");

            // Redirect to orders list
            setTimeout(() => {
                router.push("/user/orders");
            }, 1500);
        } catch (error) {
            console.error("Failed to cancel order:", error);
        } finally {
            setIsCancelling(false);
        }
    };

    const handleConfirmDelivery = async () => {
        setIsConfirming(true);
        try {
            const result = await OrderService.confirmDelivery(order.order_number);
            setIsConfirmDialogOpen(false);
            toast.success(result.message);

            // Refresh order data
            if (onUpdate) {
                onUpdate();
            }
        } catch (error) {
            console.error("Failed to confirm delivery:", error);
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Failed to confirm delivery");
            }
        } finally {
            setIsConfirming(false);
        }
    };

    return (
        <div className="flex flex-col sm:flex-row gap-3">
            {/* Back to Orders */}
            <Button
                variant="outline"
                onClick={() => router.push("/user/orders")}
                className="flex-1 sm:flex-initial"
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
            </Button>

            {/* Confirm Receipt - Shows when DELIVERED */}
            {canConfirmDelivery && (
                <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                    <AlertDialogTrigger asChild>
                        <Button variant="default" className="flex-1 sm:flex-initial">
                            <PackageCheck className="h-4 w-4 mr-2" />
                            Confirm Receipt
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Order Received?</AlertDialogTitle>
                            <AlertDialogDescription>
                                By confirming, you acknowledge that you have received your order
                                and it is in good condition. This will mark the order as completed.
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <div className="py-4 space-y-3">
                            <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Order Number:</span>
                                    <span className="font-mono font-medium">{order.order_number}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Items:</span>
                                    <span className="font-medium">{order.items.length} item(s)</span>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                💡 If there&apos;s any issue with your order, please contact support
                                before confirming receipt.
                            </p>
                        </div>

                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isConfirming}>
                                Not Yet
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleConfirmDelivery();
                                }}
                                disabled={isConfirming}
                            >
                                {isConfirming ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Confirming...
                                    </>
                                ) : (
                                    <>
                                        <PackageCheck className="h-4 w-4 mr-2" />
                                        Yes, I Received It
                                    </>
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}

            {/* Cancel Order */}
            {canCancel && (
                <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="flex-1 sm:flex-initial">
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancel Order
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to cancel this order? This action cannot be
                                undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <div className="space-y-2 py-4">
                            <Label htmlFor="cancel-reason">
                                Reason for cancellation (required)
                            </Label>
                            <Textarea
                                id="cancel-reason"
                                placeholder="Please tell us why you're cancelling this order..."
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                rows={4}
                                disabled={isCancelling}
                            />
                        </div>

                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isCancelling}>
                                Keep Order
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleCancel();
                                }}
                                disabled={isCancelling || !cancelReason.trim()}
                                className="bg-destructive hover:bg-destructive/90"
                            >
                                {isCancelling ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Cancelling...
                                    </>
                                ) : (
                                    "Cancel Order"
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}

            {/* WhatsApp Support - Shows for active orders */}
            {showSupport && (
                <WhatsAppSupportButton
                    order={order}
                    variant="outline"
                    className="flex-1 sm:flex-initial"
                />
            )}
        </div>
    );
}
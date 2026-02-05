// components/order/order-actions.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Order } from "@/types/order";
import { OrderService } from "@/services/order.service";
import { useOrder } from "@/contexts/order-context";
import { useTranslation } from "@/hooks/use-translation";
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
    const { t, locale } = useTranslation();

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
            toast.error(t.orders?.actions?.provideCancelReason || (locale === "id" ? "Mohon berikan alasan pembatalan" : "Please provide a reason for cancellation"));
            return;
        }

        setIsCancelling(true);
        try {
            await cancelOrder(order.order_number, cancelReason);
            setIsCancelDialogOpen(false);
            toast.success(t.orders?.actions?.orderCancelled || (locale === "id" ? "Pesanan berhasil dibatalkan" : "Order cancelled successfully"));

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
                toast.error(locale === "id" ? "Gagal mengonfirmasi penerimaan" : "Failed to confirm delivery");
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
                {t.orders?.actions?.backToOrders || (locale === "id" ? "Kembali ke Pesanan" : "Back to Orders")}
            </Button>

            {/* Confirm Receipt - Shows when DELIVERED */}
            {canConfirmDelivery && (
                <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                    <AlertDialogTrigger asChild>
                        <Button variant="default" className="flex-1 sm:flex-initial">
                            <PackageCheck className="h-4 w-4 mr-2" />
                            {t.orders?.actions?.confirmReceipt || (locale === "id" ? "Konfirmasi Penerimaan" : "Confirm Receipt")}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {t.orders?.actions?.confirmReceiptTitle || (locale === "id" ? "Konfirmasi Pesanan Diterima?" : "Confirm Order Received?")}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {t.orders?.actions?.confirmReceiptDesc || (locale === "id" ? "Dengan mengonfirmasi, Anda menyatakan bahwa Anda telah menerima pesanan dan dalam kondisi baik. Ini akan menandai pesanan sebagai selesai." : "By confirming, you acknowledge that you have received your order and it is in good condition. This will mark the order as completed.")}
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <div className="py-4 space-y-3">
                            <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        {t.orders?.orderNumber || (locale === "id" ? "Nomor Pesanan" : "Order Number")}:
                                    </span>
                                    <span className="font-mono font-medium">{order.order_number}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        {t.orders?.items || (locale === "id" ? "Item" : "Items")}:
                                    </span>
                                    <span className="font-medium">
                                        {order.items.length} {order.items.length === 1 ? (t.common?.item || "item") : (t.common?.items || "items")}
                                    </span>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {t.orders?.actions?.contactSupportBeforeConfirm || "💡 If there's any issue with your order, please contact support before confirming receipt."}
                            </p>
                        </div>

                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isConfirming}>
                                {t.orders?.actions?.notYet || (locale === "id" ? "Belum" : "Not Yet")}
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
                                        {t.orders?.actions?.confirming || (locale === "id" ? "Mengonfirmasi..." : "Confirming...")}
                                    </>
                                ) : (
                                    <>
                                        <PackageCheck className="h-4 w-4 mr-2" />
                                        {t.orders?.actions?.yesReceived || (locale === "id" ? "Ya, Saya Sudah Terima" : "Yes, I Received It")}
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
                            {t.orders?.actions?.cancelOrder || (locale === "id" ? "Batalkan Pesanan" : "Cancel Order")}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {t.orders?.actions?.cancelTitle || (locale === "id" ? "Batalkan Pesanan?" : "Cancel Order?")}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {t.orders?.actions?.cancelDesc || (locale === "id" ? "Apakah Anda yakin ingin membatalkan pesanan ini? Tindakan ini tidak dapat dibatalkan." : "Are you sure you want to cancel this order? This action cannot be undone.")}
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <div className="space-y-2 py-4">
                            <Label htmlFor="cancel-reason">
                                {t.orders?.actions?.cancelReason || (locale === "id" ? "Alasan pembatalan (wajib)" : "Reason for cancellation (required)")}
                            </Label>
                            <Textarea
                                id="cancel-reason"
                                placeholder={t.orders?.actions?.cancelReasonPlaceholder || (locale === "id" ? "Tolong beri tahu kami mengapa Anda membatalkan pesanan ini..." : "Please tell us why you're cancelling this order...")}
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                rows={4}
                                disabled={isCancelling}
                            />
                        </div>

                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isCancelling}>
                                {t.orders?.actions?.keepOrder || (locale === "id" ? "Pertahankan Pesanan" : "Keep Order")}
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
                                        {t.orders?.actions?.cancelling || (locale === "id" ? "Membatalkan..." : "Cancelling...")}
                                    </>
                                ) : (
                                    t.orders?.actions?.cancelOrder || (locale === "id" ? "Batalkan Pesanan" : "Cancel Order")
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
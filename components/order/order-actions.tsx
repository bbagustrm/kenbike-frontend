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
import { XCircle, Loader2, ArrowLeft, PackageCheck, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { WhatsAppSupportButton } from "./whatsapp-support-button";
import { ReturnRequestForm } from "./return-request-form";
import { canRequestReturn } from "@/types/return";

interface OrderActionsProps {
    order: Order;
    onUpdate?: () => void;
    hasActiveReturn?: boolean;
}

export function OrderActions({ order, onUpdate, hasActiveReturn = false }: OrderActionsProps) {
    const router = useRouter();
    const { cancelOrder } = useOrder();
    const { t, locale } = useTranslation();
    const tr = t.returns;

    const [isCancelling, setIsCancelling] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

    const [isConfirming, setIsConfirming] = useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

    const canCancel = order.status === "PENDING" || order.status === "FAILED";
    const canConfirmDelivery = order.status === "DELIVERED";
    const showSupport = order.status !== "COMPLETED" && order.status !== "CANCELLED";

    const returnCheck = canRequestReturn(order.status, order.completed_at);
    const canReturn = returnCheck.allowed && !hasActiveReturn;

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
            setTimeout(() => router.push("/user/orders"), 1500);
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
            onUpdate?.();
        } catch (error) {
            if (error instanceof Error) toast.error(error.message);
        } finally {
            setIsConfirming(false);
        }
    };

    return (
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            {/* Back to Orders */}
            <Button
                variant="outline"
                onClick={() => router.push("/user/orders")}
                className="flex-1 sm:flex-initial"
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t.orders?.actions?.backToOrders || (locale === "id" ? "Kembali ke Pesanan" : "Back to Orders")}
            </Button>

            {/* Confirm Receipt */}
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
                                {t.orders?.actions?.confirmReceiptDesc || (locale === "id" ? "Dengan mengonfirmasi, Anda menyatakan bahwa Anda telah menerima pesanan dan dalam kondisi baik." : "By confirming, you acknowledge that you have received your order and it is in good condition.")}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="py-4 space-y-3">
                            <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t.orders?.orderNumber || (locale === "id" ? "Nomor Pesanan" : "Order Number")}:</span>
                                    <span className="font-mono font-medium">{order.order_number}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t.orders?.items || "Item"}:</span>
                                    <span className="font-medium">{order.items.length} item</span>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {t.orders?.actions?.contactSupportBeforeConfirm || "💡 Jika ada masalah dengan pesanan, hubungi support sebelum konfirmasi."}
                            </p>
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isConfirming}>
                                {t.orders?.actions?.notYet || (locale === "id" ? "Belum" : "Not Yet")}
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={(e) => { e.preventDefault(); handleConfirmDelivery(); }}
                                disabled={isConfirming}
                            >
                                {isConfirming ? (
                                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t.orders?.actions?.confirming || (locale === "id" ? "Mengonfirmasi..." : "Confirming...")}</>
                                ) : (
                                    <><PackageCheck className="h-4 w-4 mr-2" />{t.orders?.actions?.yesReceived || (locale === "id" ? "Ya, Sudah Terima" : "Yes, I Received It")}</>
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}

            {/* ✅ Request Return Button */}
            {canReturn && (
                <ReturnRequestForm order={order} onSuccess={onUpdate} />
            )}

            {/* ✅ View Return Status Button */}
            {order.status === "COMPLETED" && hasActiveReturn && (
                <Button
                    variant="outline"
                    onClick={() => router.push(`/user/orders/${order.order_number}#return`)}
                    className="flex-1 sm:flex-initial gap-2"
                >
                    <RotateCcw className="h-4 w-4" />
                    {tr?.viewReturnStatus ?? (locale === "id" ? "Lihat Status Retur" : "View Return Status")}
                </Button>
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
                                {t.orders?.actions?.cancelDesc || (locale === "id" ? "Apakah Anda yakin ingin membatalkan pesanan ini?" : "Are you sure you want to cancel this order?")}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="space-y-2 py-4">
                            <Label htmlFor="cancel-reason">
                                {t.orders?.actions?.cancelReason || (locale === "id" ? "Alasan pembatalan (wajib)" : "Reason for cancellation (required)")}
                            </Label>
                            <Textarea
                                id="cancel-reason"
                                placeholder={t.orders?.actions?.cancelReasonPlaceholder || ""}
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                rows={4}
                                disabled={isCancelling}
                            />
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isCancelling}>
                                {t.orders?.actions?.keepOrder || (locale === "id" ? "Pertahankan" : "Keep Order")}
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={(e) => { e.preventDefault(); handleCancel(); }}
                                disabled={isCancelling || !cancelReason.trim()}
                                className="bg-destructive hover:bg-destructive/90"
                            >
                                {isCancelling ? (
                                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t.orders?.actions?.cancelling || (locale === "id" ? "Membatalkan..." : "Cancelling...")}</>
                                ) : (
                                    t.orders?.actions?.cancelOrder || (locale === "id" ? "Batalkan" : "Cancel")
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}

            {/* WhatsApp Support */}
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
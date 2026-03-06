// components/order/return-section.tsx
"use client";

import { useState } from "react";
import { ReturnRequest, ReturnStatus } from "@/types/return";
import { ReturnService } from "@/services/return.service";
import { ReturnStatusBadge } from "./return-status-badge";
import { useTranslation } from "@/hooks/use-translation";
import { Order } from "@/types/order";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    RotateCcw, PackageCheck, XCircle, Loader2,
    ExternalLink, MessageCircle, AlertCircle,
    CheckCircle2, Clock,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/format-currency";

interface ReturnSectionProps {
    returnRequest: ReturnRequest;
    order: Order;
    onUpdate?: () => void;
}

const STATUS_ICONS: Partial<Record<ReturnStatus, React.ReactNode>> = {
    REQUESTED: <Clock className="h-4 w-4 text-yellow-600" />,
    APPROVED: <CheckCircle2 className="h-4 w-4 text-blue-600" />,
    REJECTED: <XCircle className="h-4 w-4 text-red-600" />,
    ITEM_SENT: <PackageCheck className="h-4 w-4 text-purple-600" />,
    ITEM_RECEIVED: <PackageCheck className="h-4 w-4 text-indigo-600" />,
    REFUNDED: <CheckCircle2 className="h-4 w-4 text-green-600" />,
    CANCELLED: <XCircle className="h-4 w-4 text-gray-400" />,
};

export function ReturnSection({ returnRequest, order, onUpdate }: ReturnSectionProps) {
    const { t, locale } = useTranslation();
    const tr = t.returns;

    // Confirm sent dialog
    const [isSentOpen, setIsSentOpen] = useState(false);
    const [courier, setCourier] = useState("");
    const [trackingNumber, setTrackingNumber] = useState("");
    const [isConfirmingSent, setIsConfirmingSent] = useState(false);

    // Cancel dialog
    const [isCancelOpen, setIsCancelOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [isCancelling, setIsCancelling] = useState(false);

    const handleConfirmSent = async () => {
        if (!courier.trim() || !trackingNumber.trim()) {
            toast.error(locale === "id" ? "Lengkapi info pengiriman" : "Complete shipping info");
            return;
        }

        setIsConfirmingSent(true);
        try {
            await ReturnService.confirmItemSent(returnRequest.id, {
                return_courier: courier.trim(),
                return_tracking_number: trackingNumber.trim(),
            });
            toast.success(tr?.confirmSent.success ?? (locale === "id" ? "Pengiriman berhasil dikonfirmasi!" : "Shipment confirmed!"));
            setIsSentOpen(false);
            setCourier("");
            setTrackingNumber("");
            onUpdate?.();
        } catch (error) {
            if (error instanceof Error) toast.error(error.message);
            else toast.error(tr?.confirmSent.error ?? (locale === "id" ? "Gagal mengkonfirmasi" : "Failed to confirm"));
        } finally {
            setIsConfirmingSent(false);
        }
    };

    const handleCancel = async () => {
        setIsCancelling(true);
        try {
            await ReturnService.cancelReturn(returnRequest.id, cancelReason || undefined);
            toast.success(tr?.cancel.success ?? (locale === "id" ? "Retur dibatalkan" : "Return cancelled"));
            setIsCancelOpen(false);
            onUpdate?.();
        } catch (error) {
            if (error instanceof Error) toast.error(error.message);
            else toast.error(tr?.cancel.error ?? (locale === "id" ? "Gagal membatalkan" : "Failed to cancel"));
        } finally {
            setIsCancelling(false);
        }
    };

    const handleWhatsApp = () => {
        const WHATSAPP_NUMBER = "6281229505919";
        const isApproved = returnRequest.status === "APPROVED";
        const baseMsg = isApproved
            ? (tr?.whatsapp.approvedMessage ?? (locale === "id" ? "Retur saya telah disetujui. Boleh minta info alamat pengiriman barang retur?" : "My return has been approved. Could you provide the return shipping address?"))
            : "_[Tulis pertanyaan Anda]_";

        const statusLabel = tr?.status[returnRequest.status] ?? returnRequest.status;
        const reasonLabel = tr?.reasons[returnRequest.reason] ?? returnRequest.reason;

        const msg = locale === "id"
            ? `Halo KenBike,\n\n${tr?.whatsapp.askAboutReturn ?? "Saya ingin bertanya tentang retur pesanan saya:"}\n\nNo. Pesanan: ${order.order_number}\nStatus Retur: ${statusLabel}\nAlasan: ${reasonLabel}\n\n${baseMsg}\n\nTerima kasih.`
            : `Hello KenBike,\n\n${tr?.whatsapp.askAboutReturn ?? "I have a question about my return request:"}\n\nOrder: ${order.order_number}\nReturn Status: ${statusLabel}\nReason: ${reasonLabel}\n\n${baseMsg}\n\nThank you.`;

        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
    };

    const statusDesc = tr?.statusDesc[returnRequest.status]
        ?? (locale === "id" ? "Status retur Anda diperbarui." : "Your return status has been updated.");

    return (
        <>
            <Card id="return">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <RotateCcw className="h-5 w-5" />
                        {tr?.returnStatus ?? (locale === "id" ? "Status Retur" : "Return Status")}
                        <ReturnStatusBadge status={returnRequest.status} size="sm" />
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Status description */}
                    <div className="flex gap-2 text-sm bg-muted/50 rounded-lg p-3">
                        {STATUS_ICONS[returnRequest.status]}
                        <p className="text-muted-foreground">{statusDesc}</p>
                    </div>

                    {/* Return Details */}
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{tr?.detail.reason ?? (locale === "id" ? "Alasan" : "Reason")}:</span>
                            <span className="font-medium">{tr?.reasons[returnRequest.reason] ?? returnRequest.reason}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{tr?.detail.requestedAt ?? (locale === "id" ? "Diajukan" : "Requested")}:</span>
                            <span>{new Date(returnRequest.created_at).toLocaleDateString(locale === "id" ? "id-ID" : "en-US")}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{tr?.detail.refundAmount ?? (locale === "id" ? "Jumlah Refund" : "Refund Amount")}:</span>
                            <span className="font-semibold text-green-600">
                                {formatCurrency(order.total, order.currency as "IDR" | "USD")}
                            </span>
                        </div>
                    </div>

                    {/* Admin Notes */}
                    {returnRequest.admin_notes && (
                        <>
                            <Separator />
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    {tr?.detail.adminNotes ?? (locale === "id" ? "Catatan Admin" : "Admin Notes")}
                                </p>
                                <p className="text-sm bg-yellow-50 border border-yellow-200 rounded p-2">
                                    {returnRequest.admin_notes}
                                </p>
                            </div>
                        </>
                    )}

                    {/* Return Shipping Info */}
                    {(returnRequest.status === "ITEM_SENT" ||
                        returnRequest.status === "ITEM_RECEIVED" ||
                        returnRequest.status === "REFUNDED") && (
                        <>
                            <Separator />
                            <div className="space-y-2 text-sm">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    {tr?.detail.shippingInfo ?? (locale === "id" ? "Info Pengiriman Retur" : "Return Shipping Info")}
                                </p>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{tr?.detail.courier ?? (locale === "id" ? "Kurir" : "Courier")}:</span>
                                    <span className="font-medium">{returnRequest.return_courier}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{tr?.detail.trackingNumber ?? (locale === "id" ? "No. Resi" : "Tracking")}:</span>
                                    <span className="font-mono">{returnRequest.return_tracking_number}</span>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Refund Proof */}
                    {returnRequest.status === "REFUNDED" && returnRequest.refund_proof && (
                        <>
                            <Separator />
                            <div className="space-y-2 text-sm">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    {tr?.detail.refundProof ?? (locale === "id" ? "Bukti Refund" : "Refund Proof")}
                                </p>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{tr?.detail.refundMethod ?? (locale === "id" ? "Metode" : "Method")}:</span>
                                    <span className="font-medium">{returnRequest.refund_method}</span>
                                </div>
                                <a href={returnRequest.refund_proof} target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" size="sm" className="gap-1 text-xs w-full mt-1">
                                        <ExternalLink className="h-3 w-3" />
                                        {tr?.detail.viewProof ?? (locale === "id" ? "Lihat Bukti Transfer" : "View Transfer Proof")}
                                    </Button>
                                </a>
                            </div>
                        </>
                    )}

                    {/* ACTION BUTTONS */}
                    <Separator />
                    <div className="flex flex-col gap-2">
                        {/* WhatsApp */}
                        {returnRequest.status !== "CANCELLED" && returnRequest.status !== "REFUNDED" && (
                            <Button variant="outline" size="sm" className="gap-2 w-full" onClick={handleWhatsApp}>
                                <MessageCircle className="h-4 w-4" />
                                {locale === "id" ? "Tanya via WhatsApp" : "Ask via WhatsApp"}
                            </Button>
                        )}

                        {/* Confirm Item Sent */}
                        {returnRequest.status === "APPROVED" && (
                            <Button size="sm" className="gap-2 w-full" onClick={() => setIsSentOpen(true)}>
                                <PackageCheck className="h-4 w-4" />
                                {tr?.confirmSent.title ?? (locale === "id" ? "Konfirmasi Barang Dikirim" : "Confirm Item Shipped")}
                            </Button>
                        )}

                        {/* Cancel */}
                        {(returnRequest.status === "REQUESTED" || returnRequest.status === "APPROVED") && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2 w-full text-destructive hover:text-destructive"
                                onClick={() => setIsCancelOpen(true)}
                            >
                                <XCircle className="h-4 w-4" />
                                {locale === "id" ? "Batalkan Retur" : "Cancel Return"}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Confirm Sent Dialog */}
            <Dialog open={isSentOpen} onOpenChange={setIsSentOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{tr?.confirmSent.title ?? (locale === "id" ? "Konfirmasi Barang Dikirim" : "Confirm Item Shipped")}</DialogTitle>
                        <DialogDescription>
                            {tr?.confirmSent.desc ?? (locale === "id" ? "Masukkan informasi pengiriman barang retur Anda" : "Enter your return item shipping information")}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label>{tr?.confirmSent.courierLabel ?? (locale === "id" ? "Nama Kurir *" : "Courier Name *")}</Label>
                            <Input
                                value={courier}
                                onChange={(e) => setCourier(e.target.value)}
                                placeholder={tr?.confirmSent.courierPlaceholder ?? (locale === "id" ? "contoh: JNE, J&T" : "e.g.: JNE, J&T")}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>{tr?.confirmSent.trackingLabel ?? (locale === "id" ? "Nomor Resi *" : "Tracking Number *")}</Label>
                            <Input
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                                placeholder={tr?.confirmSent.trackingPlaceholder ?? (locale === "id" ? "Masukkan nomor resi" : "Enter tracking number")}
                            />
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded p-3 flex gap-2 text-xs text-blue-800">
                            <AlertCircle className="h-3 w-3 shrink-0 mt-0.5" />
                            {tr?.confirmSent.note ?? (locale === "id" ? "Pastikan nomor resi sudah benar sebelum konfirmasi." : "Make sure the tracking number is correct before confirming.")}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSentOpen(false)} disabled={isConfirmingSent}>
                            {t.common.cancel}
                        </Button>
                        <Button onClick={handleConfirmSent} disabled={isConfirmingSent}>
                            {isConfirmingSent ? (
                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{tr?.confirmSent.submitting ?? "..."}</>
                            ) : (
                                <><PackageCheck className="h-4 w-4 mr-2" />{tr?.confirmSent.submit ?? (locale === "id" ? "Konfirmasi" : "Confirm")}</>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cancel Dialog */}
            <AlertDialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{tr?.cancel.title ?? (locale === "id" ? "Batalkan Retur?" : "Cancel Return?")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {tr?.cancel.desc ?? (locale === "id" ? "Apakah Anda yakin ingin membatalkan permintaan retur ini?" : "Are you sure you want to cancel this return request?")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-2 py-2">
                        <Label>{tr?.cancel.reasonLabel ?? (locale === "id" ? "Alasan (opsional)" : "Reason (optional)")}</Label>
                        <Textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder={tr?.cancel.reasonPlaceholder ?? ""}
                            rows={3}
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isCancelling}>
                            {tr?.cancel.keep ?? (locale === "id" ? "Pertahankan" : "Keep Return")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => { e.preventDefault(); handleCancel(); }}
                            disabled={isCancelling}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {isCancelling ? (
                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t.common.processing ?? "..."}</>
                            ) : (
                                tr?.cancel.confirm ?? (locale === "id" ? "Ya, Batalkan" : "Yes, Cancel")
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
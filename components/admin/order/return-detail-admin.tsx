// components/admin/order/return-detail-admin.tsx
"use client";

import { useState } from "react";
import {
    ReturnRequest,
    ReturnStatus,
    RETURN_REASON_LABELS,
    RETURN_STATUS_LABELS,
    MarkRefundedDto,
} from "@/types/return";
import { Order } from "@/types/order";
import { ReturnService } from "@/services/return.service";
import { ReturnStatusBadge } from "@/components/order/return-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    CheckCircle, XCircle, PackageCheck, Banknote,
    Loader2, ExternalLink, RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/format-currency";

interface ReturnDetailAdminProps {
    returnRequest: ReturnRequest;
    order: Order;
    onUpdate?: () => void;
}

export function ReturnDetailAdmin({ returnRequest, order, onUpdate }: ReturnDetailAdminProps) {
    const [isActionLoading, setIsActionLoading] = useState(false);

    // Approve/Reject
    const [adminNotes, setAdminNotes] = useState("");
    const [rejectionReason, setRejectionReason] = useState("");

    // Mark Received
    const [receivedNotes, setReceivedNotes] = useState("");

    // Mark Refunded dialog
    const [isRefundOpen, setIsRefundOpen] = useState(false);
    const [refundMethod, setRefundMethod] = useState("");
    const [refundProof, setRefundProof] = useState("");
    const [refundNotes, setRefundNotes] = useState("");

    const handleApprove = async () => {
        setIsActionLoading(true);
        try {
            await ReturnService.approveReturn(returnRequest.id, {
                admin_notes: adminNotes || undefined,
            });
            toast.success("Return approved successfully");
            setAdminNotes("");
            onUpdate?.();
        } catch (error) {
            if (error instanceof Error) toast.error(error.message);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            toast.error("Rejection reason is required");
            return;
        }
        setIsActionLoading(true);
        try {
            await ReturnService.rejectReturn(returnRequest.id, {
                admin_notes: rejectionReason,
            });
            toast.success("Return rejected");
            setRejectionReason("");
            onUpdate?.();
        } catch (error) {
            if (error instanceof Error) toast.error(error.message);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleMarkReceived = async () => {
        setIsActionLoading(true);
        try {
            await ReturnService.markItemReceived(returnRequest.id, {
                received_notes: receivedNotes || undefined,
            });
            toast.success("Item marked as received");
            setReceivedNotes("");
            onUpdate?.();
        } catch (error) {
            if (error instanceof Error) toast.error(error.message);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleMarkRefunded = async () => {
        if (!refundMethod.trim() || !refundProof.trim()) {
            toast.error("Refund method and proof URL are required");
            return;
        }
        setIsActionLoading(true);
        try {
            const dto: MarkRefundedDto = {
                refund_method: refundMethod,
                refund_proof: refundProof,
                refund_notes: refundNotes || undefined,
            };
            await ReturnService.markRefunded(returnRequest.id, dto);
            toast.success("Refund recorded successfully");
            setIsRefundOpen(false);
            setRefundMethod("");
            setRefundProof("");
            setRefundNotes("");
            onUpdate?.();
        } catch (error) {
            if (error instanceof Error) toast.error(error.message);
        } finally {
            setIsActionLoading(false);
        }
    };

    const isActionable = !["REFUNDED", "CANCELLED", "REJECTED"].includes(returnRequest.status);

    return (
        <>
            <Card className="border-orange-200">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-base">
                        <span className="flex items-center gap-2">
                            <RotateCcw className="h-5 w-5 text-orange-500" />
                            Return Request
                        </span>
                        <ReturnStatusBadge status={returnRequest.status} />
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <div>
                            <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Reason</p>
                            <p className="font-medium">{RETURN_REASON_LABELS[returnRequest.reason]?.en}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Requested</p>
                            <p>{new Date(returnRequest.created_at).toLocaleDateString("en-US")}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Refund Amount</p>
                            <p className="font-semibold text-green-600">
                                {formatCurrency(order.total, order.currency)}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Return ID</p>
                            <p className="font-mono text-xs text-muted-foreground">{returnRequest.id.slice(0, 12)}...</p>
                        </div>
                    </div>

                    <Separator />

                    {/* Description */}
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Description</p>
                        <p className="text-sm bg-muted/50 rounded p-2">{returnRequest.description}</p>
                    </div>

                    {/* Proof Photos */}
                    {returnRequest.images && returnRequest.images.length > 0 && (
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Proof Photos</p>
                            <div className="flex gap-2 flex-wrap">
                                {returnRequest.images.map((url, i) => (
                                    <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                                        <Button variant="outline" size="sm" className="text-xs gap-1 h-7">
                                            <ExternalLink className="h-3 w-3" />
                                            Photo {i + 1}
                                        </Button>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Refund Bank Info */}
                    <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-sm">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Refund Account</p>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Bank:</span>
                            <span className="font-medium">{returnRequest.refund_bank_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Account No:</span>
                            <span className="font-mono">{returnRequest.refund_account_number}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Name:</span>
                            <span className="font-medium">{returnRequest.refund_account_name}</span>
                        </div>
                    </div>

                    {/* Return Shipping Info — shown when ITEM_SENT or beyond */}
                    {(returnRequest.status === "ITEM_SENT" ||
                        returnRequest.status === "ITEM_RECEIVED" ||
                        returnRequest.status === "REFUNDED") && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 space-y-1 text-sm">
                            <p className="text-xs text-purple-700 uppercase tracking-wide mb-2 font-medium">
                                Return Shipping
                            </p>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Courier:</span>
                                <span className="font-medium">{returnRequest.return_courier}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tracking:</span>
                                <span className="font-mono">{returnRequest.return_tracking_number}</span>
                            </div>
                            {returnRequest.item_sent_at && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Sent at:</span>
                                    <span>{new Date(returnRequest.item_sent_at).toLocaleDateString("en-US")}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Admin Notes (existing) */}
                    {returnRequest.admin_notes && (
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Admin Notes</p>
                            <p className="text-sm bg-yellow-50 border border-yellow-200 rounded p-2">
                                {returnRequest.admin_notes}
                            </p>
                        </div>
                    )}

                    {/* Received notes */}
                    {returnRequest.received_notes && (
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Received Notes</p>
                            <p className="text-sm bg-indigo-50 border border-indigo-200 rounded p-2">
                                {returnRequest.received_notes}
                            </p>
                        </div>
                    )}

                    {/* Refund proof */}
                    {returnRequest.status === "REFUNDED" && returnRequest.refund_proof && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2 text-sm">
                            <p className="text-xs text-green-700 uppercase tracking-wide font-medium">Refund Completed</p>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Method:</span>
                                <span className="font-medium">{returnRequest.refund_method}</span>
                            </div>
                            {returnRequest.refunded_at && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Date:</span>
                                    <span>{new Date(returnRequest.refunded_at).toLocaleDateString("en-US")}</span>
                                </div>
                            )}
                            <a href={returnRequest.refund_proof} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="sm" className="gap-1 text-xs w-full mt-1">
                                    <ExternalLink className="h-3 w-3" />
                                    View Transfer Proof
                                </Button>
                            </a>
                        </div>
                    )}

                    {/* ===================== ACTION PANELS ===================== */}

                    {/* REQUESTED → Approve or Reject */}
                    {returnRequest.status === "REQUESTED" && (
                        <>
                            <Separator />
                            <div className="space-y-3">
                                <p className="text-sm font-medium">Review Return Request</p>
                                <div className="space-y-1">
                                    <Label className="text-xs">Admin Notes (optional — sent to user)</Label>
                                    <Textarea
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        placeholder="Notes for the user when approving..."
                                        rows={2}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Rejection Reason (required if rejecting)</Label>
                                    <Textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Explain why the return is rejected..."
                                        rows={2}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        className="flex-1 gap-2"
                                        onClick={handleApprove}
                                        disabled={isActionLoading}
                                    >
                                        {isActionLoading
                                            ? <Loader2 className="h-4 w-4 animate-spin" />
                                            : <CheckCircle className="h-4 w-4" />}
                                        Approve Return
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="flex-1 gap-2"
                                        onClick={handleReject}
                                        disabled={isActionLoading || !rejectionReason.trim()}
                                    >
                                        {isActionLoading
                                            ? <Loader2 className="h-4 w-4 animate-spin" />
                                            : <XCircle className="h-4 w-4" />}
                                        Reject
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ITEM_SENT → Confirm Received */}
                    {returnRequest.status === "ITEM_SENT" && (
                        <>
                            <Separator />
                            <div className="space-y-3">
                                <p className="text-sm font-medium">Confirm Item Received</p>
                                <div className="space-y-1">
                                    <Label className="text-xs">Receipt Notes (optional)</Label>
                                    <Textarea
                                        value={receivedNotes}
                                        onChange={(e) => setReceivedNotes(e.target.value)}
                                        placeholder="Item condition upon receipt..."
                                        rows={2}
                                    />
                                </div>
                                <Button
                                    className="w-full gap-2"
                                    onClick={handleMarkReceived}
                                    disabled={isActionLoading}
                                >
                                    {isActionLoading
                                        ? <Loader2 className="h-4 w-4 animate-spin" />
                                        : <PackageCheck className="h-4 w-4" />}
                                    Confirm Item Received
                                </Button>
                            </div>
                        </>
                    )}

                    {/* ITEM_RECEIVED → Process Refund */}
                    {returnRequest.status === "ITEM_RECEIVED" && (
                        <>
                            <Separator />
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Process Refund</p>
                                <p className="text-xs text-muted-foreground">
                                    Transfer {formatCurrency(order.total, order.currency)} to{" "}
                                    <strong>{returnRequest.refund_bank_name} — {returnRequest.refund_account_number}</strong>{" "}
                                    a/n {returnRequest.refund_account_name}, then record it below.
                                </p>
                                <Button
                                    className="w-full gap-2"
                                    onClick={() => setIsRefundOpen(true)}
                                >
                                    <Banknote className="h-4 w-4" />
                                    Record Manual Refund
                                </Button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Refund Dialog */}
            <Dialog open={isRefundOpen} onOpenChange={setIsRefundOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Record Manual Refund</DialogTitle>
                        <DialogDescription>
                            Fill in the details after completing the bank transfer to the customer.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="bg-muted rounded-lg p-3 text-sm space-y-1">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Transfer to:</span>
                                <span className="font-medium">
                                    {returnRequest.refund_bank_name} — {returnRequest.refund_account_number}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Account name:</span>
                                <span>{returnRequest.refund_account_name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Amount:</span>
                                <span className="font-bold text-green-600">
                                    {formatCurrency(order.total, order.currency)}
                                </span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label>Refund Method *</Label>
                            <Input
                                value={refundMethod}
                                onChange={(e) => setRefundMethod(e.target.value)}
                                placeholder="e.g.: BCA Transfer, GoPay, Dana"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Transfer Proof URL *</Label>
                            <Input
                                value={refundProof}
                                onChange={(e) => setRefundProof(e.target.value)}
                                placeholder="https://..."
                            />
                            <p className="text-xs text-muted-foreground">
                                Upload screenshot of transfer receipt and paste the URL here.
                            </p>
                        </div>
                        <div className="space-y-1">
                            <Label>Notes (optional)</Label>
                            <Textarea
                                value={refundNotes}
                                onChange={(e) => setRefundNotes(e.target.value)}
                                placeholder="Additional notes for the customer..."
                                rows={2}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRefundOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleMarkRefunded} disabled={isActionLoading}>
                            {isActionLoading
                                ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                : <Banknote className="h-4 w-4 mr-2" />}
                            Save Refund
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
// components/admin/order/return-management-table.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { ReturnRequest, ReturnStatus, RETURN_REASON_LABELS, MarkRefundedDto } from "@/types/return";
import { ReturnService } from "@/services/return.service";
import { ReturnStatusBadge } from "@/components/order/return-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format-currency";
import {
    CheckCircle, XCircle, PackageCheck, Banknote, Eye,
    Loader2, Search, ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

const STATUS_FILTERS: { value: ReturnStatus | "ALL"; label: string }[] = [
    { value: "ALL", label: "Semua" },
    { value: "REQUESTED", label: "Menunggu Review" },
    { value: "APPROVED", label: "Disetujui" },
    { value: "REJECTED", label: "Ditolak" },
    { value: "ITEM_SENT", label: "Barang Dikirim" },
    { value: "ITEM_RECEIVED", label: "Barang Diterima" },
    { value: "REFUNDED", label: "Refund Selesai" },
    { value: "CANCELLED", label: "Dibatalkan" },
];

export function ReturnManagementTable() {
    const [returns, setReturns] = useState<ReturnRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<ReturnStatus | "ALL">("ALL");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Detail dialog
    const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Action states
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [adminNotes, setAdminNotes] = useState("");
    const [rejectionReason, setRejectionReason] = useState("");
    const [receivedNotes, setReceivedNotes] = useState("");

    // Refund dialog
    const [isRefundOpen, setIsRefundOpen] = useState(false);
    const [refundMethod, setRefundMethod] = useState("");
    const [refundProof, setRefundProof] = useState("");
    const [refundNotes, setRefundNotes] = useState("");

    const fetchReturns = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await ReturnService.getAllReturns({
                page,
                limit: 10,
                status: statusFilter === "ALL" ? undefined : statusFilter,
                search: search || undefined,
            });
            setReturns(result.data);
            setTotalPages(result.meta.totalPages);
        } catch (error) {
            toast.error("Gagal memuat data retur");
        } finally {
            setIsLoading(false);
        }
    }, [page, statusFilter, search]);

    useEffect(() => {
        fetchReturns();
    }, [fetchReturns]);

    const openDetail = async (returnRequest: ReturnRequest) => {
        try {
            const result = await ReturnService.getReturnDetail(returnRequest.id);
            setSelectedReturn(result.data);
            setAdminNotes("");
            setRejectionReason("");
            setReceivedNotes("");
            setIsDetailOpen(true);
        } catch (error) {
            toast.error("Gagal memuat detail retur");
        }
    };

    const handleApprove = async () => {
        if (!selectedReturn) return;
        setIsActionLoading(true);
        try {
            await ReturnService.approveReturn(selectedReturn.id, { admin_notes: adminNotes || undefined });
            toast.success("Retur disetujui");
            setIsDetailOpen(false);
            fetchReturns();
        } catch (error) {
            if (error instanceof Error) toast.error(error.message);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!selectedReturn) return;
        if (!rejectionReason.trim()) {
            toast.error("Alasan penolakan wajib diisi");
            return;
        }
        setIsActionLoading(true);
        try {
            await ReturnService.rejectReturn(selectedReturn.id, { admin_notes: rejectionReason });
            toast.success("Retur ditolak");
            setIsDetailOpen(false);
            fetchReturns();
        } catch (error) {
            if (error instanceof Error) toast.error(error.message);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleMarkReceived = async () => {
        if (!selectedReturn) return;
        setIsActionLoading(true);
        try {
            await ReturnService.markItemReceived(selectedReturn.id, { received_notes: receivedNotes || undefined });
            toast.success("Barang dikonfirmasi diterima");
            setIsDetailOpen(false);
            fetchReturns();
        } catch (error) {
            if (error instanceof Error) toast.error(error.message);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleMarkRefunded = async () => {
        if (!selectedReturn) return;
        if (!refundMethod.trim() || !refundProof.trim()) {
            toast.error("Metode refund dan bukti transfer wajib diisi");
            return;
        }
        setIsActionLoading(true);
        try {
            const dto: MarkRefundedDto = {
                refund_method: refundMethod,
                refund_proof: refundProof,
                refund_notes: refundNotes || undefined,
            };
            await ReturnService.markRefunded(selectedReturn.id, dto);
            toast.success("Refund berhasil dicatat");
            setIsRefundOpen(false);
            setIsDetailOpen(false);
            fetchReturns();
        } catch (error) {
            if (error instanceof Error) toast.error(error.message);
        } finally {
            setIsActionLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari nomor pesanan..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="pl-9"
                    />
                </div>
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as ReturnStatus | "ALL"); setPage(1); }}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {STATUS_FILTERS.map((f) => (
                            <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nomor Pesanan</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Alasan</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Total Refund</TableHead>
                            <TableHead>Tanggal</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">
                                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : returns.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    Tidak ada data retur
                                </TableCell>
                            </TableRow>
                        ) : (
                            returns.map((r) => (
                                <TableRow key={r.id}>
                                    <TableCell className="font-mono text-sm">
                                        {r.order?.order_number || r.order_id.slice(0, 8)}
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="text-sm font-medium">{r.user?.name}</p>
                                            <p className="text-xs text-muted-foreground">{r.user?.email}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-xs">
                                            {RETURN_REASON_LABELS[r.reason]?.id || r.reason}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <ReturnStatusBadge status={r.status} size="sm" />
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {r.order ? formatCurrency(r.order.total, r.order.currency as 'IDR' | 'USD') : "-"}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {new Date(r.created_at).toLocaleDateString("id-ID")}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openDetail(r)}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Sebelumnya</Button>
                    <span className="text-sm self-center">Halaman {page} / {totalPages}</span>
                    <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Selanjutnya</Button>
                </div>
            )}

            {/* Detail Dialog */}
            {selectedReturn && (
                <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Detail Retur — {selectedReturn.order?.order_number}</DialogTitle>
                            <DialogDescription>
                                <ReturnStatusBadge status={selectedReturn.status} />
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            {/* User Info */}
                            <Card>
                                <CardHeader className="pb-2"><CardTitle className="text-sm">Info User</CardTitle></CardHeader>
                                <CardContent className="text-sm space-y-1">
                                    <p><span className="text-muted-foreground">Nama:</span> {selectedReturn.user?.name}</p>
                                    <p><span className="text-muted-foreground">Email:</span> {selectedReturn.user?.email}</p>
                                    <p><span className="text-muted-foreground">Telepon:</span> {selectedReturn.user?.phone || "-"}</p>
                                </CardContent>
                            </Card>

                            {/* Return Info */}
                            <Card>
                                <CardHeader className="pb-2"><CardTitle className="text-sm">Info Retur</CardTitle></CardHeader>
                                <CardContent className="text-sm space-y-2">
                                    <p><span className="text-muted-foreground">Alasan:</span> {RETURN_REASON_LABELS[selectedReturn.reason]?.id}</p>
                                    <p><span className="text-muted-foreground">Deskripsi:</span> {selectedReturn.description}</p>
                                    {selectedReturn.images && selectedReturn.images.length > 0 && (
                                        <div>
                                            <p className="text-muted-foreground mb-1">Foto Bukti:</p>
                                            <div className="flex gap-2 flex-wrap">
                                                {selectedReturn.images.map((url, i) => (
                                                    <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                                                        <Button variant="outline" size="sm" className="text-xs gap-1">
                                                            <ExternalLink className="h-3 w-3" />Foto {i + 1}
                                                        </Button>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Refund Account */}
                            <Card>
                                <CardHeader className="pb-2"><CardTitle className="text-sm">Rekening Refund</CardTitle></CardHeader>
                                <CardContent className="text-sm space-y-1">
                                    <p><span className="text-muted-foreground">Bank:</span> {selectedReturn.refund_bank_name}</p>
                                    <p><span className="text-muted-foreground">No. Rekening:</span> {selectedReturn.refund_account_number}</p>
                                    <p><span className="text-muted-foreground">Nama:</span> {selectedReturn.refund_account_name}</p>
                                    <p><span className="text-muted-foreground">Jumlah Refund:</span> <strong>{selectedReturn.order ? formatCurrency(selectedReturn.order.total, selectedReturn.order.currency as 'IDR' | 'USD') : "-"}</strong></p>
                                </CardContent>
                            </Card>

                            {/* Shipping Info (if item sent) */}
                            {(selectedReturn.status === "ITEM_SENT" || selectedReturn.status === "ITEM_RECEIVED" || selectedReturn.status === "REFUNDED") && (
                                <Card>
                                    <CardHeader className="pb-2"><CardTitle className="text-sm">Info Pengiriman Barang Retur</CardTitle></CardHeader>
                                    <CardContent className="text-sm space-y-1">
                                        <p><span className="text-muted-foreground">Kurir:</span> {selectedReturn.return_courier}</p>
                                        <p><span className="text-muted-foreground">No. Resi:</span> {selectedReturn.return_tracking_number}</p>
                                        <p><span className="text-muted-foreground">Dikirim pada:</span> {selectedReturn.item_sent_at ? new Date(selectedReturn.item_sent_at).toLocaleDateString("id-ID") : "-"}</p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Admin Notes (if exists) */}
                            {selectedReturn.admin_notes && (
                                <Card>
                                    <CardHeader className="pb-2"><CardTitle className="text-sm">Catatan Admin</CardTitle></CardHeader>
                                    <CardContent className="text-sm">{selectedReturn.admin_notes}</CardContent>
                                </Card>
                            )}

                            {/* Refund Proof (if refunded) */}
                            {selectedReturn.status === "REFUNDED" && (
                                <Card>
                                    <CardHeader className="pb-2"><CardTitle className="text-sm">Bukti Refund</CardTitle></CardHeader>
                                    <CardContent className="text-sm space-y-1">
                                        <p><span className="text-muted-foreground">Metode:</span> {selectedReturn.refund_method}</p>
                                        {selectedReturn.refund_proof && (
                                            <a href={selectedReturn.refund_proof} target="_blank" rel="noopener noreferrer">
                                                <Button variant="outline" size="sm" className="gap-1 text-xs mt-1">
                                                    <ExternalLink className="h-3 w-3" />Lihat Bukti Transfer
                                                </Button>
                                            </a>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            <Separator />

                            {/* ACTION BUTTONS by status */}
                            {selectedReturn.status === "REQUESTED" && (
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <Label>Catatan Admin (opsional)</Label>
                                        <Textarea
                                            value={adminNotes}
                                            onChange={(e) => setAdminNotes(e.target.value)}
                                            placeholder="Catatan untuk user..."
                                            rows={2}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Alasan Penolakan (wajib jika ditolak)</Label>
                                        <Textarea
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            placeholder="Jelaskan alasan penolakan..."
                                            rows={2}
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            className="flex-1 gap-2"
                                            onClick={handleApprove}
                                            disabled={isActionLoading}
                                        >
                                            {isActionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                                            Setujui Retur
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            className="flex-1 gap-2"
                                            onClick={handleReject}
                                            disabled={isActionLoading || !rejectionReason.trim()}
                                        >
                                            {isActionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                                            Tolak
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {selectedReturn.status === "ITEM_SENT" && (
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <Label>Catatan Penerimaan (opsional)</Label>
                                        <Textarea
                                            value={receivedNotes}
                                            onChange={(e) => setReceivedNotes(e.target.value)}
                                            placeholder="Kondisi barang yang diterima..."
                                            rows={2}
                                        />
                                    </div>
                                    <Button
                                        className="w-full gap-2"
                                        onClick={handleMarkReceived}
                                        disabled={isActionLoading}
                                    >
                                        {isActionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackageCheck className="h-4 w-4" />}
                                        Konfirmasi Barang Diterima
                                    </Button>
                                </div>
                            )}

                            {selectedReturn.status === "ITEM_RECEIVED" && (
                                <Button
                                    className="w-full gap-2"
                                    onClick={() => setIsRefundOpen(true)}
                                >
                                    <Banknote className="h-4 w-4" />
                                    Catat Refund Manual
                                </Button>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Refund Dialog */}
            <Dialog open={isRefundOpen} onOpenChange={setIsRefundOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Catat Refund Manual</DialogTitle>
                        <DialogDescription>
                            Isi detail setelah kamu melakukan transfer refund ke user.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <Label>Metode Refund *</Label>
                            <Input
                                value={refundMethod}
                                onChange={(e) => setRefundMethod(e.target.value)}
                                placeholder="contoh: Transfer BCA, GoPay, Dana"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>URL Bukti Transfer *</Label>
                            <Input
                                value={refundProof}
                                onChange={(e) => setRefundProof(e.target.value)}
                                placeholder="https://..."
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Catatan (opsional)</Label>
                            <Textarea
                                value={refundNotes}
                                onChange={(e) => setRefundNotes(e.target.value)}
                                placeholder="Catatan tambahan untuk user..."
                                rows={2}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRefundOpen(false)}>Batal</Button>
                        <Button onClick={handleMarkRefunded} disabled={isActionLoading}>
                            {isActionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Banknote className="h-4 w-4 mr-2" />}
                            Simpan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
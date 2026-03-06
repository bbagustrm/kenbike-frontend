// components/order/return-request-form.tsx
"use client";

import { useState } from "react";
import { Order } from "@/types/order";
import { ReturnService } from "@/services/return.service";
import { ReturnReason } from "@/types/return";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RotateCcw, Loader2, Plus, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/format-currency";

interface ReturnRequestFormProps {
    order: Order;
    onSuccess?: () => void;
}

const RETURN_REASONS: ReturnReason[] = [
    "DAMAGED_ITEM",
    "WRONG_ITEM",
    "NOT_AS_DESCRIBED",
    "MISSING_PARTS",
    "OTHER",
];

export function ReturnRequestForm({ order, onSuccess }: ReturnRequestFormProps) {
    const { t, locale } = useTranslation();
    const tr = t.returns;

    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<1 | 2>(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Step 1
    const [reason, setReason] = useState<ReturnReason | "">("");
    const [description, setDescription] = useState("");
    const [photoUrls, setPhotoUrls] = useState<string[]>([""]);

    // Step 2
    const [bankName, setBankName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [accountName, setAccountName] = useState("");

    const handleAddPhoto = () => {
        if (photoUrls.length >= 5) {
            toast.error(tr?.form.maxPhotos ?? (locale === "id" ? "Maksimal 5 foto" : "Maximum 5 photos"));
            return;
        }
        setPhotoUrls([...photoUrls, ""]);
    };

    const handleRemovePhoto = (index: number) => {
        setPhotoUrls(photoUrls.filter((_, i) => i !== index));
    };

    const handlePhotoChange = (index: number, value: string) => {
        const updated = [...photoUrls];
        updated[index] = value;
        setPhotoUrls(updated);
    };

    const handleNextStep = () => {
        if (!reason) {
            toast.error(tr?.form.selectReason ?? (locale === "id" ? "Pilih alasan retur" : "Select return reason"));
            return;
        }
        if (description.length < 20) {
            toast.error(tr?.form.descMinLength ?? (locale === "id" ? "Deskripsi minimal 20 karakter" : "Description must be at least 20 characters"));
            return;
        }
        const validUrls = photoUrls.filter((u) => u.trim());
        if (validUrls.length === 0) {
            toast.error(tr?.form.minPhotos ?? (locale === "id" ? "Upload minimal 1 foto bukti" : "Upload at least 1 proof photo"));
            return;
        }
        setStep(2);
    };

    const handleSubmit = async () => {
        if (!bankName.trim() || !accountNumber.trim() || !accountName.trim()) {
            toast.error(tr?.form.completeAccount ?? (locale === "id" ? "Lengkapi info rekening" : "Complete account info"));
            return;
        }

        const validUrls = photoUrls.filter((u) => u.trim());

        setIsSubmitting(true);
        try {
            await ReturnService.createReturn({
                order_number: order.order_number,
                reason: reason as ReturnReason,
                description,
                refund_bank_name: bankName,
                refund_account_number: accountNumber,
                refund_account_name: accountName,
                image_urls: validUrls,
            });

            toast.success(tr?.form.submitSuccess ?? (locale === "id" ? "Permintaan retur berhasil diajukan!" : "Return request submitted!"));
            handleClose();
            onSuccess?.();
        } catch (error) {
            if (error instanceof Error) toast.error(error.message);
            else toast.error(tr?.form.submitError ?? (locale === "id" ? "Gagal mengajukan retur" : "Failed to submit return"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        setStep(1);
        setReason("");
        setDescription("");
        setPhotoUrls([""]);
        setBankName("");
        setAccountNumber("");
        setAccountName("");
    };

    const refundInfoText = (tr?.form.refundInfo ?? "{amount}")
        .replace("{amount}", formatCurrency(order.total, order.currency as "IDR" | "USD"));

    return (
        <>
            <Button variant="outline" onClick={() => setIsOpen(true)} className="flex-1 sm:flex-initial gap-2">
                <RotateCcw className="h-4 w-4" />
                {tr?.requestReturn ?? (locale === "id" ? "Ajukan Retur" : "Request Return")}
            </Button>

            <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <RotateCcw className="h-5 w-5" />
                            {tr?.requestReturn ?? (locale === "id" ? "Ajukan Retur" : "Request Return")}
                        </DialogTitle>
                        <DialogDescription>
                            {locale === "id" ? `Pesanan #${order.order_number}` : `Order #${order.order_number}`}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Step Indicator */}
                    <div className="flex items-center gap-2 py-2">
                        <div className={`flex items-center gap-1.5 text-sm font-medium ${step === 1 ? "text-primary" : "text-muted-foreground"}`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 1 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>1</div>
                            {tr?.form.step1 ?? (locale === "id" ? "Alasan & Bukti" : "Reason & Evidence")}
                        </div>
                        <div className="flex-1 h-px bg-border" />
                        <div className={`flex items-center gap-1.5 text-sm font-medium ${step === 2 ? "text-primary" : "text-muted-foreground"}`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 2 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>2</div>
                            {tr?.form.step2 ?? (locale === "id" ? "Info Rekening" : "Account Info")}
                        </div>
                    </div>

                    {/* STEP 1 */}
                    {step === 1 && (
                        <div className="space-y-4">
                            {/* Reason */}
                            <div className="space-y-1.5">
                                <Label>{tr?.form.reasonLabel ?? (locale === "id" ? "Alasan Retur *" : "Return Reason *")}</Label>
                                <Select value={reason} onValueChange={(v) => setReason(v as ReturnReason)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={tr?.form.selectReason ?? (locale === "id" ? "Pilih alasan retur" : "Select return reason")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {RETURN_REASONS.map((r) => (
                                            <SelectItem key={r} value={r}>
                                                {tr?.reasons[r] ?? r}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5">
                                <Label>{tr?.form.descLabel ?? (locale === "id" ? "Deskripsi Detail *" : "Detailed Description *")}</Label>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder={tr?.form.descPlaceholder ?? ""}
                                    rows={4}
                                    maxLength={1000}
                                />
                                <p className={`text-xs ${description.length < 20 ? "text-muted-foreground" : "text-green-600"}`}>
                                    {description.length}/1000
                                </p>
                            </div>

                            {/* Photos */}
                            <div className="space-y-2">
                                <Label>{tr?.form.photosLabel ?? (locale === "id" ? "Foto Bukti * (min. 1, maks. 5)" : "Proof Photos * (min. 1, max. 5)")}</Label>
                                {photoUrls.map((url, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            value={url}
                                            onChange={(e) => handlePhotoChange(index, e.target.value)}
                                            placeholder={tr?.form.photoUrlPlaceholder ?? "URL foto bukti"}
                                            className="flex-1"
                                        />
                                        {photoUrls.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRemovePhoto(index)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                {photoUrls.length < 5 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAddPhoto}
                                        className="gap-1 text-xs"
                                    >
                                        <Plus className="h-3 w-3" />
                                        {tr?.form.addPhoto ?? (locale === "id" ? "Tambah Foto" : "Add Photo")}
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* STEP 2 */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 flex gap-2">
                                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                <span>{refundInfoText}</span>
                            </div>

                            <div className="space-y-1.5">
                                <Label>{tr?.form.bankLabel ?? (locale === "id" ? "Nama Bank *" : "Bank Name *")}</Label>
                                <Input
                                    value={bankName}
                                    onChange={(e) => setBankName(e.target.value)}
                                    placeholder={tr?.form.bankPlaceholder ?? (locale === "id" ? "contoh: BCA, BNI, Mandiri" : "e.g.: BCA, BNI, Mandiri")}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label>{tr?.form.accountNumLabel ?? (locale === "id" ? "Nomor Rekening *" : "Account Number *")}</Label>
                                <Input
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)}
                                    placeholder={tr?.form.accountNumPlaceholder ?? (locale === "id" ? "Masukkan nomor rekening" : "Enter account number")}
                                    inputMode="numeric"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label>{tr?.form.accountNameLabel ?? (locale === "id" ? "Nama Pemilik Rekening *" : "Account Owner Name *")}</Label>
                                <Input
                                    value={accountName}
                                    onChange={(e) => setAccountName(e.target.value)}
                                    placeholder={tr?.form.accountNamePlaceholder ?? (locale === "id" ? "Sesuai nama di buku tabungan" : "As shown on bank book")}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        {step === 2 && (
                            <Button variant="outline" onClick={() => setStep(1)} disabled={isSubmitting}>
                                {t.common.back ?? (locale === "id" ? "Kembali" : "Back")}
                            </Button>
                        )}
                        <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                            {t.common.cancel}
                        </Button>
                        {step === 1 ? (
                            <Button onClick={handleNextStep}>
                                {t.common.continue ?? (locale === "id" ? "Lanjutkan" : "Continue")}
                            </Button>
                        ) : (
                            <Button onClick={handleSubmit} disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t.common.processing ?? "..."}</>
                                ) : (
                                    <><RotateCcw className="h-4 w-4 mr-2" />{tr?.requestReturn ?? (locale === "id" ? "Ajukan Retur" : "Submit Return")}</>
                                )}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
// components/order/return-request-form.tsx
"use client";

import { useState, useRef, useCallback } from "react";
import { Order } from "@/types/order";
import { ReturnService } from "@/services/return.service";
import { ReturnReason } from "@/types/return";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { RotateCcw, Loader2, Upload, X, AlertCircle, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/format-currency";
import { cn } from "@/lib/utils";
import Image from "next/image";

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

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_PHOTOS = 5;

interface PreviewFile {
    file: File;
    previewUrl: string;
}

export function ReturnRequestForm({ order, onSuccess }: ReturnRequestFormProps) {
    const { t, locale } = useTranslation();
    const tr = t.returns;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<1 | 2>(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Step 1
    const [reason, setReason] = useState<ReturnReason | "">("");
    const [description, setDescription] = useState("");
    const [photos, setPhotos] = useState<PreviewFile[]>([]);

    // Step 2
    const [bankName, setBankName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [accountName, setAccountName] = useState("");

    const addFiles = useCallback((files: FileList | File[]) => {
        const fileArray = Array.from(files);
        const remaining = MAX_PHOTOS - photos.length;

        if (remaining <= 0) {
            toast.error(locale === "id" ? "Maksimal 5 foto" : "Maximum 5 photos");
            return;
        }

        const toAdd = fileArray.slice(0, remaining);
        const invalid: string[] = [];

        const newPreviews: PreviewFile[] = [];
        for (const file of toAdd) {
            if (!ALLOWED_TYPES.includes(file.type)) {
                invalid.push(`${file.name}: format tidak didukung`);
                continue;
            }
            if (file.size > MAX_FILE_SIZE) {
                invalid.push(`${file.name}: ukuran melebihi 2MB`);
                continue;
            }
            newPreviews.push({ file, previewUrl: URL.createObjectURL(file) });
        }

        if (invalid.length > 0) {
            toast.error(invalid.join("\n"));
        }

        if (newPreviews.length > 0) {
            setPhotos((prev) => [...prev, ...newPreviews]);
        }
    }, [photos.length, locale]);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            addFiles(e.target.files);
        }
        // Reset input so same file can be re-selected
        e.target.value = "";
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files.length > 0) {
            addFiles(e.dataTransfer.files);
        }
    };

    const removePhoto = (index: number) => {
        setPhotos((prev) => {
            URL.revokeObjectURL(prev[index].previewUrl);
            return prev.filter((_, i) => i !== index);
        });
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
        if (photos.length === 0) {
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

        setIsSubmitting(true);
        try {
            await ReturnService.createReturn(
                {
                    order_number: order.order_number,
                    reason: reason as ReturnReason,
                    description,
                    refund_bank_name: bankName,
                    refund_account_number: accountNumber,
                    refund_account_name: accountName,
                },
                photos.map((p) => p.file),
            );

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
        // Revoke all preview URLs to avoid memory leaks
        photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
        setIsOpen(false);
        setStep(1);
        setReason("");
        setDescription("");
        setPhotos([]);
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

                    {/* ── STEP 1 ── */}
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
                                    rows={3}
                                    maxLength={1000}
                                />
                                <p className={`text-xs ${description.length < 20 ? "text-muted-foreground" : "text-green-600"}`}>
                                    {description.length}/1000
                                </p>
                            </div>

                            {/* ── Photo Upload ── */}
                            <div className="space-y-2">
                                <Label>
                                    {tr?.form.photosLabel ?? (locale === "id" ? "Foto Bukti * (min. 1, maks. 5)" : "Proof Photos * (min. 1, max. 5)")}
                                </Label>

                                {/* Drop Zone — only show when under limit */}
                                {photos.length < MAX_PHOTOS && (
                                    <div
                                        className={cn(
                                            "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
                                            isDragging
                                                ? "border-primary bg-primary/5"
                                                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                        )}
                                        onClick={() => fileInputRef.current?.click()}
                                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                        onDragLeave={() => setIsDragging(false)}
                                        onDrop={handleDrop}
                                    >
                                        <Upload className="h-7 w-7 mx-auto text-gray-400 mb-1.5" />
                                        <p className="text-sm text-gray-600 font-medium">
                                            {locale === "id" ? "Klik atau seret foto ke sini" : "Click or drag photos here"}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {locale === "id"
                                                ? `JPEG, PNG, WEBP · maks. 2MB per file · ${photos.length}/${MAX_PHOTOS} foto`
                                                : `JPEG, PNG, WEBP · max 2MB each · ${photos.length}/${MAX_PHOTOS} photos`}
                                        </p>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,image/webp"
                                            multiple
                                            className="hidden"
                                            onChange={handleFileInput}
                                        />
                                    </div>
                                )}

                                {/* Previews */}
                                {photos.length > 0 && (
                                    <div className="grid grid-cols-5 gap-2">
                                        {photos.map((photo, index) => (
                                            <div key={index} className="relative aspect-square rounded-md overflow-hidden border border-gray-200 group">
                                                <Image
                                                    src={photo.previewUrl}
                                                    alt={`Proof ${index + 1}`}
                                                    fill
                                                    className="object-cover"
                                                    unoptimized // local blob URL
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removePhoto(index)}
                                                    className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="h-3 w-3 text-white" />
                                                </button>
                                                <div className="absolute bottom-0.5 left-0.5 bg-black/50 rounded text-[9px] text-white px-1">
                                                    {index + 1}
                                                </div>
                                            </div>
                                        ))}

                                        {/* Add more slot */}
                                        {photos.length < MAX_PHOTOS && (
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="aspect-square rounded-md border-2 border-dashed border-gray-200 hover:border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-gray-500 transition-colors"
                                            >
                                                <ImageIcon className="h-4 w-4" />
                                                <span className="text-[10px]">
                                                    {locale === "id" ? "Tambah" : "Add"}
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── STEP 2 ── */}
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
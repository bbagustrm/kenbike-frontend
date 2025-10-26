"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { validateImageFile, formatFileSize, createImagePreview } from "@/lib/image-utils";
import { UploadService } from "@/services/upload.service";
import { UploadFolder } from "@/types/upload";
import { toast } from "sonner";
import Image from "next/image";

interface ImageUploadProps {
    value?: string; // Current image URL
    onChange: (url: string) => void;
    onRemove?: () => void;
    folder: UploadFolder;
    disabled?: boolean;
    maxSizeMB?: number;
    label?: string;
    description?: string;
    aspectRatio?: string;
    className?: string;
}

export function ImageUpload({
                                value,
                                onChange,
                                onRemove,
                                folder,
                                disabled = false,
                                maxSizeMB = 2,
                                label = "Upload Image",
                                description = "Click to upload or drag and drop",
                                aspectRatio = "16/9",
                                className,
                            }: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(value || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file
        const validation = validateImageFile(file, maxSizeMB);
        if (!validation.valid) {
            toast.error(validation.error);
            return;
        }

        try {
            setIsUploading(true);

            // Create preview
            const previewUrl = await createImagePreview(file);
            setPreview(previewUrl);

            // Upload to server
            const response = await UploadService.uploadImage(file, folder);

            // Update form value
            onChange(response.data.url);
            toast.success("Image uploaded successfully");
        } catch (error: unknown) {
            console.error("Upload error:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to upload image";
            toast.error(errorMessage);
            setPreview(null);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleRemove = () => {
        setPreview(null);
        if (onRemove) {
            onRemove();
        } else {
            onChange("");
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleClick = () => {
        if (!disabled && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div className={cn("space-y-2", className)}>
            {label && (
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {label}
                </label>
            )}

            <div
                onClick={handleClick}
                className={cn(
                    "relative border-2 border-dashed rounded-lg overflow-hidden transition-colors",
                    preview ? "border-primary" : "border-gray-300",
                    !disabled && "cursor-pointer hover:border-primary",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
                style={{ aspectRatio }}
            >
                {preview ? (
                    <div className="relative w-full h-full">
                        <Image
                            src={preview}
                            alt="Preview"
                            fill
                            className="object-cover"
                        />
                        {!disabled && !isUploading && (
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 h-8 w-8"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove();
                                }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                        {isUploading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-white" />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                        {isUploading ? (
                            <>
                                <Loader2 className="h-10 w-10 animate-spin text-primary mb-2" />
                                <p className="text-sm text-muted-foreground">Uploading...</p>
                            </>
                        ) : (
                            <>
                                <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                                <p className="text-sm font-medium">{description}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    PNG, JPG, WEBP up to {maxSizeMB}MB
                                </p>
                            </>
                        )}
                    </div>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileSelect}
                disabled={disabled || isUploading}
                className="hidden"
            />
        </div>
    );
}
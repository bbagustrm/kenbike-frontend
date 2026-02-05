"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { validateImageFile } from "@/lib/image-utils";
import { UploadService } from "@/services/upload.service";
import { UploadFolder } from "@/types/upload";
import { toast } from "sonner";
import Image from "next/image";

interface MultiImageUploadProps {
    value: string[];
    onChange: (urls: string[]) => void;
    folder: UploadFolder;
    disabled?: boolean;
    maxFiles?: number;
    maxSizeMB?: number;
    label?: string;
    description?: string;
    className?: string;
}

export function MultiImageUpload({
    value = [],
    onChange,
    folder,
    disabled = false,
    maxFiles = 5,
    maxSizeMB = 2,
    label = "Upload Images",
    description = "Click to upload or drag and drop",
    className,
}: MultiImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        // Check max files limit
        if (value.length + files.length > maxFiles) {
            toast.error(`Maximum ${maxFiles} images allowed`);
            return;
        }

        // Validate all files
        for (const file of files) {
            const validation = validateImageFile(file, maxSizeMB);
            if (!validation.valid) {
                toast.error(`${file.name}: ${validation.error}`);
                return;
            }
        }

        try {
            setIsUploading(true);

            // Upload all files
            const response = await UploadService.uploadImages(files, folder);

            // Add new URLs to existing ones
            const newUrls = [...value, ...response.data.urls];
            onChange(newUrls);

            toast.success(`${response.data.count} image(s) uploaded successfully`);
        } catch (error: unknown) {
            console.error("Upload error:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to upload images";
            toast.error(errorMessage);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleRemove = async (index: number) => {
        try {
            const newUrls = value.filter((_, i) => i !== index);
            onChange(newUrls);
            toast.success("Image removed");
        } catch (error) {
            console.error("Remove error:", error);
            toast.error("Failed to remove image");
        }
    };

    const handleClick = () => {
        if (!disabled && fileInputRef.current && value.length < maxFiles) {
            fileInputRef.current.click();
        }
    };

    return (
        <div className={cn("flex flex-col gap-4", className)}>
            {label && (
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {label}
                </label>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {/* Existing Images */}
                {value.map((url, index) => (
                    <div
                        key={index}
                        className="relative aspect-square border-2 border-gray-200 rounded-lg overflow-hidden group bg-muted"
                    >
                        <Image
                            src={url}
                            alt={`Image ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
                        />
                        {index === 0 && (
                            <div className="absolute bottom-2 left-2">
                                <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                                    Primary
                                </span>
                            </div>
                        )}
                        {!disabled && !isUploading && (
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleRemove(index)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                ))}

                {/* Upload Button */}
                {value.length < maxFiles && (
                    <div
                        onClick={handleClick}
                        className={cn(
                            "relative aspect-square border-2 border-dashed rounded-lg overflow-hidden transition-colors",
                            "border-gray-300 hover:border-primary cursor-pointer",
                            disabled && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                            {isUploading ? (
                                <>
                                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                                    <p className="text-xs text-muted-foreground">Uploading...</p>
                                </>
                            ) : (
                                <>
                                    <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                                    <p className="text-xs font-medium">{description}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {value.length}/{maxFiles}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                onChange={handleFileSelect}
                disabled={disabled || isUploading}
                className="hidden"
            />

            <p className="text-xs text-muted-foreground">
                PNG, JPG, WEBP up to {maxSizeMB}MB each. Max {maxFiles} images. First image will be the primary image.
            </p>
        </div>
    );
}
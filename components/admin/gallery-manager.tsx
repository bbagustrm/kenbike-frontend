"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { GalleryImageInput } from "@/types/product";
import { MultiImageUpload } from "@/components/admin/multi-image-upload";

interface GalleryManagerProps {
    value: GalleryImageInput[];
    onChange: (galleries: GalleryImageInput[]) => void;
    maxImages?: number;
    disabled?: boolean;
}

export function GalleryManager({
                                   value,
                                   onChange,
                                   maxImages = 20,
                                   disabled = false
                               }: GalleryManagerProps) {
    // Extract URLs from gallery objects
    const imageUrls = value
        .filter(g => g._action !== "delete")
        .map(g => g.imageUrl);

    // Handle image URLs change from MultiImageUpload
    const handleImagesChange = (urls: string[]) => {
        // Map existing galleries to keep captions
        const existingGalleryMap = new Map(
            value.map(g => [g.imageUrl, g])
        );

        // Create new gallery array
        const newGalleries: GalleryImageInput[] = urls.map(url => {
            const existing = existingGalleryMap.get(url);

            if (existing) {
                // Keep existing gallery with caption
                return {
                    ...existing,
                    _action: existing.id ? "update" : "create",
                };
            } else {
                // New gallery image
                return {
                    imageUrl: url,
                    caption: "",
                    _action: "create",
                };
            }
        });

        // Mark removed galleries for deletion
        const removedGalleries = value.filter(g =>
            g.id && !urls.includes(g.imageUrl) && g._action !== "delete"
        ).map(g => ({
            ...g,
            _action: "delete" as const,
        }));

        onChange([...newGalleries, ...removedGalleries]);
    };

    // Handle caption change
    const handleCaptionChange = (url: string, caption: string) => {
        const updated = value.map(g => {
            if (g.imageUrl === url) {
                return {
                    ...g,
                    caption,
                    _action: g.id ? "update" as const : "create" as const,
                };
            }
            return g;
        });
        onChange(updated);
    };

    // Get visible galleries (not marked for deletion)
    const visibleGalleries = value.filter(g => g._action !== "delete");

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label>
                    Gallery Images ({visibleGalleries.length}/{maxImages})
                </Label>
            </div>

            <p className="text-xs text-muted-foreground">
                Upload community photos, customer reviews, or product showcases. Max {maxImages} images.
            </p>

            {/* Use MultiImageUpload component */}
            <MultiImageUpload
                value={imageUrls}
                onChange={handleImagesChange}
                folder="gallery"
                maxFiles={maxImages}
                maxSizeMB={5}
                label=""
                description="Add gallery image"
                disabled={disabled}
            />

            {/* Caption inputs for each image */}
            {visibleGalleries.length > 0 && (
                <div className="space-y-3 mt-4">
                    <Label>Image Captions (Optional)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {visibleGalleries.map((gallery, index) => (
                            <Card key={gallery.imageUrl} className="p-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0 w-10 h-10 bg-muted rounded flex items-center justify-center text-xs font-medium">
                                        {index + 1}
                                    </div>
                                    <Input
                                        placeholder="Instagram account or caption..."
                                        value={gallery.caption || ""}
                                        onChange={(e) => handleCaptionChange(gallery.imageUrl, e.target.value)}
                                        disabled={disabled}
                                        className="flex-1"
                                    />
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
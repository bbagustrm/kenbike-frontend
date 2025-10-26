"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { MultiImageUpload } from "./multi-image-upload";
import { CreateVariantData, UpdateVariantData } from "@/types/product";
import { cn } from "@/lib/utils";

interface VariantManagerProps {
    variants: (CreateVariantData | UpdateVariantData)[];
    onChange: (variants: (CreateVariantData | UpdateVariantData)[]) => void;
    disabled?: boolean;
    isEdit?: boolean;
}

export function VariantManager({
    variants,
    onChange,
    disabled = false,
    isEdit = false,
}: VariantManagerProps) {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

    const addVariant = () => {
        const newVariant: CreateVariantData = {
            variantName: "",
            sku: "",
            stock: 0,
            isActive: true,
            imageUrls: [],
        };
        onChange([...variants, newVariant]);
        setExpandedIndex(variants.length);
    };

    const updateVariant = (index: number, field: string, value: unknown) => {
        const updated = variants.map((v, i) => {
            if (i === index) {
                return { ...v, [field]: value };
            }
            return v;
        });
        onChange(updated);
    };

    const removeVariant = (index: number) => {
        const variant = variants[index];

        // If editing and variant has ID, mark for deletion
        if (isEdit && "id" in variant && variant.id) {
            const updated = variants.map((v, i) => {
                if (i === index) {
                    return { ...v, _action: "delete" as const };
                }
                return v;
            });
            onChange(updated);
        } else {
            // Otherwise just remove from array
            onChange(variants.filter((_, i) => i !== index));
        }

        if (expandedIndex === index) {
            setExpandedIndex(null);
        }
    };

    const toggleExpand = (index: number) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    // Filter out deleted variants for display
    const displayVariants = variants.filter(
        (v) => !("_action" in v && v._action === "delete")
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Product Variants</Label>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addVariant}
                    disabled={disabled}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Variant
                </Button>
            </div>

            {displayVariants.length === 0 ? (
                <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                        No variants added. Click Add Variant to create one.
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {displayVariants.map((variant, index) => {
                        const isExpanded = expandedIndex === index;
                        const actualIndex = variants.indexOf(variant);

                        return (
                            <Card key={actualIndex} className="overflow-hidden">
                                <CardHeader
                                    className="cursor-pointer hover:bg-muted/50 transition-colors p-4"
                                    onClick={() => toggleExpand(index)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {isExpanded ? (
                                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                            )}
                                            <CardTitle className="text-sm font-medium">
                                                {variant.variantName || `Variant ${index + 1}`}
                                                {variant.sku && (
                                                    <span className="ml-2 text-xs text-muted-foreground font-normal">
                            ({variant.sku})
                          </span>
                                                )}
                                            </CardTitle>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeVariant(actualIndex);
                                            }}
                                            disabled={disabled}
                                            className="h-8 w-8"
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </CardHeader>

                                {isExpanded && (
                                    <CardContent className="space-y-4 p-4 pt-0">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Variant Name */}
                                            <div className="space-y-2">
                                                <Label htmlFor={`variant-name-${actualIndex}`}>
                                                    Variant Name <span className="text-destructive">*</span>
                                                </Label>
                                                <Input
                                                    id={`variant-name-${actualIndex}`}
                                                    placeholder="e.g., Space Gray 512GB"
                                                    value={variant.variantName}
                                                    onChange={(e) =>
                                                        updateVariant(actualIndex, "variantName", e.target.value)
                                                    }
                                                    disabled={disabled}
                                                    required
                                                />
                                            </div>

                                            {/* SKU */}
                                            <div className="space-y-2">
                                                <Label htmlFor={`sku-${actualIndex}`}>
                                                    SKU <span className="text-destructive">*</span>
                                                </Label>
                                                <Input
                                                    id={`sku-${actualIndex}`}
                                                    placeholder="e.g., MBP-M3-SG-512"
                                                    value={variant.sku}
                                                    onChange={(e) =>
                                                        updateVariant(actualIndex, "sku", e.target.value)
                                                    }
                                                    disabled={disabled}
                                                    required
                                                />
                                            </div>

                                            {/* Stock */}
                                            <div className="space-y-2">
                                                <Label htmlFor={`stock-${actualIndex}`}>
                                                    Stock <span className="text-destructive">*</span>
                                                </Label>
                                                <Input
                                                    id={`stock-${actualIndex}`}
                                                    type="number"
                                                    min="0"
                                                    placeholder="0"
                                                    value={variant.stock}
                                                    onChange={(e) =>
                                                        updateVariant(actualIndex, "stock", parseInt(e.target.value) || 0)
                                                    }
                                                    disabled={disabled}
                                                    required
                                                />
                                            </div>

                                            {/* Active Status */}
                                            <div className="space-y-2">
                                                <Label htmlFor={`active-${actualIndex}`}>Active Status</Label>
                                                <div className="flex items-center space-x-2 h-10">
                                                    <Switch
                                                        id={`active-${actualIndex}`}
                                                        checked={variant.isActive ?? true}
                                                        onCheckedChange={(checked) =>
                                                            updateVariant(actualIndex, "isActive", checked)
                                                        }
                                                        disabled={disabled}
                                                    />
                                                    <span className="text-sm text-muted-foreground">
                            {variant.isActive ?? true ? "Active" : "Inactive"}
                          </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Variant Images */}
                                        <div className="space-y-2">
                                            <Label>Variant Images</Label>
                                            <MultiImageUpload
                                                value={variant.imageUrls || []}
                                                onChange={(urls) => updateVariant(actualIndex, "imageUrls", urls)}
                                                folder="variants"
                                                disabled={disabled}
                                                maxFiles={5}
                                                description="Add images"
                                            />
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
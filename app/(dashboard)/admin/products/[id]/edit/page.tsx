"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ProductService } from "@/services/product.service";
import { CategoryService } from "@/services/category.service";
import { TagService } from "@/services/tag.service";
import { PromotionService } from "@/services/promotion.service";
import { handleApiError } from "@/lib/api-client";
import { UpdateProductData} from "@/types/product";
import { Category } from "@/types/category";
import { Tag } from "@/types/tag";
import { Promotion } from "@/types/promotion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/admin/image-upload";
import { MultiSelect } from "@/components/ui/multi-select";
import { VariantManager } from "@/components/admin/variant-manager";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const { user } = useAuth();
    const isOwner = user?.role === "OWNER";
    const productId = params.id as string;

    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [promotions, setPromotions] = useState<Promotion[]>([]);

    const [formData, setFormData] = useState<UpdateProductData>({
        name: "",
        slug: "",
        idDescription: "",
        enDescription: "",
        idPrice: 0,
        enPrice: 0,
        imageUrl: "",
        weight: 0,
        height: 0,
        length: 0,
        width: 0,
        taxRate: 0.11,
        categoryId: undefined,
        promotionId: undefined,
        isFeatured: false,
        isActive: true,
        isPreOrder: false,
        preOrderDays: 0,
        variants: [],
        tagIds: [],
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoadingData(true);

                // Load product data
                const productRes = await ProductService.getProductById(productId);
                const product = productRes.data;

                // Load categories, tags, promotions
                const [categoriesRes, tagsRes] = await Promise.all([
                    CategoryService.getAdminCategories({ limit: 100, isActive: true }),
                    TagService.getAdminTags({ limit: 100, isActive: true }),
                ]);

                setCategories(categoriesRes.data || []);
                setTags(tagsRes.data || []);

                if (isOwner) {
                    const promotionsRes = await PromotionService.getAdminPromotions({
                        limit: 100,
                        isActive: true,
                    });
                    setPromotions(promotionsRes.data || []);
                }

                // Populate form with product data
                setFormData({
                    name: product.name,
                    slug: product.slug,
                    idDescription: product.idDescription,
                    enDescription: product.enDescription,
                    idPrice: product.idPrice,
                    enPrice: product.enPrice,
                    imageUrl: product.imageUrl,
                    weight: product.weight,
                    height: product.height,
                    length: product.length,
                    width: product.width,
                    taxRate: product.taxRate,
                    categoryId: product.categoryId || undefined,
                    promotionId: product.promotionId || undefined,
                    isFeatured: product.isFeatured,
                    isActive: product.isActive,
                    isPreOrder: product.isPreOrder,
                    preOrderDays: product.preOrderDays,
                    variants: product.variants?.map((v) => ({
                        id: v.id,
                        variantName: v.variantName,
                        sku: v.sku,
                        stock: v.stock,
                        isActive: v.isActive,
                        imageUrls: v.images?.map((img) => img.imageUrl) || [],
                    })) || [],
                    tagIds: product.tags?.map((t) => t.id) || [],
                });
            } catch (err) {
                const errorResult = handleApiError(err);
                toast.error(errorResult.message);
                router.push("/admin/products");
            } finally {
                setIsLoadingData(false);
            }
        };

        loadData();
    }, [productId, isOwner, router]);

    const handleChange = (field: keyof UpdateProductData, value: unknown) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.imageUrl) {
            toast.error("Please upload a product image");
            return;
        }

        if (formData.variants && formData.variants.length > 0) {
            for (let i = 0; i < formData.variants.length; i++) {
                const variant = formData.variants[i];
                if (variant._action === "delete") continue;

                if (!variant.variantName || !variant.sku) {
                    toast.error(`Variant ${i + 1}: Name and SKU are required`);
                    return;
                }
            }
        }

        setIsLoading(true);

        try {
            await ProductService.updateProduct(productId, formData);
            toast.success("Product updated successfully");
            router.push("/admin/products");
        } catch (err) {
            const errorResult = handleApiError(err);
            toast.error(errorResult.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoadingData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-5xl">
            {/* Breadcrumb */}
            <Breadcrumb className="mb-6">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/admin/products">Products</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Edit Product</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Edit Product</h1>
                    <p className="text-muted-foreground">Update product information</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>Essential product details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Product Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Product Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                placeholder="e.g., MacBook Pro M3"
                                value={formData.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                required
                                minLength={3}
                                maxLength={255}
                            />
                        </div>

                        {/* Slug */}
                        <div className="space-y-2">
                            <Label htmlFor="slug">
                                Slug <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="slug"
                                placeholder="macbook-pro-m3"
                                value={formData.slug}
                                onChange={(e) => handleChange("slug", e.target.value)}
                                required
                                pattern="[a-z0-9-]+"
                                title="Only lowercase letters, numbers, and hyphens"
                            />
                            <p className="text-xs text-muted-foreground">
                                URL-friendly identifier (auto-generated from name)
                            </p>
                        </div>

                        {/* Description ID */}
                        <div className="space-y-2">
                            <Label htmlFor="idDescription">
                                Description (Indonesian) <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                id="idDescription"
                                placeholder="Deskripsi produk dalam Bahasa Indonesia..."
                                value={formData.idDescription}
                                onChange={(e) => handleChange("idDescription", e.target.value)}
                                required
                                rows={4}
                                maxLength={5000}
                            />
                        </div>

                        {/* Description EN */}
                        <div className="space-y-2">
                            <Label htmlFor="enDescription">
                                Description (English) <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                id="enDescription"
                                placeholder="Product description in English..."
                                value={formData.enDescription}
                                onChange={(e) => handleChange("enDescription", e.target.value)}
                                required
                                rows={4}
                                maxLength={5000}
                            />
                        </div>

                        {/* Product Image */}
                        <div className="space-y-2">
                            <ImageUpload
                                label="Product Image"
                                description="Upload main product image"
                                value={formData.imageUrl}
                                onChange={(url) => handleChange("imageUrl", url)}
                                folder="products"
                                aspectRatio="1/1"
                                className="w-48"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Pricing */}
                <Card>
                    <CardHeader>
                        <CardTitle>Pricing</CardTitle>
                        <CardDescription>Set product prices</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Price IDR */}
                            <div className="space-y-2">
                                <Label htmlFor="idPrice">
                                    Price (IDR) <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="idPrice"
                                    type="number"
                                    min="0"
                                    placeholder="25000000"
                                    value={formData.idPrice || ""} // Gunakan string kosong jika nilai 0
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        // Pastikan nilai tidak dimulai dengan 0
                                        if (value === "" || (value.length > 1 && value.startsWith("0"))) {
                                            handleChange("idPrice", parseInt(value.substring(1)) || 0);
                                        } else {
                                            handleChange("idPrice", parseInt(value) || 0);
                                        }
                                    }}
                                    required
                                />
                            </div>

                            {/* Price USD */}
                            <div className="space-y-2">
                                <Label htmlFor="enPrice">
                                    Price (USD) <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="enPrice"
                                    type="number"
                                    min="0"
                                    placeholder="1700"
                                    value={formData.enPrice || ""} // Gunakan string kosong jika nilai 0
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        // Pastikan nilai tidak dimulai dengan 0
                                        if (value === "" || (value.length > 1 && value.startsWith("0"))) {
                                            handleChange("enPrice", parseInt(value.substring(1)) || 0);
                                        } else {
                                            handleChange("enPrice", parseInt(value) || 0);
                                        }
                                    }}
                                    required
                                />
                            </div>

                            {/* Tax Rate */}
                            <div className="space-y-2">
                                <Label htmlFor="taxRate">Tax Rate</Label>
                                <Input
                                    id="taxRate"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="1"
                                    placeholder="0.11"
                                    value={formData.taxRate || ""} // Gunakan string kosong jika nilai 0
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        // Pastikan nilai tidak dimulai dengan 0
                                        if (value === "" || (value.length > 1 && value.startsWith("0"))) {
                                            handleChange("taxRate", parseFloat(value.substring(1)) || 0);
                                        } else {
                                            handleChange("taxRate", parseFloat(value) || 0);
                                        }
                                    }}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Default: 0.11 (11%)
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Specifications */}
                <Card>
                    <CardHeader>
                        <CardTitle>Specifications</CardTitle>
                        <CardDescription>Product dimensions and weight</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="weight">Weight (g)</Label>
                                <Input
                                    id="weight"
                                    type="number"
                                    min="0"
                                    placeholder="1600"
                                    value={formData.weight || ""} // Gunakan string kosong jika nilai 0
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        // Pastikan nilai tidak dimulai dengan 0
                                        if (value === "" || (value.length > 1 && value.startsWith("0"))) {
                                            handleChange("weight", parseInt(value.substring(1)) || 0);
                                        } else {
                                            handleChange("weight", parseInt(value) || 0);
                                        }
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="length">Length (cm)</Label>
                                <Input
                                    id="length"
                                    type="number"
                                    min="0"
                                    placeholder="30"
                                    value={formData.length || ""} // Gunakan string kosong jika nilai 0
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        // Pastikan nilai tidak dimulai dengan 0
                                        if (value === "" || (value.length > 1 && value.startsWith("0"))) {
                                            handleChange("length", parseInt(value.substring(1)) || 0);
                                        } else {
                                            handleChange("length", parseInt(value) || 0);
                                        }
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="width">Width (cm)</Label>
                                <Input
                                    id="width"
                                    type="number"
                                    min="0"
                                    placeholder="21"
                                    value={formData.width || ""} // Gunakan string kosong jika nilai 0
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        // Pastikan nilai tidak dimulai dengan 0
                                        if (value === "" || (value.length > 1 && value.startsWith("0"))) {
                                            handleChange("width", parseInt(value.substring(1)) || 0);
                                        } else {
                                            handleChange("width", parseInt(value) || 0);
                                        }
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="height">Height (cm)</Label>
                                <Input
                                    id="height"
                                    type="number"
                                    min="0"
                                    placeholder="2"
                                    value={formData.height || ""} // Gunakan string kosong jika nilai 0
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        // Pastikan nilai tidak dimulai dengan 0
                                        if (value === "" || (value.length > 1 && value.startsWith("0"))) {
                                            handleChange("height", parseInt(value.substring(1)) || 0);
                                        } else {
                                            handleChange("height", parseInt(value) || 0);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Categorization */}
                <Card>
                    <CardHeader>
                        <CardTitle>Categorization</CardTitle>
                        <CardDescription>Organize your product</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Category */}
                        <div className="space-y-2">
                            <Label htmlFor="categoryId">Category</Label>
                            <Select
                                value={formData.categoryId || "none"}
                                onValueChange={(value) => handleChange("categoryId", value === "none" ? undefined : value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No Category</SelectItem>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Tags */}
                        <div className="space-y-2">
                            <Label>Tags</Label>
                            <MultiSelect
                                options={tags.map((tag) => ({ label: tag.name, value: tag.id }))}
                                selected={formData.tagIds || []}
                                onChange={(selected) => handleChange("tagIds", selected)}
                                placeholder="Select tags..."
                            />
                        </div>

                        {/* Promotion (Owner Only) */}
                        {isOwner && (
                            <div className="space-y-2">
                                <Label htmlFor="promotionId">Promotion</Label>
                                <Select
                                    value={formData.promotionId || "none"}
                                    onValueChange={(value) => handleChange("promotionId", value === "none" ? undefined : value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select promotion" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No Promotion</SelectItem>
                                        {promotions.map((promo) => (
                                            <SelectItem key={promo.id} value={promo.id}>
                                                {promo.name} (-{(promo.discount * 100).toFixed(0)}%)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Product Variants */}
                <Card>
                    <CardHeader>
                        <CardTitle>Product Variants</CardTitle>
                        <CardDescription>Add variants like sizes, colors, etc.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <VariantManager
                            variants={formData.variants || []}
                            onChange={(variants) => handleChange("variants", variants)}
                            isEdit={true}
                        />
                    </CardContent>
                </Card>

                {/* Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Settings</CardTitle>
                        <CardDescription>Additional product settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="isActive">Active Status</Label>
                                <p className="text-sm text-muted-foreground">
                                    Control product visibility
                                </p>
                            </div>
                            <Switch
                                id="isActive"
                                checked={formData.isActive}
                                onCheckedChange={(checked) => handleChange("isActive", checked)}
                            />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="isFeatured">Featured Product</Label>
                                <p className="text-sm text-muted-foreground">
                                    Show this product on homepage
                                </p>
                            </div>
                            <Switch
                                id="isFeatured"
                                checked={formData.isFeatured}
                                onCheckedChange={(checked) => handleChange("isFeatured", checked)}
                            />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="isPreOrder">Pre-Order</Label>
                                <p className="text-sm text-muted-foreground">
                                    Enable pre-order for this product
                                </p>
                            </div>
                            <Switch
                                id="isPreOrder"
                                checked={formData.isPreOrder}
                                onCheckedChange={(checked) => handleChange("isPreOrder", checked)}
                            />
                        </div>

                        {formData.isPreOrder && (
                            <div className="space-y-2">
                                <Label htmlFor="preOrderDays">Pre-Order Days</Label>
                                <Input
                                    id="preOrderDays"
                                    type="number"
                                    min="0"
                                    placeholder="7"
                                    value={formData.preOrderDays || ""} // Gunakan string kosong jika nilai 0
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        // Pastikan nilai tidak dimulai dengan 0
                                        if (value === "" || (value.length > 1 && value.startsWith("0"))) {
                                            handleChange("preOrderDays", parseInt(value.substring(1)) || 0);
                                        } else {
                                            handleChange("preOrderDays", parseInt(value) || 0);
                                        }
                                    }}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Number of days until product is available
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Submit Buttons */}
                <div className="flex items-center gap-4">
                    <Button type="submit" disabled={isLoading} size="lg">
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Update Product
                            </>
                        )}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
}
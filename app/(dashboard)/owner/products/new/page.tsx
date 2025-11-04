"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProductService } from "@/services/product.service";
import { CategoryService } from "@/services/category.service";
import { TagService } from "@/services/tag.service";
import { PromotionService } from "@/services/promotion.service";
import { handleApiError } from "@/lib/api-client";
import { CreateProductData } from "@/types/product";
import { Category } from "@/types/category";
import { Tag } from "@/types/tag";
import { Promotion } from "@/types/promotion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { MultiImageUpload } from "@/components/admin/multi-image-upload";
import { MultiSelect } from "@/components/ui/multi-select";
import { VariantManager } from "@/components/admin/variant-manager";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { GalleryManager } from "@/components/admin/gallery-manager";
import {PriceInput} from "@/components/ui/price-input";


export default function OwnerNewProductPage() {
    const router = useRouter();
    const { user } = useAuth();
    const isOwner = user?.role === "OWNER";

    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [promotions, setPromotions] = useState<Promotion[]>([]);

    const [formData, setFormData] = useState<CreateProductData>({
        name: "",
        slug: "",
        idDescription: "",
        enDescription: "",
        idPrice: 0,
        enPrice: 0,
        imageUrls: [],
        galleryImages: [],
        weight: 0,
        height: 0,
        length: 0,
        width: 0,
        taxRate: 0.11,
        categoryId: undefined,
        promotionId: undefined,
        isFeatured: false,
        isPreOrder: false,
        preOrderDays: 0,
        variants: [],
        tagIds: [],
    });

    useEffect(() => {
        const loadInitialData = async () => {
            try {
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
                } else {
                    setPromotions([]);
                }
            } catch (err) {
                const errorResult = handleApiError(err);
                toast.error(errorResult.message);
            } finally {
                setIsLoadingData(false);
            }
        };

        loadInitialData();
    }, [isOwner]);

    const handleChange = (field: keyof CreateProductData, value: unknown) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    };

    const handleNameChange = (name: string) => {
        handleChange("name", name);
        if (!formData.slug) {
            handleChange("slug", generateSlug(name));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // ✅ UBAH: Validation untuk imageUrls
        if (!formData.imageUrls || formData.imageUrls.length === 0) {
            toast.error("Please upload at least one product image");
            return;
        }

        if (formData.variants.length === 0) {
            toast.error("Please add at least one variant");
            return;
        }

        for (let i = 0; i < formData.variants.length; i++) {
            const variant = formData.variants[i];
            if (!variant.variantName || !variant.sku) {
                toast.error(`Variant ${i + 1}: Name and SKU are required`);
                return;
            }
        }

        setIsLoading(true);

        try {
            await ProductService.createProduct(formData);
            toast.success("Product created successfully");
            router.push("/owner/products");
        } catch (err) {
            const errorResult = handleApiError(err);
            toast.error(errorResult.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoadingData) {
        return (
            <div className="flex items-center justify-center flex-1">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-5xl">
            <Breadcrumb className="mb-6">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/owner">Dashboard</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/owner/products">Products</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>New Product</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center gap-4 mb-8">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Create New Product</h1>
                    <p className="text-muted-foreground">Add a new product to your catalog</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>Essential product details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Product Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                placeholder="e.g., MacBook Pro M3"
                                value={formData.name}
                                onChange={(e) => handleNameChange(e.target.value)}
                                required
                                minLength={3}
                                maxLength={255}
                            />
                        </div>

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

                        <div className="space-y-2">
                            <Label htmlFor="idDescription">
                                Description (Indonesian) <span className="text-destructive">*</span>
                            </Label>
                            <RichTextEditor
                                value={formData.idDescription}
                                onChange={(value) => handleChange("idDescription", value)}
                                placeholder="Deskripsi produk dalam Bahasa Indonesia..."
                                maxLength={5000}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="enDescription">
                                Description (English) <span className="text-destructive">*</span>
                            </Label>
                            <RichTextEditor
                                value={formData.enDescription}
                                onChange={(value) => handleChange("enDescription", value)}
                                placeholder="Product description in English..."
                                maxLength={5000}
                            />
                        </div>

                        <div className="space-y-2">
                            <MultiImageUpload
                                label="Product Images"
                                description="Click to upload or drag and drop"
                                value={formData.imageUrls}
                                onChange={(urls) => handleChange("imageUrls", urls)}
                                folder="products"
                                maxFiles={5}
                            />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent>
                        <GalleryManager
                            value={formData.galleryImages || []}
                            onChange={(galleries) => handleChange("galleryImages", galleries)}
                            maxImages={20}
                        />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Pricing</CardTitle>
                        <CardDescription>Set product prices</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <PriceInput
                                label="Price (IDR)"
                                type="IDR"
                                value={formData.idPrice}
                                onChange={(value) => handleChange("idPrice", value)}
                                placeholder="250000"
                                required
                            />

                            <PriceInput
                                label="Price (USD)"
                                type="USD"
                                value={formData.enPrice}
                                onChange={(value) => handleChange("enPrice", value)}
                                placeholder="17.50"
                                required
                            />

                            <div className="space-y-2">
                                <Label htmlFor="taxRate">Tax Rate</Label>
                                <Input
                                    id="taxRate"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="1"
                                    placeholder="0.11"
                                    value={formData.taxRate || ""}
                                    onChange={(e) => {
                                        const value = e.target.value;
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
                                    value={formData.weight || ""}
                                    onChange={(e) => {
                                        const value = e.target.value;
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
                                    value={formData.length || ""}
                                    onChange={(e) => {
                                        const value = e.target.value;
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
                                    value={formData.width || ""}
                                    onChange={(e) => {
                                        const value = e.target.value;
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
                                    value={formData.height || ""}
                                    onChange={(e) => {
                                        const value = e.target.value;
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

                <Card>
                    <CardHeader>
                        <CardTitle>Categorization</CardTitle>
                        <CardDescription>Organize your product</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
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

                        <div className="space-y-2">
                            <Label>Tags</Label>
                            <MultiSelect
                                options={tags.map((tag) => ({ label: tag.name, value: tag.id }))}
                                selected={formData.tagIds || []}
                                onChange={(selected) => handleChange("tagIds", selected)}
                                placeholder="Select tags..."
                            />
                        </div>

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

                <Card>
                    <CardHeader>
                        <CardTitle>Product Variants</CardTitle>
                        <CardDescription>Add variants like sizes, colors, etc.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <VariantManager
                            variants={formData.variants}
                            onChange={(variants) => handleChange("variants", variants)}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Settings</CardTitle>
                        <CardDescription>Additional product settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                                    value={formData.preOrderDays || ""}
                                    onChange={(e) => {
                                        const value = e.target.value;
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

                <div className="flex items-center gap-4">
                    <Button type="submit" disabled={isLoading} size="lg">
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Create Product
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
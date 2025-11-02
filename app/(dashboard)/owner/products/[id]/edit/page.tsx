"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ProductService } from "@/services/product.service";
import { CategoryService } from "@/services/category.service";
import { TagService } from "@/services/tag.service";
import { PromotionService } from "@/services/promotion.service";
import { handleApiError } from "@/lib/api-client";
import { UpdateProductData } from "@/types/product";
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
import { ImageUpload } from "@/components/admin/image-upload";
import { MultiSelect } from "@/components/ui/multi-select";
import { VariantManager } from "@/components/admin/variant-manager";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { RichTextEditor } from "@/components/admin/rich-text-editor";


export default function OwnerEditProductPage() {
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
                        <BreadcrumbPage>Edit Product</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

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
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>Essential product details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Product Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                minLength={3}
                                maxLength={255}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="slug">Slug</Label>
                            <Input
                                id="slug"
                                value={formData.slug}
                                onChange={(e) => handleChange("slug", e.target.value)}
                                pattern="[a-z0-9-]+"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="idDescription">Description (Indonesian)</Label>
                            <RichTextEditor
                                value={formData.idDescription || ""}
                                onChange={(value) => handleChange("idDescription", value)}
                                placeholder="Deskripsi produk dalam Bahasa Indonesia..."
                                maxLength={5000}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="enDescription">Description (English)</Label>
                            <RichTextEditor
                                value={formData.enDescription || ""}
                                onChange={(value) => handleChange("enDescription", value)}
                                placeholder="Product description in English..."
                                maxLength={5000}
                            />
                        </div>

                        <div className="space-y-2">
                            <ImageUpload
                                label="Product Image"
                                value={formData.imageUrl}
                                onChange={(url) => handleChange("imageUrl", url)}
                                folder="products"
                                aspectRatio="1/1"
                                className="w-48"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Pricing</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="idPrice">Price (IDR)</Label>
                                <Input
                                    id="idPrice"
                                    type="number"
                                    min="0"
                                    value={formData.idPrice}
                                    onChange={(e) => handleChange("idPrice", parseInt(e.target.value) || 0)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="enPrice">Price (USD)</Label>
                                <Input
                                    id="enPrice"
                                    type="number"
                                    min="0"
                                    value={formData.enPrice}
                                    onChange={(e) => handleChange("enPrice", parseInt(e.target.value) || 0)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="taxRate">Tax Rate</Label>
                                <Input
                                    id="taxRate"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="1"
                                    value={formData.taxRate}
                                    onChange={(e) => handleChange("taxRate", parseFloat(e.target.value) || 0)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Specifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="weight">Weight (g)</Label>
                                <Input
                                    id="weight"
                                    type="number"
                                    min="0"
                                    value={formData.weight}
                                    onChange={(e) => handleChange("weight", parseInt(e.target.value) || 0)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="length">Length (cm)</Label>
                                <Input
                                    id="length"
                                    type="number"
                                    min="0"
                                    value={formData.length}
                                    onChange={(e) => handleChange("length", parseInt(e.target.value) || 0)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="width">Width (cm)</Label>
                                <Input
                                    id="width"
                                    type="number"
                                    min="0"
                                    value={formData.width}
                                    onChange={(e) => handleChange("width", parseInt(e.target.value) || 0)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="height">Height (cm)</Label>
                                <Input
                                    id="height"
                                    type="number"
                                    min="0"
                                    value={formData.height}
                                    onChange={(e) => handleChange("height", parseInt(e.target.value) || 0)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Categorization</CardTitle>
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
                                    value={formData.promotionId || ""}
                                    onValueChange={(value) => handleChange("promotionId", value || undefined)}
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
                    </CardHeader>
                    <CardContent>
                        <VariantManager
                            variants={formData.variants || []}
                            onChange={(variants) => handleChange("variants", variants)}
                            isEdit={true}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="isFeatured">Featured Product</Label>
                                <p className="text-sm text-muted-foreground">
                                    Show on homepage
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
                                    Enable pre-order
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
                                    value={formData.preOrderDays}
                                    onChange={(e) =>
                                        handleChange("preOrderDays", parseInt(e.target.value) || 0)
                                    }
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>

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
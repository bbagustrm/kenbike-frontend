// File: admin/products/[id]/edit/page.tsx
'use client'
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ProductService } from "@/services/product.service";
import { UpdateProductData, ProductImage } from "@/types/product";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import ProductForm from "@/components/product/ProductForm";

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const { user } = useAuth();
    const userRole = user?.role === "OWNER" ? "owner" : "admin";
    const productId = params.id as string;

    const [isLoadingData, setIsLoadingData] = useState(true);
    const [initialData, setInitialData] = useState<UpdateProductData | null>(null);

    useEffect(() => {
        const loadProductData = async () => {
            try {
                const productRes = await ProductService.getProductById(productId);
                const product = productRes.data;

                const formattedData: UpdateProductData = {
                    name: product.name,
                    slug: product.slug,
                    idDescription: product.idDescription,
                    enDescription: product.enDescription,
                    idPrice: product.idPrice,
                    enPrice: product.enPrice,
                    imageUrls: product.images?.map((img: ProductImage) => img.imageUrl) || [],
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
                    galleryImages: product.gallery?.map((g) => ({
                        id: g.id,
                        imageUrl: g.imageUrl,
                        caption: g.caption || "",
                        _action: undefined,
                    })) || [],
                };

                setInitialData(formattedData);
            } catch (err) {
                toast.error("Failed to load product data");
                router.push(`/${userRole}/products`);
            } finally {
                setIsLoadingData(false);
            }
        };

        if (productId) {
            loadProductData();
        }
    }, [productId, userRole, router]);

    const handleSubmit = async (data: UpdateProductData) => {
        await ProductService.updateProduct(productId, data);
        toast.success("Product updated successfully");
    };

    return (
        <ProductForm
            userRole={userRole}
            initialData={initialData || undefined}
            onSubmit={handleSubmit}
            isLoadingData={isLoadingData}
            title="Edit Product"
            description="Update product information"
            submitButtonText="Update Product"
            isEditing={true}
        />
    );
}
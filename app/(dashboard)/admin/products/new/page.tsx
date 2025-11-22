// File: admin/products/new/page.tsx
'use client'

import { ProductService } from "@/services/product.service";
import { CreateProductData, UpdateProductData } from "@/types/product";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import ProductForm from "@/components/product/ProductForm";

export default function NewProductPage() {
    const { user } = useAuth();
    const userRole = user?.role === "OWNER" ? "owner" : "admin";

    const initialData: CreateProductData = {
        name: "",
        slug: "",
        idDescription: "",
        enDescription: "",
        idPrice: 0,
        enPrice: 0,
        imageUrls: [],
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
        galleryImages: [],
    };

    const handleSubmit = async (data: CreateProductData | UpdateProductData) => {
        await ProductService.createProduct(data as CreateProductData);
        toast.success("Product created successfully");
    };

    return (
        <ProductForm
            userRole={userRole}
            initialData={initialData}
            onSubmit={handleSubmit}
            title="Create New Product"
            description="Add a new product to your catalog"
            submitButtonText="Create Product"
            isEditing={false}
        />
    );
}
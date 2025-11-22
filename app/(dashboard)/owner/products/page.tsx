// File: owner/products/page.tsx
import ProductsPage from "@/components/admin/page/ProductsPage";

export default function OwnerProductsPage() {
    return (
        <ProductsPage
            userRole="owner"
            customTitle="Your Product Management"
            customDescription="Manage your products, variants, and inventory"
        />
    );
}
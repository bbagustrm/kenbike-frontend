// File: admin/products/page.tsx
import ProductsPage from "@/components/admin/page/ProductsPage";

export default function AdminProductsPage() {
    return (
        <ProductsPage
            userRole="admin"
            customTitle="Admin Product Management"
            customDescription="Manage all products, variants, and inventory in the system"
        />
    );
}
// File: admin/categories/page.tsx
import CategoriesPage from "@/components/admin/page/CategoriesPage";

export default function AdminCategoriesPage() {
    return (
        <CategoriesPage
            userRole="admin"
            customTitle="Admin Category Management"
            customDescription="Manage all product categories in the system"
        />
    );
}
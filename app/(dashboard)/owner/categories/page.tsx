// File: owner/categories/page.tsx
import CategoriesPage from "@/components/admin/page/CategoriesPage";

export default function OwnerCategoriesPage() {
    return (
        <CategoriesPage
            userRole="owner"
            customTitle="Your Category Management"
            customDescription="Organize your products into categories"
        />
    );
}
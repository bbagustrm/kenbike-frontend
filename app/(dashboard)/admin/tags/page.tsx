// File: admin/tags/page.tsx
import TagsPage from "@/components/admin/page/TagsPage";

export default function AdminTagsPage() {
    return (
        <TagsPage
            userRole="admin"
            customTitle="Admin Tag Management"
            customDescription="Manage all product tags in the system"
        />
    );
}
// File: owner/tags/page.tsx
import TagsPage from "@/components/admin/page/TagsPage";

export default function OwnerTagsPage() {
    return (
        <TagsPage
            userRole="owner"
            customTitle="Your Tag Management"
            customDescription="Label and organize your products with tags"
        />
    );
}
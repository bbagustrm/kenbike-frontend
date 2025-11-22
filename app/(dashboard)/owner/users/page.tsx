// File: owner/users/page.tsx
import UsersPage from "@/components/admin/page/UsersPage";

export default function OwnerUsersPage() {
    return (
        <UsersPage
            userRole="owner"
            customTitle="User Management"
            customDescription="Manage your users, roles, and permissions"
        />
    );
}
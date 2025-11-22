// File: admin/users/page.tsx
import UsersPage from "@/components/admin/page/UsersPage";

export default function AdminUsersPage() {
    return (
        <UsersPage
            userRole="admin"
            customTitle="Admin User Management"
            customDescription="Manage all users, roles, and permissions in the system"
        />
    );
}
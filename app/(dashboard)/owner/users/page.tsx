"use client";

import { useState, useEffect, useCallback } from "react";
import { UserService } from "@/services/user.service";
import { handleApiError } from "@/lib/api-client";
import { User, UserRole, GetUsersParams } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Search,
    Loader2,
    UserPlus,
    Trash2,
    Shield,
    Ban,
    CheckCircle,
    LogOut,
    Edit,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { getUserInitials } from "@/lib/auth-utils";
import { getImageUrl } from "@/lib/image-utils";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import { UserFormDrawer } from "@/components/admin/user-form-drawer";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

export default function OwnerUsersPage() {
    const { t } = useTranslation();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);

    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showRoleDialog, setShowRoleDialog] = useState(false);
    const [showStatusDialog, setShowStatusDialog] = useState(false);
    const [showUserFormDrawer, setShowUserFormDrawer] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const [newRole, setNewRole] = useState<UserRole>("USER");
    const [statusReason, setStatusReason] = useState("");

    const getRoleColor = (role: string) => {
        switch (role) {
            case "ADMIN":
                return "bg-blue-100 text-blue-700 border-blue-200";
            case "OWNER":
                return "bg-purple-100 text-purple-700 border-purple-200";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const params: GetUsersParams = {
                page,
                limit,
                sort_by: "created_at",
                order: "desc",
            };

            if (search) params.search = search;
            if (roleFilter !== "ALL") params.role = roleFilter;

            const response = await UserService.getUsers(params);
            setUsers(response.data || []);
            setTotal(response.meta.total);
            setTotalPages(response.meta.totalPages);
        } catch (err) {
            const errorResult = handleApiError(err);
            toast.error(errorResult.message);
        } finally {
            setIsLoading(false);
        }
    }, [page, roleFilter, search, limit]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchUsers();
    };

    const handleCreateUser = () => {
        setEditingUser(null);
        setShowUserFormDrawer(true);
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setShowUserFormDrawer(true);
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        setIsActionLoading(true);
        try {
            await UserService.deleteUser(selectedUser.id, false);
            const errorResult = handleApiError(null);
            toast.success(`User ${selectedUser.username} deleted successfully`);
            setShowDeleteDialog(false);
            fetchUsers();
        } catch (err) {
            const errorResult = handleApiError(err);
            toast.error(errorResult.message);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleChangeRole = async () => {
        if (!selectedUser) return;
        setIsActionLoading(true);
        try {
            await UserService.changeUserRole(selectedUser.id, { role: newRole });
            toast.success(`User role changed to ${newRole} successfully`);
            setShowRoleDialog(false);
            fetchUsers();
        } catch (err) {
            const errorResult = handleApiError(err);
            toast.error(errorResult.message);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleChangeStatus = async () => {
        if (!selectedUser) return;
        setIsActionLoading(true);
        try {
            const newStatus = !selectedUser.is_active;
            await UserService.changeUserStatus(selectedUser.id, {
                is_active: newStatus,
                reason: newStatus ? undefined : statusReason,
            });
            toast.success(`User ${newStatus ? "activated" : "suspended"} successfully`);
            setShowStatusDialog(false);
            setStatusReason("");
            fetchUsers();
        } catch (err) {
            const errorResult = handleApiError(err);
            toast.error(errorResult.message);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleForceLogout = async (user: User) => {
        if (!confirm(`Force logout ${user.username}?`)) return;
        try {
            await UserService.forceLogoutUser(user.id);
            toast.success(`User ${user.username} logged out from all devices`);
        } catch (err) {
            const errorResult = handleApiError(err);
            toast.error(errorResult.message);
        }
    };

    // Generate pagination items
    const getPaginationItems = () => {
        const items = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                items.push(
                    <PaginationItem key={i}>
                        <PaginationLink
                            isActive={page === i}
                            onClick={() => setPage(i)}
                        >
                            {i}
                        </PaginationLink>
                    </PaginationItem>
                );
            }
        } else {
            // Always show first page
            items.push(
                <PaginationItem key={1}>
                    <PaginationLink
                        isActive={page === 1}
                        onClick={() => setPage(1)}
                    >
                        1
                    </PaginationLink>
                </PaginationItem>
            );

            // Determine if we need ellipsis
            if (page > 3) {
                items.push(
                    <PaginationItem key="ellipsis-start">
                        <PaginationEllipsis />
                    </PaginationItem>
                );
            }

            // Show pages around current page
            const startPage = Math.max(2, page - 1);
            const endPage = Math.min(totalPages - 1, page + 1);

            for (let i = startPage; i <= endPage; i++) {
                items.push(
                    <PaginationItem key={i}>
                        <PaginationLink
                            isActive={page === i}
                            onClick={() => setPage(i)}
                        >
                            {i}
                        </PaginationLink>
                    </PaginationItem>
                );
            }

            // Determine if we need ellipsis at the end
            if (page < totalPages - 2) {
                items.push(
                    <PaginationItem key="ellipsis-end">
                        <PaginationEllipsis />
                    </PaginationItem>
                );
            }

            // Always show last page
            items.push(
                <PaginationItem key={totalPages}>
                    <PaginationLink
                        isActive={page === totalPages}
                        onClick={() => setPage(totalPages)}
                    >
                        {totalPages}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        return items;
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">User Management</h1>
                <p className="text-muted-foreground">Manage users, roles, and permissions</p>
            </div>

            <div className="mb-6 flex flex-col md:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, email, or username..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button type="submit">Search</Button>
                </form>

                <Select
                    value={roleFilter}
                    onValueChange={(value) => {
                        setRoleFilter(value as UserRole | "ALL");
                        setPage(1);
                    }}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Roles</SelectItem>
                        <SelectItem value="USER">User</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="OWNER">Owner</SelectItem>
                    </SelectContent>
                </Select>

                <Button onClick={handleCreateUser}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add User
                </Button>
            </div>

            <TooltipProvider>
                <div className="border rounded-lg bg-background">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="pl-4">User</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        No users found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={getImageUrl(user.profile_image)} />
                                                    <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">
                                                        {user.first_name} {user.last_name}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        @{user.username}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={getRoleColor(user.role)}>
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {user.is_active ? (
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                    Active
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                                    Suspended
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEditUser(user)}
                                                            className="hover:bg-transparent"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent><p>Edit User</p></TooltipContent>
                                                </Tooltip>

                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedUser(user);
                                                                setNewRole(user.role);
                                                                setShowRoleDialog(true);
                                                            }}
                                                            className="hover:bg-transparent"
                                                        >
                                                            <Shield className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent><p>Change Role</p></TooltipContent>
                                                </Tooltip>

                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedUser(user);
                                                                setShowStatusDialog(true);
                                                            }}
                                                            className="hover:bg-transparent"
                                                        >
                                                            {user.is_active ? (
                                                                <Ban className="h-4 w-4" />
                                                            ) : (
                                                                <CheckCircle className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{user.is_active ? "Suspend" : "Activate"}</p>
                                                    </TooltipContent>
                                                </Tooltip>

                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleForceLogout(user)}
                                                            className="hover:bg-transparent"
                                                        >
                                                            <LogOut className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent><p>Force Logout</p></TooltipContent>
                                                </Tooltip>

                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedUser(user);
                                                                setShowDeleteDialog(true);
                                                            }}
                                                            className="hover:bg-transparent"
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent><p>Delete User</p></TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </TooltipProvider>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => setPage(page - 1)}
                                className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                        </PaginationItem>
                        {getPaginationItems()}
                        <PaginationItem>
                            <PaginationNext
                                onClick={() => setPage(page + 1)}
                                className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>

            <UserFormDrawer
                open={showUserFormDrawer}
                onOpenChange={setShowUserFormDrawer}
                user={editingUser}
                onSuccess={fetchUsers}
            />

            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t.adminUsers.confirmDelete}</DialogTitle>
                        <DialogDescription>
                            {t.adminUsers.confirmDeleteDesc.replace("{username}", selectedUser?.username || "")}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isActionLoading}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteUser} disabled={isActionLoading}>
                            {isActionLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t.adminUsers.deleting}</> : t.adminUsers.deleteButton}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t.adminUsers.changeRoleTitle}</DialogTitle>
                        <DialogDescription>
                            {t.adminUsers.changeRoleDesc.replace("{username}", selectedUser?.username || "")}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>{t.adminUsers.selectRole}</Label>
                            <Select value={newRole} onValueChange={(value) => setNewRole(value as UserRole)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USER">User</SelectItem>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                    <SelectItem value="OWNER">Owner</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRoleDialog(false)} disabled={isActionLoading}>Cancel</Button>
                        <Button onClick={handleChangeRole} disabled={isActionLoading}>
                            {isActionLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t.adminUsers.changing}</> : t.adminUsers.changeRoleButton}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedUser?.is_active ? t.adminUsers.suspendTitle : t.adminUsers.activateTitle}</DialogTitle>
                        <DialogDescription>
                            {selectedUser?.is_active
                                ? t.adminUsers.suspendDesc.replace("{username}", selectedUser?.username || "")
                                : t.adminUsers.activateDesc.replace("{username}", selectedUser?.username || "")}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedUser?.is_active && (
                        <div className="space-y-2 py-4">
                            <Label htmlFor="reason">{t.adminUsers.reasonLabel}</Label>
                            <Input id="reason" placeholder={t.adminUsers.reasonPlaceholder} value={statusReason} onChange={(e) => setStatusReason(e.target.value)} />
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setShowStatusDialog(false); setStatusReason(""); }} disabled={isActionLoading}>
                            Cancel
                        </Button>
                        <Button variant={selectedUser?.is_active ? "destructive" : "default"} onClick={handleChangeStatus} disabled={isActionLoading}>
                            {isActionLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t.adminUsers.processing}</> : (selectedUser?.is_active ? t.adminUsers.suspendButton : t.adminUsers.activateButton)}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
"use client";

import { useState, useEffect } from "react";
import { UserService } from "@/services/user.service";
import { handleApiError } from "@/lib/api-client";
import { User, UserRole } from "@/types/auth";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Search,
    Loader2,
    UserPlus,
    Edit,
    Trash2,
    Shield,
    Ban,
    CheckCircle,
    LogOut,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { Label } from "@/components/ui/label";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Pagination & Filters
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");

    // Dialog states
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showRoleDialog, setShowRoleDialog] = useState(false);
    const [showStatusDialog, setShowStatusDialog] = useState(false);
    const [newRole, setNewRole] = useState<UserRole>("USER");
    const [statusReason, setStatusReason] = useState("");
    const [isActionLoading, setIsActionLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [page, roleFilter]);

    const fetchUsers = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const params: any = {
                page,
                limit,
                sort_by: "created_at",
                order: "desc" as const,
            };

            if (search) params.search = search;
            if (roleFilter !== "ALL") params.role = roleFilter;

            const response = await UserService.getUsers(params);
            setUsers(response.data || []);
            setTotal(response.meta.total);
            setTotalPages(response.meta.totalPages);
        } catch (err) {
            setError(handleApiError(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchUsers();
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;

        setIsActionLoading(true);
        setError(null);

        try {
            await UserService.deleteUser(selectedUser.id, false);
            setSuccess(`User ${selectedUser.username} deleted successfully`);
            setShowDeleteDialog(false);
            fetchUsers();
        } catch (err) {
            setError(handleApiError(err));
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleChangeRole = async () => {
        if (!selectedUser) return;

        setIsActionLoading(true);
        setError(null);

        try {
            await UserService.changeUserRole(selectedUser.id, { role: newRole });
            setSuccess(`User role changed to ${newRole} successfully`);
            setShowRoleDialog(false);
            fetchUsers();
        } catch (err) {
            setError(handleApiError(err));
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleChangeStatus = async () => {
        if (!selectedUser) return;

        setIsActionLoading(true);
        setError(null);

        try {
            const newStatus = !selectedUser.is_active;
            await UserService.changeUserStatus(selectedUser.id, {
                is_active: newStatus,
                reason: newStatus ? undefined : statusReason,
            });
            setSuccess(
                `User ${newStatus ? "activated" : "suspended"} successfully`
            );
            setShowStatusDialog(false);
            setStatusReason("");
            fetchUsers();
        } catch (err) {
            setError(handleApiError(err));
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleForceLogout = async (user: User) => {
        if (!confirm(`Force logout ${user.username}?`)) return;

        setError(null);
        try {
            await UserService.forceLogoutUser(user.id);
            setSuccess(`User ${user.username} logged out from all devices`);
        } catch (err) {
            setError(handleApiError(err));
        }
    };

    const getRoleBadgeVariant = (role: UserRole) => {
        switch (role) {
            case "ADMIN":
                return "default";
            case "OWNER":
                return "secondary";
            default:
                return "outline";
        }
    };

    const getInitials = (user: User) => {
        return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">User Management</h1>
                <p className="text-muted-foreground">
                    Manage users, roles, and permissions
                </p>
            </div>

            {success && (
                <Alert className="mb-6 bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                        {success}
                    </AlertDescription>
                </Alert>
            )}

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Filters & Search */}
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

                <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add User
                </Button>
            </div>

            {/* Users Table */}
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
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
                                                <AvatarImage src={user.profile_image} />
                                                <AvatarFallback>{getInitials(user)}</AvatarFallback>
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
                                        <Badge variant={getRoleBadgeVariant(user.role)}>
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
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setNewRole(user.role);
                                                    setShowRoleDialog(true);
                                                }}
                                            >
                                                <Shield className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setShowStatusDialog(true);
                                                }}
                                            >
                                                {user.is_active ? (
                                                    <Ban className="h-4 w-4" />
                                                ) : (
                                                    <CheckCircle className="h-4 w-4" />
                                                )}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleForceLogout(user)}
                                            >
                                                <LogOut className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setShowDeleteDialog(true);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Showing {(page - 1) * limit + 1} to{" "}
                        {Math.min(page * limit, total)} of {total} users
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(page + 1)}
                            disabled={page === totalPages}
                        >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Delete Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {selectedUser?.username}? This
                            action can be undone (soft delete).
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(false)}
                            disabled={isActionLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteUser}
                            disabled={isActionLoading}
                        >
                            {isActionLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Change Role Dialog */}
            <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change User Role</DialogTitle>
                        <DialogDescription>
                            Change the role for {selectedUser?.username}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Select Role</Label>
                            <Select value={newRole} onValueChange={(value) => setNewRole(value as UserRole)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USER">User</SelectItem>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                    <SelectItem value="OWNER">Owner</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowRoleDialog(false)}
                            disabled={isActionLoading}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleChangeRole} disabled={isActionLoading}>
                            {isActionLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Changing...
                                </>
                            ) : (
                                "Change Role"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Change Status Dialog */}
            <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {selectedUser?.is_active ? "Suspend" : "Activate"} User
                        </DialogTitle>
                        <DialogDescription>
                            {selectedUser?.is_active
                                ? `Suspend ${selectedUser?.username}? They won't be able to login.`
                                : `Activate ${selectedUser?.username}? They will be able to login again.`}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedUser?.is_active && (
                        <div className="space-y-2 py-4">
                            <Label htmlFor="reason">Reason (optional)</Label>
                            <Input
                                id="reason"
                                placeholder="Enter reason for suspension..."
                                value={statusReason}
                                onChange={(e) => setStatusReason(e.target.value)}
                            />
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowStatusDialog(false);
                                setStatusReason("");
                            }}
                            disabled={isActionLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant={selectedUser?.is_active ? "destructive" : "default"}
                            onClick={handleChangeStatus}
                            disabled={isActionLoading}
                        >
                            {isActionLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : selectedUser?.is_active ? (
                                "Suspend"
                            ) : (
                                "Activate"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
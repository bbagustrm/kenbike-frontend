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
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { getUserInitials } from "@/lib/auth-utils";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";

export default function AdminUsersPage() {
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
    const [newRole, setNewRole] = useState<UserRole>("USER");
    const [statusReason, setStatusReason] = useState("");

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
            toast.error(handleApiError(err));
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

    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        setIsActionLoading(true);
        try {
            await UserService.deleteUser(selectedUser.id, false);
            toast.success(t.adminUsers.successMessages.deleted.replace("{username}", selectedUser.username));
            setShowDeleteDialog(false);
            fetchUsers();
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleChangeRole = async () => {
        if (!selectedUser) return;
        setIsActionLoading(true);
        try {
            await UserService.changeUserRole(selectedUser.id, { role: newRole });
            toast.success(t.adminUsers.successMessages.roleChanged.replace("{username}", selectedUser.username).replace("{role}", newRole));
            setShowRoleDialog(false);
            fetchUsers();
        } catch (err) {
            toast.error(handleApiError(err));
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
            const messageKey = newStatus ? "activated" : "suspended";
            toast.success(t.adminUsers.successMessages[messageKey].replace("{username}", selectedUser.username));
            setShowStatusDialog(false);
            setStatusReason("");
            fetchUsers();
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleForceLogout = async (user: User) => {
        if (!confirm(t.adminUsers.confirmForceLogout.replace("{username}", user.username))) return;
        try {
            await UserService.forceLogoutUser(user.id);
            toast.success(t.adminUsers.successMessages.forceLogout.replace("{username}", user.username));
        } catch (err) {
            toast.error(handleApiError(err));
        }
    };

    const getRoleBadgeVariant = (role: UserRole) => {
        switch (role) {
            case "ADMIN": return "default";
            case "OWNER": return "secondary";
            default: return "outline";
        }
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">{t.adminUsers.title}</h1>
                <p className="text-muted-foreground">{t.adminUsers.description}</p>
            </div>

            <div className="mb-6 flex flex-col md:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={t.adminUsers.searchPlaceholder}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button type="submit">{t.adminUsers.searchButton}</Button>
                </form>

                <Select value={roleFilter} onValueChange={(value) => { setRoleFilter(value as UserRole | "ALL"); setPage(1); }}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder={t.adminUsers.filterByRole} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">{t.adminUsers.allRoles}</SelectItem>
                        <SelectItem value="USER">User</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="OWNER">Owner</SelectItem>
                    </SelectContent>
                </Select>

                <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    {t.adminUsers.addUser}
                </Button>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t.adminUsers.tableHeaders.user}</TableHead>
                            <TableHead>{t.adminUsers.tableHeaders.email}</TableHead>
                            <TableHead>{t.adminUsers.tableHeaders.role}</TableHead>
                            <TableHead>{t.adminUsers.tableHeaders.status}</TableHead>
                            <TableHead>{t.adminUsers.tableHeaders.created}</TableHead>
                            <TableHead className="text-right">{t.adminUsers.tableHeaders.actions}</TableHead>
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
                                    {t.adminUsers.noUsersFound}
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={user.profile_image} />
                                                <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{user.first_name} {user.last_name}</p>
                                                <p className="text-sm text-muted-foreground">@{user.username}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        {user.is_active ? (
                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                {t.adminUsers.active}
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                                {t.adminUsers.suspended}
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => { setSelectedUser(user); setNewRole(user.role); setShowRoleDialog(true); }}>
                                                <Shield className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => { setSelectedUser(user); setShowStatusDialog(true); }}>
                                                {user.is_active ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleForceLogout(user)}>
                                                <LogOut className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => { setSelectedUser(user); setShowDeleteDialog(true); }}>
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

            {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        {t.adminUsers.pagination.showing} {(page - 1) * limit + 1} to {Math.min(page * limit, total)} {t.adminUsers.pagination.of} {total} {t.adminUsers.pagination.users}
                    </p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            {t.adminUsers.pagination.previous}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page === totalPages}>
                            {t.adminUsers.pagination.next}
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}

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
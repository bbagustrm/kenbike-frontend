"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CategoryService } from "@/services/category.service";
import { handleApiError } from "@/lib/api-client";
import { Category, CreateCategoryData, UpdateCategoryData } from "@/types/category";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Search,
    Loader2,
    Plus,
    MoreVertical,
    Edit,
    Trash2,
    RotateCcw,
    AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { BulkActionBar } from "@/components/admin/bulk-action-bar";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

export default function OwnerCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    // const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState<"active" | "deleted">("active");

    const [formDialog, setFormDialog] = useState<{
        open: boolean;
        mode: "create" | "edit";
        category: Category | null;
    }>({ open: false, mode: "create", category: null });

    const [formData, setFormData] = useState<CreateCategoryData | UpdateCategoryData>({
        name: "",
        slug: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({
        open: false,
        id: null,
    });

    const [hardDeleteDialog, setHardDeleteDialog] = useState<{ open: boolean; id: string | null }>({
        open: false,
        id: null,
    });

    const fetchCategories = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await CategoryService.getAdminCategories({
                page,
                limit,
                search: search || undefined,
                includeDeleted: activeTab === "deleted",
                onlyDeleted: activeTab === "deleted",
            });

            let filteredCategories = response.data || [];
            if (activeTab === "deleted") {
                filteredCategories = filteredCategories.filter(c => c.deletedAt !== null);
            } else {
                filteredCategories = filteredCategories.filter(c => c.deletedAt === null);
            }

            setCategories(filteredCategories);
            if (response.meta) {
                // setTotal(response.meta.total);
                setTotalPages(response.meta.totalPages);
            }
        } catch (err) {
            const errorResult = handleApiError(err);
            toast.error(errorResult.message);
        } finally {
            setIsLoading(false);
        }
    }, [page, limit, search, activeTab]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchCategories();
    };

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    };

    const handleOpenCreateDialog = () => {
        setFormData({ name: "", slug: "" });
        setFormDialog({ open: true, mode: "create", category: null });
    };

    const handleOpenEditDialog = (category: Category) => {
        setFormData({
            name: category.name,
            slug: category.slug,
            isActive: category.isActive,
        });
        setFormDialog({ open: true, mode: "edit", category });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (formDialog.mode === "create") {
                await CategoryService.createCategory(formData as CreateCategoryData);
                toast.success("Category created successfully");
            } else if (formDialog.category) {
                await CategoryService.updateCategory(
                    formDialog.category.id,
                    formData as UpdateCategoryData
                );
                toast.success("Category updated successfully");
            }

            setFormDialog({ open: false, mode: "create", category: null });
            await fetchCategories();
        } catch (err) {
            const errorResult = handleApiError(err);
            toast.error(errorResult.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await CategoryService.deleteCategory(id);
            toast.success("Category deleted successfully");
            setDeleteDialog({ open: false, id: null });
            await fetchCategories();
        } catch (err) {
            const errorResult = handleApiError(err);
            toast.error(errorResult.message);
        }
    };

    const handleHardDelete = async (id: string) => {
        try {
            await CategoryService.hardDeleteCategory(id);
            toast.success("Category permanently deleted");
            setHardDeleteDialog({ open: false, id: null });
            await fetchCategories();
        } catch (err) {
            const errorResult = handleApiError(err);
            toast.error(errorResult.message);
        }
    };

    const handleRestore = async (id: string) => {
        try {
            await CategoryService.restoreCategory(id);
            toast.success("Category restored successfully");
            await fetchCategories();
        } catch (err) {
            const errorResult = handleApiError(err);
            toast.error(errorResult.message);
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(categories.map((c) => c.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedIds([...selectedIds, id]);
        } else {
            setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;

        try {
            await CategoryService.bulkDeleteCategories(selectedIds);
            toast.success(`${selectedIds.length} categories deleted successfully`);
            setSelectedIds([]);
            await fetchCategories();
        } catch (err) {
            const errorResult = handleApiError(err);
            toast.error(errorResult.message);
        }
    };

    const handleBulkRestore = async () => {
        if (selectedIds.length === 0) return;

        try {
            await CategoryService.bulkRestoreCategories(selectedIds);
            toast.success(`${selectedIds.length} categories restored successfully`);
            setSelectedIds([]);
            await fetchCategories();
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
                <h1 className="text-3xl font-bold mb-2">Category Management</h1>
                <p className="text-muted-foreground">Organize your products into categories</p>
            </div>

            <div className="mb-6 flex flex-col md:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search categories..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button type="submit">Search</Button>
                </form>

                <Button onClick={handleOpenCreateDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Category
                </Button>
            </div>

            <Tabs
                value={activeTab}
                onValueChange={(v) => {
                    setActiveTab(v as "active" | "deleted");
                    setPage(1);
                    setSelectedIds([]);
                }}
            >
                <TabsList>
                    <TabsTrigger value="active" className="min-w-20">Active</TabsTrigger>
                    <TabsTrigger value="deleted" className="min-w-20">Deleted</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-6">
                    <div className="border rounded-lg bg-background">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-12">
                                        <Checkbox
                                            checked={selectedIds.length === categories.length && categories.length > 0}
                                            onCheckedChange={handleSelectAll}
                                        />
                                    </TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Slug</TableHead>
                                    <TableHead>Products</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                        </TableCell>
                                    </TableRow>
                                ) : categories.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8">
                                            No categories found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    categories.map((category) => (
                                        <TableRow key={category.id}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedIds.includes(category.id)}
                                                    onCheckedChange={(checked) =>
                                                        handleSelectOne(category.id, checked as boolean)
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">{category.name}</TableCell>
                                            <TableCell>
                                                <code className="text-xs bg-muted px-2 py-1 rounded">{category.slug}</code>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{category.productCount || 0}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {activeTab === "active" ? (
                                                    <Badge variant={category.isActive ? "default" : "secondary"}>
                                                        {category.isActive ? "Active" : "Inactive"}
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="destructive">Deleted</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>{new Date(category.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="hover:bg-transparent">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {activeTab === "active" ? (
                                                            <>
                                                                <DropdownMenuItem onClick={() => handleOpenEditDialog(category)}>
                                                                    <Edit className="h-4 w-4 mr-2" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="text-destructive"
                                                                    onClick={() => setDeleteDialog({ open: true, id: category.id })}
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <DropdownMenuItem onClick={() => handleRestore(category.id)}>
                                                                    <RotateCcw className="h-4 w-4 mr-2" />
                                                                    Restore
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="text-destructive"
                                                                    onClick={() => setHardDeleteDialog({ open: true, id: category.id })}
                                                                >
                                                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                                                    Delete Permanently
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

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
                </TabsContent>
            </Tabs>

            <BulkActionBar
                selectedCount={selectedIds.length}
                onDelete={activeTab === "active" ? handleBulkDelete : undefined}
                onRestore={activeTab === "deleted" ? handleBulkRestore : undefined}
                onClearSelection={() => setSelectedIds([])}
                isDeleted={activeTab === "deleted"}
            />

            <Dialog open={formDialog.open} onOpenChange={(open) => setFormDialog({ ...formDialog, open })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {formDialog.mode === "create" ? "Create Category" : "Edit Category"}
                        </DialogTitle>
                        <DialogDescription>
                            {formDialog.mode === "create"
                                ? "Add a new categories to organize your products"
                                : "Update categories information"}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Category Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., Electronics"
                                    value={formData.name}
                                    onChange={(e) => {
                                        const name = e.target.value;
                                        setFormData({
                                            ...formData,
                                            name,
                                            slug: formDialog.mode === "create" ? generateSlug(name) : formData.slug,
                                        });
                                    }}
                                    required
                                    minLength={2}
                                    maxLength={100}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="slug">
                                    Slug <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="slug"
                                    placeholder="electronics"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    required
                                    pattern="[a-z0-9-]+"
                                    title="Only lowercase letters, numbers, and hyphens"
                                />
                            </div>

                            {formDialog.mode === "edit" && (
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="isActive">Active Status</Label>
                                    <Badge variant={(formData as UpdateCategoryData).isActive ? "default" : "secondary"}>
                                        {(formData as UpdateCategoryData).isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setFormDialog({ open: false, mode: "create", category: null })}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : formDialog.mode === "create" ? (
                                    "Create"
                                ) : (
                                    "Update"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog({ open, id: null })}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Category</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this category? Products in this category will not be
                            deleted but will be uncategorized.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteDialog.id && handleDelete(deleteDialog.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                open={hardDeleteDialog.open}
                onOpenChange={(open) => setHardDeleteDialog({ open, id: null })}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Permanently Delete Category</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to permanently delete this category? This action cannot be undone and
                            will remove all data associated with this category.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => hardDeleteDialog.id && handleHardDelete(hardDeleteDialog.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete Permanently
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
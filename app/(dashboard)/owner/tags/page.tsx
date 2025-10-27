"use client";

import React, { useState, useEffect, useCallback } from "react";
import { TagService } from "@/services/tag.service";
import { handleApiError } from "@/lib/api-client";
import { Tag, CreateTagData, UpdateTagData } from "@/types/tag";
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
    Eye,
    EyeOff,
    ChevronLeft,
    ChevronRight,
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

export default function OwnerTagsPage() {
    const [tags, setTags] = useState<Tag[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState<"active" | "deleted">("active");

    const [formDialog, setFormDialog] = useState<{
        open: boolean;
        mode: "create" | "edit";
        tag: Tag | null;
    }>({ open: false, mode: "create", tag: null });

    const [formData, setFormData] = useState<CreateTagData | UpdateTagData>({
        name: "",
        slug: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({
        open: false,
        id: null,
    });

    const fetchTags = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await TagService.getAdminTags({
                page,
                limit,
                search: search || undefined,
                includeDeleted: activeTab === "deleted",
            });

            let filteredTags = response.data || [];
            if (activeTab === "deleted") {
                filteredTags = filteredTags.filter(t => t.deletedAt !== null);
            } else {
                filteredTags = filteredTags.filter(t => t.deletedAt === null);
            }

            setTags(filteredTags);
            if (response.meta) {
                setTotal(response.meta.total);
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
        fetchTags();
    }, [fetchTags]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchTags();
    };

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    };

    const handleOpenCreateDialog = () => {
        setFormData({ name: "", slug: "" });
        setFormDialog({ open: true, mode: "create", tag: null });
    };

    const handleOpenEditDialog = (tag: Tag) => {
        setFormData({
            name: tag.name,
            slug: tag.slug,
            isActive: tag.isActive,
        });
        setFormDialog({ open: true, mode: "edit", tag });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (formDialog.mode === "create") {
                await TagService.createTag(formData as CreateTagData);
                toast.success("Tag created successfully");
            } else if (formDialog.tag) {
                await TagService.updateTag(formDialog.tag.id, formData as UpdateTagData);
                toast.success("Tag updated successfully");
            }

            setFormDialog({ open: false, mode: "create", tag: null });
            await fetchTags();
        } catch (err) {
            const errorResult = handleApiError(err);
            toast.error(errorResult.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await TagService.deleteTag(id);
            toast.success("Tag deleted successfully");
            setDeleteDialog({ open: false, id: null });
            await fetchTags();
        } catch (err) {
            const errorResult = handleApiError(err);
            toast.error(errorResult.message);
        }
    };

    const handleRestore = async (id: string) => {
        try {
            await TagService.restoreTag(id);
            toast.success("Tag restored successfully");
            await fetchTags();
        } catch (err) {
            const errorResult = handleApiError(err);
            toast.error(errorResult.message);
        }
    };

    const handleHardDelete = async (id: string) => {
        if (!confirm("Are you sure you want to permanently delete this tag? This action cannot be undone!")) {
            return;
        }

        try {
            await TagService.hardDeleteTag(id);
            toast.success("Tag permanently deleted");
            await fetchTags();
        } catch (err) {
            const errorResult = handleApiError(err);
            toast.error(errorResult.message);
        }
    };

    const handleToggleActive = async (id: string) => {
        try {
            await TagService.toggleTagActive(id);
            toast.success("Tag status updated");
            await fetchTags();
        } catch (err) {
            const errorResult = handleApiError(err);
            toast.error(errorResult.message);
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(tags.map((t) => t.id));
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
            await TagService.bulkDeleteTags(selectedIds);
            toast.success(`${selectedIds.length} tags deleted successfully`);
            setSelectedIds([]);
            await fetchTags();
        } catch (err) {
            const errorResult = handleApiError(err);
            toast.error(errorResult.message);
        }
    };

    const handleBulkRestore = async () => {
        if (selectedIds.length === 0) return;

        try {
            await TagService.bulkRestoreTags(selectedIds);
            toast.success(`${selectedIds.length} tags restored successfully`);
            setSelectedIds([]);
            await fetchTags();
        } catch (err) {
            const errorResult = handleApiError(err);
            toast.error(errorResult.message);
        }
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Tag Management</h1>
                <p className="text-muted-foreground">Label and organize your products with tags</p>
            </div>

            <div className="mb-6 flex flex-col md:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search tags..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button type="submit">Search</Button>
                </form>

                <Button onClick={handleOpenCreateDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Tag
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
                                            checked={selectedIds.length === tags.length && tags.length > 0}
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
                                ) : tags.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8">
                                            No tags found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    tags.map((tag) => (
                                        <TableRow key={tag.id}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedIds.includes(tag.id)}
                                                    onCheckedChange={(checked) =>
                                                        handleSelectOne(tag.id, checked as boolean)
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-medium">
                                                    {tag.name}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <code className="text-xs bg-muted px-2 py-1 rounded">{tag.slug}</code>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{tag.productCount || 0}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {activeTab === "active" ? (
                                                    <Badge variant={tag.isActive ? "default" : "secondary"}>
                                                        {tag.isActive ? "Active" : "Inactive"}
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="destructive">Deleted</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>{new Date(tag.createdAt).toLocaleDateString()}</TableCell>
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
                                                                <DropdownMenuItem onClick={() => handleOpenEditDialog(tag)}>
                                                                    <Edit className="h-4 w-4 mr-2" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleToggleActive(tag.id)}>
                                                                    {tag.isActive ? (
                                                                        <EyeOff className="h-4 w-4 mr-2" />
                                                                    ) : (
                                                                        <Eye className="h-4 w-4 mr-2" />
                                                                    )}
                                                                    {tag.isActive ? "Deactivate" : "Activate"}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="text-destructive"
                                                                    onClick={() => setDeleteDialog({ open: true, id: tag.id })}
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <DropdownMenuItem onClick={() => handleRestore(tag.id)}>
                                                                    <RotateCcw className="h-4 w-4 mr-2" />
                                                                    Restore
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="text-destructive"
                                                                    onClick={() => handleHardDelete(tag.id)}
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-2" />
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

                    {totalPages > 1 && (
                        <div className="mt-6 flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}{" "}
                                tags
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
                            {formDialog.mode === "create" ? "Create Tag" : "Edit Tag"}
                        </DialogTitle>
                        <DialogDescription>
                            {formDialog.mode === "create"
                                ? "Add a new tag to label your products"
                                : "Update tag information"}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Tag Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., Trending"
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
                                    maxLength={50}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="slug">
                                    Slug <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="slug"
                                    placeholder="trending"
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
                                    <Badge variant={(formData as UpdateTagData).isActive ? "default" : "secondary"}>
                                        {(formData as UpdateTagData).isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setFormDialog({ open: false, mode: "create", tag: null })}
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
                        <AlertDialogTitle>Delete Tag</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this tag? Products with this tag will remain but
                            will no longer be associated with it.
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
        </div>
    );
}
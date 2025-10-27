"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ProductService } from "@/services/product.service";
import { handleApiError } from "@/lib/api-client";
import { ProductListItem } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
    Star,
    StarOff,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { BulkActionBar } from "@/components/admin/bulk-action-bar";
import { getImageUrl } from "@/lib/image-utils";
import Image from "next/image";
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

export default function AdminProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<ProductListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [search, setSearch] = useState("");
    type ProductSortBy = "createdAt" | "name" | "idPrice" | "totalSold" | "avgRating";

    const [sortBy, setSortBy] = useState<ProductSortBy>("createdAt");

    const [order, setOrder] = useState<"asc" | "desc">("desc");
    const [activeTab, setActiveTab] = useState<"active" | "deleted">("active");

    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({
        open: false,
        id: null,
    });

    const [hardDeleteDialog, setHardDeleteDialog] = useState<{ open: boolean; id: string | null }>({
        open: false,
        id: null,
    });

    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await ProductService.getAdminProducts({
                page,
                limit,
                search: search || undefined,
                sortBy: sortBy,
                order,
                includeDeleted: activeTab === "deleted",
            });

            let filteredProducts = response.data || [];
            if (activeTab === "deleted") {
                filteredProducts = filteredProducts.filter(p => p.deletedAt !== null);
            } else {
                filteredProducts = filteredProducts.filter(p => p.deletedAt === null);
            }

            setProducts(filteredProducts);
            setTotal(response.meta.total);
            setTotalPages(response.meta.totalPages);
        } catch (err) {
            const errorResult = handleApiError(err);
            toast.error(errorResult.message);
        } finally {
            setIsLoading(false);
        }
    }, [page, limit, search, sortBy, order, activeTab]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchProducts();
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(products.map((p) => p.id));
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
            await ProductService.bulkDeleteProducts(selectedIds);
            toast.success(`${selectedIds.length} products deleted successfully`);
            setSelectedIds([]);
            await fetchProducts();
        } catch (err) {
            const errorResult = handleApiError(err);
            toast.error(errorResult.message);
        }
    };

    const handleBulkRestore = async () => {
        if (selectedIds.length === 0) return;

        try {
            await ProductService.bulkRestoreProducts(selectedIds);
            toast.success(`${selectedIds.length} products restored successfully`);
            setSelectedIds([]);
            await fetchProducts();
        } catch (err) {
            const errorResult = handleApiError(err);
            toast.error(errorResult.message);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await ProductService.deleteProduct(id);
            toast.success("Product deleted successfully");
            setDeleteDialog({ open: false, id: null });
            await fetchProducts();
        } catch (err) {
            const errorResult = handleApiError(err);
            toast.error(errorResult.message);
        }
    };

    const handleHardDelete = async (id: string) => {
        try {
            await ProductService.hardDeleteProduct(id);
            toast.success("Product permanently deleted");
            setHardDeleteDialog({ open: false, id: null });
            await fetchProducts();
        } catch (err) {
            const errorResult = handleApiError(err);
            toast.error(errorResult.message);
        }
    };

    const handleRestore = async (id: string) => {
        try {
            await ProductService.restoreProduct(id);
            toast.success("Product restored successfully");
            await fetchProducts();
        } catch (err) {
            const errorResult = handleApiError(err);
            toast.error(errorResult.message);
        }
    };

    const handleToggleActive = async (id: string) => {
        try {
            await ProductService.toggleProductActive(id);
            toast.success("Product status updated");
            await fetchProducts();
        } catch (err) {
            const errorResult = handleApiError(err);
            toast.error(errorResult.message);
        }
    };

    const handleToggleFeatured = async (id: string) => {
        try {
            await ProductService.toggleProductFeatured(id);
            toast.success("Product featured status updated");
            await fetchProducts();
        } catch (err) {
            const errorResult = handleApiError(err);
            toast.error(errorResult.message);
        }
    };

    return (
        <div className="container mx-auto py-8 px-4">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Product Management</h1>
                <p className="text-muted-foreground">Manage your products, variants, and inventory</p>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button type="submit">Search</Button>
                </form>

                <Select value={sortBy} onValueChange={(value) => setSortBy(value as ProductSortBy)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="createdAt">Date Created</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="idPrice">Price</SelectItem>
                        <SelectItem value="totalSold">Total Sold</SelectItem>
                        <SelectItem value="avgRating">Rating</SelectItem>
                    </SelectContent>
                </Select>

                <Button onClick={() => router.push("/admin/products/new")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                </Button>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => {
                setActiveTab(v as "active" | "deleted");
                setPage(1);
                setSelectedIds([]);
            }}>
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
                                            checked={selectedIds.length === products.length && products.length > 0}
                                            onCheckedChange={handleSelectAll}
                                        />
                                    </TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Price (IDR)</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Sold</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                        </TableCell>
                                    </TableRow>
                                ) : products.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8">
                                            No products found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    products.map((product) => {
                                        const totalStock = product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;

                                        return (
                                            <TableRow key={product.id}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedIds.includes(product.id)}
                                                        onCheckedChange={(checked) =>
                                                            handleSelectOne(product.id, checked as boolean)
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative h-12 w-12 rounded overflow-hidden bg-muted">
                                                            <Image
                                                                src={getImageUrl(product.imageUrl) || "/placeholder.png"}
                                                                alt={product.name}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{product.name}</p>
                                                            <p className="text-sm text-muted-foreground">{product.slug}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {product.category ? (
                                                        <Badge variant="outline">{product.category.name}</Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground text-sm">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">
                                                          Rp {product.idPrice.toLocaleString("id-ID")}
                                                        </span>
                                                        {product.promotion && (
                                                            <Badge variant="secondary" className="w-fit text-xs">
                                                                -{(product.promotion.discount * 100).toFixed(0)}%
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={totalStock > 0 ? "default" : "destructive"}>
                                                        {totalStock}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{product.totalSold}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {activeTab === "active" ? (
                                                            <>
                                                                <Badge
                                                                    variant={product.isActive ? "default" : "secondary"}
                                                                    className="w-fit"
                                                                >
                                                                    {product.isActive ? "Active" : "Inactive"}
                                                                </Badge>
                                                                {product.isFeatured && (
                                                                    <Badge variant="outline" className="w-fit">
                                                                        <Star className="h-3 w-3 mr-1" />
                                                                        Featured
                                                                    </Badge>
                                                                )}
                                                                {product.tags && product.tags.length > 0 &&
                                                                    product.tags.map((tag) => (
                                                                        <Badge key={tag.id} variant="secondary" className="text-xs">
                                                                            {tag.name}
                                                                        </Badge>
                                                                    ))
                                                                }
                                                            </>
                                                        ) : (
                                                            <Badge variant="destructive" className="w-fit">
                                                                Deleted
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
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
                                                                    <DropdownMenuItem
                                                                        onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                                                                    >
                                                                        <Edit className="h-4 w-4 mr-2" />
                                                                        Edit
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleToggleActive(product.id)}>
                                                                        {product.isActive ? (
                                                                            <EyeOff className="h-4 w-4 mr-2" />
                                                                        ) : (
                                                                            <Eye className="h-4 w-4 mr-2" />
                                                                        )}
                                                                        {product.isActive ? "Deactivate" : "Activate"}
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleToggleFeatured(product.id)}>
                                                                        {product.isFeatured ? (
                                                                            <StarOff className="h-4 w-4 mr-2" />
                                                                        ) : (
                                                                            <Star className="h-4 w-4 mr-2" />
                                                                        )}
                                                                        {product.isFeatured ? "Unfeature" : "Feature"}
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        className="text-destructive"
                                                                        onClick={() => setDeleteDialog({ open: true, id: product.id })}
                                                                    >
                                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                                        Delete
                                                                    </DropdownMenuItem>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <DropdownMenuItem onClick={() => handleRestore(product.id)}>
                                                                        <RotateCcw className="h-4 w-4 mr-2" />
                                                                        Restore
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        className="text-destructive"
                                                                        onClick={() => setHardDeleteDialog({ open: true, id: product.id })}
                                                                    >
                                                                        <AlertTriangle className="h-4 w-4 mr-2" />
                                                                        Hard Delete
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-6 flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}{" "}
                                products
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

            {/* Bulk Action Bar */}
            <BulkActionBar
                selectedCount={selectedIds.length}
                onDelete={activeTab === "active" ? handleBulkDelete : undefined}
                onRestore={activeTab === "deleted" ? handleBulkRestore : undefined}
                onClearSelection={() => setSelectedIds([])}
                isDeleted={activeTab === "deleted"}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog({ open, id: null })}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Product</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this product? This action can be undone by restoring
                            from the Deleted Products tab.
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

            {/* Hard Delete Confirmation Dialog */}
            <AlertDialog
                open={hardDeleteDialog.open}
                onOpenChange={(open) => setHardDeleteDialog({ open, id: null })}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Permanently Delete Product</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to permanently delete this product? This action cannot be undone.
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
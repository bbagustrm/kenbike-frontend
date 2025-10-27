"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PromotionService } from "@/services/promotion.service";
import { handleApiError } from "@/lib/api-client";
import { Promotion } from "@/types/promotion";
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
import { Badge } from "@/components/ui/badge";
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
    Calendar,
    Percent,
    AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
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
import { format } from "date-fns";

export default function OwnerPromotionsPage() {
    const router = useRouter();
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState<"active" | "expired" | "deleted">("active");

    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({
        open: false,
        id: null,
    });

    const [hardDeleteDialog, setHardDeleteDialog] = useState<{ open: boolean; id: string | null }>({
        open: false,
        id: null,
    });

    const fetchPromotions = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await PromotionService.getAdminPromotions({
                page,
                limit,
                search: search || undefined,
                includeDeleted: activeTab === "deleted",
            });

            let filteredPromotions = response.data || [];
            if (activeTab === "deleted") {
                filteredPromotions = filteredPromotions.filter(p => p.deletedAt !== null);
            } else if (activeTab === "expired") {
                filteredPromotions = filteredPromotions.filter(p =>
                    p.deletedAt === null && new Date(p.endDate) < new Date()
                );
            } else {
                filteredPromotions = filteredPromotions.filter(p =>
                    p.deletedAt === null && new Date(p.endDate) >= new Date()
                );
            }

            setPromotions(filteredPromotions);
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
        fetchPromotions();
    }, [fetchPromotions]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchPromotions();
    };

    const handleDelete = async (id: string) => {
        try {
            await PromotionService.deletePromotion(id);
            toast.success("Promotion deleted successfully");
            setDeleteDialog({ open: false, id: null });
            fetchPromotions();
        } catch (err) {
            const errorResult = handleApiError(err);
            toast.error(errorResult.message);
        }
    };

    const handleHardDelete = async (id: string) => {
        try {
            await PromotionService.hardDeletePromotion(id);
            toast.success("Promotion permanently deleted");
            setHardDeleteDialog({ open: false, id: null });
            fetchPromotions();
        } catch (err) {
            const errorResult = handleApiError(err);
            toast.error(errorResult.message);
        }
    };

    const handleRestore = async (id: string) => {
        try {
            await PromotionService.restorePromotion(id);
            toast.success("Promotion restored successfully");
            fetchPromotions();
        } catch (err) {
            const errorResult = handleApiError(err);
            toast.error(errorResult.message);
        }
    };

    const handleToggleActive = async (id: string) => {
        try {
            await PromotionService.togglePromotionActive(id);
            toast.success("Promotion status updated");
            fetchPromotions();
        } catch (err) {
            const errorResult = handleApiError(err);
            toast.error(errorResult.message);
        }
    };

    const isPromotionExpired = (endDate: string) => {
        return new Date(endDate) < new Date();
    };

    const getPromotionStatus = (promotion: Promotion) => {
        if (promotion.deletedAt) return "deleted";
        if (!promotion.isActive) return "inactive";
        if (isPromotionExpired(promotion.endDate)) return "expired";
        if (new Date(promotion.startDate) > new Date()) return "scheduled";
        return "active";
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "active":
                return <Badge variant="default">Active</Badge>;
            case "scheduled":
                return <Badge variant="secondary">Scheduled</Badge>;
            case "expired":
                return <Badge variant="destructive">Expired</Badge>;
            case "inactive":
                return <Badge variant="outline">Inactive</Badge>;
            case "deleted":
                return <Badge variant="destructive">Deleted</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Promotion Management</h1>
                <p className="text-muted-foreground">
                    Create and manage discounts and promotional campaigns
                </p>
            </div>

            <div className="mb-6 flex flex-col md:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search promotions..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button type="submit">Search</Button>
                </form>

                <Button onClick={() => router.push("/owner/promotions/new")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Promotion
                </Button>
            </div>

            <Tabs
                value={activeTab}
                onValueChange={(v) => {
                    setActiveTab(v as "active" | "expired" | "deleted");
                    setPage(1);
                }}
            >
                <TabsList>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="expired">Expired</TabsTrigger>
                    <TabsTrigger value="deleted">Deleted</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-6">
                    <div className="border rounded-lg bg-background">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead>Promotion</TableHead>
                                    <TableHead>Discount</TableHead>
                                    <TableHead>Period</TableHead>
                                    <TableHead>Products</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                        </TableCell>
                                    </TableRow>
                                ) : promotions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            No promotions found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    promotions.map((promotion) => {
                                        const status = getPromotionStatus(promotion);

                                        return (
                                            <TableRow key={promotion.id}>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{promotion.name}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {promotion.id}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="font-mono">
                                                        <Percent className="h-3 w-3 mr-1" />
                                                        {(promotion.discount * 100).toFixed(0)}%
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col text-sm">
                                                        <div className="flex items-center gap-1 text-muted-foreground">
                                                            <Calendar className="h-3 w-3" />
                                                            <span>{format(new Date(promotion.startDate), "MMM d, yyyy")}</span>
                                                        </div>
                                                        <span className="text-xs">
                                                            to {format(new Date(promotion.endDate), "MMM d, yyyy")}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{promotion.productCount || 0}</Badge>
                                                </TableCell>
                                                <TableCell>{getStatusBadge(status)}</TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="hover:bg-transparent">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            {activeTab === "deleted" ? (
                                                                <>
                                                                    <DropdownMenuItem onClick={() => handleRestore(promotion.id)}>
                                                                        <RotateCcw className="h-4 w-4 mr-2" />
                                                                        Restore
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        className="text-destructive"
                                                                        onClick={() =>
                                                                            setHardDeleteDialog({ open: true, id: promotion.id })
                                                                        }
                                                                    >
                                                                        <AlertTriangle className="h-4 w-4 mr-2" />
                                                                        Delete Permanently
                                                                    </DropdownMenuItem>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            router.push(`/owner/promotions/${promotion.id}/edit`)
                                                                        }
                                                                    >
                                                                        <Edit className="h-4 w-4 mr-2" />
                                                                        Edit
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        className="text-destructive"
                                                                        onClick={() =>
                                                                            setDeleteDialog({ open: true, id: promotion.id })
                                                                        }
                                                                    >
                                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                                        Delete
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

                    {totalPages > 1 && (
                        <div className="mt-6 flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}{" "}
                                promotions
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

            <AlertDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog({ open, id: null })}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Promotion</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this promotion? Products with this promotion will
                            have it removed. This action can be undone from the Deleted tab.
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
                        <AlertDialogTitle>Permanently Delete Promotion</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to permanently delete this promotion? This action cannot be undone
                            and will remove all data associated with this promotion.
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
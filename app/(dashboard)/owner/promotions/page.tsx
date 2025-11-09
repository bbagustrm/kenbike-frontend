"use client";

import {useState, useEffect, useCallback, useMemo} from "react";
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
    Calendar,
    Percent,
    AlertTriangle,
    RefreshCw,
    Clock,
    TrendingUp,
    TrendingDown,
    Package,
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

interface CronStatus {
    activated: number;
    deactivated: number;
    productsCleared: number;
}

export default function OwnerPromotionsPage() {
    const router = useRouter();
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [totalPages, setTotalPages] = useState(0);
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState<"active" | "expired" | "deleted">("active");

    const [cronStatus, setCronStatus] = useState<CronStatus | null>(null);
    const [isRunningCron, setIsRunningCron] = useState(false);
    const [lastCronRun, setLastCronRun] = useState<Date | null>(null);

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
            const now = new Date();

            if (activeTab === "deleted") {
                // Only show deleted promotions
                filteredPromotions = filteredPromotions.filter(p => p.deletedAt !== null);
            } else if (activeTab === "expired") {
                // Only show expired promotions
                filteredPromotions = filteredPromotions.filter(p =>
                    p.deletedAt === null && new Date(p.endDate) < now
                );
            } else {
                filteredPromotions = filteredPromotions.filter(p => {
                    const endDate = new Date(p.endDate);
                    // Show if not deleted AND not expired
                    return p.deletedAt === null && endDate >= now;
                });

                filteredPromotions.sort((a, b) => {
                    const nowTime = now.getTime();
                    const aStart = new Date(a.startDate).getTime();
                    const bStart = new Date(b.startDate).getTime();

                    const aIsActive = aStart <= nowTime;
                    const bIsActive = bStart <= nowTime;

                    // Active promotions first
                    if (aIsActive && !bIsActive) return -1;
                    if (!aIsActive && bIsActive) return 1;

                    // Within same status, sort by start date (newest first for active, earliest first for scheduled)
                    if (aIsActive && bIsActive) {
                        return bStart - aStart; // Active: newest first
                    } else {
                        return aStart - bStart; // Scheduled: earliest first
                    }
                });
            }

            setPromotions(filteredPromotions);
            if (response.meta) {
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

    const handleManualCronTrigger = async () => {
        setIsRunningCron(true);
        try {
            const response = await PromotionService.triggerAutoUpdate();
            setCronStatus(response.data);
            setLastCronRun(new Date());

            const totalChanges = response.data.activated + response.data.deactivated + response.data.productsCleared;

            if (totalChanges > 0) {
                toast.success(
                    `Auto-update completed: ${response.data.deactivated} deactivated, ${response.data.productsCleared} products cleared`,
                    { duration: 5000 }
                );
                fetchPromotions();
            } else {
                toast.info("No promotions needed updating");
            }
        } catch (err) {
            const errorResult = handleApiError(err);
            toast.error(errorResult.message);
        } finally {
            setIsRunningCron(false);
        }
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
                return <Badge variant="default" className="bg-green-500">Active</Badge>;
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

            if (page > 3) {
                items.push(
                    <PaginationItem key="ellipsis-start">
                        <PaginationEllipsis />
                    </PaginationItem>
                );
            }

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

            if (page < totalPages - 2) {
                items.push(
                    <PaginationItem key="ellipsis-end">
                        <PaginationEllipsis />
                    </PaginationItem>
                );
            }

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

    const promotionStats = useMemo(() => {
        const now = new Date();

        const active = promotions.filter(p => {
            const startDate = new Date(p.startDate);
            const endDate = new Date(p.endDate);
            return p.deletedAt === null && p.isActive && startDate <= now && endDate >= now;
        }).length;

        const scheduled = promotions.filter(p => {
            const startDate = new Date(p.startDate);
            const endDate = new Date(p.endDate);
            return p.deletedAt === null && startDate > now && endDate >= now;
        }).length;

        const expired = promotions.filter(p => {
            const endDate = new Date(p.endDate);
            return p.deletedAt === null && endDate < now;
        }).length;

        return { active, scheduled, expired };
    }, [promotions]);



    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Promotions</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your promotional campaigns and discounts
                </p>
            </div>

            {/* Cron Monitor Card - Clean & Compact */}
            <Card className="mb-8">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="space-y-1 flex gap-2 items-center">
                            <CardTitle className="text-base font-medium">Auto-Update Monitor</CardTitle>
                            <CardDescription className="text-sm">
                                (Runs hourly)
                            </CardDescription>
                        </div>
                        <Button
                            onClick={handleManualCronTrigger}
                            disabled={isRunningCron}
                            size="sm"
                            variant="outline"
                        >
                            {isRunningCron ? (
                                <>
                                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                    Running
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="mr-2 h-3.5 w-3.5" />
                                    Run Now
                                </>
                            )}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="pb-2">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* ✅ Show real-time active count */}
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <TrendingUp className="h-4 w-4 text-green-600" />
                                <span>Active Now</span>
                            </div>
                            <p className="text-2xl font-semibold">{promotionStats.active}</p>
                        </div>

                        {/* ✅ Show expired count */}
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <TrendingDown className="h-4 w-4 text-red-600" />
                                <span>Expired</span>
                            </div>
                            <p className="text-2xl font-semibold">{promotionStats.expired}</p>
                        </div>

                        {/* ✅ Show last cron run stats if available */}
                        {cronStatus ? (
                            <>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Package className="h-4 w-4 text-orange-600" />
                                        <span>Last Cleared</span>
                                    </div>
                                    <p className="text-2xl font-semibold">{cronStatus.productsCleared}</p>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4 text-blue-600" />
                                        <span>Last Run</span>
                                    </div>
                                    <p className="text-lg font-medium">
                                        {lastCronRun ? format(lastCronRun, "HH:mm:ss") : "—"}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4 text-blue-600" />
                                        <span>Scheduled</span>
                                    </div>
                                    <p className="text-2xl font-semibold">{promotionStats.scheduled}</p>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <RefreshCw className="h-4 w-4 text-muted-foreground" />
                                        <span>Auto-Update</span>
                                    </div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Runs hourly
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Search & Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search promotions..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button type="submit">Search</Button>
                </form>

                <Button onClick={() => router.push("/owner/promotions/new")} variant="secondary">
                    <Plus className="mr-2 h-4 w-4" />
                    New Promotion
                </Button>
            </div>

            {/* Tabs & Table */}
            <Tabs
                value={activeTab}
                onValueChange={(v) => {
                    setActiveTab(v as "active" | "expired" | "deleted");
                    setPage(1);
                }}
            >
                <TabsList className="mb-6">
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="expired">Expired</TabsTrigger>
                    <TabsTrigger value="deleted">Deleted</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="space-y-4">
                    <div className="rounded-sm border bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Discount</TableHead>
                                    <TableHead>Period</TableHead>
                                    <TableHead className="text-center">Products</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32">
                                            <div className="flex items-center justify-center">
                                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : promotions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32">
                                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                <p className="text-sm">No promotions found</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    promotions.map((promotion) => {
                                        const status = getPromotionStatus(promotion);

                                        return (
                                            <TableRow key={promotion.id}>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <p className="font-medium">{promotion.name}</p>
                                                        <p className="text-xs text-muted-foreground font-mono">
                                                            {promotion.id.slice(0, 8)}...
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5">
                                                        <Percent className="h-3.5 w-3.5 text-muted-foreground" />
                                                        <span className="font-semibold">
                                                            {(promotion.discount * 100).toFixed(0)}%
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-0.5 text-sm">
                                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                                            <Calendar className="h-3 w-3" />
                                                            <span>{format(new Date(promotion.startDate), "MMM d, yyyy")}</span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground pl-4.5">
                                                            {format(new Date(promotion.endDate), "MMM d, yyyy")}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="outline" className="font-mono">
                                                        {promotion.productCount || 0}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{getStatusBadge(status)}</TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                            >
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

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center">
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
                    )}
                </TabsContent>
            </Tabs>

            {/* Delete Dialog */}
            <AlertDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog({ open, id: null })}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Promotion</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure? This will remove the promotion from all products. You can restore it later from the Deleted tab.
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

            {/* Hard Delete Dialog */}
            <AlertDialog
                open={hardDeleteDialog.open}
                onOpenChange={(open) => setHardDeleteDialog({ open, id: null })}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Permanently Delete Promotion</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the promotion and all associated data.
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
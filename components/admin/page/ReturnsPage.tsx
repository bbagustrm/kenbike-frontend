"use client";

import { ReturnManagementTable } from "@/components/admin/order/return-management-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RotateCcw } from "lucide-react";

interface ReturnsPageProps {
    customTitle?: string;
    customDescription?: string;
    customListTitle?: string;
    customListDescription?: string;
}

export default function ReturnsPage({
                                        customTitle = "Manajemen Retur",
                                        customDescription = "Kelola permintaan retur dan refund dari pelanggan",
                                        customListTitle = "Daftar Permintaan Retur",
                                        customListDescription = "Review, setujui, atau tolak permintaan retur. Proses refund manual setelah barang diterima.",
                                    }: ReturnsPageProps) {
    return (
        <div className="space-y-6 py-8 px-4">
            <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <RotateCcw className="h-6 w-6" />
                    {customTitle}
                </h1>
                <p className="text-muted-foreground mt-1">{customDescription}</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">{customListTitle}</CardTitle>
                    <CardDescription>{customListDescription}</CardDescription>
                </CardHeader>
                <CardContent>
                    <ReturnManagementTable />
                </CardContent>
            </Card>
        </div>
    );
}
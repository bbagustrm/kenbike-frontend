// app/(dashboard)/admin/returns/page.tsx
"use client";

import { ReturnManagementTable } from "@/components/admin/order/return-management-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RotateCcw } from "lucide-react";

export default function AdminReturnsPage() {
    return (
        <div className="space-y-6 py-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <RotateCcw className="h-6 w-6" />
                    Manajemen Retur
                </h1>
                <p className="text-muted-foreground mt-1">
                    Kelola permintaan retur dan refund dari pelanggan
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Daftar Permintaan Retur</CardTitle>
                    <CardDescription>
                        Review, setujui, atau tolak permintaan retur. Proses refund manual setelah barang diterima.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ReturnManagementTable />
                </CardContent>
            </Card>
        </div>
    );
}
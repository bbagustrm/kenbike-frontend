"use client";

import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, ShoppingCart, DollarSign } from "lucide-react";

export default function OwnerDashboardPage() {
    const { user } = useAuth();

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">
                    Welcome Back, {user?.first_name || user?.username}! 👋
                </h1>
                <p className="text-muted-foreground">
                    Owner Dashboard - Monitor your business at a glance
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,234</div>
                        <p className="text-xs text-muted-foreground">+20% from last month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">567</div>
                        <p className="text-xs text-muted-foreground">+15 new this week</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2,456</div>
                        <p className="text-xs text-muted-foreground">+180 from last month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$45,231</div>
                        <p className="text-xs text-muted-foreground">+25% from last month</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>🎉 Authentication Working!</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            ✅ Cookie-based authentication is now fully functional!
                        </p>
                        <p className="text-sm text-muted-foreground">
                            ✅ You are logged in as: <span className="font-bold">{user?.email}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                            ✅ Role: <span className="font-bold">{user?.role}</span>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
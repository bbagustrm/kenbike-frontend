"use client";

import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { User, Settings, LogOut, LayoutDashboard, Users, Package, ShoppingCart, BarChart3, Tag } from "lucide-react";
import { getUserInitials } from "@/lib/auth-utils";
import Link from "next/link";

export function UserAvatar() {
    const { user, logout } = useAuth();

    if (!user) return null;

    const handleLogout = async () => {
        await logout();
    };

    const getRoleColor = () => {
        switch (user.role) {
            case "ADMIN":
                return "bg-blue-100 text-blue-700 border-blue-200";
            case "OWNER":
                return "bg-purple-100 text-purple-700 border-purple-200";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <Avatar className="h-9 w-9 cursor-pointer">
                        <AvatarImage
                            src={user?.profile_image}
                            alt={user?.username}
                        />
                        <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                        <p className="text-sm font-medium leading-none">{user?.first_name} {user?.last_name}</p>
                        <p className="text-xs text-muted-foreground mt-1">@{user.username}</p>
                    </div>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.first_name} {user?.last_name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        <Badge variant="outline" className={`mt-2 w-fit ${getRoleColor()}`}>
                            {user.role}
                        </Badge>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />


                {/* Menu khusus untuk user biasa */}
                {user.role === "USER" && (
                    <>
                        <DropdownMenuItem asChild>
                            <Link href="/user/orders" className="cursor-pointer">
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Orders
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/user/profile" className="cursor-pointer">
                                <User className="mr-2 h-4 w-4" />
                                Profile
                            </Link>
                        </DropdownMenuItem>
                    </>
                )}

                {/* Menu untuk admin */}
                {user.role === "ADMIN" && (
                    <>
                        <DropdownMenuItem asChild>
                            <Link href="/admin/dashboard" className="cursor-pointer">
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                Dashboard
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/admin/users" className="cursor-pointer">
                                <Users className="mr-2 h-4 w-4" />
                                Users
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/admin/products" className="cursor-pointer">
                                <Package className="mr-2 h-4 w-4" />
                                Products
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/admin/orders" className="cursor-pointer">
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Orders
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/admin/settings" className="cursor-pointer">
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </Link>
                        </DropdownMenuItem>
                    </>
                )}

                {/* Menu untuk owner */}
                {user.role === "OWNER" && (
                    <>
                        <DropdownMenuItem asChild>
                            <Link href="/owner/dashboard" className="cursor-pointer">
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                Dashboard
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/owner/users" className="cursor-pointer">
                                <Users className="mr-2 h-4 w-4" />
                                Users
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/owner/products" className="cursor-pointer">
                                <Package className="mr-2 h-4 w-4" />
                                Products
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/owner/orders" className="cursor-pointer">
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Orders
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/owner/settings" className="cursor-pointer">
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/owner/analytics" className="cursor-pointer">
                                <BarChart3 className="mr-2 h-4 w-4" />
                                Analytics
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/owner/promotions" className="cursor-pointer">
                                <Tag className="mr-2 h-4 w-4" />
                                Promotions
                            </Link>
                        </DropdownMenuItem>
                    </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
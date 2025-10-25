"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { UserAvatar } from "@/components/auth/user-avatar";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  Menu,
  User,
  Home,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const adminNavigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

const ownerNavigation = [
  { name: "Dashboard", href: "/owner/dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/owner/users", icon: Users },
  { name: "Products", href: "/owner/products", icon: Package },
  { name: "Orders", href: "/owner/orders", icon: ShoppingCart },
  { name: "Settings", href: "/owner/settings", icon: Settings },
  { name: "Analytics", href: "/owner/analytics", icon: BarChart3 },
  { name: "Promotions", href: "/owner/promotions", icon: Tag },
];

const userNavigation = [
  { name: "Profile", href: "/user/profile", icon: User },
  { name: "Orders", href: "/user/orders", icon: ShoppingCart },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const getNavigation = () => {
    if (user?.role === "ADMIN") return adminNavigation;
    if (user?.role === "OWNER") return ownerNavigation;
    return userNavigation;
  };

  const navigation = getNavigation();

  const getDashboardTitle = () => {
    if (user?.role === "ADMIN") return "Admin Panel";
    if (user?.role === "OWNER") return "Owner Dashboard";
    return "My Account";
  };

  const getDashboardPath = () => {
    if (user?.role === "ADMIN") return "/admin/dashboard";
    if (user?.role === "OWNER") return "/owner/dashboard";
    return "/user/profile";
  };

  const Sidebar = () => (
      <>
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold">
              {user?.role === "ADMIN" ? "A" : user?.role === "OWNER" ? "O" : "U"}
            </span>
            </div>
            <span className="font-semibold text-lg">{getDashboardTitle()}</span>
          </div>
        </div>
        <div className="border-b px-3 py-2">
          <Link
              href="/"
              className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  "text-muted-foreground hover:bg-gray-100 hover:text-gray-900"
              )}
          >
            <Home className="h-5 w-5" />
            Back to Home
          </Link>
        </div>
        <nav className="flex-1 space-y-2 px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
                <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-gray-100 hover:text-gray-900"
                    )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
            );
          })}
        </nav>
      </>
  );

  return (
      <ProtectedRoute>
        <div className="flex h-screen bg-gray-50">
          {/* Desktop Sidebar */}
          <aside className="hidden md:flex md:w-64 md:flex-col border-r bg-white">
            <Sidebar />
          </aside>

          {/* Main Content */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Header */}
            <header className="flex h-16 items-center justify-between border-b bg-white px-6">
              <div className="flex items-center gap-4">
                {/* Mobile Menu */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-64 p-0">
                    <Sidebar />
                  </SheetContent>
                </Sheet>

              </div>
              <UserAvatar />
            </header>

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </ProtectedRoute>
  );
}
"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { UserAvatar } from "@/components/auth/user-avatar";
import { useAuth } from "@/contexts/auth-context";
import { ChevronRight, Home } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { getSidebarNav, type NavSubItem } from "@/config/navigation";

function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const navGroups = getSidebarNav(user?.role as "ADMIN" | "OWNER" | undefined);

  const panelLabel =
      user?.role === "ADMIN" ? "Admin Panel" :
          user?.role === "OWNER" ? "Owner Panel" :
              "My Account";

  const panelInitial =
      user?.role === "ADMIN" ? "A" :
          user?.role === "OWNER" ? "O" : "U";

  const isGroupActive = (children: NavSubItem[]) =>
      children.some((c) => pathname === c.href || pathname.startsWith(c.href + "/"));

  return (
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-3">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <span className="text-primary-foreground font-bold text-sm">{panelInitial}</span>
            </div>
            <span className="font-semibold text-base truncate">{panelLabel}</span>
          </div>
          <div className="px-2 pb-2">
            <Link href="/" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
              <Home className="h-4 w-4 shrink-0" />
              <span>Back to Home</span>
            </Link>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2">
          {navGroups.map((group) => (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                <SidebarMenu>
                  {group.items.map((item) => {
                    if (item.children) {
                      const isActive = isGroupActive(item.children);
                      return (
                          <Collapsible key={item.name} defaultOpen={true} asChild className="group/collapsible">
                            <SidebarMenuItem>
                              <CollapsibleTrigger asChild className="cursor-pointer">
                                <SidebarMenuButton tooltip={item.name} isActive={isActive}>
                                  <item.icon />
                                  <span>{item.name}</span>
                                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                </SidebarMenuButton>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <SidebarMenuSub>
                                  {item.children.map((child) => {
                                    const isChildActive = pathname === child.href || pathname.startsWith(child.href + "/");
                                    return (
                                        <SidebarMenuSubItem key={child.name}>
                                          <SidebarMenuSubButton asChild isActive={isChildActive}>
                                            <Link href={child.href}>{child.name}</Link>
                                          </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                    );
                                  })}
                                </SidebarMenuSub>
                              </CollapsibleContent>
                            </SidebarMenuItem>
                          </Collapsible>
                      );
                    }

                    const isActive = pathname === item.href || (item.href ? pathname.startsWith(item.href + "/") : false);
                    return (
                        <SidebarMenuItem key={item.name}>
                          <SidebarMenuButton asChild tooltip={item.name} isActive={isActive}>
                            <Link href={item.href!}>
                              <item.icon />
                              <span>{item.name}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter>
          <div className="px-2 py-2 text-xs text-muted-foreground text-center">Kenbike Store</div>
        </SidebarFooter>
      </Sidebar>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
      <ProtectedRoute>
        <SidebarProvider>
          <AppSidebar />
          <div className="flex flex-1 flex-col overflow-hidden min-w-0">
            <header className="flex h-16 items-center justify-between border-b px-4 md:px-6 shrink-0">
              <SidebarTrigger className={cn("h-8 w-8")} />
              <UserAvatar />
            </header>
            <main className="flex-1 overflow-y-auto px-4 md:px-8 flex flex-col bg-background">
              {children}
            </main>
          </div>
        </SidebarProvider>
      </ProtectedRoute>
  );
}
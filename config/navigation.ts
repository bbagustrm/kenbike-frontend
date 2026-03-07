import {
    LayoutDashboard,
    Users,
    Package,
    ShoppingCart,
    BarChart3,
    Settings,
    User,
    Tag,
    Folder,
    Star,
    MessageCircleMore,
    Bell,
    RotateCcw,
    type LucideIcon,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NavSubItem {
    name: string;
    href: string;
}

export interface NavItem {
    name: string;
    href?: string;
    icon: LucideIcon;
    children?: NavSubItem[];
}

export interface NavGroup {
    label: string;
    items: NavItem[];
}

// ─── Sidebar Nav (grouped, with collapsible) ──────────────────────────────────

export const adminSidebarNav: NavGroup[] = [
    {
        label: "Overview",
        items: [
            { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        ],
    },
    {
        label: "Management",
        items: [
            { name: "Users", href: "/admin/users", icon: Users },
            {
                name: "Products",
                icon: Package,
                children: [
                    { name: "All Products", href: "/admin/products" },
                    { name: "Categories", href: "/admin/categories" },
                    { name: "Tags", href: "/admin/tags" },
                ],
            },
            {
                name: "Orders",
                icon: ShoppingCart,
                children: [
                    { name: "All Orders", href: "/admin/orders" },
                    { name: "Returns", href: "/admin/returns" },
                ],
            },
        ],
    },
    {
        label: "Content",
        items: [
            { name: "Reviews", href: "/admin/reviews", icon: Star },
            { name: "Comments", href: "/admin/discussions", icon: MessageCircleMore },
        ],
    },
    {
        label: "System",
        items: [
            { name: "Settings", href: "/admin/settings", icon: Settings },
        ],
    },
];

export const ownerSidebarNav: NavGroup[] = [
    {
        label: "Overview",
        items: [
            { name: "Dashboard", href: "/owner/dashboard", icon: LayoutDashboard },
        ],
    },
    {
        label: "Management",
        items: [
            { name: "Users", href: "/owner/users", icon: Users },
            {
                name: "Products",
                icon: Package,
                children: [
                    { name: "All Products", href: "/owner/products" },
                    { name: "Categories", href: "/owner/categories" },
                    { name: "Tags", href: "/owner/tags" },
                ],
            },
            {
                name: "Orders",
                icon: ShoppingCart,
                children: [
                    { name: "All Orders", href: "/owner/orders" },
                    { name: "Returns", href: "/owner/returns" },
                ],
            },
        ],
    },
    {
        label: "Content",
        items: [
            { name: "Reviews", href: "/owner/reviews", icon: Star },
            { name: "Comments", href: "/owner/discussions", icon: MessageCircleMore },
        ],
    },
    {
        label: "Business",
        items: [
            { name: "Analytics", href: "/owner/analytics", icon: BarChart3 },
            { name: "Promotions", href: "/owner/promotions", icon: Tag },
        ],
    },
    {
        label: "System",
        items: [
            { name: "Settings", href: "/owner/settings", icon: Settings },
        ],
    },
];

export const userSidebarNav: NavGroup[] = [
    {
        label: "Account",
        items: [
            { name: "Profile", href: "/user/profile", icon: User },
            { name: "Orders", href: "/user/orders", icon: ShoppingCart },
            { name: "Notifications", href: "/user/notifications", icon: Bell },
        ],
    },
];

// ─── Navbar Quick Links (flat, for dropdown & mobile menu) ───────────────────
// Subset dari sidebar nav yang ditampilkan di navbar dropdown/mobile

export interface NavbarLink {
    name: string;
    href: string;
    icon: LucideIcon;
}

export const adminNavbarLinks: NavbarLink[] = [
    { name: "Orders",  href: "/admin/orders",   icon: ShoppingCart },
    { name: "Returns", href: "/admin/returns",  icon: RotateCcw },
    { name: "Users",   href: "/admin/users",    icon: Users },
];

export const ownerNavbarLinks: NavbarLink[] = [
    { name: "Orders",    href: "/owner/orders",    icon: ShoppingCart },
    { name: "Returns",   href: "/owner/returns",   icon: RotateCcw },
    { name: "Analytics", href: "/owner/analytics", icon: BarChart3 },
];

export const userNavbarLinks: NavbarLink[] = [
    { name: "Profile",       href: "/user/profile",        icon: User },
    { name: "Orders",        href: "/user/orders",          icon: ShoppingCart },
    { name: "Notifications", href: "/user/notifications",   icon: Bell },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

type UserRole = "ADMIN" | "OWNER" | "USER" | undefined;

export function getSidebarNav(role: UserRole): NavGroup[] {
    if (role === "ADMIN") return adminSidebarNav;
    if (role === "OWNER") return ownerSidebarNav;
    return userSidebarNav;
}

export function getNavbarLinks(role: UserRole): NavbarLink[] {
    if (role === "ADMIN") return adminNavbarLinks;
    if (role === "OWNER") return ownerNavbarLinks;
    return userNavbarLinks;
}

export function getDashboardHref(role: UserRole): string {
    if (role === "ADMIN") return "/admin/dashboard";
    if (role === "OWNER") return "/owner/dashboard";
    return "/user/orders";
}
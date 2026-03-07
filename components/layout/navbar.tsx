// components/layout/navbar.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import dynamic from "next/dynamic";
import { useTranslation } from "@/hooks/use-translation";
import { getNavbarLinks, getDashboardHref } from "@/config/navigation";

const CartSheet = dynamic(
    () => import("@/components/cart/cart-sheet").then((mod) => ({ default: mod.CartSheet })),
    { ssr: false }
);
const NotificationPopover = dynamic(
    () => import("@/components/notification/notification-popover").then((mod) => ({ default: mod.NotificationPopover })),
    { ssr: false }
);

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select, SelectContent, SelectItem, SelectTrigger,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command";
import {
  Search, Menu, X, ChevronDown, Package, Grid3x3, Percent,
  LayoutDashboard, LogOut, Shield,
} from "lucide-react";
import { getUserInitials } from "@/lib/auth-utils";
import { formatCurrency } from "@/lib/format-currency";
import { CategoryService } from "@/services/category.service";
import { PromotionService } from "@/services/promotion.service";
import { ProductService } from "@/services/product.service";
import { Category } from "@/types/category";
import { Promotion } from "@/types/promotion";
import { ProductListItem } from "@/types/product";
import { handleApiError } from "@/lib/api-client";

export default function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { t, locale, setLocale } = useTranslation();

  const isAdmin = user?.role === "ADMIN";
  const isOwner = user?.role === "OWNER";
  const isStaff = isAdmin || isOwner;

  // ✅ Derived from shared config — single source of truth
  const dashboardHref = getDashboardHref(user?.role as "ADMIN" | "OWNER" | undefined);
  const navbarLinks = getNavbarLinks(user?.role as "ADMIN" | "OWNER" | undefined);

  const getDashboardLabel = () => {
    if (isAdmin) return t.user.adminDashboard ?? "Admin Dashboard";
    if (isOwner) return t.user.ownerDashboard ?? "Owner Dashboard";
    return t.nav.dashboard ?? "Dashboard";
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ProductListItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, promotionsRes] = await Promise.all([
          CategoryService.getCategories({ limit: 10, isActive: true }),
          PromotionService.getActivePromotions(),
        ]);
        setCategories(categoriesRes.data || []);
        setPromotions(promotionsRes.data || []);
      } catch (error) {
        const errorResult = handleApiError(error);
        console.error("Failed to fetch data:", errorResult.message);
      }
    };
    const timer = setTimeout(fetchData, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isSearchOpen) {
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const searchProducts = async () => {
      if (!searchQuery || searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const response = await ProductService.getProducts({ search: searchQuery, limit: 5 });
        setSearchResults(response.data || []);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };
    const debounce = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleCommandSelect = (callback: () => void) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    callback();
  };

  const handleLogout = async () => {
    await logout();
    closeMobileMenu();
  };

  const RoleBadge = () => {
    if (!isStaff) return null;
    return (
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${
            isAdmin ? "bg-red-100 text-red-700" : "bg-purple-100 text-purple-700"
        }`}>
                <Shield className="h-2.5 w-2.5" />
          {isAdmin ? "Admin" : "Owner"}
            </span>
    );
  };

  return (
      <>
        {/* ── Main Navbar ── */}
        <header className="sticky top-0 z-50 w-full bg-background">
          <div className="container mx-auto flex h-16 items-center justify-between gap-6 px-4">
            {/* Left: Logo + Desktop Nav */}
            <div className="flex items-center md:gap-8 lg:gap-12">
              <Link href="/" className="flex-shrink-0">
                <Image src="/logo.webp" alt="Kenbike" width={300} height={150} priority className="h-12 w-auto hidden lg:inline" />
                <Image src="/logo.webp" alt="Kenbike" width={300} height={150} priority className="h-10 w-auto lg:hidden" />
              </Link>

              <nav className="hidden lg:flex items-center">
                <Link href="/search?hasPromotion=true">
                  <Button variant="ghost" className="gap-0 px-4 uppercase">{t.nav.specialPromo}</Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2 px-4 uppercase">
                      {t.nav.categories}<ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48 uppercase">
                    {categories.map((category) => (
                        <DropdownMenuItem key={category.id} asChild>
                          <Link href={`/search?category=${category.slug}`}>{category.name}</Link>
                        </DropdownMenuItem>
                    ))}
                    {categories.length > 0 && <DropdownMenuSeparator />}
                    <DropdownMenuItem asChild>
                      <Link href="/search" className="font-semibold">{t.nav.viewAllProducts ?? "View All Products"}</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Link href="/about">
                  <Button variant="ghost" className="px-4 uppercase">{t.nav.about}</Button>
                </Link>
              </nav>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="hidden lg:flex lg:max-w-[240px] xl:max-w-md w-full items-center justify-center gap-2">
                <Button variant="secondary" className="w-full justify-start gap-2 text-muted-foreground font-light bg-accent px-3"
                        onClick={() => setIsSearchOpen(true)} size="default">
                  <Search className="h-4 w-4" />
                  <span className="text-sm font-normal truncate">{t.search.placeholder}</span>
                </Button>
              </div>

              {/* Language - Desktop */}
              <div className="hidden md:block">
                <Select value={locale} onValueChange={(value) => setLocale(value as "id" | "en")}>
                  <SelectTrigger className="w-auto gap-2 border-none bg-transparent shadow-none">
                    <Image src={locale === "id" ? "/ic-flag-id.webp" : "/ic-flag-uk.webp"} alt={locale === "id" ? "ID" : "EN"} width={20} height={14} className="rounded-sm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="id">
                      <div className="flex items-center gap-2"><Image src="/ic-flag-id.webp" alt="ID" width={20} height={14} className="rounded-sm" /><span>Indonesia</span></div>
                    </SelectItem>
                    <SelectItem value="en">
                      <div className="flex items-center gap-2"><Image src="/ic-flag-uk.webp" alt="EN" width={20} height={14} className="rounded-sm" /><span>English</span></div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notification & Cart */}
              <div className="flex items-center">
                {isAuthenticated && <NotificationPopover />}
                <CartSheet />
              </div>

              <div className="flex items-center lg:hidden">
                <Search className="h-4 w-4" onClick={() => setIsSearchOpen(true)} />
              </div>

              {/* ── Auth Dropdown - Desktop ── */}
              <div className="hidden md:flex items-center gap-2">
                {isAuthenticated ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full px-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user?.profile_image} />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {getUserInitials(user)}
                            </AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-60">
                        {/* User Info */}
                        <div className="px-2 py-1.5 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold">{user?.first_name} {user?.last_name}</p>
                            <RoleBadge />
                          </div>
                          <p className="text-xs text-muted-foreground font-light">{user?.email}</p>
                        </div>
                        <DropdownMenuSeparator />

                        {/* Dashboard */}
                        <DropdownMenuItem asChild>
                          <Link href={dashboardHref} className="gap-2">
                            <LayoutDashboard className="h-4 w-4" />
                            {getDashboardLabel()}
                          </Link>
                        </DropdownMenuItem>

                        {/* ✅ Dynamic links — dari shared config */}
                        {navbarLinks.map((link) => (
                            <DropdownMenuItem key={link.href} asChild>
                              <Link href={link.href} className="gap-2">
                                <link.icon className="h-4 w-4" />
                                {link.name}
                              </Link>
                            </DropdownMenuItem>
                        ))}

                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="gap-2 text-destructive">
                          <LogOut className="h-4 w-4" />
                          {t.nav.logout}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <>
                      <Button variant="default" asChild><Link href="/login">{t.auth.titleLogin}</Link></Button>
                      <Button asChild variant="ghost"><Link href="/register">{t.auth.titleRegister}</Link></Button>
                    </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <Button variant="ghost" size="icon" className="md:hidden px-0" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </header>

        {/* ── Mobile Menu ── */}
        {isMobileMenuOpen && (
            <div className="fixed inset-0 top-[64px] z-40 bg-background md:hidden overflow-y-auto">
              <div className="container mx-auto px-4 py-4 space-y-4">

                {/* User Info */}
                {isAuthenticated ? (
                    <div className="flex items-center gap-3 pb-4 border-b">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={user?.profile_image} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                          {getUserInitials(user)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-lg font-semibold">{user?.first_name} {user?.last_name}</p>
                          <RoleBadge />
                        </div>
                        <p className="text-sm text-muted-foreground font-light">{user?.email}</p>
                      </div>
                    </div>
                ) : (
                    <div className="flex gap-2 pb-4 border-b">
                      <Button className="flex-1 text-base" asChild>
                        <Link href="/login" onClick={closeMobileMenu}>{t.auth.titleLogin}</Link>
                      </Button>
                      <Button variant="outline" className="flex-1 text-base" asChild>
                        <Link href="/register" onClick={closeMobileMenu}>{t.auth.titleRegister}</Link>
                      </Button>
                    </div>
                )}

                {/* Nav Links */}
                <nav className="space-y-1 pb-4 border-b">
                  <Link href="/search?hasPromotion=true" className="flex items-center gap-3 py-3 px-2 rounded-md hover:bg-secondary transition-colors" onClick={closeMobileMenu}>
                    <span className="text-base font-semibold">{t.nav.specialPromo}</span>
                  </Link>
                  <Link href="/about" className="flex items-center gap-3 py-3 px-2 rounded-md hover:bg-secondary transition-colors" onClick={closeMobileMenu}>
                    <span className="text-base font-semibold">{t.nav.about}</span>
                  </Link>
                  <Link href="/search" className="flex items-center gap-3 py-3 px-2 rounded-md hover:bg-secondary transition-colors" onClick={closeMobileMenu}>
                    <span className="text-base font-semibold">{t.nav.allProducts}</span>
                  </Link>
                </nav>

                {/* Categories */}
                <div className="pb-4 border-b">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">{t.nav.categories}</p>
                  <div className="space-y-1">
                    {categories.map((category) => (
                        <Link key={category.id} href={`/search?category=${category.slug}`}
                              className="block py-2.5 px-2 rounded-md hover:bg-secondary transition-colors" onClick={closeMobileMenu}>
                          {category.name}
                        </Link>
                    ))}
                  </div>
                </div>

                {/* ── Account Menu — ✅ Dynamic per role ── */}
                {isAuthenticated && (
                    <div className="pb-4 border-b">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">{t.nav.account}</p>
                      <div className="space-y-1">
                        {/* Dashboard */}
                        <Link href={dashboardHref} className="flex items-center gap-3 py-3 px-2 rounded-md hover:bg-secondary transition-colors" onClick={closeMobileMenu}>
                          <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
                          <span>{getDashboardLabel()}</span>
                        </Link>

                        {/* ✅ Dynamic links — dari shared config */}
                        {navbarLinks.map((link) => (
                            <Link key={link.href} href={link.href}
                                  className="flex items-center gap-3 py-3 px-2 rounded-md hover:bg-secondary transition-colors"
                                  onClick={closeMobileMenu}>
                              <link.icon className="h-5 w-5 text-muted-foreground" />
                              <span>{link.name}</span>
                            </Link>
                        ))}
                      </div>
                    </div>
                )}

                {/* Language */}
                <div className="pb-4 border-b">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">{t.nav.language}</p>
                  <div className="flex gap-2 px-2">
                    <Button variant={locale === "id" ? "outline" : "secondary"} size="sm" onClick={() => setLocale("id")} className="flex-1 gap-2">
                      <Image src="/ic-flag-id.webp" alt="ID" width={20} height={14} className="rounded-sm" />Indonesia
                    </Button>
                    <Button variant={locale === "en" ? "outline" : "secondary"} size="sm" onClick={() => setLocale("en")} className="flex-1 gap-2">
                      <Image src="/ic-flag-uk.webp" alt="EN" width={20} height={14} className="rounded-sm" />English
                    </Button>
                  </div>
                </div>

                {/* Logout */}
                {isAuthenticated && (
                    <Button variant="outline" className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={handleLogout}>
                      <LogOut className="h-4 w-4" />
                      {t.nav.logout}
                    </Button>
                )}
              </div>
            </div>
        )}

        {/* ── Search Dialog ── */}
        <CommandDialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
          <CommandInput placeholder={t.search.placeholder} value={searchQuery} onValueChange={setSearchQuery} />
          <CommandList>
            <CommandEmpty>
              {isSearching ? t.search.searching : searchQuery ? t.search.noResults : t.search.startTyping}
            </CommandEmpty>
            {searchResults.length > 0 && (
                <CommandGroup heading={t.search.products}>
                  {searchResults.map((product) => (
                      <CommandItem key={product.id} value={product.name}
                                   onSelect={() => handleCommandSelect(() => router.push(`/products/${product.slug}`))}>
                        <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-col flex-1">
                          <span className="font-medium">{product.name}</span>
                          <span className="text-xs text-muted-foreground font-light">{formatCurrency(product.idPrice)}</span>
                        </div>
                      </CommandItem>
                  ))}
                  <CommandSeparator />
                  <CommandItem onSelect={() => handleCommandSelect(() => router.push(`/search?search=${searchQuery}`))} className="justify-center">
                    <Search className="mr-2 h-4 w-4" />
                    {t.search.viewAllResults} &quot;{searchQuery}&quot;
                  </CommandItem>
                </CommandGroup>
            )}
            {!searchQuery && categories.length > 0 && (
                <CommandGroup heading={t.nav.categories}>
                  {categories.slice(0, 5).map((category) => (
                      <CommandItem key={category.id} onSelect={() => handleCommandSelect(() => router.push(`/search?category=${category.slug}`))}>
                        <Grid3x3 className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{category.name}</span>
                      </CommandItem>
                  ))}
                </CommandGroup>
            )}
            {!searchQuery && promotions.length > 0 && (
                <CommandGroup heading={t.search.promotions}>
                  {promotions.slice(0, 3).map((promotion) => (
                      <CommandItem key={promotion.id} onSelect={() => handleCommandSelect(() => router.push(`/search?promotion=${promotion.id}`))}>
                        <Percent className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="flex-1">{promotion.name}</span>
                        <Badge variant="destructive" className="ml-2">-{Math.round(promotion.discount * 100)}%</Badge>
                      </CommandItem>
                  ))}
                </CommandGroup>
            )}
          </CommandList>
        </CommandDialog>
      </>
  );
}
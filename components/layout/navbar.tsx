// components/layout/navbar.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useTranslation } from "@/hooks/use-translation";
import dynamic from "next/dynamic";

// Dynamic imports for client components
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Search,
  Menu,
  X,
  ChevronDown,
  Package,
  Grid3x3,
  Percent,
  User,
  ShoppingCart,
  LayoutDashboard,
  LogOut,
  Bell,
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

  // States
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ProductListItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch categories & promotions
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

  // Reset search on close
  useEffect(() => {
    if (!isSearchOpen) {
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [isSearchOpen]);

  // Search with debounce
  useEffect(() => {
    const searchProducts = async () => {
      if (!searchQuery || searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const response = await ProductService.getProducts({
          search: searchQuery,
          limit: 5,
        });
        setSearchResults(response.data || []);
      } catch (error) {
        console.error("Search failed:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };
    const debounce = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Keyboard shortcut (Cmd+K)
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

  // Close mobile menu
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

  const getDashboardLink = () => {
    switch (user?.role) {
      case "ADMIN":
        return "/admin/dashboard";
      case "OWNER":
        return "/owner/dashboard";
      default:
        return "/user/orders";
    }
  };

  return (
      <>
        {/* Main Navbar */}
        <header className="sticky top-0 z-50 w-full bg-background">
          <div className="container mx-auto flex h-16 items-center justify-between gap-6 px-4">
            {/* Left: Logo - LARGER */}
            <div className="flex items-center md:gap-8 lg:gap-12">
              <Link href="/" className="flex-shrink-0">
                <Image
                    src="/logo.webp"
                    alt="Kenbike"
                    width={300}
                    height={150}
                    priority
                    className="h-12 w-auto hidden lg:inline"
                />
                <Image
                    src="/logo.webp"
                    alt="Kenbike"
                    width={300}
                    height={150}
                    priority
                    className="h-10 w-auto lg:hidden"
                />

              </Link>

              {/* Center: Navigation - Desktop - LARGER FONT */}
              <nav className="hidden lg:flex items-center">
                <Link href="/search?hasPromotion=true">
                  <Button variant="ghost" className="gap-0 px-4 uppercase" >
                    {t.nav.specialPromo}
                    {/*<Badge className="ml-2">*/}
                    {/*  2.2*/}
                    {/*</Badge>*/}
                  </Button>
                </Link>

                {/* Category Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2 px-4 uppercase">
                      Categories
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48 uppercase">
                    {categories.map((category) => (
                        <DropdownMenuItem key={category.id} asChild>
                          <Link href={`/search?category=${category.slug}`}>
                            {category.name}
                          </Link>
                        </DropdownMenuItem>
                    ))}
                    {categories.length > 0 && <DropdownMenuSeparator />}
                    <DropdownMenuItem asChild>
                      <Link href="/search" className="font-semibold">
                        View All Products
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Link href="/about">
                  <Button variant="ghost" className="px-4 uppercase" >
                    About Us
                  </Button>
                </Link>
              </nav>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {/* Center: Search Button - Desktop - SMALLER */}
              <div className="hidden lg:flex lg:max-w-[240px] xl:max-w-md w-full items-center justify-center gap-2">
                <Button
                    variant="secondary"
                    className="w-full justify-start gap-2 text-muted-foreground font-light bg-accent px-3"
                    onClick={() => setIsSearchOpen(true)}
                    size="default"
                >
                  <Search className="h-4 w-4"/>
                  <span className="text-sm font-normal truncate">Search products, categories, or tags ...</span>
                </Button>
              </div>
              {/* Language Selector - Desktop */}
              <div className="hidden md:block">
                <Select value={locale} onValueChange={(value) => setLocale(value as "id" | "en")}>
                  <SelectTrigger className="w-auto gap-2 border-none bg-transparent shadow-none">
                    <Image
                        src={locale === "id" ? "/ic-flag-id.webp" : "/ic-flag-uk.webp"}
                        alt={locale === "id" ? "ID" : "EN"}
                        width={20}
                        height={14}
                        className="rounded-sm"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="id">
                      <div className="flex items-center gap-2">
                        <Image src="/ic-flag-id.webp" alt="ID" width={20} height={14} className="rounded-sm" />
                        <span>Indonesia</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="en">
                      <div className="flex items-center gap-2">
                        <Image src="/ic-flag-uk.webp" alt="EN" width={20} height={14} className="rounded-sm" />
                        <span>English</span>
                      </div>
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

              {/* Auth Buttons - Desktop */}
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
                      <DropdownMenuContent align="end" className="w-56">
                        <div className="px-2 py-1.5">
                          <p className="text-sm font-semibold text-foreground">{user?.first_name} {user?.last_name}</p>
                          <p className="text-xs text-muted-foreground font-light">{user?.email}</p>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={getDashboardLink()} className="gap-2">
                            <LayoutDashboard className="h-4 w-4" />
                            Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/user/profile" className="gap-2">
                            <User className="h-4 w-4" />
                            Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/user/orders" className="gap-2">
                            <ShoppingCart className="h-4 w-4" />
                            Orders
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="gap-2 text-destructive">
                          <LogOut className="h-4 w-4" />
                          Logout
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <>
                      <Button variant="default" asChild>
                        <Link href="/login">{t.auth.titleLogin}</Link>
                      </Button>
                      <Button asChild variant="ghost">
                        <Link href="/register">{t.auth.titleRegister}</Link>
                      </Button>
                    </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden px-0"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

        </header>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
            <div className="fixed inset-0 top-[64px] z-40 bg-background md:hidden overflow-y-auto">
              <div className="container mx-auto px-4 py-4 space-y-4">
                {/* User Info */}
                {isAuthenticated ? (
                    <div className="flex items-center gap-3 pb-4 border-b border-border">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={user?.profile_image} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                          {getUserInitials(user)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-lg font-semibold text-foreground">
                          {user?.first_name} {user?.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground font-light">{user?.email}</p>
                      </div>
                    </div>
                ) : (
                    <div className="flex gap-2 pb-4 border-b border-border">
                      <Button className="flex-1 text-base" asChild>
                        <Link href="/login" onClick={closeMobileMenu}>{t.auth.titleLogin}</Link>
                      </Button>
                      <Button variant="outline" className="flex-1 text-base" asChild>
                        <Link href="/register" onClick={closeMobileMenu}>{t.auth.titleRegister}</Link>
                      </Button>
                    </div>
                )}

                {/* Navigation Links */}
                <nav className="space-y-1 pb-4 border-b border-border">
                  <Link
                      href="/search?hasPromotion=true"
                      className="flex items-center gap-3 py-3 px-2 rounded-md hover:bg-secondary transition-colors"
                      onClick={closeMobileMenu}
                  >
                    <span className="text-base font-semibold text-foreground">{t.nav.specialPromo}</span>
                  </Link>
                  <Link
                      href="/about"
                      className="flex items-center gap-3 py-3 px-2 rounded-md hover:bg-secondary transition-colors"
                      onClick={closeMobileMenu}
                  >
                    <span className="text-base font-semibold text-foreground">About Us</span>
                  </Link>
                  <Link
                      href="/search"
                      className="flex items-center gap-3 py-3 px-2 rounded-md hover:bg-secondary transition-colors"
                      onClick={closeMobileMenu}
                  >
                    <span className="text-base font-semibold text-foreground">All Products</span>
                  </Link>
                </nav>

                {/* Categories */}
                <div className="pb-4 border-b border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                    Categories
                  </p>
                  <div className="space-y-1">
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            href={`/search?category=${category.slug}`}
                            className="block py-2.5 px-2 rounded-md text-foreground hover:bg-secondary transition-colors"
                            onClick={closeMobileMenu}
                        >
                          {category.name}
                        </Link>
                    ))}
                  </div>
                </div>

                {/* User Menu */}
                {isAuthenticated && (
                    <div className="pb-4 border-b border-border">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                        Account
                      </p>
                      <div className="space-y-1">
                        <Link
                            href={getDashboardLink()}
                            className="flex items-center gap-3 py-3 px-2 rounded-md hover:bg-secondary transition-colors"
                            onClick={closeMobileMenu}
                        >
                          <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
                          <span className="text-foreground">Dashboard</span>
                        </Link>
                        <Link
                            href="/user/orders"
                            className="flex items-center gap-3 py-3 px-2 rounded-md hover:bg-secondary transition-colors"
                            onClick={closeMobileMenu}
                        >
                          <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                          <span className="text-foreground">Orders</span>
                        </Link>
                        <Link
                            href="/user/notifications"
                            className="flex items-center gap-3 py-3 px-2 rounded-md hover:bg-secondary transition-colors"
                            onClick={closeMobileMenu}
                        >
                          <Bell className="h-5 w-5 text-muted-foreground" />
                          <span className="text-foreground">Notifications</span>
                        </Link>
                        <Link
                            href="/user/profile"
                            className="flex items-center gap-3 py-3 px-2 rounded-md hover:bg-secondary transition-colors"
                            onClick={closeMobileMenu}
                        >
                          <User className="h-5 w-5 text-muted-foreground" />
                          <span className="text-foreground">Profile</span>
                        </Link>
                      </div>
                    </div>
                )}

                {/* Language Selector */}
                <div className="pb-4 border-b border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                    Language
                  </p>
                  <div className="flex gap-2 px-2">
                    <Button
                        variant={locale === "id" ? "outline" : "secondary"}
                        size="sm"
                        onClick={() => setLocale("id")}
                        className="flex-1 gap-2"
                    >
                      <Image src="/ic-flag-id.webp" alt="ID" width={20} height={14} className="rounded-sm" />
                      Indonesia
                    </Button>
                    <Button
                        variant={locale === "en" ? "outline" : "secondary"}
                        size="sm"
                        onClick={() => setLocale("en")}
                        className="flex-1 gap-2"
                    >
                      <Image src="/ic-flag-uk.webp" alt="EN" width={20} height={14} className="rounded-sm" />
                      English
                    </Button>
                  </div>
                </div>

                {/* Logout */}
                {isAuthenticated && (
                    <Button
                        variant="outline"
                        className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                )}
              </div>
            </div>
        )}

        {/* Search Dialog */}
        <CommandDialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
          <CommandInput
              placeholder={t.search.placeholder}
              value={searchQuery}
              onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>
              {isSearching ? "Searching..." : searchQuery ? "No results found" : "Start typing to search..."}
            </CommandEmpty>

            {/* Search Results */}
            {searchResults.length > 0 && (
                <CommandGroup heading="Products">
                  {searchResults.map((product) => (
                      <CommandItem
                          key={product.id}
                          value={product.name}
                          onSelect={() => handleCommandSelect(() => router.push(`/products/${product.slug}`))}
                      >
                        <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-col flex-1">
                          <span className="font-medium text-foreground">{product.name}</span>
                          <span className="text-xs text-muted-foreground font-light">
                      {formatCurrency(product.idPrice)}
                    </span>
                        </div>
                      </CommandItem>
                  ))}
                  <CommandSeparator />
                  <CommandItem
                      onSelect={() => handleCommandSelect(() => router.push(`/search?search=${searchQuery}`))}
                      className="justify-center"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    View all results for &quot;{searchQuery}&quot;
                  </CommandItem>
                </CommandGroup>
            )}

            {/* Categories */}
            {!searchQuery && categories.length > 0 && (
                <CommandGroup heading="Categories">
                  {categories.slice(0, 5).map((category) => (
                      <CommandItem
                          key={category.id}
                          onSelect={() => handleCommandSelect(() => router.push(`/search?category=${category.slug}`))}
                      >
                        <Grid3x3 className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{category.name}</span>
                      </CommandItem>
                  ))}
                </CommandGroup>
            )}

            {/* Promotions */}
            {!searchQuery && promotions.length > 0 && (
                <CommandGroup heading="Promotions">
                  {promotions.slice(0, 3).map((promotion) => (
                      <CommandItem
                          key={promotion.id}
                          onSelect={() => handleCommandSelect(() => router.push(`/search?promotion=${promotion.id}`))}
                      >
                        <Percent className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="flex-1 text-foreground">{promotion.name}</span>
                        <Badge variant="destructive" className="ml-2">
                          -{Math.round(promotion.discount * 100)}%
                        </Badge>
                      </CommandItem>
                  ))}
                </CommandGroup>
            )}
          </CommandList>
        </CommandDialog>
      </>
  );
}
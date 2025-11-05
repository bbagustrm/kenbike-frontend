"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useTranslation } from "@/hooks/use-translation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Bell,
  ShoppingCart,
  Menu,
  X,
  Package,
  LogOut,
  Home,
  Info,
  Phone,
  Tag,
  Percent,
  Grid3x3,
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import CheckoutCard from "../checkout-card";
import { getUserInitials } from "@/lib/auth-utils";
import { UserAvatar } from "@/components/auth/user-avatar";
import { CategoryService } from "@/services/category.service";
import { TagService } from "@/services/tag.service";
import { PromotionService } from "@/services/promotion.service";
import { ProductService } from "@/services/product.service";
import { Category } from "@/types/category";
import { Tag as TagType } from "@/types/tag";
import { Promotion } from "@/types/promotion";
import { ProductListItem } from "@/types/product";
import { handleApiError } from "@/lib/api-client";
import { formatCurrency } from "@/lib/format-currency";

export default function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { t, locale, setLocale } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Search data
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ProductListItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Reset search when dialog closes
  useEffect(() => {
    if (!isSearchOpen) {
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [isSearchOpen]);

  // Mock data - replace dengan real data
  const cartItemsCount = 3;
  const notificationsCount = 5;

  const pages = [
    { name: t.nav.home, href: "/", icon: Home },
    { name: "All Products", href: "/search", icon: Package },
    { name: t.nav.about, href: "/about", icon: Info },
    { name: t.nav.contact, href: "/contact", icon: Phone },
  ];

  // Fetch categories, tags, promotions on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, tagsRes, promotionsRes] = await Promise.all([
          CategoryService.getCategories({ limit: 10, isActive: true }),
          TagService.getTags({ limit: 10, isActive: true }),
          PromotionService.getActivePromotions(),
        ]);

        setCategories(categoriesRes.data || []);
        setTags(tagsRes.data || []);
        setPromotions(promotionsRes.data || []);
      } catch (error) {
        const errorResult = handleApiError(error);
        console.error("Failed to fetch data:", errorResult.message);
      }
    };

    fetchData();
  }, []);

  // Search products when query changes
  useEffect(() => {
    const searchProducts = async () => {
      if (!searchQuery || searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      console.log('🔍 Searching for:', searchQuery);
      setIsSearching(true);

      try {
        // Try backend search first
        const response = await ProductService.getProducts({
          search: searchQuery,
          limit: 50,  // Get more for client-side filter
        });

        console.log('✅ API Response:', response);

        let results = response.data || [];

        // If no results and backend might not support search,
        // do client-side filtering as fallback
        if (results.length === 0) {
          console.log('🔄 Trying client-side search fallback...');
          const allProducts = await ProductService.getProducts({
            limit: 100,
          });

          results = allProducts.data.filter((product) =>
              product.name.toLowerCase().includes(searchQuery.toLowerCase())
          );

          console.log('📦 Client-side results:', results.length);
        }

        // Limit to 5 results
        setSearchResults(results.slice(0, 5));
        console.log('✅ Final results:', results.slice(0, 5).length);

      } catch (error) {
        console.error('❌ Search failed:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Filter categories, tags, promotions based on search query
  const getFilteredCategories = () => {
    if (!searchQuery) return categories;

    const query = searchQuery.toLowerCase();

    // Show all if searching for "category" keyword
    if (query.includes('category') || query.includes('kategori')) {
      return categories;
    }

    // Filter by name
    return categories.filter(cat =>
        cat.name.toLowerCase().includes(query)
    );
  };

  const getFilteredTags = () => {
    if (!searchQuery) return tags.slice(0, 5);

    const query = searchQuery.toLowerCase();

    // Show all if searching for "tag" keyword
    if (query.includes('tag')) {
      return tags;
    }

    // Filter by name
    return tags.filter(tag =>
        tag.name.toLowerCase().includes(query)
    );
  };

  const getFilteredPromotions = () => {
    if (!searchQuery) return promotions.slice(0, 3);

    const query = searchQuery.toLowerCase();

    // Show all if searching for "promotion/promo" keyword
    if (query.includes('promo') || query.includes('discount') || query.includes('sale')) {
      return promotions;
    }

    // Filter by name
    return promotions.filter(promo =>
        promo.name.toLowerCase().includes(query)
    );
  };

  const filteredCategories = getFilteredCategories();
  const filteredTags = getFilteredTags();
  const filteredPromotions = getFilteredPromotions();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY) {
        if (currentScrollY > 100) {
          setIsBottomNavVisible(false);
        }
      } else {
        setIsBottomNavVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

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

  const handleLogout = async () => {
    await logout();
  };

  const navigation = [
    { name: t.nav.specialPromo, href: "/search?hasPromotion=true" },
    { name: "All Products", href: "/search" },
    ...categories.map((category) => ({
      name: category.name,
      href: `/search?category=${category.slug}`,
    })),
  ];

  const handleCommandSelect = (callback: () => void) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    callback();
  };

  return (
      <>
        {/* Top Bar */}
        <div className="sticky top-0 z-50 bg-white w-full border-b">
          <div className="container mx-auto flex items-center justify-between py-3 px-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <Image src="/logo.svg" alt="Logo" width={160} height={160} priority />
            </Link>

            {/* Search Command - Desktop */}
            <div className="hidden md:flex flex-1 justify-center px-6">
              <Button
                  variant="outline"
                  className="relative w-full max-w-xl justify-start text-sm font-normal text-muted-foreground shadow-none"
                  onClick={() => setIsSearchOpen(true)}
                  size="lg"
              >
                <Search className="mr-2 h-4 w-4" />
                {t.search.placeholder}
                <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </Button>
            </div>

            {/* Right Icons - Desktop */}
            <div className="hidden md:flex items-center gap-4">
              {/* Notifications */}
              {isAuthenticated && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                          variant="ghost"
                          size="icon"
                          className="relative"
                          aria-label="Notifications"
                      >
                        <Bell className="w-5 h-5" />
                        {notificationsCount > 0 && (
                            <Badge
                                variant="destructive"
                                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                            >
                              {notificationsCount}
                            </Badge>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="end">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{t.notifications.title}</h4>
                          <Button variant="ghost" size="sm" className="text-xs">
                            {t.notifications.markAllRead}
                          </Button>
                        </div>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          <div className="p-3 rounded-lg bg-blue-50 hover:bg-blue-100 cursor-pointer">
                            <p className="text-sm font-medium">{t.notifications.orderProcessing}</p>
                            <p className="text-xs text-gray-500 mt-1">Order #12345 - 2 {t.common.minutesAgo}</p>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full" size="sm">
                          {t.notifications.viewAll}
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
              )}

              {/* Cart */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                      variant="ghost"
                      size="icon"
                      className="relative"
                      aria-label="Cart"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {cartItemsCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                          {cartItemsCount}
                        </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:w-[400px] flex flex-col">
                  <SheetHeader>
                    <SheetTitle>{t.cart.title}</SheetTitle>
                    <SheetDescription>
                      {cartItemsCount} {t.cart.itemsInCart}
                    </SheetDescription>
                  </SheetHeader>

                  <div className="flex-1 overflow-y-auto py-4 space-y-3">
                    <CheckoutCard
                        name="Bullmoose Bar"
                        price={320000}
                        color="Black"
                        image="/images/bullmoose.png"
                        stock="ready"
                        qty={1}
                    />
                  </div>

                  <SheetFooter className="border-t pt-4 space-y-3">
                    <div className="w-full space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{t.cart.subtotal}</span>
                        <span className="font-semibold">Rp 960.000</span>
                      </div>
                      <Button className="w-full" size="lg">
                        {t.cart.checkout}
                      </Button>
                      <Button variant="outline" className="w-full" size="sm" asChild>
                        <Link href="/cart">{t.cart.viewFullCart}</Link>
                      </Button>
                    </div>
                  </SheetFooter>
                </SheetContent>
              </Sheet>

              {/* User Menu */}
              {isAuthenticated ? (
                  <UserAvatar />
              ) : (
                  <div className="flex items-center gap-2">
                    <Button size="sm" className="min-w-20 px-4 font-medium" asChild>
                      <Link href="/login">
                        {t.auth.titleLogin}
                      </Link>
                    </Button>
                    <Button size="sm" asChild variant="outline" className="min-w-20 px-4 font-medium">
                      <Link href="/register">{t.auth.titleRegister}</Link>
                    </Button>
                  </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* Search Button - Mobile */}
          <div className="md:hidden px-4 pb-3">
            <Button
                variant="outline"
                className="w-full justify-start text-sm text-muted-foreground"
                onClick={() => setIsSearchOpen(true)}
            >
              <Search className="mr-2 h-4 w-4" />
              {t.search.placeholder}
            </Button>
          </div>
        </div>

        {/* Bottom Navigation Bar - Desktop */}
        <div
            className={cn(
                "hidden md:block border-b bg-white transition-all duration-300",
                isBottomNavVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 -translate-y-full pointer-events-none"
            )}
            style={{ position: "sticky", top: "0", zIndex: "40" }}
        >
          <div className="container mx-auto flex items-center justify-between py-2 px-4">
            <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide flex-1">
              {navigation.map((item) => (
                  <Link
                      key={item.href}
                      href={item.href}
                      className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
                  >
                    {item.name}
                  </Link>
              ))}
            </div>

            <Select value={locale} onValueChange={(value) => setLocale(value as "id" | "en")}>
              <SelectTrigger className="w-[150px] shadow-none ml-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <Image
                      src={locale === "id" ? "/ic-flag-id.svg" : "/ic-flag-uk.svg"}
                      alt={locale === "id" ? "Indonesia" : "English"}
                      width={20}
                      height={20}
                      className="rounded-sm"
                  />
                  <span>{locale === "id" ? "Indonesia" : "English"}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id">
                  <div className="flex items-center gap-3">
                    <Image src="/ic-flag-id.svg" alt="Indonesia" width={20} height={20} className="rounded-sm" />
                    <span>Indonesia</span>
                  </div>
                </SelectItem>
                <SelectItem value="en">
                  <div className="flex items-center gap-3">
                    <Image src="/ic-flag-uk.svg" alt="English" width={20} height={20} className="rounded-sm" />
                    <span>English</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
            <div className="md:hidden border-t bg-white">
              <div className="container mx-auto py-4 px-4 space-y-4">
                {isAuthenticated ? (
                    <div className="flex items-center gap-3 pb-4 border-b">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user?.profile_image} />
                        <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {user?.first_name} {user?.last_name}
                        </p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                    </div>
                ) : (
                    <div className="flex gap-2 pb-4 border-b">
                      <Button variant="outline" className="flex-1" asChild>
                        <Link href="/login">{t.auth.titleLogin}</Link>
                      </Button>
                      <Button className="flex-1" asChild>
                        <Link href="/register">{t.auth.signUp}</Link>
                      </Button>
                    </div>
                )}

                <nav className="space-y-2">
                  {navigation.map((item) => (
                      <Link
                          key={item.href}
                          href={item.href}
                          className="block py-2 text-sm font-normal hover:text-primary transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                  ))}
                </nav>

                {isAuthenticated && (
                    <div className="pt-4 border-t space-y-2">
                      <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 py-2 text-sm text-red-600 w-full"
                      >
                        <LogOut className="h-4 w-4" />
                        {t.user.logout}
                      </button>
                    </div>
                )}

                <div className="pt-4 border-t">
                  <Select value={locale} onValueChange={(value) => setLocale(value as "id" | "en")}>
                    <SelectTrigger className="w-full">
                      <div className="flex items-center gap-3">
                        <Image
                            src={locale === "id" ? "/ic-flag-id.svg" : "/ic-flag-uk.svg"}
                            alt={locale === "id" ? "Indonesia" : "English"}
                            width={20}
                            height={20}
                            className="rounded-sm"
                        />
                        <span>{locale === "id" ? "Indonesia" : "English"}</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="id">
                        <div className="flex items-center gap-3">
                          <Image src="/ic-flag-id.svg" alt="Indonesia" width={20} height={20} className="rounded-sm" />
                          <span>Indonesia</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="en">
                        <div className="flex items-center gap-3">
                          <Image src="/ic-flag-uk.svg" alt="English" width={20} height={20} className="rounded-sm" />
                          <span>English</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
        )}

        {/* Enhanced Command Dialog for Search */}
        <CommandDialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
          <CommandInput
              placeholder="Search products, categories, tags..."
              value={searchQuery}
              onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>
              {isSearching ? "Searching..." : searchQuery ? "No results found" : "Start typing to search..."}
            </CommandEmpty>

            {/* Quick Links - Show when no search query */}
            {!searchQuery && (
                <CommandGroup heading="Quick Links">
                  {pages.map((page) => (
                      <CommandItem
                          key={page.href}
                          onSelect={() => handleCommandSelect(() => router.push(page.href))}
                      >
                        <page.icon className="mr-2 h-4 w-4" />
                        <span>{page.name}</span>
                      </CommandItem>
                  ))}
                </CommandGroup>
            )}

            {/* Product Search Results - Show when searching or has results */}
            {searchQuery && searchResults.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup heading={`Products (${searchResults.length})`}>
                    {searchResults.map((product) => (
                        <CommandItem
                            key={product.id}
                            value={product.name}
                            onSelect={() => handleCommandSelect(() => router.push(`/products/${product.slug}`))}
                        >
                          <Package className="mr-2 h-4 w-4" />
                          <div className="flex flex-col flex-1">
                            <span className="font-medium">{product.name}</span>
                            <span className="text-xs text-muted-foreground">
                          {formatCurrency(product.idPrice)}
                              {product.category && ` • ${product.category.name}`}
                        </span>
                          </div>
                        </CommandItem>
                    ))}
                    <CommandItem
                        value="view-all-search-results"
                        onSelect={() => handleCommandSelect(() => router.push(`/search?search=${searchQuery}`))}
                        className="justify-center text-primary"
                    >
                      <Search className="mr-2 h-4 w-4" />
                      <span>View all results for {"}{searchQuery}{"}</span>
                    </CommandItem>
                  </CommandGroup>
                </>
            )}

            {/* Categories - Show filtered results */}
            {filteredCategories.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup heading={`Categories ${searchQuery ? `(${filteredCategories.length})` : ''}`}>
                    {filteredCategories.map((category) => (
                        <CommandItem
                            key={category.id}
                            value={`category-${category.name}`}
                            onSelect={() => handleCommandSelect(() => router.push(`/search?category=${category.slug}`))}
                        >
                          <Grid3x3 className="mr-2 h-4 w-4" />
                          <span>{category.name}</span>
                        </CommandItem>
                    ))}
                  </CommandGroup>
                </>
            )}

            {/* Tags - Show filtered results */}
            {filteredTags.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup heading={`Tags ${searchQuery ? `(${filteredTags.length})` : ''}`}>
                    {filteredTags.map((tag) => (
                        <CommandItem
                            key={tag.id}
                            value={`tag-${tag.name}`}
                            onSelect={() => handleCommandSelect(() => router.push(`/search?tag=${tag.slug}`))}
                        >
                          <Tag className="mr-2 h-4 w-4" />
                          <span>{tag.name}</span>
                        </CommandItem>
                    ))}
                  </CommandGroup>
                </>
            )}

            {/* Promotions - Show filtered results */}
            {filteredPromotions.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup heading={`Promotions ${searchQuery ? `(${filteredPromotions.length})` : ''}`}>
                    {filteredPromotions.map((promotion) => (
                        <CommandItem
                            key={promotion.id}
                            value={`promotion-${promotion.name}`}
                            onSelect={() => handleCommandSelect(() => router.push(`/search?promotion=${promotion.id}`))}
                        >
                          <Percent className="mr-2 h-4 w-4" />
                          <div className="flex items-center justify-between w-full">
                            <span>{promotion.name}</span>
                            <Badge variant="destructive" className="ml-2">
                              -{Math.round(promotion.discount * 100)}%
                            </Badge>
                          </div>
                        </CommandItem>
                    ))}
                  </CommandGroup>
                </>
            )}
          </CommandList>
        </CommandDialog>

        <style jsx global>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </>
  );
}
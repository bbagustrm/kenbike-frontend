"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useTranslation } from "@/hooks/use-translation";
import dynamic from 'next/dynamic';

const CartSheet = dynamic(() => import("@/components/cart/cart-sheet").then(mod => ({ default: mod.CartSheet })), {
  ssr: false,
});

const UserAvatar = dynamic(() => import("@/components/auth/user-avatar").then(mod => ({ default: mod.UserAvatar })), {
  ssr: false,
});

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  Bell,
  Menu,
  X,
  Package,
  Home,
  Grid3x3,
  Tag,
  Percent,
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getUserInitials } from "@/lib/auth-utils";

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

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";


export default function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated} = useAuth();
  const { t, locale, setLocale } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ProductListItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const notificationsCount = 5;

  const pages = [
    { name: t.nav.home, href: "/", icon: Home },
    { name: "All Products", href: "/search", icon: Package },
  ];

  // ✅ Fetch data dengan delay untuk non-critical content
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

    // ✅ Delay fetch data untuk prioritaskan LCP
    const timer = setTimeout(fetchData, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isSearchOpen) {
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [isSearchOpen]);

  // Search dengan debounce
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
          limit: 50,
        });
        let results = response.data || [];
        if (results.length === 0) {
          const allProducts = await ProductService.getProducts({
            limit: 100,
          });
          results = allProducts.data.filter((product) =>
              product.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        setSearchResults(results.slice(0, 5));
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

  const getFilteredCategories = () => {
    if (!searchQuery) return categories;
    const query = searchQuery.toLowerCase();
    if (query.includes('category') || query.includes('kategori')) {
      return categories;
    }
    return categories.filter(cat =>
        cat.name.toLowerCase().includes(query)
    );
  };

  const getFilteredTags = () => {
    if (!searchQuery) return tags.slice(0, 5);
    const query = searchQuery.toLowerCase();
    if (query.includes('tag')) {
      return tags;
    }
    return tags.filter(tag =>
        tag.name.toLowerCase().includes(query)
    );
  };

  const getFilteredPromotions = () => {
    if (!searchQuery) return promotions.slice(0, 3);
    const query = searchQuery.toLowerCase();
    if (query.includes('promo') || query.includes('discount') || query.includes('sale')) {
      return promotions;
    }
    return promotions.filter(promo =>
        promo.name.toLowerCase().includes(query)
    );
  };

  const filteredCategories = getFilteredCategories();
  const filteredTags = getFilteredTags();
  const filteredPromotions = getFilteredPromotions();

  // Scroll handler dengan passive listener
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

  // Keyboard shortcut
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
        <div className="sticky top-0 z-50 bg-card border-b border-border">
          <div className="container mx-auto flex items-center justify-between py-3 px-4">
            {/* ✅ Logo dengan priority untuk LCP */}
            <Link href="/" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <Image
                  src="/logo.webp"
                  alt="Kenbike Logo"
                  width={160}
                  height={160}
                  priority // ✅ PENTING: Preload logo
                  quality={95}
              />
            </Link>

            {/* Search Command - Desktop */}
            <div className="hidden md:flex flex-1 justify-center px-6">
              <Button
                  variant="outline"
                  className="relative w-full max-w-xl justify-start text-sm font-normal"
                  onClick={() => setIsSearchOpen(true)}
                  size="lg"
              >
                <Search className="mr-2 h-4 w-4" />
                {t.search.placeholder}
                <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </Button>
            </div>

            {/* Right Icons - Desktop */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 bg-background rounded-full p-1 border shadow-xs border-border">
                {isAuthenticated && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative"
                            aria-label="Notifications"
                        >
                          <Bell className="w-7 h-7" />
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
                      <PopoverContent className="w-80 bg-card" align="end">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{t.notifications.title}</h4>
                            <Button variant="ghost" size="sm" className="text-xs">
                              {t.notifications.markAllRead}
                            </Button>
                          </div>
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer">
                              <p className="text-sm font-medium">{t.notifications.orderProcessing}</p>
                              <p className="text-xs text-muted-foreground mt-1">Order #12345 - 2 {t.common.minutesAgo}</p>
                            </div>
                          </div>
                          <Button variant="outline" className="w-full" size="sm">
                            {t.notifications.viewAll}
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                )}
                <CartSheet />
              </div>

              {isAuthenticated ? (
                  <UserAvatar />
              ) : (
                  <div className="flex items-center gap-2">
                    <Button size="sm" className="min-w-20 px-4 font-medium" asChild>
                      <Link href="/login">{t.auth.titleLogin}</Link>
                    </Button>
                    <Button size="sm" asChild variant="outline" className="min-w-20 px-4 font-medium">
                      <Link href="/register">{t.auth.titleRegister}</Link>
                    </Button>
                  </div>
              )}
            </div>

            <div className="flex items-center md:hidden gap-2 bg-background rounded-full p-1.5 ">
              {isAuthenticated && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                          variant="ghost"
                          size="icon"
                          className="relative"
                          aria-label="Notifications"
                      >
                        <Bell className="w-7 h-7" />
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
                    <PopoverContent className="w-80 bg-card" align="end">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{t.notifications.title}</h4>
                          <Button variant="ghost" size="sm" className="text-xs">
                            {t.notifications.markAllRead}
                          </Button>
                        </div>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer">
                            <p className="text-sm font-medium">{t.notifications.orderProcessing}</p>
                            <p className="text-xs text-muted-foreground mt-1">Order #12345 - 2 {t.common.minutesAgo}</p>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full" size="sm">
                          {t.notifications.viewAll}
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
              )}
              <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
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

        {/* Bottom Navigation - sama seperti sebelumnya, tapi tambahkan loading="lazy" untuk flag images */}
        <div
            className={cn(
                "hidden md:block border-b border-border bg-card transition-all duration-300",
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
                      className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
                  >
                    {item.name}
                  </Link>
              ))}
            </div>
            <Select value={locale} onValueChange={(value) => setLocale(value as "id" | "en")}>
              <SelectTrigger className="w-[150px] shadow-none ml-4 flex-shrink-0 bg-card">
                <div className="flex items-center gap-3">
                  {/* ✅ Lazy load flag images */}
                  <Image
                      src={locale === "id" ? "/ic-flag-id.webp" : "/ic-flag-uk.webp"}
                      alt={locale === "id" ? "Indonesia" : "English"}
                      width={20}
                      height={20}
                      className="rounded-sm"
                      loading="lazy"
                  />
                  <span>{locale === "id" ? "Indonesia" : "English"}</span>
                </div>
              </SelectTrigger>
              <SelectContent className="bg-card">
                <SelectItem value="id">
                  <div className="flex items-center gap-3">
                    <Image src="/ic-flag-id.webp" alt="Indonesia" width={20} height={20} className="rounded-sm" loading="lazy" />
                    <span>Indonesia</span>
                  </div>
                </SelectItem>
                <SelectItem value="en">
                  <div className="flex items-center gap-3">
                    <Image src="/ic-flag-uk.webp" alt="English" width={20} height={20} className="rounded-sm" loading="lazy" />
                    <span>English</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Mobile Menu - sama seperti sebelumnya */}
        {isMobileMenuOpen && (
            <div className="md:hidden border-t border-border bg-card">
              <div className="container mx-auto py-4 px-4 space-y-4">
                {isAuthenticated ? (
                    <div className="flex items-center gap-3 pb-4 border-b border-border">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user?.profile_image} />
                        <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {user?.first_name} {user?.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                ) : (
                    <div className="flex gap-2 pb-4 border-b border-border">
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
              </div>
            </div>
        )}

        {/* Command Dialog - Render conditionally */}
        {isSearchOpen && (
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
        )}

        {/* Floating Cart - Mobile */}
        <div className="bg-secondary rounded-full fixed bottom-5 right-5 z-50 md:hidden">
          <CartSheet />
        </div>

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



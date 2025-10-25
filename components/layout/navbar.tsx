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
export default function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { t, locale, setLocale } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Mock data - replace dengan real data
  const cartItemsCount = 3;
  const notificationsCount = 5;

  // Mock search results - replace dengan real API
  const searchResults = [
    { id: 1, name: "Bullmoose Bar Black", category: "Stang", href: "/products/1" },
    { id: 2, name: "Front Rack Silver", category: "Rack", href: "/products/2" },
    { id: 3, name: "Centerpull Brake", category: "Centerpull", href: "/products/3" },
  ];

  const pages = [
    { name: t.nav.home, href: "/", icon: Home },
    { name: t.nav.products, href: "/products", icon: Package },
    { name: t.nav.about, href: "/about", icon: Info },
    { name: t.nav.contact, href: "/contact", icon: Phone },
  ];

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
    { name: t.nav.newProducts, href: "/products/latest" },
    { name: t.nav.specialPromo, href: "/promo" },
    { name: t.nav.about, href: "/about" },
    { name: t.nav.contact, href: "/contact" },
  ];

  return (
      <>
        {/* Top Bar - Higher z-index to stay on top */}
        <div className="sticky top-0 z-50 bg-white w-full">
          <div className="border-b">
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
        </div>

        {/* Bottom Navigation Bar - Desktop (Sticky & Hide on Scroll) */}
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
            {/* Left Menu */}
            <div className="flex items-center gap-6">
              {navigation.map((item) => (
                  <Link
                      key={item.name}
                      href={item.href}
                      className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.name}
                  </Link>
              ))}
            </div>

            {/* Language Selector */}
            <Select value={locale} onValueChange={(value) => setLocale(value as "id" | "en")}>
              <SelectTrigger className="w-[150px] shadow-none">
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
                    <Image
                        src="/ic-flag-id.svg"
                        alt="Indonesia"
                        width={20}
                        height={20}
                        className="rounded-sm"
                    />
                    <span>Indonesia</span>
                  </div>
                </SelectItem>
                <SelectItem value="en">
                  <div className="flex items-center gap-3">
                    <Image
                        src="/ic-flag-uk.svg"
                        alt="English"
                        width={20}
                        height={20}
                        className="rounded-sm"
                    />
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
                          key={item.name}
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
                          <Image
                              src="/ic-flag-id.svg"
                              alt="Indonesia"
                              width={20}
                              height={20}
                              className="rounded-sm"
                          />
                          <span>Indonesia</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="en">
                        <div className="flex items-center gap-3">
                          <Image
                              src="/ic-flag-uk.svg"
                              alt="English"
                              width={20}
                              height={20}
                              className="rounded-sm"
                          />
                          <span>English</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
        )}

        {/* Command Dialog for Search */}
        <CommandDialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
          <CommandInput placeholder={t.search.typeToSearch} />
          <CommandList>
            <CommandEmpty>{t.search.noResults}</CommandEmpty>
            <CommandGroup heading={t.search.pages}>
              {pages.map((page) => (
                  <CommandItem
                      key={page.href}
                      onSelect={() => {
                        router.push(page.href);
                        setIsSearchOpen(false);
                      }}
                  >
                    <page.icon className="mr-2 h-4 w-4" />
                    <span>{page.name}</span>
                  </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading={t.search.products}>
              {searchResults.map((result) => (
                  <CommandItem
                      key={result.id}
                      onSelect={() => {
                        router.push(result.href);
                        setIsSearchOpen(false);
                      }}
                  >
                    <Package className="mr-2 h-4 w-4" />
                    <div className="flex flex-col">
                      <span>{result.name}</span>
                      <span className="text-xs text-muted-foreground">{result.category}</span>
                    </div>
                  </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </>
  );
}
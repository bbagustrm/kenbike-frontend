"use client";

import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Bell, ShoppingCart } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import CheckoutCard from "../checkout-card";
import { useLanguage, type SupportedLanguage } from "@/hooks/use-language";

export default function Navbar() {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (value: string) => {
    setLanguage(value as SupportedLanguage);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow w-full">
      {/* === Top Bar === */}
      <div className="container mx-auto flex items-center justify-between py-2">
        {/* Logo */}
        <Link href="/public" className="flex items-center gap-2 cursor-pointer">
          <Image src="/logo.png" alt="Logo" width={90} height={90} />
        </Link>

        {/* Search Bar */}
        <div className="flex-1 flex justify-center px-4">
          <div className="relative w-full max-w-md flex items-center">
            <Search className="absolute left-3 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search produk..."
              className="w-full pl-10 pr-3 py-2 rounded border border-gray-300 focus:outline-none"
            />
          </div>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                aria-label="Notifications"
                className="cursor-pointer rounded-full p-2 transition-colors hover:bg-gray-200"
              >
                <Bell className="w-6 h-6" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="font-semibold mb-2">Notifications</div>
              <div className="text-sm text-gray-500">
                Belum ada notifikasi baru.
              </div>
            </PopoverContent>
          </Popover>

          {/* Cart */}
          <Sheet>
            <SheetTrigger asChild>
              <button
                aria-label="Cart"
                className="cursor-pointer rounded-full p-2 transition-colors hover:bg-gray-200"
              >
                <ShoppingCart className="w-6 h-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[400px] p-4">
              <SheetHeader>
                <SheetTitle>Keranjang</SheetTitle>
                <SheetDescription>
                  Produk yang sudah kamu tambahkan
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-3 py-4">
                <CheckoutCard
                  name="Bullmoose Bar"
                  price={320000}
                  color="Black"
                  image="/images/bullmoose.png"
                  stock="ready"
                  qty={1}
                />
                <CheckoutCard
                  name="Bullmoose Bar"
                  price={320000}
                  color="Black"
                  image="/images/bullmoose.png"
                  stock="low"
                  qty={1}
                />
                <CheckoutCard
                  name="Bullmoose Bar"
                  price={320000}
                  color="Black"
                  image="/images/bullmoose.png"
                  stock="out"
                  qty={1}
                />
              </div>

              <SheetFooter className="flex flex-col gap-2">
                <Button className="w-full" size="lg">
                  Checkout
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          {/* Avatar */}
          <Link
            href="/user/profile"
            className="cursor-pointer rounded-full p-1 transition-colors hover:bg-gray-200"
          >
            <Avatar>
              <AvatarImage />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>

      {/* === Bottom Bar === */}
      <div className="border-t">
        <div className="container mx-auto flex items-center justify-between py-2">
          {/* Left Menu */}
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="/products/latest"
                  className="px-4 py-2 cursor-pointer"
                >
                  Produk Terbaru
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="/promo"
                  className="px-4 py-2 cursor-pointer"
                >
                  Promo Spesial
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="/about"
                  className="px-4 py-2 cursor-pointer"
                >
                  Tentang Kami
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Right Language Select */}
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="id">🇮🇩 ID</SelectItem>
              <SelectItem value="en">🇬🇧 EN</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </nav>
  );
}

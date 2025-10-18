"use client";

import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { useLanguage, type SupportedLanguage } from "@/hooks/use-language";

export default function NavHome() {
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

        {/* Login & Register */}
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="outline">Login</Button>
          </Link>
          <Link href="/register">
            <Button>Register</Button>
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

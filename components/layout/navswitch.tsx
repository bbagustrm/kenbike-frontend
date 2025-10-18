"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import Navbar from "@/components/layout/navbar";
import Navbar2 from "./navbar2";
import NavHome from "./navbarhome";

export default function NavbarSwitcher() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // Misalnya role/token disimpan di localStorage setelah login
    try {
      const token = window.localStorage.getItem("token");
      const userRole = window.localStorage.getItem("role"); // "user" | "admin" | "owner"

      if (token && token.length > 0 && userRole) {
        setRole(userRole);
      } else {
        setRole(null);
      }
    } catch (error) {
      console.error("Failed to read role from storage", error);
      setRole(null);
    }
  }, [pathname]);

  const isDetailProduct = pathname.includes("/detailproduct/");
  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password");

  // Jika sedang di halaman login/register/forgot-password → tidak ada navbar
  if (isAuthPage) {
    return null;
  }

  // Jika user belum login → pakai NavHome
  if (!role) {
    return <NavHome />;
  }

  // Jika halaman detail produk → pakai Navbar2
  if (isDetailProduct) {
    return <Navbar2 />;
  }

  // Jika sudah login → tampilkan navbar sesuai role
  if (role === "admin") return <Navbar />;
  if (role === "owner") return <Navbar />; // misal owner pakai Navbar yg sama dgn admin
  if (role === "user") return <Navbar />; // default user

  return <NavHome />; // fallback
}

"use client";

import { useEffect, useState } from "react";

import ProfileScreen from "@/app/(site)/_components/profile-screen";
import type { UserRole } from "@/lib/mocks/users";

export default function SharedProfilePage() {
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    try {
      const storedRole = window.localStorage.getItem("role");
      if (storedRole === "admin" || storedRole === "owner" || storedRole === "user") {
        setRole(storedRole);
      } else {
        setRole(null);
      }
    } catch (error) {
      console.error("Failed to read role from storage", error);
      setRole(null);
    }
  }, []);

  return <ProfileScreen role={role} />;
}

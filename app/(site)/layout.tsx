import type { ReactNode } from "react";

import Footer from "@/components/footer/footer";
import NavbarSwitcher from "@/components/navbar/navswitch";

export default function SiteLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <NavbarSwitcher />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

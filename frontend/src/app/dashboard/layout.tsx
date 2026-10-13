"use client";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import s from "./layout.module.css";
import { AuthProvider } from "@/context/AuthContext";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/dashboard/categories", label: "Categories" },
  { href: "/dashboard/products", label: "Products" },
  { href: "/dashboard/users", label: "Users" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const path = usePathname();

  // console.log(path);
  return (
    <AuthProvider>
      <div className={s.shell}>
        <aside className={s.sidebar}>
          <h1 className={s.logo}>Admin</h1>
          <nav className={s.nav}>
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`${s.link} ${path === l.href ? s.active : ""}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className={s.main}>{children}</main>
      </div>
    </AuthProvider>
  );
}

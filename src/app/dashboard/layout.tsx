"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

import {
  LayoutDashboard,
  Globe,
  FileText,
  LogOut,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const navItem = (
    href: string,
    label: string,
    Icon: any
  ) => {
    const active = pathname === href || pathname.startsWith(href + "/");

    return (
      <Link
        href={href}
        className={`flex items-center gap-3 rounded-md px-3 py-2 transition
          ${
            active
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted"
          }
        `}
      >
        <Icon size={18} />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/40 flex flex-col">
        <div className="h-14 flex items-center px-6 font-bold border-b">
          SaaS CMS
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItem("/dashboard", "Dashboard", LayoutDashboard)}
          {navItem("/dashboard/domains", "Domains", Globe)}
          {navItem("/dashboard/pages", "Pages", FileText)}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-red-600 hover:bg-red-50 transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

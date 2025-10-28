"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Users,
  Bell,
  BarChart3,
  Settings,
  LayoutDashboard,
  UserCog,
  Briefcase,
  MessageSquare,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Kullanıcılar",
    href: "/users",
    icon: Users,
  },
  {
    name: "İş İlanları",
    href: "/jobs",
    icon: Briefcase,
  },
  {
    name: "Yorumlar",
    href: "/reviews",
    icon: MessageSquare,
  },
  {
    name: "Bildirimler",
    href: "/notifications",
    icon: Bell,
  },
  {
    name: "Analitik",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    name: "Ayarlar",
    href: "/settings",
    icon: Settings,
  },
];

const adminNavigation = [
  {
    name: "Admin Yönetimi",
    href: "/admin-management",
    icon: UserCog,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-sm font-bold">YOB</span>
          </div>
          <span className="text-lg font-semibold">Admin Panel</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}

        {/* Admin Section */}
        <div className="pt-4">
          <div className="px-3 pb-2 text-xs font-semibold text-muted-foreground">
            SUPER ADMIN
          </div>
          {adminNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Theme Toggle */}
        <div className="mt-auto pt-4 border-t border-border">
          <div className="px-3 pb-2 text-xs font-semibold text-muted-foreground">
            TEMA
          </div>
          <div className="px-3">
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </div>
  );
}

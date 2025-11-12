"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState } from "react";
import {
  Users,
  Bell,
  BarChart3,
  Settings,
  LayoutDashboard,
  UserCog,
  Briefcase,
  MessageSquare,
  Menu,
  X,
  FolderTree,
  Wrench,
  Image as ImageIcon,
  LayoutList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

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
    name: "İçerik Yönetimi",
    href: "/content",
    icon: LayoutList,
    children: [
      {
        name: "Tamir Kategorileri",
        href: "/content/repair-categories",
        icon: FolderTree,
      },
      {
        name: "Tamir Türleri",
        href: "/content/repair-types",
        icon: Wrench,
      },
      {
        name: "Ana Sayfa Slider",
        href: "/content/home-sliders",
        icon: ImageIcon,
      },
      {
        name: "Ana Sayfa Kartları",
        href: "/content/home-cards",
        icon: LayoutList,
      },
    ],
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  
  const toggleSubmenu = (itemName: string) => {
    setExpandedMenus(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={toggleMobileMenu}
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </Button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 flex h-full w-64 flex-col border-r bg-card transition-transform duration-300 ease-in-out lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
            <div
             className="relative h-10 w-10">
              <Image src={"/app-logo.png"} alt="logo" fill sizes="100wv" className="object-cover" />
             </div>
            <span className="text-lg font-semibold">Admin Panel</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.children && item.children.some(child => pathname.startsWith(child.href)));
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedMenus.includes(item.name);

            return (
              <div key={item.name}>
                {hasChildren ? (
                  <button
                    onClick={() => toggleSubmenu(item.name)}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="flex-1 text-left">{item.name}</span>
                    <svg
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isExpanded && "rotate-180"
                      )}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    onClick={closeMobileMenu}
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
                )}
                
                {/* Submenu */}
                {hasChildren && isExpanded && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children!.map((child) => {
                      const ChildIcon = child.icon;
                      const isChildActive = pathname === child.href;
                      
                      return (
                        <Link
                          key={child.name}
                          href={child.href}
                          onClick={closeMobileMenu}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            isChildActive
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <ChildIcon className="h-4 w-4" />
                          {child.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
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
                  onClick={closeMobileMenu}
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
    </>
  );
}

"use client";

import Link from "next/link";
import { FolderTree, Wrench, ImageIcon, LayoutList } from "lucide-react";

const contentPages = [
  {
    name: "Tamir Kategorileri",
    description: "Ana tamir kategorilerini yönetin",
    href: "/content/repair-categories",
    icon: FolderTree,
    count: "3 kategori",
  },
  {
    name: "Tamir Türleri",
    description: "Tamir türlerini ve alt kategorileri yönetin",
    href: "/content/repair-types",
    icon: Wrench,
    count: "21 tür",
  },
  {
    name: "Ana Sayfa Slider",
    description: "Ana sayfa slider görsellerini yönetin",
    href: "/content/home-sliders",
    icon: ImageIcon,
    count: "2 slider",
  },
  {
    name: "Ana Sayfa Kartları",
    description: "Ana sayfa özellik kartlarını yönetin",
    href: "/content/home-cards",
    icon: LayoutList,
    count: "3 kart",
  },
];

export default function ContentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">İçerik Yönetimi</h1>
        <p className="text-muted-foreground">
          Uygulama içeriğini yönetin
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {contentPages.map((page) => {
          const Icon = page.icon;
          return (
            <Link
              key={page.href}
              href={page.href}
              className="group rounded-lg border p-6 hover:border-primary transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    {page.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {page.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {page.count}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

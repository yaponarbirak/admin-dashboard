"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogOut, Users, Bell, FileText, BarChart } from "lucide-react";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="container mx-auto p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            Hoş Geldiniz, {user?.displayName}!
          </h1>
          <p className="text-muted-foreground mt-1">
            YOB Admin Panel - {user?.role}
          </p>
        </div>
        <Button variant="outline" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          Çıkış Yap
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Toplam Kullanıcı
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Yakında eklenecek</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Gönderilen Bildirim
            </CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Yakında eklenecek</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Aktif İlanlar</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Yakında eklenecek</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bu Ay</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Yakında eklenecek</p>
          </CardContent>
        </Card>
      </div>

      {/* Welcome Card */}
      <Card>
        <CardHeader>
          <CardTitle>🎉 Admin Panel Başarıyla Kuruldu!</CardTitle>
          <CardDescription>
            Sprint 1 tamamlandı. Authentication sistemi çalışıyor.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">✅ Tamamlanan Özellikler:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Firebase Authentication entegrasyonu</li>
              <li>Admin custom claims sistemi</li>
              <li>Login/logout işlevleri</li>
              <li>Protected routes</li>
              <li>Shadcn/ui component library</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">
              🚀 Sıradaki Özellikler (Sprint 2):
            </h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Kullanıcı listesi ve yönetimi</li>
              <li>Kullanıcı detay sayfası</li>
              <li>Ban/unban işlemleri</li>
              <li>Dashboard sidebar navigation</li>
            </ul>
          </div>

          <div className="pt-4">
            <p className="text-sm text-muted-foreground">
              <strong>Giriş Bilgileri:</strong>
              <br />
              Email: {user?.email}
              <br />
              Role: {user?.role}
              <br />
              UID: {user?.uid}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

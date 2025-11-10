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
import {
  LogOut,
  Users,
  Bell,
  FileText,
  BarChart,
  TrendingUp,
  TrendingDown,
  Star,
  UserCheck,
  UserX,
  Briefcase,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function AdminPage() {
  const { user, logout } = useAuth();
  const { data: stats, isLoading, refetch } = useDashboardStats();

  return (
    <div className="container mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Hoş Geldiniz, {user?.displayName}!
          </h1>
          <p className="text-muted-foreground mt-1">
            YOB Admin Panel - {user?.role === "super_admin" ? "Super Admin" : user?.role === "admin" ? "Admin" : "Moderator"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Yenile
          </Button>
          <Button variant="outline" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Çıkış Yap
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Toplam Kullanıcı
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.users.total || 0}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  +{stats?.users.newThisMonth || 0} bu ay
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Aktif Kullanıcı</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.users.active || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.users.banned || 0} yasaklı kullanıcı
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Active Jobs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Aktif İlanlar</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.jobs.active || 0}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  +{stats?.jobs.newThisMonth || 0} bu ay
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Total Reviews */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Puan</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats?.reviews.averageRating || "0.0"} ⭐
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.reviews.total || 0} toplam değerlendirme
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Jobs Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              İlan Durumu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Toplam İlan</span>
                  <span className="font-semibold">{stats?.jobs.total || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Aktif</span>
                  <span className="font-semibold text-green-600">
                    {stats?.jobs.active || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tamamlanan</span>
                  <span className="font-semibold text-blue-600">
                    {stats?.jobs.completed || 0}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* User Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Kullanıcı Durumu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Toplam</span>
                  <span className="font-semibold">{stats?.users.total || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Aktif</span>
                  <span className="font-semibold text-green-600">
                    {stats?.users.active || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Yasaklı</span>
                  <span className="font-semibold text-red-600">
                    {stats?.users.banned || 0}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Reviews Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="h-4 w-4" />
              Değerlendirmeler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Toplam</span>
                  <span className="font-semibold">{stats?.reviews.total || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Ortalama Puan</span>
                  <span className="font-semibold text-yellow-600">
                    {stats?.reviews.averageRating || "0.0"} ⭐
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Bu Ay</span>
                  <span className="font-semibold">
                    +{stats?.reviews.newThisMonth || 0}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Hızlı Erişim</CardTitle>
          <CardDescription>
            Sık kullanılan işlemlere buradan ulaşabilirsiniz
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/users">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <Users className="h-6 w-6" />
                <span>Kullanıcılar</span>
              </Button>
            </Link>
            <Link href="/jobs">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <Briefcase className="h-6 w-6" />
                <span>İlanlar</span>
              </Button>
            </Link>
            <Link href="/notifications">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <Bell className="h-6 w-6" />
                <span>Bildirimler</span>
              </Button>
            </Link>
            <Link href="/reviews">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <Star className="h-6 w-6" />
                <span>Değerlendirmeler</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Welcome Card */}
      <Card className="bg-linear-to-br from-primary/10 via-primary/5 to-background">
        <CardHeader>
          <CardTitle>🎉 YOB Admin Panel</CardTitle>
          <CardDescription>
            Tüm sistem özellikleri aktif ve çalışıyor
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Aktif Modüller:
            </h3>
            <ul className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-600" />
                Kullanıcı Yönetimi
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-600" />
                İlan Yönetimi
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-600" />
                Bildirim Sistemi
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-600" />
                Değerlendirmeler
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-600" />
                Admin Yönetimi
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-600" />
                Analytics Dashboard
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              <strong>Oturum Bilgileri:</strong>
              <br />
              Email: {user?.email}
              <br />
              Rol: {user?.role === "super_admin" ? "Super Admin" : user?.role === "admin" ? "Admin" : "Moderator"}
              <br />
              UID: {user?.uid}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

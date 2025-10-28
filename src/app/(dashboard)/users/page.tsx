"use client";

import { useState } from "react";
import { useUsers, useUserCount } from "@/hooks/useUsers";
import { UsersTable } from "@/components/users/UsersTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Users as UsersIcon, RefreshCw, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [profileTypeFilter, setProfileTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { data, isLoading, error, refetch } = useUsers({ searchQuery });
  const { data: userCount } = useUserCount();

  // Calculate statistics
  const stats = {
    total: data?.users.length || 0,
    customers:
      data?.users.filter((u) => u.profileType === "customer").length || 0,
    serviceProviders:
      data?.users.filter((u) => u.profileType === "serviceProvider").length ||
      0,
    active: data?.users.filter((u) => u.isActive && !u.isBanned).length || 0,
    banned: data?.users.filter((u) => u.isBanned).length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Kullanıcılar</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Tüm kullanıcıları görüntüleyin ve yönetin
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Yenile
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Toplam Kullanıcı
            </CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {!isLoading ? (
              <>
                <div className="text-2xl font-bold">
                  {stats.total.toLocaleString("tr-TR")}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.active} aktif
                </p>
              </>
            ) : (
              <Skeleton className="h-8 w-20" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Müşteriler</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {!isLoading ? (
              <>
                <div className="text-2xl font-bold">
                  {stats.customers.toLocaleString("tr-TR")}
                </div>
                <p className="text-xs text-muted-foreground">
                  {((stats.customers / stats.total) * 100 || 0).toFixed(0)}%
                  toplam
                </p>
              </>
            ) : (
              <Skeleton className="h-8 w-20" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Hizmet Sağlayıcılar
            </CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {!isLoading ? (
              <>
                <div className="text-2xl font-bold">
                  {stats.serviceProviders.toLocaleString("tr-TR")}
                </div>
                <p className="text-xs text-muted-foreground">
                  {((stats.serviceProviders / stats.total) * 100 || 0).toFixed(
                    0
                  )}
                  % toplam
                </p>
              </>
            ) : (
              <Skeleton className="h-8 w-20" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yasaklı</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {!isLoading ? (
              <>
                <div className="text-2xl font-bold text-destructive">
                  {stats.banned.toLocaleString("tr-TR")}
                </div>
                <p className="text-xs text-muted-foreground">
                  {((stats.banned / stats.total) * 100 || 0).toFixed(1)}% toplam
                </p>
              </>
            ) : (
              <Skeleton className="h-8 w-20" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="E-posta, isim veya UID ile ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Select
            value={profileTypeFilter}
            onValueChange={setProfileTypeFilter}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Profil Tipi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Tipler</SelectItem>
              <SelectItem value="customer">Müşteri</SelectItem>
              <SelectItem value="serviceProvider">Hizmet Sağlayıcı</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="inactive">Pasif</SelectItem>
              <SelectItem value="banned">Yasaklı</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <p className="text-destructive">
              Kullanıcılar yüklenirken hata oluştu.
            </p>
            <Button
              onClick={() => refetch()}
              variant="outline"
              className="mt-4"
            >
              Tekrar Dene
            </Button>
          </CardContent>
        </Card>
      ) : data && data.users.length > 0 ? (
        <UsersTable
          users={data.users.filter((user) => {
            // Profile type filter
            if (
              profileTypeFilter !== "all" &&
              user.profileType !== profileTypeFilter
            ) {
              return false;
            }

            // Status filter
            if (
              statusFilter === "active" &&
              (!user.isActive || user.isBanned)
            ) {
              return false;
            }
            if (
              statusFilter === "inactive" &&
              (user.isActive || user.isBanned)
            ) {
              return false;
            }
            if (statusFilter === "banned" && !user.isBanned) {
              return false;
            }

            return true;
          })}
        />
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <p className="text-muted-foreground">
              {searchQuery
                ? "Arama kriterlerine uygun kullanıcı bulunamadı."
                : "Henüz kullanıcı yok."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

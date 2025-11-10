"use client";

import { useState } from "react";
import { useUsers } from "@/hooks/useUsers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Shield, ShieldOff, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { UserDocument } from "@/types";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { GrantAdminDialog } from "@/components/users/GrantAdminDialog";
import { RevokeAdminDialog } from "@/components/users/RevokeAdminDialog";

export default function AdminManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserDocument | null>(null);
  const [grantDialogOpen, setGrantDialogOpen] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  
  const { data, isLoading, refetch } = useUsers({ searchQuery });

  // Admin ve normal kullanıcıları ayır
  const adminUsers = data?.users.filter(u => u.isAdmin) || [];
  const regularUsers = data?.users.filter(u => !u.isAdmin) || [];

  const stats = {
    totalAdmins: adminUsers.length,
    superAdmins: adminUsers.filter(u => u.adminRole === "super_admin").length,
    admins: adminUsers.filter(u => u.adminRole === "admin").length,
    moderators: adminUsers.filter(u => u.adminRole === "moderator").length,
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "super_admin":
        return <Badge variant="destructive">Super Admin</Badge>;
      case "admin":
        return <Badge className="bg-orange-600">Admin</Badge>;
      case "moderator":
        return <Badge variant="secondary">Moderator</Badge>;
      default:
        return <Badge variant="outline">Kullanıcı</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Yönetimi</h1>
          <p className="text-muted-foreground">
            Admin kullanıcılarını görüntüleyin ve yönetin
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Yenile
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Admin</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAdmins}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Super Admin</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.superAdmins}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin</CardTitle>
            <Shield className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.admins}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Moderator</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.moderators}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="E-posta veya isim ile ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Current Admins */}
      <Card>
        <CardHeader>
          <CardTitle>Mevcut Adminler</CardTitle>
          <CardDescription>
            Admin yetkisine sahip kullanıcılar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : adminUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Henüz admin kullanıcı bulunmuyor
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kullanıcı</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Kayıt Tarihi</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminUsers.map((user) => (
                    <TableRow key={user.uid}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.email}</span>
                          {user.fullName && (
                            <span className="text-sm text-muted-foreground">
                              {user.fullName}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.adminRole)}</TableCell>
                      <TableCell>
                        {user.createdAt && format(
                          user.createdAt.toDate(),
                          "d MMM yyyy",
                          { locale: tr }
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setRevokeDialogOpen(true);
                          }}
                        >
                          <ShieldOff className="mr-2 h-4 w-4" />
                          Yetkiyi Kaldır
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Regular Users - Can Grant Admin */}
      <Card>
        <CardHeader>
          <CardTitle>Kullanıcılar</CardTitle>
          <CardDescription>
            Admin yetkisi verebileceğiniz kullanıcılar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : regularUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Admin olmayan kullanıcı bulunamadı
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kullanıcı</TableHead>
                    <TableHead>Tip</TableHead>
                    <TableHead>Kayıt Tarihi</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {regularUsers.slice(0, 10).map((user) => (
                    <TableRow key={user.uid}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.email}</span>
                          {user.fullName && (
                            <span className="text-sm text-muted-foreground">
                              {user.fullName}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.profileType === "serviceProvider" ? "default" : "secondary"}>
                          {user.profileType === "serviceProvider" ? "Hizmet Sağlayıcı" : "Müşteri"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.createdAt && format(
                          user.createdAt.toDate(),
                          "d MMM yyyy",
                          { locale: tr }
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:text-green-700"
                          onClick={() => {
                            setSelectedUser(user);
                            setGrantDialogOpen(true);
                          }}
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          Admin Yap
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <GrantAdminDialog
        user={selectedUser}
        open={grantDialogOpen}
        onOpenChange={setGrantDialogOpen}
        onSuccess={() => {
          refetch();
          setSelectedUser(null);
        }}
      />

      <RevokeAdminDialog
        user={selectedUser}
        open={revokeDialogOpen}
        onOpenChange={setRevokeDialogOpen}
        onSuccess={() => {
          refetch();
          setSelectedUser(null);
        }}
      />
    </div>
  );
}

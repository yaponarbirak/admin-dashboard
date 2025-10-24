"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Ban,
  Shield,
  Edit,
  Trash2,
  Star,
  Briefcase,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import type { Timestamp } from "firebase/firestore";
import { BanUserDialog } from "@/components/users/BanUserDialog";

// Helper to safely convert Timestamp to Date
function toDate(timestamp: Timestamp | undefined | null): Date | null {
  if (!timestamp) return null;
  if (typeof timestamp === "object" && "toDate" in timestamp) {
    return timestamp.toDate();
  }
  // Fallback if it's already a Date or can be converted
  return (timestamp as any) instanceof Date ? (timestamp as any) : null;
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const uid = params.uid as string;
  const [banDialogOpen, setBanDialogOpen] = useState(false);

  const { data: user, isLoading, error } = useUser(uid);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Geri
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <p className="text-destructive">
              Kullanıcı bulunamadı veya bir hata oluştu.
            </p>
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="mt-4"
            >
              Geri Dön
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const initials = user.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email.slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Kullanıcı Detayı</h1>
            <p className="text-muted-foreground">
              Kullanıcı bilgilerini görüntüle ve yönet
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Düzenle
          </Button>
          <Button variant="destructive" onClick={() => setBanDialogOpen(true)}>
            <Ban className="mr-2 h-4 w-4" />
            {user.isBanned ? "Yasağı Kaldır" : "Yasakla"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.profileImageUrl} />
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <h3 className="mt-4 text-xl font-semibold">
                {user.fullName || "İsimsiz Kullanıcı"}
              </h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>

              <div className="mt-4 flex gap-2">
                <Badge
                  variant={
                    user.profileType === "serviceProvider"
                      ? "default"
                      : "secondary"
                  }
                >
                  {user.profileType === "serviceProvider"
                    ? "Hizmet Sağlayıcı"
                    : "Müşteri"}
                </Badge>
                {user.isBanned && <Badge variant="destructive">Yasaklı</Badge>}
                {!user.isActive && <Badge variant="secondary">Pasif</Badge>}
              </div>
            </div>

            <Separator />

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{user.email}</span>
              </div>
              {user.phoneNumber && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{user.phoneNumber}</span>
                </div>
              )}
              {user.address && (
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">
                      {user.address.city} / {user.address.district}
                    </p>
                    <p className="text-muted-foreground">
                      {user.address.fullAddress}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Dates */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Kayıt Tarihi</p>
                  <p className="font-medium">
                    {toDate(user.createdAt)
                      ? format(toDate(user.createdAt)!, "d MMMM yyyy", {
                          locale: tr,
                        })
                      : "—"}
                  </p>
                </div>
              </div>
              {user.lastLoginAt && toDate(user.lastLoginAt) && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Son Giriş</p>
                    <p className="font-medium">
                      {format(toDate(user.lastLoginAt)!, "d MMMM yyyy HH:mm", {
                        locale: tr,
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Details Cards */}
        <div className="md:col-span-2 space-y-6">
          {/* Service Provider Info */}
          {user.profileType === "serviceProvider" && (
            <Card>
              <CardHeader>
                <CardTitle>Hizmet Sağlayıcı Bilgileri</CardTitle>
                <CardDescription>
                  İş kategorileri ve değerlendirme bilgileri
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.bio && (
                  <div>
                    <p className="text-sm font-medium mb-1">Biyografi</p>
                    <p className="text-sm text-muted-foreground">{user.bio}</p>
                  </div>
                )}

                {user.serviceCategories &&
                  user.serviceCategories.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">
                        Hizmet Kategorileri
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {user.serviceCategories.map((category) => (
                          <Badge key={category} variant="outline">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {(user.rating !== undefined ||
                  user.reviewCount !== undefined) && (
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <div>
                        <p className="text-2xl font-bold">
                          {user.rating?.toFixed(1) || "0.0"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Ortalama Puan
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {user.reviewCount || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Değerlendirme
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>İstatistikler</CardTitle>
              <CardDescription>İş ve başvuru istatistikleri</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    <span>Yayınlanan İlanlar</span>
                  </div>
                  <p className="text-3xl font-bold">{user.jobsPosted || 0}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    <span>Tamamlanan İşler</span>
                  </div>
                  <p className="text-3xl font-bold">
                    {user.jobsCompleted || 0}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>Alınan Başvurular</span>
                  </div>
                  <p className="text-3xl font-bold">
                    {user.applicationsReceived || 0}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>Gönderilen Başvurular</span>
                  </div>
                  <p className="text-3xl font-bold">
                    {user.applicationsSent || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ban Info */}
          {user.isBanned && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">
                  Yasak Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {user.bannedAt && toDate(user.bannedAt) && (
                  <div>
                    <p className="text-sm font-medium">Yasaklanma Tarihi</p>
                    <p className="text-sm text-muted-foreground">
                      {format(toDate(user.bannedAt)!, "d MMMM yyyy HH:mm", {
                        locale: tr,
                      })}
                    </p>
                  </div>
                )}
                {user.bannedReason && (
                  <div>
                    <p className="text-sm font-medium">Sebep</p>
                    <p className="text-sm text-muted-foreground">
                      {user.bannedReason}
                    </p>
                  </div>
                )}
                {user.bannedBy && (
                  <div>
                    <p className="text-sm font-medium">Yasaklayan Admin</p>
                    <p className="text-sm text-muted-foreground">
                      {user.bannedBy}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* System Info */}
          <Card>
            <CardHeader>
              <CardTitle>Sistem Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kullanıcı ID:</span>
                <span className="font-mono">{user.uid}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Durum:</span>
                <Badge variant={user.isActive ? "default" : "secondary"}>
                  {user.isActive ? "Aktif" : "Pasif"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Son Güncelleme:</span>
                <span>
                  {toDate(user.updatedAt)
                    ? format(toDate(user.updatedAt)!, "d MMM yyyy HH:mm", {
                        locale: tr,
                      })
                    : "—"}
                </span>
              </div>
              {user.fcmTokens && user.fcmTokens.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    FCM Token Sayısı:
                  </span>
                  <span>{user.fcmTokens.length}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Tehlikeli İşlemler</CardTitle>
          <CardDescription>
            Bu işlemler geri alınamaz. Dikkatli olun!
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button variant="destructive" disabled>
            <Trash2 className="mr-2 h-4 w-4" />
            Kullanıcıyı Sil
          </Button>
          <Button variant="outline" disabled>
            Tüm Verilerini Sil
          </Button>
        </CardContent>
      </Card>

      {/* Ban Dialog */}
      <BanUserDialog
        open={banDialogOpen}
        onOpenChange={setBanDialogOpen}
        user={{
          uid: user.uid,
          email: user.email,
          fullName: user.fullName,
          isBanned: user.isBanned,
        }}
      />
    </div>
  );
}

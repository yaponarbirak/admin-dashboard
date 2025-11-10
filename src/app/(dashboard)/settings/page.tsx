"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, AlertTriangle, User, Lock, Shield } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Badge } from "@/components/ui/badge";
import { EditProfileDialog } from "@/components/settings/EditProfileDialog";
import { ChangePasswordDialog } from "@/components/settings/ChangePasswordDialog";

export default function SettingsPage() {
  const { user } = useAuth();
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ayarlar</h1>
        <p className="text-muted-foreground">Hesap ve sistem ayarlarını yönetin</p>
      </div>

      {/* Admin Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Bilgileri
          </CardTitle>
          <CardDescription>
            Mevcut admin hesabı bilgileriniz
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span className="text-sm text-muted-foreground">E-posta</span>
            <span className="font-medium">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span className="text-sm text-muted-foreground">Admin Rolü</span>
            <Badge variant={
              user?.role === "super_admin" ? "destructive" : 
              user?.role === "admin" ? "default" : 
              "secondary"
            }>
              {user?.role === "super_admin" ? "Super Admin" : 
               user?.role === "admin" ? "Admin" : 
               "Moderator"}
            </Badge>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span className="text-sm text-muted-foreground">Kullanıcı ID</span>
            <span className="font-mono text-xs">{user?.uid}</span>
          </div>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Hesap Ayarları
          </CardTitle>
          <CardDescription>
            Hesabınızla ilgili ayarları yönetin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="space-y-1">
              <h3 className="font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Profil Bilgileri
              </h3>
              <p className="text-sm text-muted-foreground">
                Adınızı ve diğer bilgilerinizi düzenleyin
              </p>
            </div>
            <Button variant="outline" onClick={() => setEditProfileOpen(true)}>
              Düzenle
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="space-y-1">
              <h3 className="font-medium flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Şifre Değiştir
              </h3>
              <p className="text-sm text-muted-foreground">
                Hesap güvenliği için şifrenizi güncelleyin
              </p>
            </div>
            <Button variant="outline" onClick={() => setChangePasswordOpen(true)}>
              Değiştir
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Tehlikeli İşlemler
          </CardTitle>
          <CardDescription>
            Bu işlemler geri alınamaz. Dikkatli olun.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900 rounded-lg bg-red-50 dark:bg-red-950/20">
            <div className="space-y-1">
              <h3 className="font-medium text-red-800 dark:text-red-200">Hesabı Sil</h3>
              <p className="text-sm text-red-600 dark:text-red-400">
                Hesabınızı ve tüm verilerinizi kalıcı olarak silin
              </p>
            </div>
            <Link href="/hesap-sil">
              <Button variant="destructive" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Hesabı Sil
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      
      {/* Dialogs */}
      <EditProfileDialog 
        open={editProfileOpen} 
        onOpenChange={setEditProfileOpen} 
      />
      <ChangePasswordDialog 
        open={changePasswordOpen} 
        onOpenChange={setChangePasswordOpen} 
      />
    </div>
  );
}

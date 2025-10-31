import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, AlertTriangle } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ayarlar</h1>
        <p className="text-muted-foreground">Hesap ve sistem ayarlarını yönetin</p>
      </div>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Hesap Ayarları</CardTitle>
          <CardDescription>
            Hesabınızla ilgili ayarları yönetin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <h3 className="font-medium">Profil Bilgileri</h3>
              <p className="text-sm text-muted-foreground">
                Adınızı, e-postanızı ve diğer bilgilerinizi düzenleyin
              </p>
            </div>
            <Button variant="outline" disabled>
              Yakında
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <h3 className="font-medium">Şifre Değiştir</h3>
              <p className="text-sm text-muted-foreground">
                Hesap güvenliği için şifrenizi güncelleyin
              </p>
            </div>
            <Button variant="outline" disabled>
              Yakında
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <h3 className="font-medium">Bildirim Ayarları</h3>
              <p className="text-sm text-muted-foreground">
                E-posta ve push bildirim tercihlerinizi yönetin
              </p>
            </div>
            <Button variant="outline" disabled>
              Yakında
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
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
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
            <div className="space-y-1">
              <h3 className="font-medium text-red-800">Hesabı Sil</h3>
              <p className="text-sm text-red-600">
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
    </div>
  );
}

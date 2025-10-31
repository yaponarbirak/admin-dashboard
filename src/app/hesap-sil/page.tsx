"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { 
  EmailAuthProvider, 
  reauthenticateWithCredential, 
  deleteUser 
} from "firebase/auth";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Trash2, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function DeleteAccountPage() {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Firebase Auth kullanıcısını dinle
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Kullanıcı giriş yapmamışsa kullanıcı login sayfasına yönlendir
  useEffect(() => {
    if (!loading && !user) {
      router.push("/kullanici-giris?redirect=/hesap-sil");
    }
  }, [loading, user, router]);

  // Loading durumunda loading ekranı göster
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Kullanıcı yoksa null döndür (useEffect redirect eder)
  if (!user) {
    return null;
  }

  const handleDeleteAccount = async () => {
    if (!password.trim()) {
      toast.error("Şifrenizi girmelisiniz");
      return;
    }

    if (!user) {
      toast.error("Kullanıcı oturumu bulunamadı");
      return;
    }

    setIsLoading(true);

    try {
      // Re-authentication yap
      const credential = EmailAuthProvider.credential(
        user.email!,
        password
      );

      await reauthenticateWithCredential(user, credential);

      // Firestore'dan kullanıcı verisini sil
      try {
        await deleteDoc(doc(db, "users", user.uid));
      } catch (firestoreError) {
        console.warn("Firestore kullanıcı verisi silinemedi:", firestoreError);
        // Firestore hatası auth silme işlemini durdurmasın
      }

      // Firebase Auth'dan kullanıcıyı sil
      await deleteUser(user);

      // Dialog'u kapat
      setIsDialogOpen(false);

      // Başarı mesajı
      toast.success("Hesabınız başarıyla silindi");

      // Ana sayfaya yönlendir
      router.push("/");

    } catch (error: any) {
      console.error("Hesap silme hatası:", error);
      
      if (error.code === 'auth/wrong-password') {
        toast.error("Hatalı şifre girdiniz");
      } else if (error.code === 'auth/too-many-requests') {
        toast.error("Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin");
      } else if (error.code === 'auth/requires-recent-login') {
        toast.error("Güvenlik nedeniyle tekrar giriş yapmanız gerekiyor");
      } else {
        toast.error(`Hesap silinirken hata oluştu: ${error.message || error}`);
      }
    } finally {
      setIsLoading(false);
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Ana Sayfaya Dön
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Hesabı Sil
          </h1>
          <p className="text-gray-600 mt-2">
            Hesabınızı kalıcı olarak silmek istiyorsanız aşağıdaki adımları takip edin.
          </p>
        </div>

        {/* Warning Card */}
        <Card className="border-red-200 bg-red-50 mb-6">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Önemli Uyarı
            </CardTitle>
          </CardHeader>
          <CardContent className="text-red-700">
            <ul className="list-disc list-inside space-y-1">
              <li>Bu işlem geri alınamaz</li>
              <li>Tüm verileriniz kalıcı olarak silinecek</li>
              <li>Aktif ilanlarınız ve teklifleriniz iptal edilecek</li>
              <li>Geçmiş işlem kayıtlarınıza erişemeyeceksiniz</li>
            </ul>
          </CardContent>
        </Card>

        {/* User Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Hesap Bilgileri</CardTitle>
            <CardDescription>
              Silinecek hesap bilgileri
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>E-posta:</strong> {user?.email}</p>
              <p><strong>Hesap Oluşturma:</strong> {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('tr-TR') : 'Bilinmiyor'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Delete Account Card */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Hesabı Kalıcı Olarak Sil</CardTitle>
            <CardDescription>
              Hesabınızı silmek için şifrenizi girin ve onaylayın.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password">Mevcut Şifreniz</Label>
              <Input
                id="password"
                type="password"
                placeholder="Şifrenizi girin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
              />
            </div>

            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  disabled={!password.trim() || isLoading}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Hesabımı Sil
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-red-600">
                    Hesabı Silmeyi Onaylayın
                  </AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p>
                      Bu işlem <strong>geri alınamaz</strong>. Hesabınız ve tüm verileriniz 
                      kalıcı olarak silinecektir.
                    </p>
                    <p className="text-red-600 font-medium">
                      Devam etmek istediğinizden emin misiniz?
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>İptal Et</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Siliniyor...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Evet, Hesabımı Sil
                      </>
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="text-xs text-gray-500 text-center">
              Bu işlem geri alınamaz. Hesabınızı silmeden önce tüm önemli verilerinizi kaydettiğinizden emin olun.
            </div>
          </CardContent>
        </Card>

        {/* Alternative Actions */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Hesabınızı silmekten vazgeçtiniz mi?
          </p>
          <div className="space-x-4">
            <Link href="/">
              <Button variant="outline">
                Ana Sayfa
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline">
                Giriş Yap
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
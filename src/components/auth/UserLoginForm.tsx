"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

export function UserLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Redirect URL'i al (hesap-sil sayfasından geliyorsa oraya döndür)
  const redirectTo = searchParams.get("redirect") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("E-posta ve şifre gereklidir");
      return;
    }

    setIsLoading(true);

    try {
      // Firebase Auth ile giriş yap (admin kontrolü yok)
      await signInWithEmailAndPassword(auth, email, password);
      
      toast.success("Başarıyla giriş yaptınız");
      
      // Belirtilen sayfaya yönlendir
      router.push(redirectTo);

    } catch (error: any) {
      console.error("Giriş hatası:", error);
      
      if (error.code === "auth/user-not-found") {
        toast.error("Kullanıcı bulunamadı");
      } else if (error.code === "auth/wrong-password") {
        toast.error("Hatalı şifre");
      } else if (error.code === "auth/invalid-email") {
        toast.error("Geçersiz e-posta adresi");
      } else if (error.code === "auth/too-many-requests") {
        toast.error("Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin");
      } else {
        toast.error("Giriş yaparken bir hata oluştu");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-posta</Label>
          <Input
            id="email"
            type="email"
            placeholder="ornek@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Şifre</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Şifrenizi girin"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-red-600 hover:bg-red-700" 
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Giriş yapılıyor...
          </>
        ) : (
          "Giriş Yap"
        )}
      </Button>

      <div className="text-center text-sm">
        <p className="text-gray-600">
          Hesabınız yok mu?{" "}
          <a href="#" className="text-red-600 hover:underline">
            Kayıt Ol
          </a>
        </p>
      </div>
    </form>
  );
}
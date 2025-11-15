"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { revokeAdminAccess } from "@/lib/firebase/users";
import { useAuth } from "@/components/auth/AuthProvider";
import type { UserDocument } from "@/types";
import { ShieldOff, AlertTriangle } from "lucide-react";

interface RevokeAdminDialogProps {
  user: UserDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function RevokeAdminDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: RevokeAdminDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user: currentAdmin } = useAuth();

  const handleRevokeAdmin = async () => {
    if (!user || !currentAdmin) return;

    // Admin kendi yetkisini kaldıramaz
    if (user.uid === currentAdmin.uid) {
      toast.error("Kendi admin yetkinizi kaldıramazsınız");
      return;
    }

    setIsLoading(true);
    try {
      await revokeAdminAccess({
        uid: user.uid,
        revokedBy: currentAdmin.uid,
        revokedByEmail: currentAdmin.email,
      });

      toast.success(`${user.email} kullanıcısının admin yetkisi kaldırıldı`);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Admin yetkisi kaldırma hatası:", error);
      toast.error("Admin yetkisi kaldırılırken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-600">
            <ShieldOff className="h-5 w-5" />
            Admin Yetkisini Kaldır
          </DialogTitle>
          <DialogDescription>
            {user?.email} kullanıcısının admin yetkisini kaldırmak üzeresiniz.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg bg-orange-50 border border-orange-200 p-4">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-sm">
                <p className="font-medium text-orange-900">
                  Bu işlem sonrasında:
                </p>
                <ul className="list-disc list-inside text-orange-800 space-y-1">
                  <li>Kullanıcı admin paneline erişemeyecek</li>
                  <li>Tüm admin yetkileri kaldırılacak</li>
                  <li>Normal kullanıcı hesabı olarak devam edecek</li>
                </ul>
              </div>
            </div>
          </div>

          {user?.role && (
            <div className="text-sm text-muted-foreground">
              <p>
                <strong>Mevcut Rol:</strong>{" "}
                {user.role === "super_admin"
                  ? "Super Admin"
                  : user.role === "admin"
                  ? "Admin"
                  : "Moderator"}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            İptal
          </Button>
          <Button
            onClick={handleRevokeAdmin}
            disabled={isLoading}
            variant="destructive"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Kaldırılıyor...
              </>
            ) : (
              <>
                <ShieldOff className="mr-2 h-4 w-4" />
                Yetkiyi Kaldır
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
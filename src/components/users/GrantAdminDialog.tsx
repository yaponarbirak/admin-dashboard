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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { grantAdminAccess } from "@/lib/firebase/users";
import { useAuth } from "@/components/auth/AuthProvider";
import type { UserDocument, AdminRole } from "@/types";
import { Shield } from "lucide-react";

interface GrantAdminDialogProps {
  user: UserDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function GrantAdminDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: GrantAdminDialogProps) {
  const [role, setRole] = useState<AdminRole>("admin");
  const [isLoading, setIsLoading] = useState(false);
  const { user: currentAdmin } = useAuth();

  const handleGrantAdmin = async () => {
    if (!user || !currentAdmin) return;

    // Admin kendine yetki veremez (zaten admin)
    if (user.uid === currentAdmin.uid) {
      toast.error("Kendi hesabınıza zaten admin yetkiniz var");
      return;
    }

    setIsLoading(true);
    try {
      await grantAdminAccess({
        uid: user.uid,
        role,
        grantedBy: currentAdmin.uid,
        grantedByEmail: currentAdmin.email,
      });

      toast.success(`${user.email} kullanıcısına admin yetkisi verildi`);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Admin yetkisi verme hatası:", error);
      toast.error("Admin yetkisi verilirken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Admin Yetkisi Ver
          </DialogTitle>
          <DialogDescription>
            {user?.email} kullanıcısına admin yetkisi vermek üzeresiniz.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="role">Admin Rolü</Label>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as AdminRole)}
              disabled={isLoading}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Rol seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="moderator">
                  <div className="flex flex-col">
                    <span className="font-medium">Moderator</span>
                    <span className="text-xs text-muted-foreground">
                      Temel yönetim yetkileri
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex flex-col">
                    <span className="font-medium">Admin</span>
                    <span className="text-xs text-muted-foreground">
                      Tam yönetim yetkileri
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="super_admin">
                  <div className="flex flex-col">
                    <span className="font-medium">Super Admin</span>
                    <span className="text-xs text-muted-foreground">
                      Tüm yetkiler (dikkatli kullanın)
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
            <p className="font-medium mb-1">⚠️ Uyarı</p>
            <p>
              Bu kullanıcı admin paneline erişim ve seçilen role uygun yetkilere sahip olacak.
              Bu işlem geri alınabilir.
            </p>
          </div>
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
            onClick={handleGrantAdmin}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Yetki Veriliyor...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Admin Yetkisi Ver
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
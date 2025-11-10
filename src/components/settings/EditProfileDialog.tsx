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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import { User } from "lucide-react";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProfileDialog({ open, onOpenChange }: EditProfileDialogProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || "");

  const handleSave = async () => {
    if (!auth.currentUser) return;

    setIsLoading(true);
    try {
      const trimmedName = displayName.trim();
      
      // Firebase Auth'da güncelle
      await updateProfile(auth.currentUser, {
        displayName: trimmedName,
      });

      // Firestore'da güncelle
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        displayName: trimmedName,
        updatedAt: Timestamp.now(),
      });

      toast.success("Profil bilgileriniz güncellendi");
      onOpenChange(false);
      
      // Sayfayı yenile
      window.location.reload();
    } catch (error) {
      console.error("Profil güncelleme hatası:", error);
      toast.error("Profil güncellenirken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profil Bilgilerini Düzenle
          </DialogTitle>
          <DialogDescription>
            Adınızı ve diğer bilgilerinizi güncelleyin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Görünen Ad</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Adınız"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              value={user?.email || ""}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              E-posta adresi değiştirilemez
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
          <Button onClick={handleSave} disabled={isLoading || !displayName.trim()}>
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Kaydediliyor...
              </>
            ) : (
              "Kaydet"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

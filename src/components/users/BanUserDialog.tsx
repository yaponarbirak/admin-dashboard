"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/components/auth/AuthProvider";
import { banUser, unbanUser } from "@/lib/firebase/users";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface BanUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    uid: string;
    email: string;
    fullName: string;
    isBanned: boolean;
  };
}

export function BanUserDialog({
  open,
  onOpenChange,
  user,
}: BanUserDialogProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const { user: admin } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  const handleBan = async () => {
    if (!admin) {
      toast.error("Admin bilgisi bulunamadı");
      return;
    }

    if (!user.isBanned && !reason.trim()) {
      toast.error("Yasaklama sebebi gerekli");
      return;
    }

    setLoading(true);

    try {
      if (user.isBanned) {
        // Unban user
        await unbanUser(user.uid, admin.uid, admin.email);
        toast.success(`${user.fullName || user.email} yasağı kaldırıldı`);
      } else {
        // Ban user
        await banUser({
          uid: user.uid,
          reason: reason.trim(),
          adminUid: admin.uid,
          adminEmail: admin.email,
        });
        toast.success(`${user.fullName || user.email} yasaklandı`);
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["user", user.uid] });
      queryClient.invalidateQueries({ queryKey: ["users"] });

      onOpenChange(false);
      setReason("");
    } catch (error: any) {
      console.error("Ban/Unban error:", error);
      toast.error(error.message || "İşlem başarısız oldu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {user.isBanned ? "Yasağı Kaldır" : "Kullanıcıyı Yasakla"}
          </DialogTitle>
          <DialogDescription>
            {user.isBanned
              ? `${
                  user.fullName || user.email
                } kullanıcısının yasağını kaldırmak istediğinizden emin misiniz?`
              : `${
                  user.fullName || user.email
                } kullanıcısını yasaklamak istediğinizden emin misiniz?`}
          </DialogDescription>
        </DialogHeader>

        {!user.isBanned && (
          <div className="space-y-2">
            <Label htmlFor="reason">Yasaklama Sebebi *</Label>
            <Textarea
              id="reason"
              placeholder="Kullanıcının neden yasaklandığını açıklayın..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Bu sebep kullanıcıya gösterilmeyecektir, sadece admin kayıtlarında
              tutulacaktır.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            İptal
          </Button>
          <Button
            variant={user.isBanned ? "default" : "destructive"}
            onClick={handleBan}
            disabled={loading || (!user.isBanned && !reason.trim())}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {user.isBanned ? "Yasağı Kaldır" : "Yasakla"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

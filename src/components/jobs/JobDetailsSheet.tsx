"use client";

import { JobDisplay } from "@/hooks/useJobs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Calendar,
  DollarSign,
  User,
  Eye,
  FileText,
  Image as ImageIcon,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import {
  toggleJobVisibility,
  deleteJob,
  getJobApplicationCount,
} from "@/lib/jobs";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface JobDetailsSheetProps {
  job: JobDisplay | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JobDetailsSheet({
  job,
  open,
  onOpenChange,
}: JobDetailsSheetProps) {
  const [creatorData, setCreatorData] = useState<any>(null);
  const [loadingCreator, setLoadingCreator] = useState(false);
  const [applicationCount, setApplicationCount] = useState(0);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (job?.createdBy && open) {
      setLoadingCreator(true);
      getDoc(doc(db, "users", job.createdBy))
        .then((docSnap) => {
          if (docSnap.exists()) {
            setCreatorData(docSnap.data());
          }
        })
        .catch((error) => {
          console.error("Error fetching creator:", error);
        })
        .finally(() => {
          setLoadingCreator(false);
        });
    }
  }, [job?.createdBy, open]);

  useEffect(() => {
    if (job?.id && open) {
      setLoadingApplications(true);
      getJobApplicationCount(job.id)
        .then((count) => {
          setApplicationCount(count);
        })
        .catch((error) => {
          console.error("Error fetching application count:", error);
        })
        .finally(() => {
          setLoadingApplications(false);
        });
    }
  }, [job?.id, open]);

  const handleToggleStatus = async () => {
    if (!job) return;

    setIsTogglingStatus(true);
    try {
      const currentVisibility = job.isVisibleToOthers ?? true;
      await toggleJobVisibility(job.id, currentVisibility);
      toast.success(
        currentVisibility
          ? "İlan gizlendi (başkaları göremez)"
          : "İlan görünür hale getirildi"
      );
      onOpenChange(false);
    } catch (error) {
      toast.error("İlan durumu değiştirilemedi");
      console.error(error);
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!job) return;

    setIsDeleting(true);
    try {
      await deleteJob(job.id);
      toast.success("İlan başarıyla silindi");
      setShowDeleteDialog(false);
      onOpenChange(false);
    } catch (error) {
      toast.error("İlan silinirken bir hata oluştu");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!job) return null;

  const formatCurrency = (amount?: number) => {
    if (!amount) return "-";
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const budgetTypeText = {
    hourly: "Saatlik",
    daily: "Günlük",
    project: "Proje Bazlı",
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl px-6 py-24">
        <SheetHeader>
          <SheetTitle className="text-2xl">{job.title}</SheetTitle>
          <SheetDescription>İlan ID: {job.id}</SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] pr-4 mt-6">
          <div className="space-y-6">
            {/* Status Badges */}
            <div className="flex flex-wrap gap-2">
              {job.isActive ? (
                <Badge variant="default" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Aktif
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <XCircle className="h-3 w-3" />
                  Pasif
                </Badge>
              )}
              <Badge variant="outline">{job.category}</Badge>
              {job.durum && <Badge variant="outline">{job.durum}</Badge>}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4" />
                Açıklama
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {job.description}
              </p>
            </div>

            <Separator />

            {/* Photos */}
            {job.photos && job.photos.length > 0 && (
              <>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <ImageIcon className="h-4 w-4" />
                    Fotoğraflar ({job.photos.length})
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {job.photos.map((photo, index) => (
                      <div
                        key={index}
                        className="relative aspect-video overflow-hidden rounded-lg border"
                      >
                        <img
                          src={photo}
                          alt={`İlan fotoğrafı ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Creator Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4" />
                İlan Sahibi
              </div>
              {loadingCreator ? (
                <p className="text-sm text-muted-foreground">Yükleniyor...</p>
              ) : creatorData ? (
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={creatorData.photoURL} />
                    <AvatarFallback>
                      {creatorData.fullName?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {creatorData.fullName || "İsimsiz"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {creatorData.email}
                    </p>
                    {creatorData.phoneNumber && (
                      <p className="text-xs text-muted-foreground">
                        {creatorData.phoneNumber}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  ID: {job.createdBy}
                </p>
              )}
            </div>

            <Separator />

            {/* Application Count */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4" />
                Başvurular
              </div>
              {loadingApplications ? (
                <p className="text-sm text-muted-foreground">Yükleniyor...</p>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-bold">{applicationCount}</div>
                  <span className="text-sm text-muted-foreground">
                    başvuru alındı
                  </span>
                </div>
              )}
            </div>

            <Separator />

            {/* Dates */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Oluşturulma
                </span>
                <span>
                  {job.olusturulmaTarihi &&
                    format(job.olusturulmaTarihi.toDate(), "PPP p", {
                      locale: tr,
                    })}
                </span>
              </div>
              {job.guncellemeTarihi && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Son Güncelleme
                  </span>
                  <span>
                    {format(job.guncellemeTarihi.toDate(), "PPP p", {
                      locale: tr,
                    })}
                  </span>
                </div>
              )}
              {job.sonKullanmaTarihi && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    Son Geçerlilik
                  </span>
                  <span>
                    {format(job.sonKullanmaTarihi.toDate(), "PPP p", {
                      locale: tr,
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleToggleStatus}
                disabled={isTogglingStatus}
              >
                {isTogglingStatus
                  ? "İşleniyor..."
                  : job.isVisibleToOthers ?? true
                  ? "Gizle"
                  : "Göster"}
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting}
              >
                İlanı Sil
              </Button>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              İlanı silmek istediğinizden emin misiniz?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. İlan ve ilişkili tüm başvurular kalıcı
              olarak silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Siliniyor..." : "Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}

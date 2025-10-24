"use client";

import { ReviewDisplay } from "@/hooks/useReviews";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Star,
  User,
  Calendar,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Trash2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  toggleReviewPublic,
  toggleReviewVerified,
  deleteReview,
  addReviewResponse,
  removeReviewResponse,
} from "@/lib/reviews";
import { db } from "@/lib/firebase/client";
import { doc, getDoc } from "firebase/firestore";

interface ReviewDetailsSheetProps {
  review: ReviewDisplay | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReviewDetailsSheet({
  review,
  open,
  onOpenChange,
}: ReviewDetailsSheetProps) {
  const [reviewerData, setReviewerData] = useState<any>(null);
  const [reviewedData, setReviewedData] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingPublic, setIsTogglingPublic] = useState(false);
  const [isTogglingVerified, setIsTogglingVerified] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [isAddingResponse, setIsAddingResponse] = useState(false);
  const [showResponseForm, setShowResponseForm] = useState(false);

  useEffect(() => {
    if (review) {
      setResponseText(review.responseText || "");
      setShowResponseForm(false);

      // Fetch reviewer data
      const fetchReviewer = async () => {
        const userDoc = await getDoc(doc(db, "users", review.reviewerId));
        if (userDoc.exists()) {
          setReviewerData(userDoc.data());
        }
      };

      // Fetch reviewed user data
      const fetchReviewed = async () => {
        const userDoc = await getDoc(doc(db, "users", review.reviewedId));
        if (userDoc.exists()) {
          setReviewedData(userDoc.data());
        }
      };

      fetchReviewer();
      fetchReviewed();
    }
  }, [review]);

  if (!review) return null;

  const handleTogglePublic = async () => {
    setIsTogglingPublic(true);
    try {
      await toggleReviewPublic(review.id, review.isPublic);
      toast.success(review.isPublic ? "Yorum gizlendi" : "Yorum yayınlandı");
    } catch (error) {
      console.error("Error toggling review public status:", error);
      toast.error("İşlem başarısız oldu");
    } finally {
      setIsTogglingPublic(false);
    }
  };

  const handleToggleVerified = async () => {
    setIsTogglingVerified(true);
    try {
      await toggleReviewVerified(review.id, review.isVerified);
      toast.success(
        review.isVerified ? "Doğrulama kaldırıldı" : "Yorum doğrulandı"
      );
    } catch (error) {
      console.error("Error toggling review verified status:", error);
      toast.error("İşlem başarısız oldu");
    } finally {
      setIsTogglingVerified(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await deleteReview(review.id);
      toast.success("Yorum silindi");
      setDeleteDialogOpen(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Yorum silinemedi");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddResponse = async () => {
    if (!responseText.trim()) {
      toast.error("Lütfen yanıt metnini girin");
      return;
    }

    setIsAddingResponse(true);
    try {
      await addReviewResponse(review.id, responseText.trim());
      toast.success("Yanıt eklendi");
      setShowResponseForm(false);
    } catch (error) {
      console.error("Error adding response:", error);
      toast.error("Yanıt eklenemedi");
    } finally {
      setIsAddingResponse(false);
    }
  };

  const handleRemoveResponse = async () => {
    setIsAddingResponse(true);
    try {
      await removeReviewResponse(review.id);
      toast.success("Yanıt kaldırıldı");
      setResponseText("");
    } catch (error) {
      console.error("Error removing response:", error);
      toast.error("Yanıt kaldırılamadı");
    } finally {
      setIsAddingResponse(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Yorum Detayları</SheetTitle>
            <SheetDescription>
              Yorumun tüm bilgilerini görüntüleyin ve yönetin
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-120px)] pr-4">
            <div className="space-y-6 py-6">
              {/* Status Badges */}
              <div className="flex gap-2 flex-wrap">
                <Badge variant={review.isPublic ? "default" : "secondary"}>
                  {review.isPublic ? "Yayında" : "Beklemede"}
                </Badge>
                <Badge variant={review.isVerified ? "default" : "outline"}>
                  {review.isVerified ? "Doğrulanmış" : "Doğrulanmamış"}
                </Badge>
                <Badge variant="outline">
                  {review.reviewType === "advertiserToProvider"
                    ? "İlan Sahibi → Hizmet Veren"
                    : "Hizmet Veren → İlan Sahibi"}
                </Badge>
              </div>

              {/* Rating Summary */}
              <div className="space-y-2">
                <h3 className="font-semibold">Genel Değerlendirme</h3>
                <div className="flex items-center gap-3">
                  {renderStars(review.rating)}
                  <span className="text-2xl font-bold">
                    {review.rating.toFixed(1)}
                  </span>
                  <span className="text-sm text-muted-foreground">/ 5.0</span>
                </div>
              </div>

              {/* Detailed Ratings */}
              {(review.communicationRating ||
                review.priceRating ||
                review.qualityRating ||
                review.timelinessRating) && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="font-semibold">Detaylı Puanlar</h3>
                    {review.communicationRating && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm">İletişim</span>
                        <div className="flex items-center gap-2">
                          {renderStars(review.communicationRating)}
                          <span className="text-sm font-medium w-8">
                            {review.communicationRating}
                          </span>
                        </div>
                      </div>
                    )}
                    {review.qualityRating && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Kalite</span>
                        <div className="flex items-center gap-2">
                          {renderStars(review.qualityRating)}
                          <span className="text-sm font-medium w-8">
                            {review.qualityRating}
                          </span>
                        </div>
                      </div>
                    )}
                    {review.priceRating && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Fiyat</span>
                        <div className="flex items-center gap-2">
                          {renderStars(review.priceRating)}
                          <span className="text-sm font-medium w-8">
                            {review.priceRating}
                          </span>
                        </div>
                      </div>
                    )}
                    {review.timelinessRating && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Zamanında Teslim</span>
                        <div className="flex items-center gap-2">
                          {renderStars(review.timelinessRating)}
                          <span className="text-sm font-medium w-8">
                            {review.timelinessRating}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Comment */}
              {review.comment && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Yorum
                    </h3>
                    <p className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">
                      {review.comment}
                    </p>
                  </div>
                </>
              )}

              {/* Reviewer Info */}
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Yorumu Yapan
                </h3>
                <div className="text-sm space-y-1">
                  <p>
                    <strong>İsim:</strong> {review.reviewerName}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    ID: {review.reviewerId}
                  </p>
                </div>
              </div>

              {/* Reviewed Info */}
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Yorumu Alan
                </h3>
                <div className="text-sm space-y-1">
                  {review.reviewedBusinessName && (
                    <p>
                      <strong>İşletme:</strong> {review.reviewedBusinessName}
                    </p>
                  )}
                  <p className="text-muted-foreground text-xs">
                    ID: {review.reviewedId}
                  </p>
                </div>
              </div>

              {/* Admin Response */}
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold">Admin Yanıtı</h3>

                {review.hasResponse && !showResponseForm ? (
                  <div className="space-y-3">
                    <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                      <p className="text-sm">{review.responseText}</p>
                      {review.respondedAtDate && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Yanıtlandı:{" "}
                          {review.respondedAtDate.toLocaleDateString("tr-TR")}{" "}
                          {review.respondedAtDate.toLocaleTimeString("tr-TR")}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowResponseForm(true)}
                        disabled={isAddingResponse}
                      >
                        Yanıtı Düzenle
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveResponse}
                        disabled={isAddingResponse}
                      >
                        {isAddingResponse ? "Kaldırılıyor..." : "Yanıtı Kaldır"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Admin yanıtınızı buraya yazın..."
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleAddResponse}
                        disabled={isAddingResponse || !responseText.trim()}
                      >
                        {isAddingResponse ? "Ekleniyor..." : "Yanıt Ekle"}
                      </Button>
                      {showResponseForm && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowResponseForm(false);
                            setResponseText(review.responseText || "");
                          }}
                          disabled={isAddingResponse}
                        >
                          İptal
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Dates */}
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Tarihler
                </h3>
                <div className="text-sm space-y-1 text-muted-foreground">
                  <p>
                    Oluşturulma:{" "}
                    {review.createdAtDate.toLocaleDateString("tr-TR")}{" "}
                    {review.createdAtDate.toLocaleTimeString("tr-TR")}
                  </p>
                  <p>
                    Güncellenme:{" "}
                    {review.updatedAtDate.toLocaleDateString("tr-TR")}{" "}
                    {review.updatedAtDate.toLocaleTimeString("tr-TR")}
                  </p>
                </div>
              </div>

              {/* IDs */}
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold">Teknik Bilgiler</h3>
                <div className="text-xs space-y-1 text-muted-foreground font-mono">
                  <p>Yorum ID: {review.id}</p>
                  <p>İlan ID: {review.ilanId}</p>
                  <p>Sözleşme ID: {review.contractId}</p>
                </div>
              </div>

              {/* Actions */}
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold">İşlemler</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={review.isPublic ? "outline" : "default"}
                    onClick={handleTogglePublic}
                    disabled={isTogglingPublic}
                    className="flex-1"
                  >
                    {isTogglingPublic ? (
                      "İşleniyor..."
                    ) : review.isPublic ? (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Gizle
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Yayınla
                      </>
                    )}
                  </Button>
                  <Button
                    variant={review.isVerified ? "outline" : "default"}
                    onClick={handleToggleVerified}
                    disabled={isTogglingVerified}
                    className="flex-1"
                  >
                    {isTogglingVerified ? (
                      "İşleniyor..."
                    ) : review.isVerified ? (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Doğrulamayı Kaldır
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Doğrula
                      </>
                    )}
                  </Button>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Yorumu Sil
                </Button>
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Yorumu silmek istediğinizden emin misiniz?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. Yorum kalıcı olarak silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Siliniyor..." : "Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

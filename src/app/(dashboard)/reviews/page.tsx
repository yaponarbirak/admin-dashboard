"use client";

import { useState } from "react";
import { useReviews } from "@/hooks/useReviews";
import { ReviewDetailsSheet } from "@/components/reviews/ReviewDetailsSheet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  MoreHorizontal,
  MessageSquare,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { ReviewDisplay } from "@/hooks/useReviews";
import {
  toggleReviewPublic,
  toggleReviewVerified,
  deleteReview,
} from "@/lib/reviews";
import { toast } from "sonner";

export default function ReviewsPage() {
  const [statusFilter, setStatusFilter] = useState<
    "all" | "public" | "pending" | "withComment"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReview, setSelectedReview] = useState<ReviewDisplay | null>(
    null
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<ReviewDisplay | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingReviewId, setTogglingReviewId] = useState<string | null>(null);
  const [togglingVerifiedId, setTogglingVerifiedId] = useState<string | null>(
    null
  );

  const {
    reviews,
    isLoading,
    error,
    totalCount,
    publicCount,
    pendingCount,
    withCommentCount,
  } = useReviews(statusFilter);

  // Filter reviews by search query
  const filteredReviews = reviews.filter((review) => {
    const query = searchQuery.toLowerCase();
    return (
      review.reviewerName.toLowerCase().includes(query) ||
      review.reviewedBusinessName?.toLowerCase().includes(query) ||
      review.comment?.toLowerCase().includes(query) ||
      review.id.toLowerCase().includes(query)
    );
  });

  const handleViewDetails = (review: ReviewDisplay) => {
    setSelectedReview(review);
    setSheetOpen(true);
  };

  const handleTogglePublic = async (review: ReviewDisplay) => {
    setTogglingReviewId(review.id);
    try {
      await toggleReviewPublic(review.id, review.isPublic);
      toast.success(review.isPublic ? "Yorum gizlendi" : "Yorum yayınlandı");
    } catch (error) {
      console.error("Error toggling review public status:", error);
      toast.error("İşlem başarısız oldu");
    } finally {
      setTogglingReviewId(null);
    }
  };

  const handleToggleVerified = async (review: ReviewDisplay) => {
    setTogglingVerifiedId(review.id);
    try {
      await toggleReviewVerified(review.id, review.isVerified);
      toast.success(
        review.isVerified ? "Doğrulama kaldırıldı" : "Yorum doğrulandı"
      );
    } catch (error) {
      console.error("Error toggling review verified status:", error);
      toast.error("İşlem başarısız oldu");
    } finally {
      setTogglingVerifiedId(null);
    }
  };

  const handleDeleteClick = (review: ReviewDisplay) => {
    setReviewToDelete(review);
  };

  const handleDeleteConfirm = async () => {
    if (!reviewToDelete) return;

    setIsDeleting(true);
    try {
      await deleteReview(reviewToDelete.id);
      toast.success("Yorum silindi");
      setReviewToDelete(null);
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Yorum silinemedi");
    } finally {
      setIsDeleting(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Yorum Moderasyonu</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Kullanıcı yorumlarını yönetin, moderasyon yapın ve yanıtlayın
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Yorum</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yayında</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publicCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beklemede</CardTitle>
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Yorum Metni Olan
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{withCommentCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Yorumlar</CardTitle>
          <CardDescription>
            Tüm kullanıcı yorumlarını görüntüleyin ve yönetin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Select
              value={statusFilter}
              onValueChange={(value: any) => setStatusFilter(value)}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Durum seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="public">Yayında</SelectItem>
                <SelectItem value="pending">Beklemede</SelectItem>
                <SelectItem value="withComment">Yorum Metni Olan</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Yorum, kullanıcı veya işletme adı ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm mb-4">Hata: {error}</div>
          )}

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Yorumlar yükleniyor...
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery
                ? "Arama kriterlerine uygun yorum bulunamadı."
                : "Henüz yorum bulunmuyor."}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Yorumcu</TableHead>
                    <TableHead>Yorumu Alan</TableHead>
                    <TableHead>Puan</TableHead>
                    <TableHead>Yorum</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell>
                        <div className="font-medium">{review.reviewerName}</div>
                        <div className="text-xs text-muted-foreground">
                          {review.reviewType === "advertiserToProvider"
                            ? "İlan Sahibi"
                            : "Hizmet Veren"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {review.reviewedBusinessName || "İsimsiz"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                          <span className="text-sm font-medium">
                            {review.rating.toFixed(1)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {review.comment ? (
                          <div className="max-w-xs truncate text-sm text-muted-foreground">
                            {review.comment}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">
                            Yorum yok
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant={review.isPublic ? "default" : "secondary"}
                            className="w-fit"
                          >
                            {review.isPublic ? "Yayında" : "Beklemede"}
                          </Badge>
                          {review.isVerified && (
                            <Badge variant="outline" className="w-fit">
                              Doğrulanmış
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {review.createdAtDate.toLocaleDateString("tr-TR")}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Menüyü aç</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleViewDetails(review)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Detayları Gör
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleTogglePublic(review)}
                              disabled={togglingReviewId === review.id}
                            >
                              {togglingReviewId === review.id ? (
                                "İşleniyor..."
                              ) : review.isPublic ? (
                                <>
                                  <EyeOff className="mr-2 h-4 w-4" />
                                  Gizle
                                </>
                              ) : (
                                <>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Yayınla
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleVerified(review)}
                              disabled={togglingVerifiedId === review.id}
                            >
                              {togglingVerifiedId === review.id ? (
                                "İşleniyor..."
                              ) : review.isVerified ? (
                                <>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Doğrulamayı Kaldır
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Doğrula
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(review)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Sil
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Details Sheet */}
      <ReviewDetailsSheet
        review={selectedReview}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!reviewToDelete}
        onOpenChange={(open) => !open && setReviewToDelete(null)}
      >
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
    </div>
  );
}

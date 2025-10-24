"use client";

import { useState } from "react";
import { useJobs, JobDisplay } from "@/hooks/useJobs";
import { JobDetailsSheet } from "@/components/jobs/JobDetailsSheet";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import {
  MoreHorizontal,
  Search,
  Eye,
  ToggleLeft,
  Trash2,
  AlertCircle,
  Briefcase,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
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
import { toggleJobVisibility, deleteJob } from "@/lib/jobs";
import { toast } from "sonner";

export default function JobsPage() {
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<JobDisplay | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<JobDisplay | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingJobId, setTogglingJobId] = useState<string | null>(null);

  const { jobs, isLoading, error, totalCount } = useJobs({
    status: statusFilter,
  });

  // Filter jobs by search query
  const filteredJobs = jobs.filter((job) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      job.title.toLowerCase().includes(searchLower) ||
      job.description.toLowerCase().includes(searchLower) ||
      job.category.toLowerCase().includes(searchLower)
    );
  });

  const formatCurrency = (amount?: number) => {
    if (!amount) return "-";
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (job: any) => {
    if (!job.isActive) {
      return <Badge variant="secondary">Pasif</Badge>;
    }
    if (job.isUrgent) {
      return <Badge variant="destructive">Acil</Badge>;
    }
    return <Badge variant="default">Aktif</Badge>;
  };

  const handleViewDetails = (job: JobDisplay) => {
    setSelectedJob(job);
    setSheetOpen(true);
  };

  const handleToggleVisibility = async (job: JobDisplay) => {
    setTogglingJobId(job.id);
    try {
      const currentVisibility = job.isVisibleToOthers ?? true;
      await toggleJobVisibility(job.id, currentVisibility);
      toast.success(
        currentVisibility
          ? "İlan gizlendi (başkaları göremez)"
          : "İlan görünür hale getirildi"
      );
    } catch (error) {
      toast.error("İlan durumu değiştirilemedi");
      console.error(error);
    } finally {
      setTogglingJobId(null);
    }
  };

  const handleDeleteClick = (job: JobDisplay) => {
    setJobToDelete(job);
  };

  const handleDeleteConfirm = async () => {
    if (!jobToDelete) return;

    setIsDeleting(true);
    try {
      await deleteJob(jobToDelete.id);
      toast.success("İlan başarıyla silindi");
      setJobToDelete(null);
    } catch (error) {
      toast.error("İlan silinirken bir hata oluştu");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">İş İlanları</h1>
          <p className="text-muted-foreground">
            Platformdaki tüm iş ilanlarını yönetin
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Briefcase className="h-8 w-8 text-muted-foreground" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam İlan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif İlanlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {jobs.filter((j) => j.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pasif İlanlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {jobs.filter((j) => !j.isActive).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtreler</CardTitle>
          <CardDescription>İlanları filtreleyin ve arayın</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="İlan başlığı, açıklama veya şehir ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value: any) => setStatusFilter(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Pasif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle>İlanlar ({filteredJobs.length})</CardTitle>
          <CardDescription>Tüm iş ilanlarının listesi</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>Hata: {error.message}</p>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Başlık</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Kullanıcı</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground"
                    >
                      İlan bulunamadı
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium max-w-[300px]">
                        <div className="truncate">{job.title}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{job.category}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {job.userId.substring(0, 8)}...
                      </TableCell>
                      <TableCell>{getStatusBadge(job)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {job.createdAt &&
                          formatDistanceToNow(job.createdAt.toDate(), {
                            addSuffix: true,
                            locale: tr,
                          })}
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
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleViewDetails(job)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Detayları Gör
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleVisibility(job)}
                              disabled={togglingJobId === job.id}
                            >
                              <ToggleLeft className="mr-2 h-4 w-4" />
                              {togglingJobId === job.id
                                ? "İşleniyor..."
                                : job.isVisibleToOthers ?? true
                                ? "Gizle"
                                : "Göster"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteClick(job)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Sil
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Job Details Sheet */}
      <JobDetailsSheet
        job={selectedJob}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!jobToDelete}
        onOpenChange={(open) => !open && setJobToDelete(null)}
      >
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

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  useScheduledNotifications,
  useCancelScheduledNotification,
  useDeleteScheduledNotification,
} from "@/hooks/useScheduledNotifications";
import { Calendar, Clock, Users, X, Trash2, CalendarX } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const statusConfig: Record<
  string,
  { label: string; variant: "outline" | "secondary" }
> = {
  draft: { label: "Taslak", variant: "outline" as const },
  scheduled: { label: "Zamanlandı", variant: "secondary" as const },
};

const toDate = (timestamp: any): Date => {
  if (!timestamp) return new Date();
  if (timestamp.toDate) return timestamp.toDate();
  if (timestamp.seconds) return new Date(timestamp.seconds * 1000);
  return new Date(timestamp);
};

export default function ScheduledNotificationsPage() {
  const { data: notifications, isLoading, error } = useScheduledNotifications();
  const cancelNotification = useCancelScheduledNotification();
  const deleteNotification = useDeleteScheduledNotification();

  // Debug logging
  console.log("📋 Scheduled notifications:", {
    isLoading,
    error,
    count: notifications?.length,
    notifications,
  });

  const handleCancel = async (campaignId: string, title: string) => {
    if (
      !confirm(
        `"${title}" bildirimini iptal etmek istediğinizden emin misiniz?`
      )
    ) {
      return;
    }

    try {
      await cancelNotification.mutateAsync(campaignId);
      toast.success("Bildirim iptal edildi");
    } catch (error) {
      console.error("Error canceling notification:", error);
      toast.error("Bildirim iptal edilemedi");
    }
  };

  const handleDelete = async (campaignId: string, title: string) => {
    if (
      !confirm(`"${title}" bildirimini silmek istediğinizden emin misiniz?`)
    ) {
      return;
    }

    try {
      await deleteNotification.mutateAsync(campaignId);
      toast.success("Bildirim silindi");
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Bildirim silinemedi");
    }
  };

  const now = new Date();
  const upcomingCount =
    notifications?.filter((n) => n.scheduledFor && toDate(n.scheduledFor) > now)
      .length || 0;
  const draftCount =
    notifications?.filter((n) => n.status === "draft").length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Zamanlanmış Bildirimler</h1>
        <p className="text-muted-foreground">
          İleri bir tarihte gönderilecek bildirimleri görüntüleyin
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Gelecek Gönderimler
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingCount}</div>
            <p className="text-xs text-muted-foreground">
              Gönderim bekleyen bildirim
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taslaklar</CardTitle>
            <CalendarX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftCount}</div>
            <p className="text-xs text-muted-foreground">
              Zamanlanmamış taslak
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Scheduled Notifications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Zamanlanmış Bildirimler</CardTitle>
          <CardDescription>
            Gelecekte gönderilecek tüm bildirimler
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : notifications && notifications.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Başlık</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Hedef</TableHead>
                    <TableHead>Zamanlanma</TableHead>
                    <TableHead>Oluşturan</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map((notification) => {
                    const scheduledDate = notification.scheduledFor
                      ? toDate(notification.scheduledFor)
                      : null;
                    const isPast = scheduledDate && scheduledDate < now;

                    return (
                      <TableRow key={notification.campaignId}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {notification.title}
                            </div>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {notification.body}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={statusConfig[notification.status].variant}
                          >
                            {statusConfig[notification.status].label}
                          </Badge>
                          {isPast && (
                            <Badge variant="destructive" className="ml-2">
                              Süresi Geçti
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{notification.sentCount || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {scheduledDate ? (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <div className="text-sm">
                                <div>
                                  {format(scheduledDate, "d MMMM yyyy", {
                                    locale: tr,
                                  })}
                                </div>
                                <div className="text-muted-foreground">
                                  {format(scheduledDate, "HH:mm", {
                                    locale: tr,
                                  })}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Belirlenmedi
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="text-muted-foreground">
                              {notification.createdBy}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {notification.status === "scheduled" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleCancel(
                                    notification.campaignId,
                                    notification.title
                                  )
                                }
                                disabled={cancelNotification.isPending}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleDelete(
                                  notification.campaignId,
                                  notification.title
                                )
                              }
                              disabled={deleteNotification.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
              <Clock className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">
                Zamanlanmış bildirim yok
              </h3>
              <p className="text-sm text-muted-foreground">
                Bildirim gönder sayfasından zamanlanmış bildirim
                oluşturabilirsiniz
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { Badge } from "@/components/ui/badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useNotificationHistory } from "@/hooks/useNotificationHistory";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Users, CheckCircle2, XCircle, Clock } from "lucide-react";
import type { NotificationStatus } from "@/types";

const statusConfig: Record<
  NotificationStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  draft: { label: "Taslak", variant: "outline" },
  scheduled: { label: "Zamanlandı", variant: "secondary" },
  sending: { label: "Gönderiliyor", variant: "default" },
  completed: { label: "Tamamlandı", variant: "default" },
  failed: { label: "Başarısız", variant: "destructive" },
};

export default function NotificationHistoryPage() {
  const { data: campaigns, isLoading } = useNotificationHistory();

  const toDate = (timestamp: any): Date => {
    if (!timestamp) return new Date();
    if (timestamp instanceof Date) return timestamp;
    if (typeof timestamp === "object" && "toDate" in timestamp) {
      return timestamp.toDate();
    }
    return new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Bildirim Geçmişi</h1>
        <p className="text-muted-foreground">
          Gönderilen tüm bildirim kampanyaları
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Toplam Kampanya
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Toplam Gönderim
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns
                ?.reduce((sum, c) => sum + c.totalSent, 0)
                .toLocaleString("tr-TR") || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Başarılı</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns
                ?.reduce((sum, c) => sum + c.totalDelivered, 0)
                .toLocaleString("tr-TR") || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Başarısız</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns
                ?.reduce((sum, c) => sum + c.totalFailed, 0)
                .toLocaleString("tr-TR") || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Kampanya Listesi</CardTitle>
          <CardDescription>Son gönderilen bildirimler</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : campaigns && campaigns.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Başlık</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Hedef Kitle</TableHead>
                  <TableHead>Gönderim</TableHead>
                  <TableHead>Başarı Oranı</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Gönderen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => {
                  const successRate =
                    campaign.totalSent > 0
                      ? Math.round(
                          (campaign.totalDelivered / campaign.totalSent) * 100
                        )
                      : 0;

                  return (
                    <TableRow key={campaign.campaignId}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">{campaign.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {campaign.body}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig[campaign.status].variant}>
                          {statusConfig[campaign.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>
                            {campaign.totalTargeted.toLocaleString("tr-TR")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle2 className="h-3 w-3" />
                            {campaign.totalDelivered.toLocaleString("tr-TR")}
                          </div>
                          {campaign.totalFailed > 0 && (
                            <div className="flex items-center gap-1 text-red-600">
                              <XCircle className="h-3 w-3" />
                              {campaign.totalFailed.toLocaleString("tr-TR")}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-20 rounded-full bg-secondary">
                            <div
                              className="h-full rounded-full bg-green-600"
                              style={{ width: `${successRate}%` }}
                            />
                          </div>
                          <span className="text-sm">{successRate}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(
                            toDate(campaign.createdAt),
                            "d MMM yyyy, HH:mm",
                            { locale: tr }
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {campaign.createdByEmail}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <Clock className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">Henüz bildirim yok</h3>
              <p className="text-sm text-muted-foreground">
                İlk bildirimi göndererek başlayın
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

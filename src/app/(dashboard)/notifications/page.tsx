"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bell, Send, Clock, FileText, History } from "lucide-react";
import Link from "next/link";

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bildirim Yönetimi</h1>
          <p className="text-muted-foreground">
            Kullanıcılara bildirim gönderin ve kampanyaları yönetin
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/notifications/send">
          <Card className="cursor-pointer transition-all hover:border-primary hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Bildirim Gönder
              </CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Yeni bildirim kampanyası oluştur
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/notifications/templates">
          <Card className="cursor-pointer transition-all hover:border-primary hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Template'ler
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Hazır bildirim şablonları
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/notifications/scheduled">
          <Card className="cursor-pointer transition-all hover:border-primary hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Zamanlanmış</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Planlanmış kampanyalar
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/notifications/history">
          <Card className="cursor-pointer transition-all hover:border-primary hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Geçmiş</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Gönderilen bildirimler
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Bu Ay Gönderilen
            </CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground">Yakında</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ortalama Açılma Oranı
            </CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground">Yakında</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Aktif Kampanyalar
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground">Yakında</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle>Son Kampanyalar</CardTitle>
          <CardDescription>
            En son gönderilen bildirim kampanyaları
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Bell className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium">Henüz bildirim gönderilmedi</p>
            <p className="mb-4 text-sm text-muted-foreground">
              İlk bildirim kampanyanızı oluşturmak için yukarıdaki butona
              tıklayın
            </p>
            <Link href="/notifications/send">
              <Button>
                <Send className="mr-2 h-4 w-4" />
                Bildirim Gönder
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

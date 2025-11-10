"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  Star, 
  Calendar,
  Activity,
  Target,
  Award
} from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import { useJobs } from "@/hooks/useJobs";
import { useReviews } from "@/hooks/useReviews";

export default function AnalyticsPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();

  // Calculate growth percentages
  const userGrowthRate = stats?.users.total 
    ? ((stats.users.newThisMonth / stats.users.total) * 100).toFixed(1) 
    : "0";
  
  const jobGrowthRate = stats?.jobs.total
    ? ((stats.jobs.newThisMonth / stats.jobs.total) * 100).toFixed(1)
    : "0";

  const activeRate = stats?.users.total
    ? ((stats.users.active / stats.users.total) * 100).toFixed(1)
    : "0";

  const completionRate = stats?.jobs.total
    ? ((stats.jobs.completed / stats.jobs.total) * 100).toFixed(1)
    : "0";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analitik</h1>
        <p className="text-muted-foreground">
          Platform istatistiklerini ve raporları görüntüleyin
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Kullanıcı Büyüme</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">+{userGrowthRate}%</div>
                <p className="text-xs text-muted-foreground">Bu ay</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">İlan Büyüme</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">+{jobGrowthRate}%</div>
                <p className="text-xs text-muted-foreground">Bu ay</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Aktiflik Oranı</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold text-blue-600">{activeRate}%</div>
                <p className="text-xs text-muted-foreground">Aktif kullanıcı</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tamamlanma Oranı</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold text-purple-600">{completionRate}%</div>
                <p className="text-xs text-muted-foreground">Tamamlanan ilanlar</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* User Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Kullanıcı Analitiği
            </CardTitle>
            <CardDescription>Detaylı kullanıcı istatistikleri</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {statsLoading ? (
              <>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Toplam Kullanıcı</span>
                    <span className="font-semibold">{stats?.users.total || 0}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600" 
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Aktif Kullanıcı</span>
                    <span className="font-semibold text-green-600">
                      {stats?.users.active || 0} ({activeRate}%)
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-600" 
                      style={{ width: `${activeRate}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Yasaklı Kullanıcı</span>
                    <span className="font-semibold text-red-600">
                      {stats?.users.banned || 0}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-600" 
                      style={{ 
                        width: stats?.users.total 
                          ? `${(stats.users.banned / stats.users.total * 100).toFixed(0)}%` 
                          : '0%' 
                      }}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Bu Ay Yeni Kayıt</span>
                    <span className="text-sm font-semibold text-green-600">
                      +{stats?.users.newThisMonth || 0}
                    </span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Job Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              İlan Analitiği
            </CardTitle>
            <CardDescription>Detaylı ilan istatistikleri</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {statsLoading ? (
              <>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Toplam İlan</span>
                    <span className="font-semibold">{stats?.jobs.total || 0}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600" 
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Aktif İlan</span>
                    <span className="font-semibold text-green-600">
                      {stats?.jobs.active || 0}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-600" 
                      style={{ 
                        width: stats?.jobs.total 
                          ? `${(stats.jobs.active / stats.jobs.total * 100).toFixed(0)}%` 
                          : '0%' 
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tamamlanan</span>
                    <span className="font-semibold text-purple-600">
                      {stats?.jobs.completed || 0} ({completionRate}%)
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-600" 
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Bu Ay Yeni İlan</span>
                    <span className="text-sm font-semibold text-green-600">
                      +{stats?.jobs.newThisMonth || 0}
                    </span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Review Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Değerlendirme Analitiği
          </CardTitle>
          <CardDescription>Platform memnuniyet istatistikleri</CardDescription>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <div className="grid gap-6 md:grid-cols-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold text-yellow-600">
                  {stats?.reviews.averageRating || "0.0"} ⭐
                </div>
                <p className="text-sm text-muted-foreground mt-1">Ortalama Puan</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold">
                  {stats?.reviews.total || 0}
                </div>
                <p className="text-sm text-muted-foreground mt-1">Toplam Değerlendirme</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  +{stats?.reviews.newThisMonth || 0}
                </div>
                <p className="text-sm text-muted-foreground mt-1">Bu Ay</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

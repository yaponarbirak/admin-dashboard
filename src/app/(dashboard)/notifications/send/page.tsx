"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Send, Eye, Users, Loader2 } from "lucide-react";
import type { NotificationFormData, NotificationTargetType } from "@/types";
import { useTargetedUsersCount } from "@/hooks/useTargetedUsersCount";
import { useNotificationTemplates } from "@/hooks/useNotificationTemplates";
import {
  sendNotificationNow,
  scheduleNotification,
} from "@/lib/firebase/notifications";
import { toast } from "sonner";

export default function SendNotificationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: templates } = useNotificationTemplates();
  const [scheduleType, setScheduleType] = useState<"now" | "scheduled">("now");
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [formData, setFormData] = useState<NotificationFormData>({
    title: "",
    body: "",
    imageUrl: "",
    actionUrl: "",
    targetType: "all",
    filters: {},
    specificUserIds: [],
  });

  const { data: targetCount } = useTargetedUsersCount({
    targetType: formData.targetType,
    filters: formData.filters,
  });

  const handleTemplateSelect = (templateId: string) => {
    // If "none" is selected, clear the template selection
    if (templateId === "none") {
      setSelectedTemplate("");
      return;
    }

    setSelectedTemplate(templateId);
    if (templateId && templates) {
      const template = templates.find((t) => t.templateId === templateId);
      if (template) {
        setFormData({
          ...formData,
          title: template.title,
          body: template.body,
          imageUrl: template.imageUrl || "",
          actionUrl: template.actionUrl || "",
          templateId: template.templateId,
        });
      }
    }
  };

  const handleTargetTypeChange = (value: NotificationTargetType) => {
    setFormData({ ...formData, targetType: value });
  };

  const handleFilterChange = (key: string, value: any) => {
    setFormData({
      ...formData,
      filters: {
        ...formData.filters,
        [key]: value === "all" ? undefined : value,
      },
    });
  };

  const handleSend = async () => {
    // Validasyon
    if (!formData.title.trim()) {
      toast.error("Başlık gerekli");
      setActiveTab("content");
      return;
    }

    if (!formData.body.trim()) {
      toast.error("Mesaj gerekli");
      setActiveTab("content");
      return;
    }

    if (!targetCount || targetCount === 0) {
      toast.error("Hedef kitle seçilmedi");
      setActiveTab("audience");
      return;
    }

    if (!user) {
      toast.error("Kullanıcı bilgisi bulunamadı");
      return;
    }

    try {
      setIsSending(true);

      // Form data'yı temizle - boş string'leri undefined yap
      const cleanedFormData: NotificationFormData = {
        title: formData.title.trim(),
        body: formData.body.trim(),
        targetType: formData.targetType,
        filters: formData.filters,
      };

      // Opsiyonel alanları sadece değer varsa ekle
      if (formData.imageUrl?.trim()) {
        cleanedFormData.imageUrl = formData.imageUrl.trim();
      }

      if (formData.actionUrl?.trim()) {
        cleanedFormData.actionUrl = formData.actionUrl.trim();
      }

      if (formData.specificUserIds && formData.specificUserIds.length > 0) {
        cleanedFormData.specificUserIds = formData.specificUserIds;
      }

      if (formData.scheduledFor) {
        cleanedFormData.scheduledFor = formData.scheduledFor;
      }

      if (formData.templateId?.trim()) {
        cleanedFormData.templateId = formData.templateId.trim();
      }

      if (scheduleType === "now") {
        // Hemen gönder
        const result = await sendNotificationNow(
          cleanedFormData,
          user.uid,
          user.email
        );

        toast.success(
          `Bildirim başarıyla gönderildi! (${result.targetedCount} kullanıcı)`
        );

        router.push("/notifications");
      } else {
        // Zamanla
        const campaignId = await scheduleNotification(
          cleanedFormData,
          user.uid,
          user.email
        );

        toast.success("Bildirim zamanlandı!");
        router.push(`/notifications/scheduled`);
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("Bildirim gönderilemedi");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Bildirim Gönder</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Yeni bildirim kampanyası oluşturun
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-auto sm:ml-0">
          <Button variant="outline" disabled={isSending} className="flex-1 sm:flex-none">
            <Eye className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Önizleme</span>
          </Button>
          <Button onClick={handleSend} disabled={isSending} className="flex-1 sm:flex-none">
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                {scheduleType === "now" ? "Gönder" : "Zamanla"}
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content" className="text-xs sm:text-sm">İçerik</TabsTrigger>
              <TabsTrigger value="audience" className="text-xs sm:text-sm">Hedef Kitle</TabsTrigger>
              <TabsTrigger value="schedule" className="text-xs sm:text-sm">Zamanlama</TabsTrigger>
            </TabsList>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Bildirim İçeriği</CardTitle>
                  <CardDescription>
                    Kullanıcılara gösterilecek başlık ve mesajı girin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Template Selection */}
                  {templates && templates.length > 0 && (
                    <div className="space-y-2">
                      <Label>Şablon Seç (Opsiyonel)</Label>
                      <Select
                        value={selectedTemplate || undefined}
                        onValueChange={handleTemplateSelect}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Şablon seçin veya manuel girin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Şablon Kullanma</SelectItem>
                          {templates.map((template) => (
                            <SelectItem
                              key={template.templateId}
                              value={template.templateId}
                            >
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="title">Başlık *</Label>
                    <Input
                      id="title"
                      placeholder="Örn: Yeni iş fırsatları!"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      maxLength={50}
                    />
                    <p className="text-xs text-muted-foreground">
                      {formData.title.length}/50 karakter
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="body">Mesaj *</Label>
                    <Textarea
                      id="body"
                      placeholder="Örn: Merhaba {{fullName}}, yeni iş fırsatları var!"
                      value={formData.body}
                      onChange={(e) =>
                        setFormData({ ...formData, body: e.target.value })
                      }
                      rows={4}
                      maxLength={200}
                    />
                    <p className="text-xs text-muted-foreground">
                      {formData.body.length}/200 karakter
                      <span className="block mt-1">
                        💡 {`{{fullName}}, {{city}}, {{rating}}`} gibi
                        değişkenler kullanabilirsiniz
                      </span>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Görsel URL (Opsiyonel)</Label>
                    <Input
                      id="imageUrl"
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={formData.imageUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, imageUrl: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="actionUrl">Aksiyon URL (Opsiyonel)</Label>
                    <Input
                      id="actionUrl"
                      type="url"
                      placeholder="Tıklandığında açılacak sayfa"
                      value={formData.actionUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, actionUrl: e.target.value })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Audience Tab */}
            <TabsContent value="audience" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Hedef Kitle Seçimi</CardTitle>
                  <CardDescription>
                    Bildirimi kimlere göndermek istiyorsunuz?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup
                    value={formData.targetType}
                    onValueChange={handleTargetTypeChange}
                  >
                    <div className="flex items-start space-x-3 rounded-lg border p-4">
                      <RadioGroupItem value="all" id="all" className="mt-1" />
                      <div className="flex-1">
                        <Label
                          htmlFor="all"
                          className="cursor-pointer font-medium"
                        >
                          Tüm Kullanıcılar
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Sistemdeki tüm kullanıcılara gönder
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 rounded-lg border p-4">
                      <RadioGroupItem
                        value="filtered"
                        id="filtered"
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor="filtered"
                          className="cursor-pointer font-medium"
                        >
                          Filtrelenmiş Kullanıcılar
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Belirli kriterlere uyan kullanıcılara gönder
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 rounded-lg border p-4">
                      <RadioGroupItem
                        value="specific"
                        id="specific"
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor="specific"
                          className="cursor-pointer font-medium"
                        >
                          Belirli Kullanıcılar
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Manuel olarak seçilen kullanıcılara gönder
                        </p>
                      </div>
                    </div>
                  </RadioGroup>

                  {/* Filters */}
                  {formData.targetType === "filtered" && (
                    <div className="space-y-4 rounded-lg border p-4">
                      <h4 className="font-medium">Filtreler</h4>

                      <div className="space-y-2">
                        <Label>Profil Tipi</Label>
                        <Select
                          value={formData.filters?.profileType || "all"}
                          onValueChange={(value) =>
                            handleFilterChange("profileType", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Profil tipi seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tümü</SelectItem>
                            <SelectItem value="customer">Müşteri</SelectItem>
                            <SelectItem value="serviceProvider">
                              Hizmet Sağlayıcı
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Durum</Label>
                        <Select
                          value={
                            formData.filters?.isActive === undefined
                              ? "all"
                              : formData.filters.isActive
                              ? "active"
                              : "inactive"
                          }
                          onValueChange={(value) =>
                            handleFilterChange(
                              "isActive",
                              value === "all" ? undefined : value === "active"
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Durum seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tümü</SelectItem>
                            <SelectItem value="active">Aktif</SelectItem>
                            <SelectItem value="inactive">Pasif</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Schedule Tab */}
            <TabsContent value="schedule" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Gönderim Zamanlaması</CardTitle>
                  <CardDescription>
                    Bildirimi ne zaman göndermek istiyorsunuz?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup
                    value={scheduleType}
                    onValueChange={(value: "now" | "scheduled") =>
                      setScheduleType(value)
                    }
                  >
                    <div className="flex items-start space-x-3 rounded-lg border p-4">
                      <RadioGroupItem value="now" id="now" className="mt-1" />
                      <div className="flex-1">
                        <Label
                          htmlFor="now"
                          className="cursor-pointer font-medium"
                        >
                          Hemen Gönder
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Bildirimi şimdi gönder
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 rounded-lg border p-4">
                      <RadioGroupItem
                        value="scheduled"
                        id="scheduled"
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor="scheduled"
                          className="cursor-pointer font-medium"
                        >
                          Zamanla
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Belirli bir tarih ve saatte gönder
                        </p>
                      </div>
                    </div>
                  </RadioGroup>

                  {scheduleType === "scheduled" && (
                    <div className="space-y-2 rounded-lg border p-4">
                      <Label htmlFor="scheduledDate">Tarih ve Saat</Label>
                      <Input
                        id="scheduledDate"
                        type="datetime-local"
                        min={new Date().toISOString().slice(0, 16)}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            scheduledFor: new Date(e.target.value),
                          })
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Bildirim bu tarih ve saatte otomatik olarak gönderilecek
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview & Stats */}
        <div className="space-y-6">
          {/* Preview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Önizleme
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border bg-muted p-4">
                <div className="mb-2 flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    YOB
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">
                      {formData.title || "Bildirim Başlığı"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formData.body || "Bildirim mesajı burada görünecek..."}
                    </p>
                    {formData.imageUrl && (
                      <div className="mt-2 h-32 w-full rounded bg-muted-foreground/20" />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Hedef Kitle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ulaşılacak:</span>
                  <span className="font-semibold">
                    {targetCount?.toLocaleString("tr-TR") || 0} kullanıcı
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tip:</span>
                  <span className="font-medium">
                    {formData.targetType === "all"
                      ? "Tüm Kullanıcılar"
                      : formData.targetType === "filtered"
                      ? "Filtrelenmiş"
                      : "Belirli Kullanıcılar"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

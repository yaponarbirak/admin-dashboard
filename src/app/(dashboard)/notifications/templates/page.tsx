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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useNotificationTemplates,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
} from "@/hooks/useNotificationTemplates";
import { Plus, Edit, Trash2, FileText, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import type { NotificationCategory } from "@/types";

const categoryConfig: Record<
  NotificationCategory,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  marketing: { label: "Pazarlama", variant: "default" },
  transactional: { label: "İşlemsel", variant: "secondary" },
  system: { label: "Sistem", variant: "outline" },
};

export default function NotificationTemplatesPage() {
  const { data: templates, isLoading } = useNotificationTemplates();
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "marketing" as NotificationCategory,
    title: "",
    body: "",
    imageUrl: "",
    actionUrl: "",
    variables: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "marketing",
      title: "",
      body: "",
      imageUrl: "",
      actionUrl: "",
      variables: "",
    });
    setEditingTemplate(null);
  };

  const handleSubmit = async () => {
    if (
      !formData.name.trim() ||
      !formData.title.trim() ||
      !formData.body.trim()
    ) {
      toast.error("Şablon adı, başlık ve mesaj gerekli");
      return;
    }

    try {
      const variables = formData.variables
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v.length > 0);

      const templateData: any = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        title: formData.title.trim(),
        body: formData.body.trim(),
        variables,
        isActive: true,
      };

      // Only add imageUrl and actionUrl if they have values
      const imageUrl = formData.imageUrl?.trim();
      const actionUrl = formData.actionUrl?.trim();

      if (imageUrl) {
        templateData.imageUrl = imageUrl;
      }

      if (actionUrl) {
        templateData.actionUrl = actionUrl;
      }

      if (editingTemplate) {
        await updateTemplate.mutateAsync({
          templateId: editingTemplate.templateId,
          updates: templateData,
        });
        toast.success("Şablon güncellendi");
      } else {
        await createTemplate.mutateAsync(templateData);
        toast.success("Şablon oluşturuldu");
      }

      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Şablon kaydedilemedi");
    }
  };

  const handleEdit = (template: any) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      category: template.category,
      title: template.title,
      body: template.body,
      imageUrl: template.imageUrl || "",
      actionUrl: template.actionUrl || "",
      variables: template.variables.join(", "),
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm("Bu şablonu silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      await deleteTemplate.mutateAsync(templateId);
      toast.success("Şablon silindi");
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Şablon silinemedi");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bildirim Şablonları</h1>
          <p className="text-muted-foreground">
            Hazır bildirim şablonlarını yönetin
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Şablon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? "Şablonu Düzenle" : "Yeni Şablon Oluştur"}
              </DialogTitle>
              <DialogDescription>
                Bildirim şablonu oluşturun veya düzenleyin
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Şablon Adı *</Label>
                  <Input
                    placeholder="Örn: Hoşgeldin Mesajı"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: NotificationCategory) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="marketing">Pazarlama</SelectItem>
                      <SelectItem value="transactional">İşlemsel</SelectItem>
                      <SelectItem value="system">Sistem</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Açıklama</Label>
                <Input
                  placeholder="Şablon açıklaması"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Başlık *</Label>
                <Input
                  placeholder="Örn: Hoşgeldin {{userName}}!"
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
                <Label>Mesaj *</Label>
                <Textarea
                  placeholder="Örn: Merhaba {{userName}}, {{jobCount}} yeni iş ilanı var!"
                  value={formData.body}
                  onChange={(e) =>
                    setFormData({ ...formData, body: e.target.value })
                  }
                  rows={4}
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.body.length}/200 karakter
                </p>
              </div>

              <div className="space-y-2">
                <Label>Görsel URL</Label>
                <Input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Aksiyon URL</Label>
                <Input
                  type="url"
                  placeholder="Tıklandığında açılacak sayfa"
                  value={formData.actionUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, actionUrl: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Değişkenler</Label>
                <Input
                  placeholder="fullName, city, rating (virgülle ayırın)"
                  value={formData.variables}
                  onChange={(e) =>
                    setFormData({ ...formData, variables: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Mesajda {`{{fullName}}`} şeklinde kullanın.
                  <span className="block mt-1">
                    <strong>Kullanılabilir:</strong> fullName, firstName, email,
                    phoneNumber, profileType, city, district, rating,
                    reviewCount, jobsCompleted
                  </span>
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                  }}
                >
                  İptal
                </Button>
                <Button onClick={handleSubmit}>
                  {editingTemplate ? "Güncelle" : "Oluştur"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : templates && templates.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.templateId}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {template.description}
                    </CardDescription>
                  </div>
                  <Badge variant={categoryConfig[template.category].variant}>
                    {categoryConfig[template.category].label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-semibold">Başlık:</span>
                    <p className="text-muted-foreground">{template.title}</p>
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold">Mesaj:</span>
                    <p className="line-clamp-2 text-muted-foreground">
                      {template.body}
                    </p>
                  </div>
                </div>

                {template.variables.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {template.variables.map((variable) => (
                      <Badge
                        key={variable}
                        variant="outline"
                        className="text-xs"
                      >
                        {`{{${variable}}}`}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {template.usageCount} kullanım
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(template)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(template.templateId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">Henüz şablon yok</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              İlk bildirim şablonunuzu oluşturarak başlayın
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Şablon
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

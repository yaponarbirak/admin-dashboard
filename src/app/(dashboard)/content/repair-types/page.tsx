"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { db } from "@/lib/firebase/client";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { toast } from "sonner";

interface RepairType {
  id: string;
  title: string;
  slug: string;
  icon: string;
  order: number;
  categoryId: string;
  subCategoryId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function RepairTypesPage() {
  const [repairTypes, setRepairTypes] = useState<RepairType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<RepairType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    icon: "",
    order: 0,
    categoryId: "",
    subCategoryId: "",
    isActive: true,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchRepairTypes();
  }, []);

  const fetchRepairTypes = async () => {
    try {
      const q = query(collection(db, "repair_types"), orderBy("order"));
      const querySnapshot = await getDocs(q);
      const types: RepairType[] = [];
      querySnapshot.forEach((doc) => {
        types.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        } as RepairType);
      });
      setRepairTypes(types);
    } catch (error) {
      console.error("Error fetching repair types:", error);
      toast.error("Tamir türleri yüklenirken hata oluştu");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = repairTypes.findIndex((type) => type.id === active.id);
    const newIndex = repairTypes.findIndex((type) => type.id === over.id);

    const reorderedTypes = arrayMove(repairTypes, oldIndex, newIndex);
    
    // Update order values in the reordered array
    const newTypes = reorderedTypes.map((type, index) => ({
      ...type,
      order: index,
    }));
    
    // Update local state immediately for smooth UX
    setRepairTypes(newTypes);

    // Update order in Firestore
    try {
      const batch = newTypes.map((type) => 
        updateDoc(doc(db, "repair_types", type.id), {
          order: type.order,
          updatedAt: Timestamp.now(),
        })
      );

      await Promise.all(batch);
      toast.success("Sıralama güncellendi");
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Sıralama güncellenirken hata oluştu");
      // Revert on error
      fetchRepairTypes();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = {
        ...formData,
        subCategoryId: formData.subCategoryId || null,
        // Auto-calculate order: if editing, keep current order; if new, add to end
        order: editingType ? formData.order : repairTypes.length,
        updatedAt: Timestamp.now(),
      };

      if (editingType) {
        await updateDoc(doc(db, "repair_types", editingType.id), data);
        toast.success("Tamir türü güncellendi");
      } else {
        await addDoc(collection(db, "repair_types"), {
          ...data,
          createdAt: Timestamp.now(),
          createdBy: "admin",
          updatedBy: "admin",
        });
        toast.success("Tamir türü eklendi");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchRepairTypes();
    } catch (error) {
      console.error("Error saving repair type:", error);
      toast.error("Kaydetme sırasında hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (type: RepairType) => {
    setEditingType(type);
    setFormData({
      title: type.title,
      slug: type.slug,
      icon: type.icon,
      order: type.order,
      categoryId: type.categoryId,
      subCategoryId: type.subCategoryId || "",
      isActive: type.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu tamir türünü silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "repair_types", id));
      toast.success("Tamir türü silindi");
      fetchRepairTypes();
    } catch (error) {
      console.error("Error deleting repair type:", error);
      toast.error("Silme sırasında hata oluştu");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      icon: "",
      order: 0,
      categoryId: "",
      subCategoryId: "",
      isActive: true,
    });
    setEditingType(null);
  };

  // SortableRow component for drag and drop
  function SortableRow({
    type,
    onEdit,
    onDelete,
  }: {
    type: RepairType;
    onEdit: (type: RepairType) => void;
    onDelete: (id: string) => void;
  }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: type.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <TableRow ref={setNodeRef} style={style}>
        <TableCell>
          <Button
            variant="ghost"
            size="icon"
            className="cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </Button>
        </TableCell>
        <TableCell className="font-medium">{type.title}</TableCell>
        <TableCell className="text-muted-foreground">{type.slug}</TableCell>
        <TableCell className="text-muted-foreground">{type.categoryId}</TableCell>
        <TableCell className="text-muted-foreground">
          {type.subCategoryId || "-"}
        </TableCell>
        <TableCell>{type.order}</TableCell>
        <TableCell>
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
              type.isActive
                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            {type.isActive ? "Aktif" : "Pasif"}
          </span>
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="icon" onClick={() => onEdit(type)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(type.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  const filteredTypes = repairTypes.filter((type) =>
    type.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tamir Türleri</h1>
          <p className="text-muted-foreground">
            Uygulama içindeki tamir türlerini yönetin
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Yeni Tamir Türü
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tamir türü ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Başlık</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Kategori ID</TableHead>
                <TableHead>Alt Kategori ID</TableHead>
                <TableHead>Sıra</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <SortableContext
              items={filteredTypes.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <TableBody>
                {filteredTypes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      Tamir türü bulunamadı
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTypes.map((type) => (
                    <SortableRow
                      key={type.id}
                      type={type}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </TableBody>
            </SortableContext>
          </Table>
        </DndContext>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingType ? "Tamir Türünü Düzenle" : "Yeni Tamir Türü"}
            </DialogTitle>
            <DialogDescription>
              Tamir türü bilgilerini girin
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Başlık</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="categoryId">Kategori ID</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categoryId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ariza-tespit-secimi">
                      Arıza Tespit Seçimi
                    </SelectItem>
                    <SelectItem value="genel-mekanik-tamiri">
                      Genel Mekanik Tamiri
                    </SelectItem>
                    <SelectItem value="motor-tamiri">Motor Tamiri</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subCategoryId">Alt Kategori ID (Opsiyonel)</Label>
                <Input
                  id="subCategoryId"
                  value={formData.subCategoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, subCategoryId: e.target.value })
                  }
                  placeholder="Örn: motor-tamiri"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="icon">SVG Icon</Label>
                <Textarea
                  id="icon"
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData({ ...formData, icon: e.target.value })
                  }
                  placeholder="<svg>...</svg>"
                  rows={4}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="h-4 w-4"
                />
                <Label htmlFor="isActive">Aktif</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                İptal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

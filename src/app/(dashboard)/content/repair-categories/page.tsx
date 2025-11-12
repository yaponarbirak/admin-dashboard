"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface RepairCategory {
  id: string;
  title: string;
  slug: string;
  icon: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Sortable Row Component
function SortableRow({
  category,
  onEdit,
  onDelete,
}: {
  category: RepairCategory;
  onEdit: (category: RepairCategory) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} className="border-b">
      <td className="p-3">
        <button
          className="cursor-grab active:cursor-grabbing hover:bg-accent p-1 rounded"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </button>
      </td>
      <td className="p-3 font-medium">{category.title}</td>
      <td className="p-3 text-muted-foreground">{category.slug}</td>
      <td className="p-3">{category.order}</td>
      <td className="p-3">
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
            category.isActive
              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
          }`}
        >
          {category.isActive ? "Aktif" : "Pasif"}
        </span>
      </td>
      <td className="p-3 text-right">
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" onClick={() => onEdit(category)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(category.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

export default function RepairCategoriesPage() {
  const [categories, setCategories] = useState<RepairCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<RepairCategory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    icon: "",
    order: 0,
    isActive: true,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const q = query(collection(db, "repair_categories"), orderBy("order"));
      const querySnapshot = await getDocs(q);
      const cats: RepairCategory[] = [];
      querySnapshot.forEach((doc) => {
        cats.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        } as RepairCategory);
      });
      setCategories(cats);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Kategoriler yüklenirken hata oluştu");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = categories.findIndex((cat) => cat.id === active.id);
    const newIndex = categories.findIndex((cat) => cat.id === over.id);

    const reorderedCategories = arrayMove(categories, oldIndex, newIndex);
    
    // Update order values in the reordered array
    const newCategories = reorderedCategories.map((cat, index) => ({
      ...cat,
      order: index,
    }));
    
    // Update local state immediately for smooth UX
    setCategories(newCategories);

    // Update order in Firestore
    try {
      const batch = newCategories.map((cat) => 
        updateDoc(doc(db, "repair_categories", cat.id), {
          order: cat.order,
          updatedAt: Timestamp.now(),
        })
      );
      
      await Promise.all(batch);
      toast.success("Sıralama güncellendi");
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Sıralama güncellenirken hata oluştu");
      // Revert on error
      fetchCategories();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = {
        ...formData,
        // Auto-calculate order: if editing, keep current order; if new, add to end
        order: editingCategory ? formData.order : categories.length,
        updatedAt: Timestamp.now(),
      };

      if (editingCategory) {
        await updateDoc(doc(db, "repair_categories", editingCategory.id), data);
        toast.success("Kategori güncellendi");
      } else {
        await addDoc(collection(db, "repair_categories"), {
          ...data,
          createdAt: Timestamp.now(),
          createdBy: "admin",
          updatedBy: "admin",
        });
        toast.success("Kategori eklendi");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Kaydetme sırasında hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (category: RepairCategory) => {
    setEditingCategory(category);
    setFormData({
      title: category.title,
      slug: category.slug,
      icon: category.icon,
      order: category.order,
      isActive: category.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu kategoriyi silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "repair_categories", id));
      toast.success("Kategori silindi");
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Silme sırasında hata oluştu");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      icon: "",
      order: 0,
      isActive: true,
    });
    setEditingCategory(null);
  };

  const filteredCategories = categories.filter((cat) =>
    cat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tamir Kategorileri</h1>
          <p className="text-muted-foreground">
            Ana tamir kategorilerini yönetin
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Yeni Kategori
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Kategori ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

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
                <TableHead>Sıra</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <SortableContext
              items={filteredCategories.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <TableBody>
                {filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Kategori bulunamadı
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((category) => (
                    <SortableRow
                      key={category.id}
                      category={category}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Kategoriyi Düzenle" : "Yeni Kategori"}
            </DialogTitle>
            <DialogDescription>
              Kategori bilgilerini girin
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

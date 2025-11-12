"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, GripVertical, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { db, storage } from "@/lib/firebase/client";
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
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { toast } from "sonner";
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
import Image from "next/image";

interface HomeSlider {
  id: string;
  title: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

export default function HomeSlidersPage() {
  const [sliders, setSliders] = useState<HomeSlider[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingSlider, setEditingSlider] = useState<HomeSlider | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    imageUrl: "",
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
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    try {
      const q = query(collection(db, "home_sliders"), orderBy("order"));
      const querySnapshot = await getDocs(q);
      const items: HomeSlider[] = [];
      querySnapshot.forEach((doc) => {
        items.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        } as HomeSlider);
      });
      setSliders(items);
    } catch (error) {
      console.error("Error fetching sliders:", error);
      toast.error("Slider'lar yüklenirken hata oluştu");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = sliders.findIndex((item) => item.id === active.id);
    const newIndex = sliders.findIndex((item) => item.id === over.id);

    const reorderedSliders = arrayMove(sliders, oldIndex, newIndex);
    
    const newSliders = reorderedSliders.map((item, index) => ({
      ...item,
      order: index,
    }));
    
    setSliders(newSliders);

    try {
      const batch = newSliders.map((item) => 
        updateDoc(doc(db, "home_sliders", item.id), {
          order: item.order,
          updatedAt: Timestamp.now(),
        })
      );
      
      await Promise.all(batch);
      toast.success("Sıralama güncellendi");
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Sıralama güncellenirken hata oluştu");
      fetchSliders();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Lütfen bir resim dosyası seçin");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Resim boyutu 5MB'dan küçük olmalıdır");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const timestamp = Date.now();
    const fileName = `sliders/${timestamp}_${file.name}`;
    const storageRef = ref(storage, fileName);
    
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };

  const deleteOldImage = async (imageUrl: string) => {
    try {
      // Only delete if it's a Firebase Storage URL
      if (imageUrl.includes("firebasestorage.googleapis.com")) {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
      }
    } catch (error) {
      console.error("Error deleting old image:", error);
      // Don't throw error, just log it
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let imageUrl = formData.imageUrl;

      // Upload new image if selected
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
        
        // Delete old image if editing
        if (editingSlider && editingSlider.imageUrl) {
          await deleteOldImage(editingSlider.imageUrl);
        }
      }

      const data = {
        ...formData,
        imageUrl,
        order: editingSlider ? formData.order : sliders.length,
        updatedAt: Timestamp.now(),
        updatedBy: "admin",
      };

      if (editingSlider) {
        await updateDoc(doc(db, "home_sliders", editingSlider.id), data);
        toast.success("Slider güncellendi");
      } else {
        await addDoc(collection(db, "home_sliders"), {
          ...data,
          createdAt: Timestamp.now(),
          createdBy: "admin",
        });
        toast.success("Slider eklendi");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchSliders();
    } catch (error) {
      console.error("Error saving slider:", error);
      toast.error("Kaydetme sırasında hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (slider: HomeSlider) => {
    setEditingSlider(slider);
    setFormData({
      title: slider.title,
      imageUrl: slider.imageUrl,
      order: slider.order,
      isActive: slider.isActive,
    });
    setImagePreview(slider.imageUrl);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu slider'ı silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      const slider = sliders.find((s) => s.id === id);
      if (slider?.imageUrl) {
        await deleteOldImage(slider.imageUrl);
      }
      
      await deleteDoc(doc(db, "home_sliders", id));
      toast.success("Slider silindi");
      fetchSliders();
    } catch (error) {
      console.error("Error deleting slider:", error);
      toast.error("Silme sırasında hata oluştu");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      imageUrl: "",
      order: 0,
      isActive: true,
    });
    setEditingSlider(null);
    setImageFile(null);
    setImagePreview("");
  };

  function SortableRow({
    slider,
    onEdit,
    onDelete,
  }: {
    slider: HomeSlider;
    onEdit: (slider: HomeSlider) => void;
    onDelete: (id: string) => void;
  }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: slider.id });

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
        <TableCell>
          <div className="relative h-16 w-28">
            <Image
              src={slider.imageUrl}
              alt={slider.title}
              fill
              className="object-cover rounded"
            />
          </div>
        </TableCell>
        <TableCell className="font-medium">{slider.title}</TableCell>
        <TableCell>{slider.order}</TableCell>
        <TableCell>
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
              slider.isActive
                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            {slider.isActive ? "Aktif" : "Pasif"}
          </span>
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="icon" onClick={() => onEdit(slider)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(slider.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  const filteredSliders = sliders.filter((slider) =>
    slider.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ana Sayfa Slider</h1>
          <p className="text-muted-foreground">
            Ana sayfa slider görsellerini yönetin
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Yeni Slider
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Slider ara..."
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
                <TableHead>Görsel</TableHead>
                <TableHead>Başlık</TableHead>
                <TableHead>Sıra</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <SortableContext
              items={filteredSliders.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <TableBody>
                {filteredSliders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Slider bulunamadı
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSliders.map((slider) => (
                    <SortableRow
                      key={slider.id}
                      slider={slider}
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
              {editingSlider ? "Slider Düzenle" : "Yeni Slider"}
            </DialogTitle>
            <DialogDescription>
              Slider bilgilerini girin
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
                <Label htmlFor="image">Görsel</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="flex-1"
                  />
                  {imagePreview && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview("");
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {imagePreview && (
                  <div className="relative h-48 w-full mt-2">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-contain rounded"
                    />
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  Maksimum dosya boyutu: 5MB
                </p>
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
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
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


"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, GripVertical, X } from "lucide-react";
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

interface HomeCard {
  id: string;
  title: string;
  actionKey: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

export default function HomeCardsPage() {
  const [cards, setCards] = useState<HomeCard[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCard, setEditingCard] = useState<HomeCard | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    actionKey: "",
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
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const q = query(collection(db, "home_cards"), orderBy("order"));
      const querySnapshot = await getDocs(q);
      const items: HomeCard[] = [];
      querySnapshot.forEach((doc) => {
        items.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        } as HomeCard);
      });
      setCards(items);
    } catch (error) {
      console.error("Error fetching cards:", error);
      toast.error("Kartlar yüklenirken hata oluştu");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = cards.findIndex((item) => item.id === active.id);
    const newIndex = cards.findIndex((item) => item.id === over.id);

    const reorderedCards = arrayMove(cards, oldIndex, newIndex);
    
    const newCards = reorderedCards.map((item, index) => ({
      ...item,
      order: index,
    }));
    
    setCards(newCards);

    try {
      const batch = newCards.map((item) => 
        updateDoc(doc(db, "home_cards", item.id), {
          order: item.order,
          updatedAt: Timestamp.now(),
        })
      );
      
      await Promise.all(batch);
      toast.success("Sıralama güncellendi");
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Sıralama güncellenirken hata oluştu");
      fetchCards();
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
    const fileName = `cards/${timestamp}_${file.name}`;
    const storageRef = ref(storage, fileName);
    
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };

  const deleteOldImage = async (imageUrl: string) => {
    try {
      if (imageUrl.includes("firebasestorage.googleapis.com")) {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
      }
    } catch (error) {
      console.error("Error deleting old image:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let imageUrl = formData.imageUrl;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
        
        if (editingCard && editingCard.imageUrl) {
          await deleteOldImage(editingCard.imageUrl);
        }
      }

      const data = {
        ...formData,
        imageUrl,
        order: editingCard ? formData.order : cards.length,
        updatedAt: Timestamp.now(),
        updatedBy: "admin",
      };

      if (editingCard) {
        await updateDoc(doc(db, "home_cards", editingCard.id), data);
        toast.success("Kart güncellendi");
      } else {
        await addDoc(collection(db, "home_cards"), {
          ...data,
          createdAt: Timestamp.now(),
          createdBy: "admin",
        });
        toast.success("Kart eklendi");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchCards();
    } catch (error) {
      console.error("Error saving card:", error);
      toast.error("Kaydetme sırasında hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (card: HomeCard) => {
    setEditingCard(card);
    setFormData({
      title: card.title,
      actionKey: card.actionKey,
      imageUrl: card.imageUrl,
      order: card.order,
      isActive: card.isActive,
    });
    setImagePreview(card.imageUrl);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu kartı silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      const card = cards.find((c) => c.id === id);
      if (card?.imageUrl) {
        await deleteOldImage(card.imageUrl);
      }
      
      await deleteDoc(doc(db, "home_cards", id));
      toast.success("Kart silindi");
      fetchCards();
    } catch (error) {
      console.error("Error deleting card:", error);
      toast.error("Silme sırasında hata oluştu");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      actionKey: "",
      imageUrl: "",
      order: 0,
      isActive: true,
    });
    setEditingCard(null);
    setImageFile(null);
    setImagePreview("");
  };

  function SortableRow({
    card,
    onEdit,
    onDelete,
  }: {
    card: HomeCard;
    onEdit: (card: HomeCard) => void;
    onDelete: (id: string) => void;
  }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: card.id });

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
          <div className="relative h-16 w-16">
            <Image
              src={card.imageUrl}
              alt={card.title}
              fill
              className="object-cover rounded"
            />
          </div>
        </TableCell>
        <TableCell className="font-medium">{card.title}</TableCell>
        <TableCell className="text-muted-foreground">{card.actionKey}</TableCell>
        <TableCell>{card.order}</TableCell>
        <TableCell>
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
              card.isActive
                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            {card.isActive ? "Aktif" : "Pasif"}
          </span>
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="icon" onClick={() => onEdit(card)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(card.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  const filteredCards = cards.filter((card) =>
    card.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ana Sayfa Kartları</h1>
          <p className="text-muted-foreground">
            Ana sayfa özellik kartlarını yönetin
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Yeni Kart
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Kart ara..."
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
                <TableHead>Action Key</TableHead>
                <TableHead>Sıra</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <SortableContext
              items={filteredCards.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <TableBody>
                {filteredCards.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Kart bulunamadı
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCards.map((card) => (
                    <SortableRow
                      key={card.id}
                      card={card}
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
              {editingCard ? "Kartı Düzenle" : "Yeni Kart"}
            </DialogTitle>
            <DialogDescription>
              Kart bilgilerini girin
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
                <Label htmlFor="actionKey">Action Key</Label>
                <Input
                  id="actionKey"
                  value={formData.actionKey}
                  onChange={(e) =>
                    setFormData({ ...formData, actionKey: e.target.value })
                  }
                  placeholder="parts, service, etc."
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


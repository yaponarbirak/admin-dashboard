# RFC-010: Admin Panel İçerik Yönetimi Sistemi

**Durum:** 📝 Draft  
**Tarih:** 11 Kasım 2025  
**Yazar:** AI Assistant  
**Sprint:** Sprint 4 Extension (Content Management)  
**Bağımlılık:** RFC-009 (Sanity → Firebase Migration)

---

## 📋 İçindekiler

1. [Özet](#özet)
2. [Motivasyon](#motivasyon)
3. [Özellikler](#özellikler)
4. [Teknik Tasarım](#teknik-tasarım)
5. [UI/UX Tasarımı](#uiux-tasarımı)
6. [API & Backend](#api--backend)
7. [Güvenlik](#güvenlik)
8. [Uygulama Adımları](#uygulama-adımları)

---

## Özet

RFC-009'da planlanan Sanity → Firebase migrasyonu sonrası, tüm içerik yönetimi Firebase Firestore üzerinden yapılacaktır. Bu RFC, **YOB Admin Panel**'e eklenecek içerik yönetimi modülünün teknik ve UI tasarımını içermektedir.

### Yönetilecek İçerikler

1. ✅ **Tamir Kategorileri** (Repair Categories)
2. ✅ **Tamir Türleri** (Repair Types) 
3. ✅ **Ana Ekran Slider'ları** (Home Sliders)
4. ✅ **Ana Ekran Kartları** (Home Cards)

---

## Motivasyon

### 🎯 İhtiyaçlar

- ✅ Sanity CMS bağımlılığından kurtulmak
- ✅ Tüm içeriği tek bir admin panelden yönetmek
- ✅ Kategori ekleme/düzenleme/silme işlemleri
- ✅ Görsel yükleme ve yönetimi
- ✅ Sıralama ve aktif/pasif durumu yönetimi
- ✅ Alt kategori ilişkilendirme
- ✅ Örnek cümle yönetimi

### 💡 Faydalar

- 🚀 Tek ekosistem (Firebase)
- 💰 Maliyet tasarrufu (Sanity subscription)
- 🔒 Daha iyi güvenlik kontrolü
- ⚡ Daha hızlı içerik güncellemeleri
- 📊 Kullanım analitikleri
- 🎨 Özelleştirilebilir UI

---

## Özellikler

### 🗂️ Modül 1: Tamir Kategorileri

**Sayfa:** `/dashboard/content/categories`

#### Özellikler
- ✅ Kategori listesi (tablo görünümü)
- ✅ Yeni kategori ekleme
- ✅ Kategori düzenleme
- ✅ Kategori silme (soft delete)
- ✅ Sıralama değiştirme (drag & drop)
- ✅ Aktif/Pasif durumu toggle
- ✅ Arama ve filtreleme

#### Kategori Alanları
```typescript
interface RepairCategory {
  id: string;                // Auto-generated
  title: string;             // "Arıza Tespit Seçimi"
  slug: string;              // "ariza-tespit-secimi" (auto-generate)
  order: number;             // Sıralama
  isActive: boolean;         // Aktif/Pasif
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;         // Admin UID
  updatedBy: string;         // Admin UID
}
```

---

### 🔧 Modül 2: Tamir Türleri

**Sayfa:** `/dashboard/content/repair-types`

#### Özellikler
- ✅ Tamir türü listesi (kategoriye göre filtrelenebilir)
- ✅ Yeni tamir türü ekleme
- ✅ Tamir türü düzenleme
- ✅ Tamir türü silme
- ✅ SVG ikon yükleme/düzenleme
- ✅ Örnek cümle ekleme/çıkarma
- ✅ Alt kategori ilişkilendirme
- ✅ Kategori değiştirme
- ✅ Sıralama ve aktif/pasif

#### Tamir Türü Alanları
```typescript
interface RepairType {
  id: string;                     // Auto-generated
  title: string;                  // "Motor Problemi"
  slug: string;                   // "motor-problemi"
  icon: string;                   // SVG kodu
  order: number;                  // Sıralama
  categoryId: string;             // Kategori referansı
  subCategoryId?: string;         // Alt kategori (opsiyonel)
  exampleSentences: string[];     // Örnek cümleler
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  updatedBy: string;
}
```

---

### 🎠 Modül 3: Ana Ekran Slider'ları

**Sayfa:** `/dashboard/content/sliders`

#### Özellikler
- ✅ Slider listesi (önizleme ile)
- ✅ Yeni slider ekleme
- ✅ Slider düzenleme
- ✅ Slider silme
- ✅ Görsel yükleme (Firebase Storage)
- ✅ Sıralama (drag & drop)
- ✅ Aktif/Pasif durumu
- ✅ Görsel önizleme

#### Slider Alanları
```typescript
interface HomeSlider {
  id: string;
  title: string;               // Slider başlığı
  imageUrl: string;            // Firebase Storage URL
  order: number;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  updatedBy: string;
}
```

---

### 🃏 Modül 4: Ana Ekran Kartları

**Sayfa:** `/dashboard/content/home-cards`

#### Özellikler
- ✅ Kart listesi (önizleme ile)
- ✅ Yeni kart ekleme
- ✅ Kart düzenleme
- ✅ Kart silme
- ✅ Görsel yükleme
- ✅ Action key seçimi (dropdown)
- ✅ Sıralama
- ✅ Aktif/Pasif durumu

#### Home Card Alanları
```typescript
interface HomeCard {
  id: string;
  title: string;               // "Tamir İlanı Ver"
  imageUrl: string;            // Firebase Storage URL
  actionKey: 'repair' | 'parts' | 'towing';  // Action type
  order: number;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  updatedBy: string;
}
```

---

## Teknik Tasarım

### 📂 Klasör Yapısı

```
src/
├── app/(dashboard)/
│   └── content/
│       ├── layout.tsx                    # Content management layout
│       ├── page.tsx                      # Content overview/stats
│       ├── categories/
│       │   ├── page.tsx                  # Categories list
│       │   ├── [id]/
│       │   │   └── page.tsx              # Edit category
│       │   └── new/
│       │       └── page.tsx              # New category
│       ├── repair-types/
│       │   ├── page.tsx                  # Repair types list
│       │   ├── [id]/
│       │   │   └── page.tsx              # Edit repair type
│       │   └── new/
│       │       └── page.tsx              # New repair type
│       ├── sliders/
│       │   ├── page.tsx                  # Sliders list
│       │   ├── [id]/
│       │   │   └── page.tsx              # Edit slider
│       │   └── new/
│       │       └── page.tsx              # New slider
│       └── home-cards/
│           ├── page.tsx                  # Home cards list
│           ├── [id]/
│           │   └── page.tsx              # Edit card
│           └── new/
│               └── page.tsx              # New card
│
├── components/
│   └── content/
│       ├── CategoriesTable.tsx           # Categories table
│       ├── CategoryForm.tsx              # Category add/edit form
│       ├── RepairTypesTable.tsx          # Repair types table
│       ├── RepairTypeForm.tsx            # Repair type add/edit form
│       ├── SvgIconEditor.tsx             # SVG icon editor
│       ├── SlidersTable.tsx              # Sliders table
│       ├── SliderForm.tsx                # Slider add/edit form
│       ├── HomeCardsTable.tsx            # Home cards table
│       ├── HomeCardForm.tsx              # Home card add/edit form
│       ├── ImageUploader.tsx             # Firebase Storage image upload
│       └── DraggableList.tsx             # Reorderable list component
│
├── lib/
│   └── firebase/
│       ├── content.ts                    # Content CRUD operations
│       └── storage.ts                    # Firebase Storage helpers
│
└── hooks/
    ├── useRepairCategories.ts            # Categories hook
    ├── useRepairTypes.ts                 # Repair types hook
    ├── useSliders.ts                     # Sliders hook
    └── useHomeCards.ts                   # Home cards hook
```

---

## UI/UX Tasarımı

### 🎨 Ana İçerik Yönetimi Sayfası

**URL:** `/dashboard/content`

```tsx
// İçerik yönetimi ana sayfası - 4 kart grid
┌────────────────────────────────────────────────┐
│  İçerik Yönetimi                               │
├────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ 📂       │  │ 🔧       │  │ 🎠       │    │
│  │ Tamir    │  │ Tamir    │  │ Slider   │    │
│  │ Kategori │  │ Türleri  │  │          │    │
│  │          │  │          │  │          │    │
│  │ 3 Aktif  │  │ 24 Aktif │  │ 5 Aktif  │    │
│  └──────────┘  └──────────┘  └──────────┘    │
│                                                 │
│  ┌──────────┐                                  │
│  │ 🃏       │                                  │
│  │ Ana Ekran│                                  │
│  │ Kartları │                                  │
│  │          │                                  │
│  │ 3 Aktif  │                                  │
│  └──────────┘                                  │
│                                                 │
└────────────────────────────────────────────────┘
```

---

### 📋 Kategori Listesi

**URL:** `/dashboard/content/categories`

```tsx
┌────────────────────────────────────────────────────────────┐
│  Tamir Kategorileri                    [+ Yeni Kategori]   │
├────────────────────────────────────────────────────────────┤
│  [🔍 Ara...]                           Filtre: [Tümü ▼]   │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Sıra │ Başlık              │ Durum  │ İşlemler       │ │
│  ├──────┼─────────────────────┼────────┼────────────────┤ │
│  │  ⣿ 1 │ Arıza Tespit        │ 🟢Aktif│ ✏️ 🗑️         │ │
│  │  ⣿ 2 │ Genel Mekanik       │ 🟢Aktif│ ✏️ 🗑️         │ │
│  │  ⣿ 3 │ Motor Tamiri        │ 🔴Pasif│ ✏️ 🗑️         │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                             │
│  Gösterilen: 3 / 3                                         │
└────────────────────────────────────────────────────────────┘
```

**Özellikler:**
- 🔍 Real-time arama
- 🎯 Durum filtresi (Tümü / Aktif / Pasif)
- ⣿ Drag & drop sıralama
- 🟢🔴 Toggle ile aktif/pasif
- ✏️ Düzenle butonu
- 🗑️ Sil butonu (confirmation dialog)

---

### ✏️ Kategori Ekleme/Düzenleme Formu

**URL:** `/dashboard/content/categories/new` veya `/dashboard/content/categories/[id]`

```tsx
┌────────────────────────────────────────────────┐
│  Yeni Kategori Ekle                            │
├────────────────────────────────────────────────┤
│                                                 │
│  Kategori Başlığı *                            │
│  ┌─────────────────────────────────────────┐  │
│  │ Motor Tamiri                            │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  Slug (otomatik oluşturuldu)                   │
│  ┌─────────────────────────────────────────┐  │
│  │ motor-tamiri                 [🔄]       │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  Sıralama                                      │
│  ┌─────────────────────────────────────────┐  │
│  │ 3                                       │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  ☑ Aktif                                       │
│                                                 │
│  [İptal]                           [Kaydet]   │
│                                                 │
└────────────────────────────────────────────────┘
```

**Form Validasyonu:**
- ✅ Başlık: Zorunlu, 2-100 karakter
- ✅ Slug: Benzersiz, otomatik oluşturulur (manuel düzenlenebilir)
- ✅ Sıralama: Pozitif tam sayı

---

### 🔧 Tamir Türleri Listesi

**URL:** `/dashboard/content/repair-types`

```tsx
┌──────────────────────────────────────────────────────────────────┐
│  Tamir Türleri                             [+ Yeni Tamir Türü]   │
├──────────────────────────────────────────────────────────────────┤
│  [🔍 Ara...]  Kategori: [Tümü ▼]  Durum: [Tümü ▼]               │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ # │ İkon│ Başlık        │ Kategori      │ Durum│ İşlemler │ │
│  ├───┼─────┼───────────────┼───────────────┼──────┼──────────┤ │
│  │ 1 │ 🔧  │ Motor         │ Arıza Tespit  │ 🟢   │ ✏️ 🗑️   │ │
│  │ 2 │ ⚙️  │ Şanzıman     │ Genel Mekanik │ 🟢   │ ✏️ 🗑️   │ │
│  │ 3 │ 🔩  │ Fren Sistemi  │ Genel Mekanik │ 🟢   │ ✏️ 🗑️   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  Gösterilen: 3 / 24                          [« 1 2 3 4 5 »]   │
└──────────────────────────────────────────────────────────────────┘
```

---

### 📝 Tamir Türü Ekleme/Düzenleme Formu

```tsx
┌────────────────────────────────────────────────┐
│  Yeni Tamir Türü Ekle                          │
├────────────────────────────────────────────────┤
│                                                 │
│  Başlık *                                      │
│  ┌─────────────────────────────────────────┐  │
│  │ Motor Arızası                           │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  Kategori *                                    │
│  ┌─────────────────────────────────────────┐  │
│  │ Arıza Tespit Seçimi              [▼]   │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  Alt Kategori (Opsiyonel)                     │
│  ┌─────────────────────────────────────────┐  │
│  │ Seçiniz...                       [▼]   │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  SVG İkonu *                                   │
│  ┌─────────────────────────────────────────┐  │
│  │ <svg>...</svg>              [Önizle]   │  │
│  │                                         │  │
│  └─────────────────────────────────────────┘  │
│  Önizleme: [🔧]                                │
│                                                 │
│  Örnek Cümleler                                │
│  ┌─────────────────────────────────────────┐  │
│  │ • Motorumda tıkırtı var         [🗑️]  │  │
│  │ • Motor ısınıyor                [🗑️]  │  │
│  │ • Gaz pedalı tepki vermiyor     [🗑️]  │  │
│  └─────────────────────────────────────────┘  │
│  [+ Yeni Cümle Ekle]                          │
│                                                 │
│  Sıralama: [3]                                 │
│  ☑ Aktif                                       │
│                                                 │
│  [İptal]                           [Kaydet]   │
│                                                 │
└────────────────────────────────────────────────┘
```

---

### 🎠 Slider Yönetimi

```tsx
┌─────────────────────────────────────────────────────────┐
│  Ana Ekran Slider'ları                  [+ Yeni Slider] │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ ⣿  ┌─────────┐  Yaz Kampanyası                  │  │
│  │ 1  │  [IMG]  │  🟢 Aktif                         │  │
│  │    └─────────┘  [✏️] [🗑️]                        │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ ⣿  ┌─────────┐  Kış Bakımı                      │  │
│  │ 2  │  [IMG]  │  🟢 Aktif                         │  │
│  │    └─────────┘  [✏️] [🗑️]                        │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ ⣿  ┌─────────┐  İndirimler                      │  │
│  │ 3  │  [IMG]  │  🔴 Pasif                         │  │
│  │    └─────────┘  [✏️] [🗑️]                        │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Slider Form:**
```tsx
┌────────────────────────────────────────────────┐
│  Yeni Slider Ekle                              │
├────────────────────────────────────────────────┤
│                                                 │
│  Başlık *                                      │
│  ┌─────────────────────────────────────────┐  │
│  │ Yaz Kampanyası                          │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  Görsel *                                      │
│  ┌─────────────────────────────────────────┐  │
│  │                                         │  │
│  │        [📷 Görsel Yükle]               │  │
│  │                                         │  │
│  │  Önerilen: 1200x400px, max 2MB        │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  Önizleme:                                     │
│  ┌─────────────────────────────────────────┐  │
│  │         [Yüklenen Görsel]              │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  Sıralama: [1]                                 │
│  ☑ Aktif                                       │
│                                                 │
│  [İptal]                           [Kaydet]   │
│                                                 │
└────────────────────────────────────────────────┘
```

---

## API & Backend

### 🔥 Firebase Functions (Optional)

**File:** `lib/firebase/content.ts`

```typescript
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";

// ============================================
// REPAIR CATEGORIES
// ============================================

export interface RepairCategory {
  id: string;
  title: string;
  slug: string;
  order: number;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  updatedBy: string;
}

export async function getRepairCategories(): Promise<RepairCategory[]> {
  const q = query(
    collection(db, "repair_categories"),
    orderBy("order", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as RepairCategory));
}

export async function getRepairCategory(id: string): Promise<RepairCategory | null> {
  const docRef = doc(db, "repair_categories", id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as RepairCategory;
}

export async function createRepairCategory(
  data: Omit<RepairCategory, "id" | "createdAt" | "updatedAt">,
  adminUid: string
): Promise<string> {
  const docRef = await addDoc(collection(db, "repair_categories"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: adminUid,
    updatedBy: adminUid,
  });
  return docRef.id;
}

export async function updateRepairCategory(
  id: string,
  data: Partial<Omit<RepairCategory, "id" | "createdAt">>,
  adminUid: string
): Promise<void> {
  const docRef = doc(db, "repair_categories", id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
    updatedBy: adminUid,
  });
}

export async function deleteRepairCategory(id: string): Promise<void> {
  const docRef = doc(db, "repair_categories", id);
  await deleteDoc(docRef);
}

// ============================================
// REPAIR TYPES
// ============================================

export interface RepairType {
  id: string;
  title: string;
  slug: string;
  icon: string;
  order: number;
  categoryId: string;
  subCategoryId?: string;
  exampleSentences: string[];
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  updatedBy: string;
}

export async function getRepairTypes(categoryId?: string): Promise<RepairType[]> {
  let q = query(collection(db, "repair_types"), orderBy("order", "asc"));
  
  if (categoryId) {
    q = query(q, where("categoryId", "==", categoryId));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as RepairType));
}

export async function createRepairType(
  data: Omit<RepairType, "id" | "createdAt" | "updatedAt">,
  adminUid: string
): Promise<string> {
  const docRef = await addDoc(collection(db, "repair_types"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: adminUid,
    updatedBy: adminUid,
  });
  return docRef.id;
}

export async function updateRepairType(
  id: string,
  data: Partial<Omit<RepairType, "id" | "createdAt">>,
  adminUid: string
): Promise<void> {
  const docRef = doc(db, "repair_types", id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
    updatedBy: adminUid,
  });
}

// ============================================
// HOME SLIDERS
// ============================================

export interface HomeSlider {
  id: string;
  title: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  updatedBy: string;
}

// Similar CRUD functions for sliders...

// ============================================
// HOME CARDS
// ============================================

export interface HomeCard {
  id: string;
  title: string;
  imageUrl: string;
  actionKey: "repair" | "parts" | "towing";
  order: number;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  updatedBy: string;
}

// Similar CRUD functions for home cards...
```

---

### 📤 Firebase Storage Helpers

**File:** `lib/firebase/storage.ts`

```typescript
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/lib/firebase/client";

export async function uploadImage(
  file: File,
  path: string
): Promise<string> {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(storageRef);
  return downloadUrl;
}

export async function deleteImage(url: string): Promise<void> {
  const storageRef = ref(storage, url);
  await deleteObject(storageRef);
}

// Helper: Upload slider image
export async function uploadSliderImage(file: File, sliderId: string): Promise<string> {
  const path = `content/sliders/${sliderId}_${Date.now()}.${file.name.split('.').pop()}`;
  return uploadImage(file, path);
}

// Helper: Upload home card image
export async function uploadHomeCardImage(file: File, cardId: string): Promise<string> {
  const path = `content/home-cards/${cardId}_${Date.now()}.${file.name.split('.').pop()}`;
  return uploadImage(file, path);
}
```

---

## Güvenlik

### 🔒 Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Content collections - Admin only
    match /repair_categories/{categoryId} {
      allow read: if true;  // Public read
      allow write: if request.auth != null 
                   && request.auth.token.admin == true;
    }
    
    match /repair_types/{typeId} {
      allow read: if true;  // Public read
      allow write: if request.auth != null 
                   && request.auth.token.admin == true;
    }
    
    match /home_sliders/{sliderId} {
      allow read: if true;  // Public read
      allow write: if request.auth != null 
                   && request.auth.token.admin == true;
    }
    
    match /home_cards/{cardId} {
      allow read: if true;  // Public read
      allow write: if request.auth != null 
                   && request.auth.token.admin == true;
    }
  }
}
```

### 🔒 Firebase Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Content images
    match /content/{folder}/{fileName} {
      allow read: if true;  // Public read
      allow write: if request.auth != null 
                   && request.auth.token.admin == true
                   && request.resource.size < 5 * 1024 * 1024  // Max 5MB
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

---

## Uygulama Adımları

### ✅ Hafta 1: Backend & Firebase Setup

#### Gün 1-2: Firestore Collections
- [ ] `repair_categories` koleksiyonu oluştur
- [ ] `repair_types` koleksiyonu oluştur
- [ ] `home_sliders` koleksiyonu oluştur
- [ ] `home_cards` koleksiyonu oluştur
- [ ] Firestore indexes oluştur
- [ ] Security rules yaz ve deploy et

#### Gün 3-4: Firebase Storage
- [ ] Storage bucket klasörlerini oluştur
- [ ] Storage security rules yaz
- [ ] Image upload helpers yaz
- [ ] Image optimization setup (opsiyonel)

#### Gün 5: API Layer
- [ ] `lib/firebase/content.ts` dosyasını yaz
- [ ] `lib/firebase/storage.ts` dosyasını yaz
- [ ] CRUD fonksiyonlarını test et
- [ ] Custom hooks yaz

---

### ✅ Hafta 2: Admin Panel UI - Kategoriler & Tamir Türleri

#### Gün 1-2: Tamir Kategorileri
- [ ] `/content/categories` sayfa layout
- [ ] `CategoriesTable` component
- [ ] `CategoryForm` component
- [ ] CRUD operations entegrasyonu
- [ ] Drag & drop sıralama
- [ ] Toast notifications

#### Gün 3-5: Tamir Türleri
- [ ] `/content/repair-types` sayfa layout
- [ ] `RepairTypesTable` component
- [ ] `RepairTypeForm` component
- [ ] `SvgIconEditor` component
- [ ] Örnek cümle yönetimi
- [ ] Alt kategori ilişkilendirme
- [ ] CRUD operations entegrasyonu

---

### ✅ Hafta 3: Admin Panel UI - Sliders & Cards

#### Gün 1-3: Slider Yönetimi
- [ ] `/content/sliders` sayfa layout
- [ ] `SlidersTable` component
- [ ] `SliderForm` component
- [ ] `ImageUploader` component
- [ ] Firebase Storage entegrasyonu
- [ ] Görsel önizleme
- [ ] Drag & drop sıralama

#### Gün 4-5: Home Cards
- [ ] `/content/home-cards` sayfa layout
- [ ] `HomeCardsTable` component
- [ ] `HomeCardForm` component
- [ ] Action key dropdown
- [ ] Image upload entegrasyonu
- [ ] CRUD operations

---

### ✅ Hafta 4: Test, Polish & Deployment

#### Gün 1-2: Testing
- [ ] Unit testler
- [ ] Integration testler
- [ ] E2E testler (Playwright)
- [ ] Form validation testleri
- [ ] Image upload testleri

#### Gün 3-4: Polish
- [ ] Loading states
- [ ] Error handling
- [ ] Toast notifications
- [ ] Responsive design fix
- [ ] Accessibility (a11y)

#### Gün 5: Deployment
- [ ] Production deployment
- [ ] Migration data validation
- [ ] Documentation update
- [ ] Team training

---

## Başarı Kriterleri

### ✅ Tamamlanma Kriterleri

1. ✅ Admin tüm içerikleri yönetebiliyor
2. ✅ CRUD işlemleri hatasız çalışıyor
3. ✅ Görsel upload çalışıyor
4. ✅ Sıralama ve aktif/pasif toggle çalışıyor
5. ✅ Form validasyonları çalışıyor
6. ✅ Mobile responsive
7. ✅ Security rules doğru çalışıyor
8. ✅ Testler %90+ pass

---

## Ek Özellikler (Opsiyonel)

### 🎯 Phase 2 Features

- 📊 İçerik kullanım analytics
- 📝 Audit log (kim ne zaman değiştirdi)
- 🔄 Bulk operations (toplu aktif/pasif)
- 📤 Import/Export (JSON, CSV)
- 🔍 Advanced search & filtering
- 🌐 Multi-language support
- 📱 Preview mode (Flutter app görünümü)
- ⏰ Scheduled publish (gelecek tarihte aktif olma)

---

## Sonuç

Bu RFC, YOB Admin Panel'e entegre edilecek **kapsamlı içerik yönetimi sistemi**ni tanımlamaktadır. RFC-009'daki Sanity → Firebase migrasyonu tamamlandıktan sonra, bu modül devreye alınarak tüm içerik yönetimi tek bir yerden yapılabilecektir.

**Tahmini Süre:** 4 hafta  
**Tahmini Effort:** 100-120 saat  
**Öncelik:** 🔴 Yüksek  
**Bağımlılık:** RFC-009 tamamlanmalı

---

## Referanslar

- [Shadcn/ui Data Table](https://ui.shadcn.com/docs/components/data-table)
- [Firebase Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [Firebase Storage Upload](https://firebase.google.com/docs/storage/web/upload-files)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)

---

**Onay:** Bekleniyor  
**Başlangıç Tarihi:** RFC-009 tamamlandıktan sonra

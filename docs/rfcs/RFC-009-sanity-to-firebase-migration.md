# RFC-009: Sanity'den Firebase'e Geçiş ve Veri Migrasyonu

**Durum:** 📝 Draft  
**Tarih:** 11 Kasım 2025  
**Yazar:** AI Assistant  
**Sprint:** Special Migration Sprint  

---

## 📋 İçindekiler

1. [Özet](#özet)
2. [Mevcut Durum Analizi](#mevcut-durum-analizi)
3. [Hedef Mimari](#hedef-mimari)
4. [Veri Yapısı Dönüşümü](#veri-yapısı-dönüşümü)
5. [Migration Stratejisi](#migration-stratejisi)
6. [Risk Analizi](#risk-analizi)
7. [Uygulama Adımları](#uygulama-adımları)

---

## Özet

Yap Onar Bırak Flutter uygulaması şu anda içerik yönetimi için **Sanity CMS** kullanmaktadır. Bu RFC, Sanity bağımlılığını tamamen kaldırarak, tüm içerik yönetimini **Firebase Firestore** üzerinden yapacak şekilde migrasyonun teknik planını içermektedir.

### Geçiş Kapsamı

- ✅ Tamir kategorileri (Advertisement Types & Preferences)
- ✅ Ana ekran slider'ları
- ✅ Ana ekran kartları (Home Cards)
- ✅ Alt kategori ilişkileri
- ✅ İkon ve görsel yönetimi
- ✅ Örnek cümleler (Form examples)

---

## Mevcut Durum Analizi

### 🔍 Sanity Kullanım Noktaları

#### 1. **Modeller** (`lib/models/sanity/`)
```dart
✓ advertisement_preference.dart    // İlan kategorileri (ana)
✓ advertisement_type.dart          // İlan tipleri (alt kategoriler)
✓ home_cards.dart                  // Ana ekran kartları
✓ slider.dart                      // Ana ekran slider'ları
```

#### 2. **Servisler** (`lib/services/`)
```dart
✓ sanity/sanity_queries.dart       // Tüm Sanity sorguları
✓ advertisement_service.dart       // İlan servisi (Sanity wrapper)
✓ repair_category_service.dart     // Tamir kategori servisi
```

#### 3. **Ekranlar** (`lib/screens/`)
```dart
✓ home_screen.dart                 // Slider ve home cards kullanımı
✓ create_advertise.dart            // Kategori listesi
✓ service_provider_sign_up_screen.dart  // Kategori seçimi
✓ edit_business_profile_screen.dart     // Tamir türü seçimi
```

#### 4. **Dependencies**
```yaml
sanity_client: ^1.9.0  # ❌ KALDIRILACAK
```

---

### 📊 Sanity Veri Yapısı

#### Schema 1: `advertisementPreferences`
```typescript
{
  _type: "advertisementPreferences",
  title: string,              // "Arıza Tespit Seçimi"
  slug: {
    current: string          // "ariza-tespit-secimi"
  }
}
```

#### Schema 2: `advertisementType`
```typescript
{
  _type: "advertisementType",
  title: string,              // "Motor Problemi"
  slug: {
    current: string          // "motor-problemi"
  },
  icon: string,              // SVG kodu
  order: number,             // Sıralama
  exampleSentences: string[], // Örnek cümleler
  belongsTo: reference,       // advertisementPreferences referansı
  subCategory?: reference     // Alt kategori (opsiyonel)
}
```

#### Schema 3: `slider`
```typescript
{
  _type: "slider",
  title: string,
  slides: [{
    title: string,
    image: {
      asset: {
        url: string
      }
    }
  }]
}
```

#### Schema 4: `homeCards`
```typescript
{
  _type: "homeCards",
  title: string,              // "Otomobilinize Özel"
  cards: [{
    title: string,
    image: {
      asset: {
        url: string
      }
    },
    actionKey: string,        // "repair", "parts", "towing"
    order: number
  }]
}
```

---

## Hedef Mimari

### 🎯 Firebase Firestore Koleksiyon Yapısı

```
firestore/
├── repair_categories/                    # Ana kategoriler (eski advertisementPreferences)
│   └── {categoryId}
│       ├── id: string
│       ├── title: string
│       ├── slug: string
│       ├── order: number
│       ├── createdAt: timestamp
│       ├── updatedAt: timestamp
│       └── isActive: boolean
│
├── repair_types/                         # Tamir türleri (eski advertisementType)
│   └── {typeId}
│       ├── id: string
│       ├── title: string
│       ├── slug: string
│       ├── icon: string (SVG)
│       ├── order: number
│       ├── categoryId: string (reference)
│       ├── subCategoryId?: string (opsiyonel)
│       ├── exampleSentences: string[]
│       ├── createdAt: timestamp
│       ├── updatedAt: timestamp
│       └── isActive: boolean
│
├── home_sliders/                         # Ana ekran slider'ları
│   └── {sliderId}
│       ├── id: string
│       ├── title: string
│       ├── order: number
│       ├── imageUrl: string
│       ├── isActive: boolean
│       ├── createdAt: timestamp
│       └── updatedAt: timestamp
│
└── home_cards/                           # Ana ekran kartları
    └── {cardId}
        ├── id: string
        ├── title: string
        ├── imageUrl: string
        ├── actionKey: string
        ├── order: number
        ├── isActive: boolean
        ├── createdAt: timestamp
        └── updatedAt: timestamp
```

### 🔄 Veri İlişkileri

```
repair_categories (Ana Kategori)
    ↓ (categoryId)
repair_types (Tamir Türleri)
    ↓ (subCategoryId - opsiyonel)
repair_types (Alt Tamir Türleri)
```

---

## Veri Yapısı Dönüşümü

### 📋 Mapping Tablosu

| Sanity Field | Firebase Field | Transformation |
|-------------|---------------|----------------|
| `_type: "advertisementPreferences"` | Collection: `repair_categories` | Koleksiyon adı değişikliği |
| `_type: "advertisementType"` | Collection: `repair_types` | Koleksiyon adı değişikliği |
| `slug.current` | `slug` | Nested field → flat field |
| `belongsTo._ref` | `categoryId` | Reference → String ID |
| `subCategory._ref` | `subCategoryId` | Reference → String ID (nullable) |
| `image.asset.url` | `imageUrl` | Nested → flat, URL string |
| `exampleSentences` | `exampleSentences` | Array olarak aynı kalır |
| `icon` | `icon` | SVG string olarak aynı kalır |
| - | `isActive` | Yeni field (default: true) |
| - | `createdAt` | Yeni timestamp |
| - | `updatedAt` | Yeni timestamp |

---

## Migration Stratejisi

### 📅 Faz 1: Hazırlık (1-2 Gün)

1. **Sanity'den veri export**
   - Tüm `advertisementPreferences` dokümanlarını export
   - Tüm `advertisementType` dokümanlarını export
   - Tüm `slider` ve `homeCards` dokümanlarını export
   - JSON formatında yedekleme

2. **Firebase Storage hazırlığı**
   - `/content/sliders/` klasörü
   - `/content/home-cards/` klasörü
   - Görsellerin Firebase Storage'a yüklenmesi

3. **Migration script hazırlığı**
   - Node.js script ile Sanity API → Firebase Admin SDK
   - Veri dönüşüm fonksiyonları
   - Validation logic

### 📅 Faz 2: Veri Migrasyonu (1 Gün)

```javascript
// Migration script örneği
const admin = require('firebase-admin');
const sanityClient = require('@sanity/client');

const client = sanityClient({
  projectId: 'b8y4gnld',
  dataset: 'developer',
  apiVersion: '2025-09-02',
  useCdn: false,
  token: process.env.SANITY_TOKEN
});

async function migrateCategories() {
  const categories = await client.fetch('*[_type == "advertisementPreferences"]');
  
  for (const cat of categories) {
    await admin.firestore().collection('repair_categories').doc(cat.slug.current).set({
      id: cat.slug.current,
      title: cat.title,
      slug: cat.slug.current,
      order: 0, // Manuel ayarlanacak
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      isActive: true
    });
  }
}

async function migrateTypes() {
  const types = await client.fetch(`
    *[_type == "advertisementType"] {
      title,
      "slug": slug.current,
      icon,
      order,
      exampleSentences,
      "categorySlug": belongsTo->slug.current,
      "subCategorySlug": subCategory->slug.current
    }
  `);
  
  for (const type of types) {
    await admin.firestore().collection('repair_types').doc(type.slug).set({
      id: type.slug,
      title: type.title,
      slug: type.slug,
      icon: type.icon,
      order: type.order,
      categoryId: type.categorySlug,
      subCategoryId: type.subCategorySlug || null,
      exampleSentences: type.exampleSentences || [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      isActive: true
    });
  }
}
```

### 📅 Faz 3: Flutter Kod Değişiklikleri (2-3 Gün)

#### 1. Model Değişiklikleri

**Yeni: `lib/models/firebase/repair_category.dart`**
```dart
class RepairCategory {
  final String id;
  final String title;
  final String slug;
  final int order;
  final DateTime createdAt;
  final DateTime updatedAt;
  final bool isActive;

  RepairCategory({
    required this.id,
    required this.title,
    required this.slug,
    required this.order,
    required this.createdAt,
    required this.updatedAt,
    required this.isActive,
  });

  factory RepairCategory.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return RepairCategory(
      id: doc.id,
      title: data['title'] ?? '',
      slug: data['slug'] ?? '',
      order: data['order'] ?? 0,
      createdAt: (data['createdAt'] as Timestamp).toDate(),
      updatedAt: (data['updatedAt'] as Timestamp).toDate(),
      isActive: data['isActive'] ?? true,
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'id': id,
      'title': title,
      'slug': slug,
      'order': order,
      'createdAt': Timestamp.fromDate(createdAt),
      'updatedAt': Timestamp.fromDate(updatedAt),
      'isActive': isActive,
    };
  }
}
```

**Yeni: `lib/models/firebase/repair_type.dart`**
```dart
class RepairType {
  final String id;
  final String title;
  final String slug;
  final String icon;
  final int order;
  final String categoryId;
  final String? subCategoryId;
  final List<String> exampleSentences;
  final DateTime createdAt;
  final DateTime updatedAt;
  final bool isActive;

  RepairType({
    required this.id,
    required this.title,
    required this.slug,
    required this.icon,
    required this.order,
    required this.categoryId,
    this.subCategoryId,
    required this.exampleSentences,
    required this.createdAt,
    required this.updatedAt,
    required this.isActive,
  });

  factory RepairType.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return RepairType(
      id: doc.id,
      title: data['title'] ?? '',
      slug: data['slug'] ?? '',
      icon: data['icon'] ?? '',
      order: data['order'] ?? 0,
      categoryId: data['categoryId'] ?? '',
      subCategoryId: data['subCategoryId'],
      exampleSentences: List<String>.from(data['exampleSentences'] ?? []),
      createdAt: (data['createdAt'] as Timestamp).toDate(),
      updatedAt: (data['updatedAt'] as Timestamp).toDate(),
      isActive: data['isActive'] ?? true,
    );
  }
}
```

#### 2. Servis Değişiklikleri

**Yeni: `lib/services/firebase/content_service.dart`**
```dart
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../models/firebase/repair_category.dart';
import '../../models/firebase/repair_type.dart';
import '../../models/firebase/home_slider.dart';
import '../../models/firebase/home_card.dart';

class ContentService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // Repair Categories
  Future<List<RepairCategory>> getRepairCategories() async {
    final snapshot = await _firestore
        .collection('repair_categories')
        .where('isActive', isEqualTo: true)
        .orderBy('order')
        .get();
    
    return snapshot.docs
        .map((doc) => RepairCategory.fromFirestore(doc))
        .toList();
  }

  Future<RepairCategory?> getRepairCategoryBySlug(String slug) async {
    final snapshot = await _firestore
        .collection('repair_categories')
        .where('slug', isEqualTo: slug)
        .where('isActive', isEqualTo: true)
        .limit(1)
        .get();
    
    if (snapshot.docs.isEmpty) return null;
    return RepairCategory.fromFirestore(snapshot.docs.first);
  }

  // Repair Types
  Future<List<RepairType>> getRepairTypes({String? categoryId}) async {
    Query query = _firestore
        .collection('repair_types')
        .where('isActive', isEqualTo: true);
    
    if (categoryId != null) {
      query = query.where('categoryId', isEqualTo: categoryId);
    }
    
    query = query.orderBy('order');
    
    final snapshot = await query.get();
    return snapshot.docs
        .map((doc) => RepairType.fromFirestore(doc))
        .toList();
  }

  Future<List<RepairType>> getSubRepairTypes(String parentTypeId) async {
    final snapshot = await _firestore
        .collection('repair_types')
        .where('subCategoryId', isEqualTo: parentTypeId)
        .where('isActive', isEqualTo: true)
        .orderBy('order')
        .get();
    
    return snapshot.docs
        .map((doc) => RepairType.fromFirestore(doc))
        .toList();
  }

  Future<List<RepairType>> searchRepairTypes(String query) async {
    if (query.isEmpty) return [];
    
    final snapshot = await _firestore
        .collection('repair_types')
        .where('isActive', isEqualTo: true)
        .orderBy('order')
        .get();
    
    final lowercaseQuery = query.toLowerCase();
    return snapshot.docs
        .map((doc) => RepairType.fromFirestore(doc))
        .where((type) {
          // Title'da ara
          if (type.title.toLowerCase().contains(lowercaseQuery)) {
            return true;
          }
          // Example sentences'da ara
          for (final sentence in type.exampleSentences) {
            if (sentence.toLowerCase().contains(lowercaseQuery)) {
              return true;
            }
          }
          return false;
        })
        .toList();
  }

  // Home Sliders
  Future<List<HomeSlider>> getHomeSliders() async {
    final snapshot = await _firestore
        .collection('home_sliders')
        .where('isActive', isEqualTo: true)
        .orderBy('order')
        .get();
    
    return snapshot.docs
        .map((doc) => HomeSlider.fromFirestore(doc))
        .toList();
  }

  // Home Cards
  Future<List<HomeCard>> getHomeCards() async {
    final snapshot = await _firestore
        .collection('home_cards')
        .where('isActive', isEqualTo: true)
        .orderBy('order')
        .get();
    
    return snapshot.docs
        .map((doc) => HomeCard.fromFirestore(doc))
        .toList();
  }
}
```

#### 3. Ekran Güncellemeleri

**Güncellenecek: `home_screen.dart`**
```dart
// ESKİ
final SanityQueries _sanityQueries = SanityQueries();
final sliders = await _sanityQueries.getSliders();
final homeCards = await _sanityQueries.getHomeCards();

// YENİ
final ContentService _contentService = ContentService();
final sliders = await _contentService.getHomeSliders();
final homeCards = await _contentService.getHomeCards();
```

### 📅 Faz 4: Admin Panel Entegrasyonu (2-3 Gün)

- RFC-010'da detaylandırılacak

### 📅 Faz 5: Test ve Doğrulama (1-2 Gün)

1. **Unit testler**
   - Content service testleri
   - Model serialization testleri

2. **Integration testler**
   - End-to-end kategori listesi testi
   - Arama fonksiyonu testi
   - Alt kategori ilişki testi

3. **UI testleri**
   - Ana ekran slider testi
   - Kategori seçim ekranları
   - Tamir formu testleri

### 📅 Faz 6: Deployment ve Cleanup (1 Gün)

1. **Production deployment**
   - Flutter app güncelleme (Google Play)
   - Admin panel deployment

2. **Sanity cleanup**
   - `sanity_client` dependency kaldırma
   - Sanity klasör ve dosyalarını silme
   - Sanity projesi dondurma/silme (opsiyonel)

---

## Risk Analizi

### ⚠️ Yüksek Riskler

| Risk | Etki | Olasılık | Çözüm |
|------|------|----------|-------|
| Veri kaybı | 🔴 Yüksek | 🟡 Orta | Sanity export yedekleme + staging ortamda test |
| Downtime | 🔴 Yüksek | 🟢 Düşük | Blue-green deployment stratejisi |
| Görsellerin kaybolması | 🟡 Orta | 🟡 Orta | Firebase Storage'a önceden upload |
| İlişki bozulması | 🔴 Yüksek | 🟡 Orta | Migration script validasyonu |

### 🛡️ Risk Azaltma Stratejileri

1. **Veri Yedekleme**
   - Sanity'den tam export (JSON)
   - Görsellerin local kopyası
   - Firestore backup öncesi

2. **Aşamalı Geçiş**
   - Staging ortamda tam test
   - Soft launch (beta kullanıcılar)
   - Rollback planı hazır

3. **Monitoring**
   - Firebase Analytics ile kullanım takibi
   - Crashlytics ile hata takibi
   - Admin panel'den veri doğrulama

---

## Uygulama Adımları

### ✅ Checklist

#### Hafta 1: Hazırlık ve Migration
- [ ] Sanity veri export scripti hazırla
- [ ] Tüm Sanity verilerini export et (JSON)
- [ ] Görselleri Firebase Storage'a yükle
- [ ] Firebase Firestore koleksiyonlarını oluştur
- [ ] Migration scripti yaz ve test et
- [ ] Staging'de migration'ı çalıştır
- [ ] Veri bütünlüğünü doğrula

#### Hafta 2: Flutter Kod Değişiklikleri
- [ ] Yeni Firebase model sınıflarını oluştur
- [ ] `ContentService` servisini yaz
- [ ] Eski Sanity modellerini kaldır
- [ ] Eski Sanity servislerini kaldır
- [ ] Tüm ekranlarda Sanity referanslarını değiştir
- [ ] `pubspec.yaml`'dan `sanity_client`'ı kaldır
- [ ] Unit testleri yaz ve çalıştır

#### Hafta 3: Admin Panel & Test
- [ ] Admin panel içerik yönetimi sayfalarını yap (RFC-010)
- [ ] Integration testleri yaz
- [ ] UI testlerini çalıştır
- [ ] Beta test grubuna dağıt
- [ ] Feedback topla ve düzelt

#### Hafta 4: Production Deployment
- [ ] Production Firebase'e migration çalıştır
- [ ] Flutter app production build
- [ ] Google Play Store'a yükle
- [ ] Admin panel production deployment
- [ ] Sanity projesini dondur
- [ ] Monitoring ve metric takibi

---

## Başarı Kriterleri

### ✅ Tamamlanma Kriterleri

1. ✅ Tüm Sanity bağımlılıkları kaldırıldı
2. ✅ Tüm veriler Firebase'e migrate edildi
3. ✅ Flutter app Sanity'siz çalışıyor
4. ✅ Admin panel içerik yönetimi çalışıyor
5. ✅ Mevcut özellikler etkilenmedi
6. ✅ Performance'ta düşüş yok
7. ✅ Kullanıcı deneyimi değişmedi
8. ✅ Testler %100 geçiyor

---

## Sonuç

Bu migration, Yap Onar Bırak uygulamasını **tamamen Firebase ekosisteminde** birleştirecek ve **Sanity bağımlılığını ortadan kaldıracaktır**. Admin panel sayesinde içerik yönetimi daha kolay ve entegre hale gelecektir.

**Tahmini Süre:** 3-4 hafta  
**Tahmini Effort:** 80-100 saat  
**Öncelik:** 🔴 Yüksek

---

## Referanslar

- [Firebase Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Storage Documentation](https://firebase.google.com/docs/storage)
- [Flutter Firebase Integration](https://firebase.flutter.dev/)
- [Sanity Export API](https://www.sanity.io/docs/http-api)

---

**Onay:** Bekleniyor  
**Sonraki Adım:** RFC-010 Admin Panel Content Management hazırlanacak

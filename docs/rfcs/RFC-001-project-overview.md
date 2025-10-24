# RFC-001: YOB Admin Panel - Proje Genel Bakış

**Durum:** Onaylandı ✅  
**Tarih:** 24 Ekim 2025  
**Yazar:** GitHub Copilot

## Özet

Yap Onar Bırak (YOB) Flutter uygulaması için Next.js 15 tabanlı, Firebase entegreli bir admin paneli geliştirilecek. Bu panel, kullanıcı yönetimi, bildirim gönderimi, içerik moderasyonu ve analytics işlevlerini sağlayacak.

## Motivasyon

- Flutter uygulaması Firebase üzerinde çalışıyor
- Manuel admin işlemleri için GUI ihtiyacı var
- Toplu bildirim gönderimi gerekli
- Kullanıcı moderasyonu için araçlar gerekli
- İçerik (ilan, başvuru, yorum) yönetimi gerekli

## Proje Yapısı

```
yob-admin/
├── docs/
│   └── rfcs/                    # Tüm RFC dokümanları
├── src/
│   ├── app/                     # Next.js App Router
│   ├── components/              # React komponenler
│   ├── lib/                     # Utilities & helpers
│   ├── types/                   # TypeScript tanımları
│   └── middleware.ts            # Auth middleware
├── public/                      # Statik dosyalar
└── scripts/                     # Utility scripts
```

## Teknoloji Stack

### Core

- **Next.js 16.0** - React framework
- **React 19.2** - UI library
- **TypeScript 5** - Type safety

### Firebase

- **firebase-admin** - Server-side SDK
- **firebase** - Client-side SDK
- Custom Claims authentication

### UI/UX

- **Shadcn/ui** - Component library
- **Tailwind CSS 4** - Styling
- **Lucide React** - Icons
- **Recharts** - Data visualization

### State & Forms

- **TanStack Query** - Server state
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Utilities

- **date-fns** - Date manipulation
- **sonner** - Toast notifications
- **clsx & tailwind-merge** - Class utilities

## Geliştirme Aşamaları

Bu proje 6 sprint'e bölünmüştür:

1. **Sprint 1:** Temel Kurulum & Authentication
2. **Sprint 2:** Kullanıcı Yönetimi
3. **Sprint 3:** Bildirim Sistemi
4. **Sprint 4:** İçerik Yönetimi
5. **Sprint 5:** Analytics & Raporlama
6. **Sprint 6:** Güvenlik & Optimizasyon

Her sprint için ayrı RFC dokümanı hazırlanacaktır.

## Deployment Strategy

- **Geliştirme:** Vercel Preview
- **Staging:** Vercel (staging branch)
- **Production:** Vercel (main branch)
- Firebase Admin SDK için environment variables

## Güvenlik Yaklaşımı

- Firebase Custom Claims ile admin yetkisi
- Middleware ile route protection
- Server Actions ile secure mutations
- Firestore Security Rules
- Rate limiting
- Audit logging

## İzolasyon Planı

Bu proje şu anda YapOnarBirak mono-repo içinde yer alıyor ancak ileride ayrılacak:

```
# Şu anki yapı
YapOnarBirak/
├── lib/              # Flutter app
├── ios/              # Flutter iOS
├── android/          # Flutter Android
└── yob-admin/        # Admin panel

# Gelecekteki yapı
yob-admin/            # Ayrı repository
```

Izolasyon için gerekli adımlar:

1. Bağımsız Git repository oluşturma
2. Firebase config kopyalama
3. Environment variables ayarlama
4. Deployment pipeline kurulumu

## Başarı Kriterleri

- ✅ Admin kullanıcı güvenli şekilde giriş yapabiliyor
- ✅ Tüm kullanıcıları görüntüleyip yönetebiliyor
- ✅ Toplu/filtrelenmiş bildirim gönderebiliyor
- ✅ İlanları onaylama/silme yapabiliyor
- ✅ Temel analytics dashboard çalışıyor
- ✅ Production'da stabil çalışıyor

## Alternatifler

### Değerlendirilen Diğer Yaklaşımlar:

1. **NextAuth.js ile Custom Provider**

   - ❌ Extra layer karmaşıklığı
   - ❌ Firebase ile tam entegrasyon zor

2. **Separate Firebase Project**

   - ❌ İki proje yönetimi
   - ❌ Cross-project data access karmaşık
   - ❌ Ekstra maliyet

3. **Firebase Console Manuel Yönetim**
   - ❌ UI yok
   - ❌ Toplu işlemler zor
   - ❌ Non-technical admin kullanamaz

## Açık Sorular

- [ ] Multi-admin support var mı? → Evet, custom claims ile
- [ ] Audit logging ne kadar detaylı? → Phase 6'da detaylandırılacak
- [ ] Analytics için Google Analytics entegrasyonu? → Opsiyonel
- [ ] Email notifications? → Cloud Functions ile mevcut

## Referanslar

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Shadcn/ui](https://ui.shadcn.com/)
- [TanStack Query](https://tanstack.com/query/latest)

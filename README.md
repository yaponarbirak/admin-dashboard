# YOB Admin Panel 🛠️This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

Next.js tabanlı, Firebase entegreli admin paneli - Yap Onar Bırak Flutter uygulaması için.## Getting Started

## 📋 Proje HakkındaFirst, run the development server:

Bu admin paneli, Yap Onar Bırak (YOB) Flutter uygulamasının yönetimi için geliştirilmiştir. Kullanıcı yönetimi, bildirim gönderimi, içerik moderasyonu ve analytics gibi temel admin işlevlerini sağlar.```bash

npm run dev

## 🚀 Teknoloji Stack# or

yarn dev

### Core# or

- **Next.js 16.0** - React framework (App Router)pnpm dev

- **React 19.2** - UI library# or

- **TypeScript 5** - Type safetybun dev

```

### Backend & Database

- **Firebase Authentication** - Kullanıcı doğrulamaOpen [http://localhost:3000](http://localhost:3000) with your browser to see the result.

- **Firebase Firestore** - Database

- **Firebase Admin SDK** - Server-side operationsYou can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

- **Custom Claims** - Admin yetkilendirme

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

### UI/UX

- **Shadcn/ui** - Component library## Learn More

- **Tailwind CSS 4** - Styling

- **Lucide React** - IconsTo learn more about Next.js, take a look at the following resources:

- **Sonner** - Toast notifications

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.

### State & Forms- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

- **TanStack Query** - Server state management

- **React Hook Form** - Form yönetimiYou can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

- **Zod** - Schema validation

## Deploy on Vercel

## 🏗️ Proje Yapısı

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

```

yob-admin/Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

├── docs/
│ └── rfcs/ # RFC dokümanları
├── scripts/
│ └── create-admin.js # Admin kullanıcı oluşturma script'i
├── src/
│ ├── app/ # Next.js App Router
│ │ ├── (auth)/ # Auth route group
│ │ └── (dashboard)/ # Protected routes
│ ├── components/
│ │ ├── ui/ # Shadcn UI components
│ │ ├── auth/ # Auth components
│ │ ├── layout/ # Layout components
│ │ └── providers/ # Context providers
│ ├── lib/
│ │ ├── firebase/ # Firebase config & helpers
│ │ ├── hooks/ # Custom React hooks
│ │ └── utils.ts # Utility functions
│ └── types/ # TypeScript type definitions
└── public/ # Static assets

````

## 🎯 Özellikler

### Sprint 1: Temel Kurulum ✅ (Devam Ediyor)
- [x] Firebase SDK kurulumu
- [x] Shadcn/ui setup
- [x] TypeScript types
- [ ] Authentication sistemi
- [ ] Dashboard layout
- [ ] Route protection

### Sprint 2: Kullanıcı Yönetimi (Planlama)
- [ ] Kullanıcı listesi & filtreleme
- [ ] Kullanıcı detay sayfası
- [ ] Ban/unban işlemleri
- [ ] Kullanıcı silme

### Sprint 3: Bildirim Sistemi (Planlama)
- [ ] Toplu bildirim gönderimi
- [ ] Filtrelenmiş bildirim
- [ ] Template sistemi
- [ ] Schedule edilmiş bildirimler

### Sprint 4: İçerik Yönetimi (Planlama)
- [ ] İlan yönetimi
- [ ] Başvuru görüntüleme
- [ ] Yorum moderasyonu

### Sprint 5: Analytics (Planlama)
- [ ] Dashboard istatistikleri
- [ ] Kullanıcı aktivite grafikleri
- [ ] Export özellikleri

### Sprint 6: Güvenlik & Production (Planlama)
- [ ] Rate limiting
- [ ] Security hardening
- [ ] Performance optimization

## 🚦 Başlangıç

### Gereksinimler

- Node.js 20.x veya üzeri
- npm veya yarn
- Firebase projesi
- Firebase Admin SDK service account key

### 1. Kurulum

```bash
cd yob-admin
npm install
````

### 2. Environment Variables

`.env.local` dosyası oluşturun (`.env.local.example`'dan kopyalayın):

```bash
cp .env.local.example .env.local
```

Gerekli değerleri doldurun:

- Firebase Client SDK credentials (zaten mevcut)
- Firebase Admin SDK credentials (Service Account key'den)

### 3. Firebase Admin SDK Setup

1. Firebase Console'a gidin: [Service Accounts](https://console.firebase.google.com/project/yaponarbirak-2a7dc/settings/serviceaccounts/adminsdk)
2. "Generate New Private Key" butonuna tıklayın
3. İndirilen JSON dosyasını açın
4. `.env.local` dosyasına ekleyin:
   ```
   FIREBASE_CLIENT_EMAIL=...
   FIREBASE_PRIVATE_KEY="..."
   ```

### 4. İlk Admin Kullanıcısı Oluşturma

Interactive mode:

```bash
node scripts/create-admin.js
```

Environment variables ile:

```bash
# .env.local'e ekleyin:
# INITIAL_ADMIN_EMAIL=admin@yaponarbirak.com
# INITIAL_ADMIN_PASSWORD=SecurePassword123!

node scripts/create-admin.js --env
```

### 5. Development Server

```bash
npm run dev
```

Uygulama http://localhost:3000 adresinde çalışacak.

## 📚 Dokümantasyon

Detaylı teknik dokümantasyon için `docs/rfcs/` klasörüne bakın:

- [RFC-001: Proje Genel Bakış](docs/rfcs/RFC-001-project-overview.md)
- [RFC-002: Sprint 1 - Temel Kurulum](docs/rfcs/RFC-002-sprint-1-foundation.md)
- [Sprint 1 İlerleme Raporu](docs/rfcs/SPRINT-1-PROGRESS.md)

## 🔒 Güvenlik

- ⚠️ `.env.local` dosyası **ASLA** commit edilmemeli
- ⚠️ Service account private key son derece hassastır
- ⚠️ Production'da environment variables kullanılmalı
- ⚠️ Admin credentials güvenli saklanmalı

## 🛠️ Komutlar

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start

# Lint
npm run lint

# Admin user oluşturma
node scripts/create-admin.js
```

## 📝 TODO

- [ ] Service account key setup
- [ ] Auth Provider implementation
- [ ] Login page
- [ ] Dashboard layout
- [ ] Middleware setup
- [ ] Protected routes

## 🤝 Katkıda Bulunma

1. RFC dokümanlarını inceleyin
2. Feature branch oluşturun
3. Değişikliklerinizi commit edin
4. Pull request açın

## 📄 Lisans

Bu proje Yap Onar Bırak için özel olarak geliştirilmiştir.

## 📞 İletişim

Sorularınız için RFC dokümanlarını inceleyebilirsiniz.

---

**Durum:** 🚧 Geliştirme Aşamasında (Sprint 1)  
**Son Güncelleme:** 24 Ekim 2025

# RFC-002: Sprint 1 - Temel Kurulum & Authentication

**Durum:** Devam Ediyor 🚧  
**Tarih:** 24 Ekim 2025  
**Yazar:** GitHub Copilot  
**İlgili RFC:** RFC-001

## Özet

Sprint 1'de projenin temel altyapısı kurulacak: Firebase Admin SDK, Shadcn/ui, authentication sistemi ve ilk admin kullanıcısı oluşturma mekanizması.

## Hedefler

Bu sprint sonunda:

- ✅ Firebase Admin SDK kurulu ve çalışıyor
- ✅ Shadcn/ui base komponenleri yüklü
- ✅ İlk admin kullanıcısı oluşturulabiliyor
- ✅ Login sayfası çalışıyor
- ✅ Protected dashboard layout var

## Detaylı İş Kalemleri

### 1. Paket Kurulumları

#### 1.1 Firebase SDK'ları

```bash
npm install firebase firebase-admin
npm install -D @types/node
```

**Neden firebase-admin?**

- Server-side işlemler için gerekli
- Custom claims set edebilmek için
- Firestore admin yetkisiyle erişim
- Kullanıcı yönetimi (delete, update vb.)

**Neden firebase (client)?**

- Browser-side authentication
- Real-time Firestore listeners
- Client-side auth state yönetimi

#### 1.2 Shadcn/ui Kurulumu

```bash
npx shadcn@latest init
```

Kurulacak ilk komponenler:

- `button` - Temel buton
- `input` - Form inputları
- `label` - Form labels
- `card` - Card container
- `form` - React Hook Form wrapper
- `toast` - Notification system
- `dropdown-menu` - User menu
- `avatar` - User avatar
- `separator` - Visual divider
- `skeleton` - Loading states

#### 1.3 Additional Dependencies

```bash
npm install @tanstack/react-query zod react-hook-form @hookform/resolvers
npm install date-fns clsx tailwind-merge
npm install sonner # Toast notifications
npm install lucide-react # Icons
```

### 2. Folder Structure Oluşturma

```
src/
├── app/
│   ├── (auth)/                     # Auth route group
│   │   ├── layout.tsx              # Centered auth layout
│   │   └── login/
│   │       └── page.tsx            # Login sayfası
│   ├── (dashboard)/                # Protected route group
│   │   ├── layout.tsx              # Dashboard layout (sidebar)
│   │   ├── page.tsx                # Dashboard home
│   │   └── loading.tsx             # Loading state
│   ├── api/
│   │   └── auth/
│   │       ├── login/route.ts      # Login API
│   │       └── logout/route.ts     # Logout API
│   ├── globals.css
│   └── layout.tsx                  # Root layout
├── components/
│   ├── ui/                         # Shadcn components
│   ├── auth/
│   │   ├── LoginForm.tsx           # Login form component
│   │   └── AuthProvider.tsx       # Auth context provider
│   ├── layout/
│   │   ├── Sidebar.tsx             # Dashboard sidebar
│   │   ├── Header.tsx              # Dashboard header
│   │   └── UserMenu.tsx            # User dropdown menu
│   └── providers/
│       └── QueryProvider.tsx       # TanStack Query provider
├── lib/
│   ├── firebase/
│   │   ├── admin.ts                # Firebase Admin SDK config
│   │   ├── client.ts               # Firebase Client SDK config
│   │   └── auth.ts                 # Auth helper functions
│   ├── hooks/
│   │   └── useAuth.ts              # Custom auth hook
│   └── utils.ts                    # Utility functions (cn)
├── types/
│   └── index.ts                    # TypeScript type definitions
└── middleware.ts                   # Route protection middleware
```

### 3. Firebase Configuration

#### 3.1 Environment Variables Setup

`.env.local`:

```env
# Firebase Client SDK (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin SDK (Private)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# App Config
NODE_ENV=development
```

#### 3.2 Service Account Key

Firebase Console'dan:

1. Project Settings → Service Accounts
2. Generate New Private Key
3. Download JSON
4. Extract credentials to `.env.local`

**Güvenlik Notu:**

- Service account key ASLA commit edilmeyecek
- `.gitignore`'a eklenecek
- Production'da environment variables kullanılacak

#### 3.3 Firebase Admin SDK Setup

`src/lib/firebase/admin.ts`:

- Admin SDK initialize
- Singleton pattern ile instance yönetimi
- Auth & Firestore helpers

#### 3.4 Firebase Client SDK Setup

`src/lib/firebase/client.ts`:

- Client SDK initialize
- Auth instance export
- Firestore instance export

### 4. Authentication Sistemi

#### 4.1 Custom Claims Yapısı

Firebase'de kullanıcı oluşturulduğunda:

```json
{
  "uid": "abc123",
  "email": "admin@yaponarbirak.com",
  "customClaims": {
    "admin": true,
    "role": "super_admin"
  }
}
```

Firestore'da karşılığı:

```json
{
  "users/{uid}": {
    "email": "admin@yaponarbirak.com",
    "displayName": "Admin User",
    "role": "super_admin",
    "isAdmin": true,
    "createdAt": "2025-10-24T00:00:00Z",
    "lastLogin": "2025-10-24T00:00:00Z"
  }
}
```

#### 4.2 Login Flow

```
1. User enters email/password
   ↓
2. Firebase Auth signInWithEmailAndPassword
   ↓
3. Get ID Token with custom claims
   ↓
4. Verify admin claim exists
   ↓
5. Create session cookie (optional)
   ↓
6. Redirect to /dashboard
```

#### 4.3 Protected Routes

`middleware.ts`:

- Check authentication status
- Verify admin claim
- Redirect to login if unauthorized
- Allow access to protected routes

Protected paths:

- `/` (dashboard)
- `/users/*`
- `/notifications/*`
- `/content/*`
- `/analytics/*`

Public paths:

- `/login`
- `/api/auth/*`

### 5. İlk Admin Kullanıcısı Oluşturma

#### 5.1 CLI Script

`scripts/create-admin.js`:

```javascript
// Interactive script
// Asks: email, password, display name
// Creates user in Firebase Auth
// Sets custom claim: admin: true
// Creates user doc in Firestore
```

Kullanım:

```bash
node scripts/create-admin.js
```

#### 5.2 Alternatif: Environment Variables

`.env.local`:

```env
INITIAL_ADMIN_EMAIL=admin@yaponarbirak.com
INITIAL_ADMIN_PASSWORD=SecurePassword123!
```

First run'da otomatik oluşturma.

### 6. UI Components

#### 6.1 Login Page

**Özellikler:**

- Email/password form
- Form validation (Zod)
- Loading states
- Error handling
- "Remember me" checkbox (optional)
- Minimal ve temiz tasarım

#### 6.2 Dashboard Layout

**Components:**

- `Sidebar`: Sol navigasyon menüsü
- `Header`: Üst bar (breadcrumb, user menu)
- `UserMenu`: Avatar + dropdown
- `Main Content Area`: Children render

**Navigasyon Items:**

- 🏠 Dashboard
- 👥 Kullanıcılar
- 🔔 Bildirimler
- 📋 İçerik
- 📊 Analytics

#### 6.3 Auth Provider

React Context ile:

- `user` state
- `loading` state
- `login()` function
- `logout()` function
- `checkAdminStatus()` function

### 7. Type Definitions

```typescript
// src/types/index.ts

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: "super_admin" | "admin" | "moderator";
  isAdmin: boolean;
  createdAt: Date;
  lastLogin: Date;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}
```

## Implementation Order

**Gün 1-2:**

1. ✅ Paket kurulumları
2. ✅ Folder structure oluşturma
3. ✅ Firebase configuration
4. ✅ Shadcn/ui init + base components

**Gün 3:** 5. ✅ Firebase Admin & Client SDK setup 6. ✅ Create admin script 7. ✅ İlk admin kullanıcısı oluşturma

**Gün 4:** 8. ✅ Auth Provider implementation 9. ✅ Login page 10. ✅ Middleware setup

**Gün 5:** 11. ✅ Dashboard layout 12. ✅ Protected routes testing 13. ✅ Polish & bug fixes

## Başarı Kriterleri

Sprint 1 tamamlanmış sayılır when:

- [ ] Tüm paketler kurulu ve çalışıyor
- [ ] Firebase Admin SDK bağlantısı başarılı
- [ ] İlk admin kullanıcısı oluşturuldu
- [ ] Login sayfası çalışıyor
- [ ] Dashboard layout render ediliyor
- [ ] Middleware protected routes'ları koruyor
- [ ] Auth state yönetimi çalışıyor
- [ ] Dark mode toggle çalışıyor

## Güvenlik Considerations

- ❌ Service account key commit edilmeyecek
- ✅ Environment variables kullanılacak
- ✅ HTTPS only (production)
- ✅ Strong password validation
- ✅ Admin claim verification
- ✅ Rate limiting (future)
- ✅ Session timeout (future)

## Testing Checklist

- [ ] Admin kullanıcısı login olabiliyor
- [ ] Non-admin kullanıcı login olamıyor
- [ ] Protected routes unauthorized kullanıcıyı redirect ediyor
- [ ] Logout çalışıyor
- [ ] Auth state persistence çalışıyor
- [ ] Loading states doğru gösteriliyor
- [ ] Error messages kullanıcı dostu

## Notlar

- İlk sprint en kritik sprint - foundation atmak önemli
- Clean code & type safety'e dikkat edilmeli
- Documentation her adımda güncel tutulmalı
- Git commit messages descriptive olmalı

## Sonraki Sprint

RFC-003: Sprint 2 - Kullanıcı Yönetimi

- Kullanıcı listesi
- Arama & filtreleme
- Kullanıcı detay sayfası
- Ban/activate işlemleri

# RFC-003: Sprint 2 - Kullanıcı Yönetimi

**Durum:** Planlama 📋  
**Tarih:** 24 Ekim 2025  
**Yazar:** GitHub Copilot  
**İlgili RFC:** RFC-001, RFC-002

## Özet

Sprint 2'de Firestore'daki kullanıcıları görüntüleme, yönetme ve moderate etme özellikleri geliştirilecek. Bu, admin panelinin core functionality'lerinden biri.

## Hedefler

- ✅ Tüm kullanıcıları liste halinde görebilme
- ✅ Arama ve filtreleme yapabilme
- ✅ Sayfalama (pagination) ile performans
- ✅ Kullanıcı detay sayfası
- ✅ Kullanıcı durumu değiştirme (active/banned)
- ✅ Kullanıcı silme (soft delete)
- ✅ Temel kullanıcı istatistikleri

## Teknik Tasarım

### 1. Data Structure

#### Firestore Collection: `users`

```typescript
interface UserDocument {
  uid: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  profileType: "customer" | "serviceProvider";
  profileImageUrl?: string;

  // Address
  address?: {
    city: string;
    district: string;
    fullAddress: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };

  // Status
  isActive: boolean;
  isBanned: boolean;
  bannedAt?: Timestamp;
  bannedReason?: string;
  bannedBy?: string; // Admin UID

  // Service Provider specific
  serviceCategories?: string[];
  bio?: string;
  rating?: number;
  reviewCount?: number;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;

  // Stats
  jobsPosted?: number;
  jobsCompleted?: number;
  applicationsReceived?: number;
  applicationsSent?: number;
}
```

### 2. Page Structure

```
src/app/(dashboard)/users/
├── page.tsx                 # Ana liste sayfası
├── [id]/
│   ├── page.tsx            # Detay sayfası
│   └── loading.tsx         # Loading state
├── loading.tsx             # Liste loading
└── _components/
    ├── UserTable.tsx       # Tablo component
    ├── UserFilters.tsx     # Filter panel
    ├── UserStats.tsx       # İstatistik kartları
    ├── UserActions.tsx     # Action buttons
    └── UserDetailsCard.tsx # Detay card
```

### 3. Components

#### 3.1 UserTable Component

**Features:**

- Server-side sorting
- Pagination (50 items per page)
- Column visibility toggle
- Row selection (for bulk actions)
- Responsive design

**Columns:**

- Avatar + Full Name
- Email
- Phone
- Profile Type (Badge)
- Status (Active/Banned)
- Registration Date
- Last Login
- Actions (Dropdown)

**Tech:**

- TanStack Table v8
- Server Components
- Skeleton loading states

#### 3.2 UserFilters Component

**Filter Options:**

- Text search (name, email, phone)
- Profile Type (customer/serviceProvider)
- Status (active/banned/all)
- Registration date range
- City/District
- Has profile image (yes/no)

**Implementation:**

- URL search params
- Client component
- useTransition for smooth UX
- Filter badge chips

#### 3.3 UserStats Component

**Metrics:**

- 📊 Total Users
- 👤 Active Users
- 🔨 Service Providers
- 🛒 Customers
- 🚫 Banned Users
- 📈 New This Month

**Tech:**

- Server Component
- Firestore aggregation queries
- Card grid layout
- Trend indicators

### 4. Server Actions

```typescript
// src/app/(dashboard)/users/actions.ts

export async function getUsersWithPagination(params: {
  page: number;
  pageSize: number;
  search?: string;
  profileType?: string;
  status?: string;
  city?: string;
}): Promise<{
  users: UserDocument[];
  totalCount: number;
  hasMore: boolean;
}>;

export async function getUserById(userId: string): Promise<UserDocument | null>;

export async function updateUserStatus(
  userId: string,
  status: "active" | "banned",
  reason?: string
): Promise<{ success: boolean; error?: string }>;

export async function deleteUser(
  userId: string,
  hardDelete?: boolean
): Promise<{ success: boolean; error?: string }>;

export async function getUserStats(): Promise<{
  total: number;
  active: number;
  banned: number;
  serviceProviders: number;
  customers: number;
  newThisMonth: number;
}>;
```

### 5. User Detail Page Features

**Sections:**

1. **Profile Header**

   - Avatar (large)
   - Full name
   - Email, phone
   - Profile type badge
   - Status badge
   - Quick actions

2. **Basic Information**

   - Personal details
   - Contact info
   - Address with map
   - Registration date
   - Last login

3. **Activity Stats** (Service Provider)

   - Rating & review count
   - Jobs completed
   - Success rate
   - Earnings (if applicable)

4. **Content Overview**

   - Posted jobs count
   - Applications sent/received
   - Active contracts
   - Reviews given/received

5. **Activity Timeline**

   - Recent actions
   - Login history
   - Important events

6. **Admin Actions**
   - Ban/Unban with reason
   - Delete account
   - Send notification
   - View audit log
   - Reset password (future)

### 6. Moderation Features

#### Ban User Dialog

```typescript
interface BanUserForm {
  userId: string;
  reason: string;
  duration?: "permanent" | "7days" | "30days";
  notifyUser: boolean;
  banMessage?: string;
}
```

**Flow:**

1. Admin clicks "Ban User"
2. Dialog opens with form
3. Reason is required
4. Optional: Send notification to user
5. Confirm action
6. Update Firestore
7. Set custom claim (banned: true)
8. Log action to audit log
9. Toast notification

#### Delete User

- Soft delete (default): `isDeleted: true`
- Hard delete (optional): Remove all data
- Confirmation dialog with warning
- Can't delete users with active contracts
- Cascading delete for user content

## UI/UX Design

### Color Coding

- 🟢 Active users: Green badge
- 🔴 Banned users: Red badge
- 🟡 Pending verification: Yellow badge
- ⚫ Deleted: Gray badge

### Icons (Lucide)

- `Users` - Users page
- `Search` - Search box
- `Filter` - Filter panel
- `MoreVertical` - Actions menu
- `Ban` - Ban action
- `Trash2` - Delete action
- `UserCheck` - Activate action
- `Mail` - Send notification

### Loading States

- Skeleton cards for stats
- Skeleton table rows
- Shimmer effect
- Suspense boundaries

## Performance Optimization

### 1. Firestore Queries

```typescript
// Indexed queries
// composite index: profileType + isActive + createdAt

const usersQuery = query(
  collection(db, "users"),
  where("profileType", "==", "serviceProvider"),
  where("isActive", "==", true),
  orderBy("createdAt", "desc"),
  limit(50)
);
```

### 2. Pagination Strategy

- Cursor-based pagination (startAfter)
- Cache previous queries
- Prefetch next page
- Show loading skeleton

### 3. Caching

- TanStack Query cache
- Stale-while-revalidate
- Optimistic updates
- Cache invalidation on mutations

## Security & Permissions

### Firestore Rules Update

```javascript
match /users/{userId} {
  // Admin can read all users
  allow read: if request.auth.token.admin == true;

  // Admin can update user status
  allow update: if request.auth.token.admin == true &&
                request.resource.data.diff(resource.data).affectedKeys()
                .hasOnly(['isActive', 'isBanned', 'bannedAt', 'bannedReason', 'bannedBy', 'updatedAt']);

  // Admin can delete (soft delete only)
  allow update: if request.auth.token.admin == true &&
                request.resource.data.isDeleted == true;
}
```

### Admin Actions Logging

```typescript
// New collection: admin_actions
{
  actionId: string;
  adminUid: string;
  adminEmail: string;
  actionType: 'ban_user' | 'unban_user' | 'delete_user' | 'update_user';
  targetUserId: string;
  reason?: string;
  metadata: object;
  timestamp: Timestamp;
}
```

## Implementation Timeline

**Gün 1:**

- [ ] UserStats component & queries
- [ ] Basic table setup (TanStack Table)
- [ ] Server action for getUsersWithPagination

**Gün 2:**

- [ ] UserFilters component
- [ ] Search & filter functionality
- [ ] Pagination implementation

**Gün 3:**

- [ ] User detail page
- [ ] getUserById server action
- [ ] Profile sections layout

**Gün 4:**

- [ ] Ban/Unban functionality
- [ ] Delete user functionality
- [ ] Confirmation dialogs
- [ ] Admin actions logging

**Gün 5:**

- [ ] Polish UI/UX
- [ ] Loading states
- [ ] Error handling
- [ ] Testing

## Testing Checklist

- [ ] Liste tüm kullanıcıları gösteriyor
- [ ] Arama çalışıyor (name, email)
- [ ] Filtereler doğru çalışıyor
- [ ] Pagination next/prev çalışıyor
- [ ] Detay sayfası render oluyor
- [ ] Ban user işlemi çalışıyor
- [ ] Unban user işlemi çalışıyor
- [ ] Delete confirmation dialog açılıyor
- [ ] Stats doğru hesaplanıyor
- [ ] Mobile responsive

## Başarı Kriterleri

Sprint 2 tamamlandı when:

- [ ] Kullanıcı listesi performanslı çalışıyor
- [ ] Arama ve filtreleme sorunsuz
- [ ] Detay sayfası tüm bilgileri gösteriyor
- [ ] Ban/unban işlemleri çalışıyor
- [ ] Admin actions loglanıyor
- [ ] UI responsive ve kullanıcı dostu

## Sonraki Sprint

RFC-004: Sprint 3 - Bildirim Sistemi

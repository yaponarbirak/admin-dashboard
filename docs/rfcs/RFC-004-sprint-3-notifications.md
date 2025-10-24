# RFC-004: Sprint 3 - Bildirim Sistemi

**Durum:** Planlama 📋  
**Tarih:** 24 Ekim 2025  
**Yazar:** GitHub Copilot  
**İlgili RFC:** RFC-001, RFC-002, RFC-003

## Özet

Sprint 3'te Firebase Cloud Messaging (FCM) kullanarak kullanıcılara toplu veya filtrelenmiş bildirim gönderme sistemi geliştirilecek.

## Hedefler

- ✅ Tüm kullanıcılara toplu bildirim gönderme
- ✅ Filtrelenmiş kullanıcılara bildirim gönderme
- ✅ Bildirim template sistemi
- ✅ Schedule edilmiş bildirimler
- ✅ Bildirim geçmişi ve istatistikleri
- ✅ Önizleme özelliği

## Teknik Tasarım

### 1. Data Structures

#### FCM Token Management

```typescript
// Firestore: users/{userId}
interface UserDocument {
  // ... existing fields
  fcmTokens?: string[]; // Multiple devices support
  notificationSettings?: {
    enabled: boolean;
    categories: {
      jobUpdates: boolean;
      messages: boolean;
      marketing: boolean;
      systemAlerts: boolean;
    };
  };
}
```

#### Notification History

```typescript
// Firestore: notification_campaigns/{campaignId}
interface NotificationCampaign {
  campaignId: string;
  title: string;
  body: string;
  imageUrl?: string;
  actionUrl?: string;

  // Targeting
  targetType: "all" | "filtered" | "specific";
  filters?: {
    profileType?: "customer" | "serviceProvider";
    cities?: string[];
    districts?: string[];
    registeredAfter?: Timestamp;
    registeredBefore?: Timestamp;
    isActive?: boolean;
    hasCompletedJobs?: boolean;
  };
  specificUserIds?: string[];

  // Status
  status: "draft" | "scheduled" | "sending" | "completed" | "failed";
  scheduledFor?: Timestamp;

  // Stats
  totalTargeted: number;
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;

  // Metadata
  createdBy: string; // Admin UID
  createdByEmail: string;
  createdAt: Timestamp;
  sentAt?: Timestamp;
  completedAt?: Timestamp;

  // Template
  templateId?: string;
  templateVariables?: Record<string, string>;
}
```

#### Notification Templates

```typescript
// Firestore: notification_templates/{templateId}
interface NotificationTemplate {
  templateId: string;
  name: string;
  description: string;
  category: "marketing" | "transactional" | "system";

  // Content with variables
  title: string; // e.g., "Merhaba {{userName}}!"
  body: string; // e.g., "{{jobCount}} yeni iş ilanı var!"
  imageUrl?: string;
  actionUrl?: string;

  variables: string[]; // e.g., ['userName', 'jobCount']

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
  usageCount: number;
}
```

### 2. Page Structure

```
src/app/(dashboard)/notifications/
├── page.tsx                     # Overview & quick send
├── send/
│   └── page.tsx                # Detailed send form
├── templates/
│   ├── page.tsx                # Template list
│   ├── [id]/page.tsx           # Template edit
│   └── new/page.tsx            # Create template
├── history/
│   ├── page.tsx                # Campaign history
│   └── [id]/page.tsx           # Campaign details
├── scheduled/
│   └── page.tsx                # Scheduled campaigns
└── _components/
    ├── NotificationForm.tsx     # Main send form
    ├── FilterBuilder.tsx        # Visual filter builder
    ├── TemplateSelector.tsx     # Template picker
    ├── PreviewCard.tsx          # Notification preview
    ├── CampaignStats.tsx        # Stats cards
    └── SchedulePicker.tsx       # Date/time picker
```

### 3. Core Components

#### 3.1 NotificationForm

**Features:**

- Step-by-step wizard (4 steps)
- Real-time preview
- Target audience counter
- Template support
- Media upload

**Steps:**

1. **Audience** - Select target users
2. **Content** - Write notification
3. **Preview** - Review before send
4. **Schedule** - Send now or later

**Validation (Zod):**

```typescript
const notificationSchema = z.object({
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(500),
  imageUrl: z.string().url().optional(),
  actionUrl: z.string().optional(),
  targetType: z.enum(['all', 'filtered', 'specific']),
  filters: z.object({...}).optional(),
  scheduledFor: z.date().optional(),
});
```

#### 3.2 FilterBuilder

**Visual Query Builder:**

```typescript
interface FilterRule {
  field: string;
  operator: "equals" | "in" | "greaterThan" | "lessThan";
  value: any;
}

interface FilterGroup {
  rules: FilterRule[];
  combinator: "AND" | "OR";
}
```

**Filterable Fields:**

- Profile Type (customer/serviceProvider)
- Location (city, district)
- Registration Date
- Active Status
- Has Completed Jobs
- Rating (for service providers)
- Last Login Date

**Preview:**

- Live count of matching users
- Sample users list (first 5)
- "Test send" to admin only

#### 3.3 PreviewCard

**Mobile Phone Mockup:**

- Shows how notification will look
- Dynamic content update
- Image preview
- Action button preview
- Different device sizes (iOS/Android)

### 4. Server Actions & API Routes

```typescript
// src/app/(dashboard)/notifications/actions.ts

export async function sendNotification(
  campaign: NotificationCampaign
): Promise<{ success: boolean; campaignId: string; error?: string }>;

export async function scheduleNotification(
  campaign: NotificationCampaign
): Promise<{ success: boolean; campaignId: string }>;

export async function getTargetedUsers(
  filters: NotificationCampaign["filters"]
): Promise<{ users: User[]; count: number }>;

export async function getCampaignHistory(
  page: number,
  pageSize: number
): Promise<{ campaigns: NotificationCampaign[]; total: number }>;

export async function cancelScheduledCampaign(
  campaignId: string
): Promise<{ success: boolean }>;

export async function testNotification(
  adminUid: string,
  notification: { title: string; body: string; imageUrl?: string }
): Promise<{ success: boolean }>;
```

### 5. Firebase Cloud Functions

#### Send Notification Function

```javascript
// functions/src/notifications.js

exports.sendBulkNotification = functions.https.onCall(async (data, context) => {
  // Verify admin
  if (!context.auth?.token?.admin) {
    throw new functions.https.HttpsError("permission-denied");
  }

  const { campaignId } = data;
  const campaign = await getCampaign(campaignId);

  // Get target users
  const users = await getTargetedUsers(campaign.filters);

  // Extract FCM tokens
  const tokens = users.flatMap((u) => u.fcmTokens || []).filter(Boolean);

  // Send in batches (500 per batch - FCM limit)
  const batches = chunk(tokens, 500);
  const results = [];

  for (const batch of batches) {
    const result = await admin.messaging().sendMulticast({
      tokens: batch,
      notification: {
        title: campaign.title,
        body: campaign.body,
        imageUrl: campaign.imageUrl,
      },
      data: {
        actionUrl: campaign.actionUrl || "",
        campaignId: campaign.campaignId,
      },
    });
    results.push(result);
  }

  // Update campaign stats
  await updateCampaignStats(campaignId, results);

  // Store in user notifications
  await storeNotifications(users, campaign);

  return { success: true };
});
```

#### Scheduled Notification Function

```javascript
// Cron job - runs every minute
exports.processScheduledNotifications = functions.pubsub
  .schedule("every 1 minutes")
  .onRun(async (context) => {
    const now = admin.firestore.Timestamp.now();

    // Find campaigns scheduled for now
    const campaigns = await db
      .collection("notification_campaigns")
      .where("status", "==", "scheduled")
      .where("scheduledFor", "<=", now)
      .get();

    for (const doc of campaigns.docs) {
      await sendBulkNotification({ campaignId: doc.id });
    }
  });
```

### 6. Template System

#### Template Variables

```typescript
const AVAILABLE_VARIABLES = {
  userName: "Kullanıcı adı",
  userEmail: "E-posta",
  jobCount: "İş sayısı",
  cityName: "Şehir",
  appName: "Uygulama adı",
};

// Template parsing
function parseTemplate(
  template: string,
  variables: Record<string, string>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return variables[key] || "";
  });
}
```

#### Predefined Templates

1. **Hoş Geldiniz** - Yeni kullanıcı
2. **Yeni İş İlanı** - Yeni iş yayınlandı
3. **Başvuru Onayı** - Başvuru kabul edildi
4. **Tamamlanan İş** - İş başarıyla tamamlandı
5. **Promosyon** - Özel kampanya
6. **Sistem Duyurusu** - Önemli sistem mesajı

### 7. Statistics & Analytics

#### Campaign Stats Card

```typescript
interface CampaignStats {
  totalCampaigns: number;
  sentToday: number;
  sentThisWeek: number;
  sentThisMonth: number;
  totalRecipients: number;
  averageDeliveryRate: number;
  scheduledCount: number;
}
```

#### Campaign Detail Stats

- Total Targeted
- Successfully Sent
- Delivered (if available)
- Failed
- Delivery Rate %
- Send Duration
- Created by (admin)

## UI/UX Flow

### Quick Send Flow (Simple)

```
1. Dashboard → Notifications
   ↓
2. Click "Hızlı Gönder"
   ↓
3. Select: All Users / Service Providers / Customers
   ↓
4. Enter title & body
   ↓
5. Preview
   ↓
6. Confirm & Send
```

### Advanced Send Flow

```
1. Notifications → Send
   ↓
2. Build custom filters
   ↓
3. See live user count
   ↓
4. Choose template or custom
   ↓
5. Add image/action URL
   ↓
6. Preview notification
   ↓
7. Test send to yourself
   ↓
8. Schedule or send now
   ↓
9. Confirm
```

## Performance & Limits

### FCM Limitations

- Max 500 tokens per multicast
- Max 1,000,000 messages per second (project limit)
- Max 4KB payload size

### Optimization Strategies

- Batch sending (500 per batch)
- Queue system for large campaigns
- Rate limiting
- Progress tracking
- Retry failed sends

### Database Impact

- Use batch writes
- Index on required fields
- Pagination for history
- Archive old campaigns (>90 days)

## Security

### Permissions

- Only admins with `notifications:send` permission
- Audit logging for all sends
- Rate limiting per admin
- Require confirmation for >1000 recipients

### Validation

- Input sanitization
- XSS prevention
- URL validation
- Image size limits (max 1MB)

## Implementation Timeline

**Gün 1:**

- [ ] NotificationForm setup
- [ ] Basic send functionality
- [ ] "Send to All" feature

**Gün 2:**

- [ ] FilterBuilder component
- [ ] Target user counting
- [ ] Filtered send implementation

**Gün 3:**

- [ ] Template system
- [ ] Template CRUD
- [ ] Template selector

**Gün 4:**

- [ ] Schedule feature
- [ ] Preview component
- [ ] Test send

**Gün 5:**

- [ ] History page
- [ ] Campaign stats
- [ ] Polish & testing

## Testing Checklist

- [ ] Tüm kullanıcılara bildirim gidiyor
- [ ] Filtrelenmiş gönderim çalışıyor
- [ ] User count doğru hesaplanıyor
- [ ] Preview doğru görünüyor
- [ ] Template değişkenler parse ediliyor
- [ ] Scheduled bildirimler zamanında gidiyor
- [ ] Stats doğru hesaplanıyor
- [ ] Test send çalışıyor
- [ ] Büyük kampanyalar (10k+ users) handle ediliyor

## Başarı Kriterleri

Sprint 3 tamamlandı when:

- [ ] Toplu bildirim gönderilebiliyor
- [ ] Filter builder çalışıyor
- [ ] Template sistemi kullanılabilir
- [ ] Schedule özelliği çalışıyor
- [ ] History sayfası bilgilendirici
- [ ] Performance sorunsuz

## Sonraki Sprint

RFC-005: Sprint 4 - İçerik Yönetimi

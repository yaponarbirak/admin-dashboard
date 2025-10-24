import { Timestamp } from "firebase/firestore";

// ============================================
// USER TYPES
// ============================================

export type ProfileType = "customer" | "serviceProvider";
export type AdminRole = "super_admin" | "admin" | "moderator";

export interface Address {
  city: string;
  district: string;
  fullAddress: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface UserDocument {
  uid: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  profileType: ProfileType;
  profileImageUrl?: string;

  // Address
  address?: Address;

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

  // FCM Tokens
  fcmTokens?: string[];
}

// ============================================
// ADMIN TYPES
// ============================================

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: AdminRole;
  isAdmin: boolean;
  createdAt: Date;
  lastLogin: Date;
  photoURL?: string;
}

export interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationTargetType = "all" | "filtered" | "specific";
export type NotificationStatus =
  | "draft"
  | "scheduled"
  | "sending"
  | "completed"
  | "failed";
export type NotificationCategory = "marketing" | "transactional" | "system";

export interface NotificationFilters {
  profileType?: "customer" | "serviceProvider";
  cities?: string[];
  districts?: string[];
  registeredAfter?: Date;
  registeredBefore?: Date;
  isActive?: boolean;
  hasCompletedJobs?: boolean;
}

export interface NotificationCampaign {
  campaignId: string;
  title: string;
  body: string;
  imageUrl?: string;
  actionUrl?: string;

  // Targeting
  targetType: NotificationTargetType;
  filters?: NotificationFilters;
  specificUserIds?: string[];
  targetCount?: number; // For scheduled notifications

  // Status
  status: NotificationStatus;
  scheduledFor?: Timestamp;

  // Stats
  totalTargeted: number;
  totalSent: number;
  sentCount?: number; // Alias for totalSent
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

export interface NotificationTemplate {
  templateId: string;
  name: string;
  description: string;
  category: NotificationCategory;

  // Content with variables
  title: string;
  body: string;
  imageUrl?: string;
  actionUrl?: string;

  variables: string[];

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
  usageCount: number;
}

export interface NotificationFormData {
  title: string;
  body: string;
  imageUrl?: string;
  actionUrl?: string;
  targetType: NotificationTargetType;
  filters?: NotificationFilters;
  specificUserIds?: string[];
  scheduledFor?: Date;
  templateId?: string;
}

// ============================================
// ADMIN ACTION LOG
// ============================================

export type AdminActionType =
  | "ban_user"
  | "unban_user"
  | "delete_user"
  | "update_user"
  | "send_notification"
  | "delete_job"
  | "delete_application"
  | "delete_review";

export interface AdminAction {
  actionId: string;
  adminUid: string;
  adminEmail: string;
  actionType: AdminActionType;
  targetUserId?: string;
  targetResourceId?: string;
  reason?: string;
  metadata: Record<string, any>;
  timestamp: Timestamp;
  ipAddress?: string;
  userAgent?: string;
}

// ============================================
// STATS TYPES
// ============================================

export interface UserStats {
  total: number;
  active: number;
  banned: number;
  serviceProviders: number;
  customers: number;
  newThisMonth: number;
  newThisWeek: number;
}

export interface DashboardStats {
  users: UserStats;
  jobs: {
    total: number;
    active: number;
    completed: number;
    newToday: number;
  };
  applications: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
  };
  notifications: {
    sentToday: number;
    sentThisWeek: number;
    sentThisMonth: number;
  };
}

// ============================================
// FORM TYPES
// ============================================

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface BanUserFormData {
  userId: string;
  reason: string;
  duration?: "permanent" | "7days" | "30days";
  notifyUser: boolean;
  banMessage?: string;
}

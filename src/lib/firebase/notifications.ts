import {
  collection,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
  serverTimestamp,
  getDocs,
  getDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "./client";
import { auth } from "./client";
import type {
  NotificationCampaign,
  NotificationFormData,
  NotificationFilters,
  UserDocument,
} from "@/types";

/**
 * Template değişkenlerini kullanıcı verisiyle değiştirir
 * Örnek: "Merhaba {{fullName}}" -> "Merhaba Ahmet Yılmaz"
 */
function replaceTemplateVariables(
  text: string,
  userData: Partial<UserDocument>
): string {
  let result = text;

  // Desteklenen değişkenler
  const variables: Record<string, string> = {
    fullName: userData.fullName || "Kullanıcı",
    firstName: userData.fullName?.split(" ")[0] || "Kullanıcı",
    email: userData.email || "",
    phoneNumber: userData.phoneNumber || "",
    profileType:
      userData.profileType === "serviceProvider"
        ? "Hizmet Sağlayıcı"
        : "Müşteri",
    city: userData.address?.city || "",
    district: userData.address?.district || "",
    rating: userData.rating?.toFixed(1) || "0.0",
    reviewCount: userData.reviewCount?.toString() || "0",
    jobsCompleted: userData.jobsCompleted?.toString() || "0",
  };

  // Tüm {{variable}} formatındaki değişkenleri değiştir
  Object.keys(variables).forEach((key) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    result = result.replace(regex, variables[key]);
  });

  return result;
}

/**
 * Firestore'dan hedef kullanıcıları getirir
 */
async function getTargetedUsers(
  targetType: "all" | "filtered" | "specific",
  filters?: NotificationFilters,
  specificUserIds?: string[]
): Promise<string[]> {
  if (targetType === "specific" && specificUserIds) {
    return specificUserIds;
  }

  const usersRef = collection(db, "users");
  let q = query(usersRef);

  // Apply filters
  if (targetType === "filtered" && filters) {
    if (filters.profileType) {
      q = query(q, where("profileType", "==", filters.profileType));
    }

    if (filters.isActive !== undefined) {
      q = query(q, where("isActive", "==", filters.isActive));
    }

    // Ban edilmiş kullanıcıları hariç tut
    q = query(q, where("isBanned", "==", false));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.id);
}

/**
 * FCM tokenleri olan kullanıcıları filtreler
 */
async function getUsersWithFCMTokens(userIds: string[]): Promise<
  Array<{
    uid: string;
    tokens: string[];
  }>
> {
  const usersRef = collection(db, "users");
  const usersWithTokens: Array<{ uid: string; tokens: string[] }> = [];

  // Firestore'un 'in' sorgusu max 10 item alır, chunk'lara ayır
  const chunkSize = 10;
  for (let i = 0; i < userIds.length; i += chunkSize) {
    const chunk = userIds.slice(i, i + chunkSize);
    const q = query(usersRef, where("__name__", "in", chunk));
    const snapshot = await getDocs(q);

    snapshot.docs.forEach((doc) => {
      const data = doc.data();

      // fcmToken (tekil) veya fcmTokens (array) olabilir
      let tokens: string[] = [];

      if (
        data.fcmTokens &&
        Array.isArray(data.fcmTokens) &&
        data.fcmTokens.length > 0
      ) {
        tokens = data.fcmTokens;
      } else if (data.fcmToken && typeof data.fcmToken === "string") {
        tokens = [data.fcmToken];
      }

      if (tokens.length > 0) {
        usersWithTokens.push({
          uid: doc.id,
          tokens,
        });
        console.log(`✅ User ${doc.id} has ${tokens.length} token(s)`);
      } else {
        console.log(`⚠️  User ${doc.id} (${data.email}) has no FCM token`);
      }
    });
  }

  return usersWithTokens;
}

/**
 * Bildirim kampanyası oluşturur (Firestore'a kaydeder)
 */
export async function createNotificationCampaign(
  formData: NotificationFormData,
  createdBy: string,
  createdByEmail: string
): Promise<string> {
  const campaignsRef = collection(db, "notification_campaigns");

  // Hedef kullanıcıları al
  const targetedUserIds = await getTargetedUsers(
    formData.targetType,
    formData.filters,
    formData.specificUserIds
  );

  // Firestore'a kaydedilecek campaign objesi - undefined değerleri temizle
  const campaignData: any = {
    title: formData.title,
    body: formData.body,
    targetType: formData.targetType,
    status: formData.scheduledFor ? "scheduled" : "sending",
    totalTargeted: targetedUserIds.length,
    totalSent: 0,
    totalDelivered: 0,
    totalFailed: 0,
    createdBy,
    createdByEmail,
    createdAt: serverTimestamp(),
  };

  // Opsiyonel alanları sadece değer varsa ekle
  if (formData.imageUrl) {
    campaignData.imageUrl = formData.imageUrl;
  }

  if (formData.actionUrl) {
    campaignData.actionUrl = formData.actionUrl;
  }

  if (formData.filters && Object.keys(formData.filters).length > 0) {
    campaignData.filters = formData.filters;
  }

  if (formData.specificUserIds && formData.specificUserIds.length > 0) {
    campaignData.specificUserIds = formData.specificUserIds;
  }

  if (formData.scheduledFor) {
    campaignData.scheduledFor = Timestamp.fromDate(formData.scheduledFor);
  }

  if (formData.templateId) {
    campaignData.templateId = formData.templateId;
  }

  const docRef = await addDoc(campaignsRef, campaignData);
  return docRef.id;
}

/**
 * Bildirimi hemen gönderir (Firebase Cloud Functions'a event tetikler)
 */
export async function sendNotificationNow(
  formData: NotificationFormData,
  createdBy: string,
  createdByEmail: string
): Promise<{
  campaignId: string;
  targetedCount: number;
}> {
  // 1. Kampanya oluştur
  const campaignId = await createNotificationCampaign(
    formData,
    createdBy,
    createdByEmail
  );

  // 2. Hedef kullanıcıları al
  const targetedUserIds = await getTargetedUsers(
    formData.targetType,
    formData.filters,
    formData.specificUserIds
  );

  console.log("🎯 Targeted users:", targetedUserIds.length);

  // 3. FCM tokenleri olan kullanıcıları filtrele
  const usersWithTokens = await getUsersWithFCMTokens(targetedUserIds);

  console.log("📱 Users with FCM tokens:", {
    total: usersWithTokens.length,
    totalTokens: usersWithTokens.reduce((sum, u) => sum + u.tokens.length, 0),
  });

  // Development mode: Token yoksa mock token ekle
  const isDevelopment = process.env.NODE_ENV === "development";

  if (usersWithTokens.length === 0) {
    if (isDevelopment) {
      console.warn("⚠️  DEV MODE: No FCM tokens found, using mock data");

      // Mock data ile devam et (gerçek notification gönderilmez)
      const mockUsersWithTokens = targetedUserIds.slice(0, 5).map((uid) => ({
        uid,
        tokens: [`mock_token_${uid}_${Date.now()}`],
      }));

      // Campaign'i completed olarak işaretle (mock)
      const campaignRef = doc(db, "notification_campaigns", campaignId);
      await updateDoc(campaignRef, {
        status: "completed",
        sentAt: serverTimestamp(),
        completedAt: serverTimestamp(),
        totalSent: mockUsersWithTokens.length,
        totalDelivered: mockUsersWithTokens.length,
        totalFailed: 0,
      });

      return {
        campaignId,
        targetedCount: targetedUserIds.length,
      };
    } else {
      // Production'da hata ver
      const campaignRef = doc(db, "notification_campaigns", campaignId);
      await updateDoc(campaignRef, {
        status: "failed",
        completedAt: serverTimestamp(),
      });

      throw new Error(
        "Hiçbir kullanıcıda FCM token bulunamadı. Kullanıcılar mobil uygulamayı yüklememiş olabilir."
      );
    }
  }

  // 4. Campaign'i güncelle - gönderiliyor olarak işaretle
  const campaignRef = doc(db, "notification_campaigns", campaignId);
  await updateDoc(campaignRef, {
    status: "sending",
    sentAt: serverTimestamp(),
  });

  // 5. Admin SDK ile bildirim gönder (server-side)
  try {
    // Get current user's ID token
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const idToken = await currentUser.getIdToken();

    // Mesajda değişken var mı kontrol et ({{variable}} formatı)
    const hasVariables =
      /\{\{[a-zA-Z]+\}\}/.test(formData.title) ||
      /\{\{[a-zA-Z]+\}\}/.test(formData.body);

    // Request payload'u hazırla
    const requestPayload = {
      campaignId,
      title: formData.title,
      body: formData.body,
      imageUrl: formData.imageUrl,
      actionUrl: formData.actionUrl,
      hasVariables, // Backend'e değişken olduğunu bildir
      users: usersWithTokens,
    };

    console.log("📤 Sending notification request:", {
      campaignId,
      title: requestPayload.title,
      bodyLength: requestPayload.body?.length,
      hasVariables,
      userCount: usersWithTokens.length,
      tokenCount: usersWithTokens.reduce((sum, u) => sum + u.tokens.length, 0),
    });

    const response = await fetch("/api/notifications/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData.error || `HTTP ${response.status}: ${response.statusText}`;
      console.error("API Error:", errorData);
      throw new Error(`Failed to send notification: ${errorMessage}`);
    }

    const result = await response.json();

    // 6. Campaign'i tamamlandı olarak işaretle
    await updateDoc(campaignRef, {
      status: "completed",
      completedAt: serverTimestamp(),
      totalSent: result.successCount,
      totalFailed: result.failureCount,
      totalDelivered: result.successCount, // FCM success = delivered kabul ediyoruz
    });

    return {
      campaignId,
      targetedCount: targetedUserIds.length,
    };
  } catch (error) {
    // Hata durumunda campaign'i failed olarak işaretle
    await updateDoc(campaignRef, {
      status: "failed",
      completedAt: serverTimestamp(),
    });

    throw error;
  }
}

/**
 * Zamanlanmış bildirim oluşturur
 */
export async function scheduleNotification(
  formData: NotificationFormData,
  createdBy: string,
  createdByEmail: string
): Promise<string> {
  if (!formData.scheduledFor) {
    throw new Error("scheduledFor is required for scheduled notifications");
  }

  const campaignId = await createNotificationCampaign(
    formData,
    createdBy,
    createdByEmail
  );

  // Cloud Function bu zamanlanmış kampanyaları kontrol edip gönderecek
  // Cron job veya Cloud Scheduler ile periyodik olarak kontrol edilir

  return campaignId;
}

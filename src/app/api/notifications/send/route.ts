import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getMessaging } from "firebase-admin/messaging";
import { getFirestore } from "firebase-admin/firestore";
import { adminApp } from "@/lib/firebase/admin";

interface SendNotificationRequest {
  campaignId: string;
  title: string;
  body: string;
  imageUrl?: string;
  actionUrl?: string;
  hasVariables?: boolean; // Şablonda değişken var mı?
  users: Array<{
    uid: string;
    tokens: string[];
  }>;
}

/**
 * Template değişkenlerini kullanıcı verisiyle değiştirir
 */
function replaceVariables(text: string, userData: any): string {
  let result = text;

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

  Object.keys(variables).forEach((key) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    result = result.replace(regex, variables[key]);
  });

  return result;
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔔 Notification API called");

    // 1. Auth kontrolü - sadece admin kullanıcılar gönderebilir
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.error("❌ No Authorization header");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const auth = getAuth(adminApp);

    try {
      const decodedToken = await auth.verifyIdToken(token);
      console.log("✅ Token verified for user:", decodedToken.uid);

      // Admin kontrolü
      if (!decodedToken.admin) {
        console.error("❌ User is not admin:", decodedToken.uid);
        return NextResponse.json(
          { error: "Forbidden - Admin access required" },
          { status: 403 }
        );
      }
    } catch (error) {
      console.error("❌ Token verification failed:", error);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // 2. Request body'yi parse et
    const body: SendNotificationRequest = await request.json();
    const {
      title,
      body: messageBody,
      imageUrl,
      actionUrl,
      users,
      hasVariables,
    } = body;

    console.log("📝 Request body received:", {
      hasTitle: !!title,
      hasBody: !!messageBody,
      hasUsers: !!users,
      title,
      messageBody: messageBody?.substring(0, 50),
      userCount: users?.length,
      rawBody: JSON.stringify(body).substring(0, 200),
    });

    if (!title || !messageBody || !users || users.length === 0) {
      console.error("❌ Missing required fields:", {
        hasTitle: !!title,
        hasMessageBody: !!messageBody,
        hasUsers: !!users,
        usersLength: users?.length,
      });
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: {
            title: !!title,
            body: !!messageBody,
            users: !!users,
            usersLength: users?.length,
          },
        },
        { status: 400 }
      );
    }

    // 3. FCM mesajını hazırla
    const messaging = getMessaging(adminApp);
    const firestore = getFirestore(adminApp);

    console.log("🎯 Processing users:", users.length);
    console.log("📝 Has variables:", hasVariables);

    let successCount = 0;
    let failureCount = 0;

    // Eğer değişkenler varsa, her kullanıcı için özelleştirilmiş mesaj gönder
    if (hasVariables) {
      console.log("🔄 Sending personalized notifications with variables");

      for (const user of users) {
        try {
          // Kullanıcı verisini Firestore'dan çek
          const userDoc = await firestore
            .collection("users")
            .doc(user.uid)
            .get();
          const userData = userDoc.data() || {};

          // Değişkenleri kullanıcı verisiyle değiştir
          const personalizedTitle = replaceVariables(title, userData);
          const personalizedBody = replaceVariables(messageBody, userData);

          console.log(
            `📤 Sending to ${user.uid}:`,
            personalizedTitle.substring(0, 30)
          );

          // Her kullanıcıya özel mesaj gönder
          for (const token of user.tokens) {
            try {
              await messaging.send({
                token,
                notification: {
                  title: personalizedTitle,
                  body: personalizedBody,
                  imageUrl,
                },
                data: {
                  campaignId: body.campaignId,
                  actionUrl: actionUrl || "",
                },
                android: {
                  priority: "high",
                  notification: {
                    sound: "default",
                    channelId: "default",
                  },
                },
                apns: {
                  payload: {
                    aps: {
                      sound: "default",
                      badge: 1,
                    },
                  },
                },
              });
              successCount++;
            } catch (error: any) {
              console.error(`❌ Failed to send to token:`, error.message);
              failureCount++;
            }
          }
        } catch (error: any) {
          console.error(
            `❌ Failed to process user ${user.uid}:`,
            error.message
          );
          failureCount += user.tokens.length;
        }
      }
    } else {
      // Değişken yoksa, toplu gönderim yap (daha hızlı)
      console.log("📤 Sending batch notifications without variables");

      const tokens: string[] = [];
      users.forEach((user) => {
        tokens.push(...user.tokens);
      });

      console.log("🎯 Total FCM tokens:", tokens.length);

      if (tokens.length === 0) {
        console.warn("⚠️ No FCM tokens found");
        return NextResponse.json({
          successCount: 0,
          failureCount: 0,
          message: "No FCM tokens found",
        });
      }

      const notification: any = {
        title,
        body: messageBody,
      };

      if (imageUrl) {
        notification.imageUrl = imageUrl;
      }

      const data: Record<string, string> = {
        campaignId: body.campaignId,
      };

      if (actionUrl) {
        data.actionUrl = actionUrl;
      }

      // Multicast mesaj gönder (max 500 token per request)
      const batchSize = 500;

      for (let i = 0; i < tokens.length; i += batchSize) {
        const batchTokens = tokens.slice(i, i + batchSize);

        try {
          const response = await messaging.sendEachForMulticast({
            tokens: batchTokens,
            notification,
            data,
            android: {
              priority: "high",
              notification: {
                sound: "default",
                channelId: "default",
              },
            },
            apns: {
              payload: {
                aps: {
                  sound: "default",
                  badge: 1,
                },
              },
            },
          });

          successCount += response.successCount;
          failureCount += response.failureCount;

          // Geçersiz token'ları temizle (opsiyonel)
          if (response.failureCount > 0) {
            const failedTokens: string[] = [];
            response.responses.forEach((resp, idx) => {
              if (!resp.success) {
                const error = resp.error;
                // Token geçersizse veya kayıt bulunamazsa
                if (
                  error?.code === "messaging/invalid-registration-token" ||
                  error?.code === "messaging/registration-token-not-registered"
                ) {
                  failedTokens.push(batchTokens[idx]);
                }
              }
            });

            // TODO: Geçersiz token'ları Firestore'dan temizle
            console.log(`❌ Failed tokens: ${failedTokens.length}`);
          }
        } catch (error) {
          console.error("❌ Error sending batch:", error);
          failureCount += batchTokens.length;
        }
      }
    }

    console.log("✅ Notification sent successfully:", {
      successCount,
      failureCount,
    });

    return NextResponse.json({
      successCount,
      failureCount,
      message: `Sent to ${successCount} devices, ${failureCount} failed`,
    });
  } catch (error) {
    console.error("❌ Error in send notification API:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Test için kullanıcılara mock FCM token ekleyen script
// Terminal'den çalıştır: node yob-admin/scripts/add-mock-fcm-tokens.js

const admin = require("firebase-admin");
const serviceAccount = require("./yaponarbirak-2a7dc-firebase-adminsdk-fbsvc-e9b64c60ea.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function addMockFCMTokens() {
  try {
    console.log("🔍 Fetching active users...");

    const usersSnapshot = await db
      .collection("users")
      .where("isActive", "==", true)
      .limit(10) // İlk 10 aktif kullanıcı
      .get();

    if (usersSnapshot.empty) {
      console.log("❌ No active users found");
      return;
    }

    console.log(`✅ Found ${usersSnapshot.size} active users`);

    const batch = db.batch();
    let count = 0;

    usersSnapshot.forEach((doc) => {
      const userData = doc.data();

      // Zaten token varsa atla
      if (userData.fcmTokens && userData.fcmTokens.length > 0) {
        console.log(`⏭️  Skipping ${userData.email} - already has tokens`);
        return;
      }

      // Mock FCM token ekle (gerçek değil, sadece test için)
      const mockToken = `mock_fcm_token_${doc.id}_${Date.now()}`;

      batch.update(doc.ref, {
        fcmTokens: [mockToken],
      });

      console.log(`✅ Adding mock token to ${userData.email}`);
      count++;
    });

    if (count > 0) {
      await batch.commit();
      console.log(`\n✅ Successfully added mock FCM tokens to ${count} users`);
      console.log(
        "\n⚠️  NOTE: These are MOCK tokens. They won't actually send notifications."
      );
      console.log(
        "💡 For real notifications, users need to login via mobile app."
      );
    } else {
      console.log("\n✅ All users already have FCM tokens");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    process.exit();
  }
}

addMockFCMTokens();

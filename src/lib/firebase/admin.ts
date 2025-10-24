import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

/**
 * Firebase Admin SDK Configuration
 * Server-side only - NEVER expose to client
 */

let adminApp: App;

function initializeFirebaseAdmin(): App {
  // Check if already initialized
  if (getApps().length > 0) {
    return getApps()[0] as App;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  // Validate environment variables
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin SDK credentials. Please check your .env.local file.\n" +
        "Required: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY"
    );
  }

  // Initialize Firebase Admin
  adminApp = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      // Replace escaped newlines in private key
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
    projectId,
  });

  console.log("✅ Firebase Admin SDK initialized");

  return adminApp;
}

// Initialize on import
if (typeof window === "undefined") {
  // Only initialize on server-side
  adminApp = initializeFirebaseAdmin();
} else {
  // Dummy app for client-side (should never be used)
  adminApp = {} as App;
}

// Export instances
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
export const adminStorage = getStorage(adminApp);

// Export app instance
export { adminApp };

// Helper function to verify admin claim
export async function verifyAdminClaim(uid: string): Promise<boolean> {
  try {
    const user = await adminAuth.getUser(uid);
    return user.customClaims?.admin === true;
  } catch (error) {
    console.error("Error verifying admin claim:", error);
    return false;
  }
}

// Helper function to set admin claim
export async function setAdminClaim(
  uid: string,
  role: "super_admin" | "admin" | "moderator" = "admin"
): Promise<void> {
  try {
    await adminAuth.setCustomUserClaims(uid, {
      admin: true,
      role,
    });
    console.log(`✅ Admin claim set for user: ${uid} with role: ${role}`);
  } catch (error) {
    console.error("Error setting admin claim:", error);
    throw error;
  }
}

// Helper function to remove admin claim
export async function removeAdminClaim(uid: string): Promise<void> {
  try {
    await adminAuth.setCustomUserClaims(uid, {
      admin: false,
      role: null,
    });
    console.log(`✅ Admin claim removed for user: ${uid}`);
  } catch (error) {
    console.error("Error removing admin claim:", error);
    throw error;
  }
}

// Helper function to get user by email
export async function getUserByEmail(email: string) {
  try {
    return await adminAuth.getUserByEmail(email);
  } catch (error) {
    console.error("Error getting user by email:", error);
    throw error;
  }
}

// Helper function to create user
export async function createAdminUser(
  email: string,
  password: string,
  displayName: string,
  role: "super_admin" | "admin" | "moderator" = "admin"
) {
  try {
    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName,
      emailVerified: true, // Admin users are pre-verified
    });

    // Set admin custom claims
    await setAdminClaim(userRecord.uid, role);

    // Create user document in Firestore
    await adminDb.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      displayName,
      role,
      isAdmin: true,
      createdAt: new Date(),
      lastLogin: new Date(),
    });

    console.log(`✅ Admin user created: ${email}`);
    return userRecord;
  } catch (error) {
    console.error("Error creating admin user:", error);
    throw error;
  }
}

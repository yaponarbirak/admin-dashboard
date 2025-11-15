import {
  signInWithEmailAndPassword,
  signOut,
  User,
  UserCredential,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./client";
import { AdminUser } from "@/types";

/**
 * Sign in with email and password
 */
export async function loginWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential;
  } catch (error: any) {
    console.error("Login error:", error);
    throw getAuthErrorMessage(error.code);
  }
}

/**
 * Sign out current user
 */
export async function logout(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}

/**
 * Check if user has admin claim
 */
export async function checkAdminClaim(user: User): Promise<boolean> {
  try {
    // Kullanıcının kendi dokümanını oku (auth state ile izin var)
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (!userDoc.exists()) {
      console.log("User document does not exist");
      return false;
    }
    
    const userData = userDoc.data();
    console.log("User data:", { isAdmin: userData.isAdmin, role: userData.role });
    return userData.isAdmin === true && userData.role != null;
  } catch (error) {
    console.error("Error checking admin claim:", error);
    return false;
  }
}

/**
 * Get admin user role from token
 */
export async function getAdminRole(
  user: User
): Promise<"super_admin" | "admin" | "moderator" | null> {
  try {
    // Firestore'dan kullanıcı dokümanını kontrol et
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (!userDoc.exists()) {
      return null;
    }
    
    const userData = userDoc.data();
    return userData.role || null;
  } catch (error) {
    console.error("Error getting admin role:", error);
    return null;
  }
}

/**
 * Convert Firebase User to AdminUser
 */
export async function convertToAdminUser(
  user: User
): Promise<AdminUser | null> {
  try {
    const isAdmin = await checkAdminClaim(user);
    if (!isAdmin) {
      return null;
    }

    const role = await getAdminRole(user);

    return {
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || "Admin User",
      role: role || "admin",
      isAdmin: true,
      createdAt: new Date(user.metadata.creationTime || Date.now()),
      lastLogin: new Date(user.metadata.lastSignInTime || Date.now()),
      photoURL: user.photoURL || undefined,
    };
  } catch (error) {
    console.error("Error converting to admin user:", error);
    return null;
  }
}

/**
 * Get current user ID token
 */
export async function getCurrentUserToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    return await user.getIdToken();
  } catch (error) {
    console.error("Error getting user token:", error);
    return null;
  }
}

/**
 * Refresh user ID token
 */
export async function refreshUserToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    return await user.getIdToken(true); // Force refresh
  } catch (error) {
    console.error("Error refreshing user token:", error);
    return null;
  }
}

/**
 * Get user-friendly error messages
 */
function getAuthErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    "auth/invalid-email": "Geçersiz e-posta adresi.",
    "auth/user-disabled": "Bu hesap devre dışı bırakılmış.",
    "auth/user-not-found": "Kullanıcı bulunamadı.",
    "auth/wrong-password": "Hatalı şifre.",
    "auth/invalid-credential": "Geçersiz kullanıcı bilgileri.",
    "auth/too-many-requests":
      "Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin.",
    "auth/network-request-failed":
      "Ağ hatası. İnternet bağlantınızı kontrol edin.",
    "auth/weak-password": "Şifre çok zayıf. En az 6 karakter olmalıdır.",
    "auth/email-already-in-use": "Bu e-posta adresi zaten kullanılıyor.",
  };

  return errorMessages[errorCode] || "Bir hata oluştu. Lütfen tekrar deneyin.";
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function isStrongPassword(password: string): {
  isValid: boolean;
  message?: string;
} {
  if (password.length < 8) {
    return { isValid: false, message: "Şifre en az 8 karakter olmalıdır." };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: "Şifre en az bir büyük harf içermelidir.",
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: "Şifre en az bir küçük harf içermelidir.",
    };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: "Şifre en az bir rakam içermelidir." };
  }

  return { isValid: true };
}

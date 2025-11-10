import { doc, updateDoc, Timestamp, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { AdminRole } from "@/types";

export interface BanUserParams {
  uid: string;
  reason: string;
  adminUid: string;
  adminEmail: string;
}

export async function banUser({
  uid,
  reason,
  adminUid,
  adminEmail,
}: BanUserParams) {
  const userRef = doc(db, "users", uid);

  await updateDoc(userRef, {
    isBanned: true,
    bannedAt: Timestamp.now(),
    bannedReason: reason,
    bannedBy: adminUid,
    isActive: false,
    updatedAt: Timestamp.now(),
  });

  // TODO: Log admin action
  // await logAdminAction({
  //   actionType: "ban_user",
  //   adminUid,
  //   adminEmail,
  //   targetUid: uid,
  //   details: { reason },
  // });
}

export async function unbanUser(
  uid: string,
  adminUid: string,
  adminEmail: string
) {
  const userRef = doc(db, "users", uid);

  await updateDoc(userRef, {
    isBanned: false,
    bannedAt: null,
    bannedReason: null,
    bannedBy: null,
    isActive: true,
    updatedAt: Timestamp.now(),
  });

  // TODO: Log admin action
  // await logAdminAction({
  //   actionType: "unban_user",
  //   adminUid,
  //   adminEmail,
  //   targetUid: uid,
  // });
}

export interface GrantAdminParams {
  uid: string;
  role: AdminRole;
  grantedBy: string;
  grantedByEmail: string;
}

export interface RevokeAdminParams {
  uid: string;
  revokedBy: string;
  revokedByEmail: string;
}

export async function grantAdminAccess({
  uid,
  role,
  grantedBy,
  grantedByEmail,
}: GrantAdminParams) {
  const userRef = doc(db, "users", uid);
  const adminRef = doc(db, "admins", uid);

  // Users koleksiyonunu güncelle
  await updateDoc(userRef, {
    isAdmin: true,
    adminRole: role,
    updatedAt: Timestamp.now(),
  });

  // Admins koleksiyonuna kayıt ekle
  await setDoc(adminRef, {
    uid,
    role,
    createdAt: Timestamp.now(),
    createdBy: grantedBy,
    createdByEmail: grantedByEmail,
    isActive: true,
  });

  // TODO: Log admin action
  // await logAdminAction({
  //   actionType: "grant_admin",
  //   adminUid: grantedBy,
  //   adminEmail: grantedByEmail,
  //   targetUid: uid,
  //   details: { role },
  // });
}

export async function revokeAdminAccess({
  uid,
  revokedBy,
  revokedByEmail,
}: RevokeAdminParams) {
  const userRef = doc(db, "users", uid);
  const adminRef = doc(db, "admins", uid);

  // Users koleksiyonunu güncelle
  await updateDoc(userRef, {
    isAdmin: false,
    adminRole: null,
    updatedAt: Timestamp.now(),
  });

  // Admins koleksiyonundan tamamen sil (eğer kayıt varsa)
  try {
    const adminDoc = await getDoc(adminRef);
    if (adminDoc.exists()) {
      await deleteDoc(adminRef);
      console.log("Admin record deleted from admins collection:", uid);
    } else {
      console.warn("Admin record not found in admins collection:", uid);
    }
  } catch (error) {
    // Admins koleksiyonunda kayıt yoksa sessizce geç
    console.warn("Could not delete admin record:", error);
  }

  // TODO: Log admin action
  // await logAdminAction({
  //   actionType: "revoke_admin",
  //   adminUid: revokedBy,
  //   adminEmail: revokedByEmail,
  //   targetUid: uid,
  //   details: {},
  // });
}

import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

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

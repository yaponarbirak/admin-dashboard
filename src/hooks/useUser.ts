"use client";

import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { UserDocument } from "@/types";

export function useUser(uid: string) {
  return useQuery({
    queryKey: ["user", uid],
    queryFn: async () => {
      if (!uid) throw new Error("UID is required");

      const userDoc = await getDoc(doc(db, "users", uid));

      if (!userDoc.exists()) {
        throw new Error("Kullanıcı bulunamadı");
      }

      const data = userDoc.data();
      const user: UserDocument = {
        uid: userDoc.id,
        email: data.email || "",
        fullName: data.fullName || "",
        phoneNumber: data.phoneNumber || undefined,
        profileType: data.profileType || "customer",
        profileImageUrl: data.profileImageUrl || undefined,
        address: data.address || undefined,
        isActive: data.isActive ?? true,
        isBanned: data.isBanned || false,
        bannedAt: data.bannedAt || undefined,
        bannedReason: data.bannedReason || undefined,
        bannedBy: data.bannedBy || undefined,
        serviceCategories: data.serviceCategories || undefined,
        bio: data.bio || undefined,
        rating: data.rating || undefined,
        reviewCount: data.reviewCount || undefined,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        lastLoginAt: data.lastLoginAt || undefined,
        jobsPosted: data.jobsPosted || 0,
        jobsCompleted: data.jobsCompleted || 0,
        applicationsReceived: data.applicationsReceived || 0,
        applicationsSent: data.applicationsSent || 0,
        fcmTokens: data.fcmTokens || undefined,
      };

      return user;
    },
    enabled: !!uid,
    staleTime: 30000,
  });
}

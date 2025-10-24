"use client";

import { useQuery } from "@tanstack/react-query";
import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  limit,
  startAfter,
  DocumentSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { UserDocument } from "@/types";

interface UseUsersOptions {
  searchQuery?: string;
  role?: string;
  pageSize?: number;
  lastDoc?: DocumentSnapshot | null;
}

export function useUsers(options: UseUsersOptions = {}) {
  const {
    searchQuery = "",
    role = "",
    pageSize = 20,
    lastDoc = null,
  } = options;

  return useQuery({
    queryKey: ["users", searchQuery, role, lastDoc?.id],
    queryFn: async () => {
      const usersRef = collection(db, "users");
      let q = query(usersRef, orderBy("createdAt", "desc"), limit(pageSize));

      // Filter by role if specified
      if (role && role !== "all") {
        q = query(q, where("role", "==", role));
      }

      // Pagination
      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);

      const users: UserDocument[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          uid: doc.id,
          email: data.email || "",
          fullName: data.fullName || data.displayName || "",
          phoneNumber: data.phoneNumber || undefined,
          profileType: data.profileType || "customer",
          profileImageUrl: data.profileImageUrl || data.photoURL || undefined,
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
          createdAt: data.createdAt || Timestamp.now(),
          updatedAt: data.updatedAt || Timestamp.now(),
          lastLoginAt: data.lastLoginAt || undefined,
          jobsPosted: data.jobsPosted || 0,
          jobsCompleted: data.jobsCompleted || 0,
          applicationsReceived: data.applicationsReceived || 0,
          applicationsSent: data.applicationsSent || 0,
          fcmTokens: data.fcmTokens || undefined,
        };
      });

      // Client-side search filtering (if needed)
      let filteredUsers = users;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredUsers = users.filter(
          (user) =>
            user.email.toLowerCase().includes(query) ||
            user.fullName?.toLowerCase().includes(query) ||
            user.uid.toLowerCase().includes(query)
        );
      }

      return {
        users: filteredUsers,
        lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
        hasMore: snapshot.docs.length === pageSize,
      };
    },
    staleTime: 30000, // 30 seconds
  });
}

// Get total user count
export function useUserCount() {
  return useQuery({
    queryKey: ["users", "count"],
    queryFn: async () => {
      const usersRef = collection(db, "users");
      const snapshot = await getDocs(usersRef);
      return snapshot.size;
    },
    staleTime: 60000, // 1 minute
  });
}

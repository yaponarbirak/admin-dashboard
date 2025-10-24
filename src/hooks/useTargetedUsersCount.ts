"use client";

import { useQuery } from "@tanstack/react-query";
import {
  collection,
  query,
  where,
  getCountFromServer,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { NotificationFilters, NotificationTargetType } from "@/types";

interface UseTargetedUsersCountProps {
  targetType: NotificationTargetType;
  filters?: NotificationFilters;
  specificUserIds?: string[];
}

export function useTargetedUsersCount({
  targetType,
  filters = {},
  specificUserIds = [],
}: UseTargetedUsersCountProps) {
  return useQuery({
    queryKey: ["targeted-users-count", targetType, filters, specificUserIds],
    queryFn: async () => {
      const usersRef = collection(db, "users");

      // Specific users
      if (targetType === "specific") {
        return specificUserIds.length;
      }

      // All users
      if (targetType === "all" && Object.keys(filters).length === 0) {
        const snapshot = await getCountFromServer(usersRef);
        return snapshot.data().count;
      }

      // Filtered users
      let q = query(usersRef);

      // Apply filters
      if (filters.profileType) {
        q = query(q, where("profileType", "==", filters.profileType));
      }

      if (filters.isActive !== undefined) {
        q = query(q, where("isActive", "==", filters.isActive));
      }

      const snapshot = await getCountFromServer(q);
      return snapshot.data().count;
    },
    staleTime: 30000, // 30 seconds
  });
}

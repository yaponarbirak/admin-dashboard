"use client";

import { useQuery } from "@tanstack/react-query";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { NotificationCampaign } from "@/types";

export function useNotificationHistory(limitCount: number = 50) {
  return useQuery({
    queryKey: ["notification-history", limitCount],
    queryFn: async () => {
      const campaignsRef = collection(db, "notification_campaigns");
      const q = query(
        campaignsRef,
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        campaignId: doc.id,
        ...doc.data(),
      })) as NotificationCampaign[];
    },
    staleTime: 30000,
  });
}

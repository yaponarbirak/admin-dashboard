"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { NotificationCampaign } from "@/types";

export function useScheduledNotifications() {
  return useQuery({
    queryKey: ["scheduled-notifications"],
    queryFn: async () => {
      const campaignsRef = collection(db, "notification_campaigns");

      try {
        // İlk önce scheduled status ile dene
        const scheduledQuery = query(
          campaignsRef,
          where("status", "==", "scheduled"),
          orderBy("createdAt", "desc")
        );
        const scheduledSnapshot = await getDocs(scheduledQuery);

        // Draft kampanyaları da ekle
        const draftQuery = query(
          campaignsRef,
          where("status", "==", "draft"),
          orderBy("createdAt", "desc")
        );
        const draftSnapshot = await getDocs(draftQuery);

        // Her iki sonucu birleştir
        const allDocs = [...scheduledSnapshot.docs, ...draftSnapshot.docs];

        return allDocs.map((doc) => ({
          campaignId: doc.id,
          ...doc.data(),
        })) as NotificationCampaign[];
      } catch (error) {
        console.error("Error fetching scheduled notifications:", error);
        // Hata durumunda basit sorgu dene
        const simpleQuery = query(campaignsRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(simpleQuery);

        return snapshot.docs
          .filter((doc) => {
            const data = doc.data();
            return data.status === "scheduled" || data.status === "draft";
          })
          .map((doc) => ({
            campaignId: doc.id,
            ...doc.data(),
          })) as NotificationCampaign[];
      }
    },
    staleTime: 10000, // 10 saniye
  });
}

export function useCancelScheduledNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      const campaignRef = doc(db, "notification_campaigns", campaignId);
      await updateDoc(campaignRef, {
        status: "failed",
        failedCount: 0,
        updatedAt: Timestamp.now(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notification-history"] });
    },
  });
}

export function useDeleteScheduledNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      const campaignRef = doc(db, "notification_campaigns", campaignId);
      await deleteDoc(campaignRef);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-notifications"] });
    },
  });
}

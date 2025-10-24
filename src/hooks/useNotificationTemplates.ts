"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { NotificationTemplate } from "@/types";

export function useNotificationTemplates() {
  return useQuery({
    queryKey: ["notification-templates"],
    queryFn: async () => {
      const templatesRef = collection(db, "notification_templates");
      const q = query(templatesRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        templateId: doc.id,
        ...doc.data(),
      })) as NotificationTemplate[];
    },
    staleTime: 30000,
  });
}

// Helper function to remove undefined values
function removeUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const result: any = {};
  Object.keys(obj).forEach((key) => {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
  });
  return result;
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      template: Omit<
        NotificationTemplate,
        "templateId" | "createdAt" | "updatedAt" | "usageCount"
      >
    ) => {
      const templatesRef = collection(db, "notification_templates");

      // Clean template data - remove undefined values
      const cleanedTemplate = removeUndefined({
        name: template.name,
        description: template.description,
        category: template.category,
        title: template.title,
        body: template.body,
        imageUrl: template.imageUrl,
        actionUrl: template.actionUrl,
        variables: template.variables,
        isActive: template.isActive,
      });

      const docRef = await addDoc(templatesRef, {
        ...cleanedTemplate,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        usageCount: 0,
      });
      return docRef.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-templates"] });
    },
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      templateId,
      updates,
    }: {
      templateId: string;
      updates: Partial<NotificationTemplate>;
    }) => {
      const templateRef = doc(db, "notification_templates", templateId);

      // Clean updates - remove undefined values
      const cleanedUpdates = removeUndefined(updates);

      await updateDoc(templateRef, {
        ...cleanedUpdates,
        updatedAt: serverTimestamp(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-templates"] });
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateId: string) => {
      const templateRef = doc(db, "notification_templates", templateId);
      await deleteDoc(templateRef);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-templates"] });
    },
  });
}

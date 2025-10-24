"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
  Query,
  DocumentData,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export interface Job {
  id: string;
  baslik: string; // title
  detaylar: string; // description
  kategori: string; // category
  altKategori?: string; // subcategory
  konum?: any; // location data
  butce?: {
    min?: number;
    max?: number;
    tip?: "hourly" | "daily" | "project";
  };
  fotograflar?: string[]; // photos
  userId: string; // creator user ID
  olusturulmaTarihi: Timestamp; // createdAt
  guncellemeTarihi?: Timestamp; // updatedAt
  sonKullanmaTarihi?: Timestamp; // expiresAt
  updatedAt?: Timestamp;
  durum?: string; // status: "aktif", "tamamlandi", "isletme_secildi", etc.
  isVisibleToOthers?: boolean;
  selectedApplicationId?: string;
  selectedServiceProviderId?: string;
  selectedAt?: Timestamp;
  yayinSuresi?: number;
}

// Helper type for display
export interface JobDisplay extends Job {
  title: string;
  description: string;
  category: string;
  photos: string[];
  createdBy: string;
  createdAt: Timestamp;
  isActive: boolean;
}

interface UseJobsOptions {
  status?: "active" | "inactive" | "all";
  city?: string;
  category?: string;
  limit?: number;
}

export function useJobs(options: UseJobsOptions = {}) {
  const [jobs, setJobs] = useState<JobDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("🔍 useJobs options:", options);

      // Base query - TEMPORARILY GET ALL DOCS WITHOUT ORDERING TO DEBUG
      let q: Query<DocumentData> = collection(db, "ilanlar");

      // Subscribe to changes
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          console.log(
            "✅ Snapshot received, docs count:",
            snapshot.docs.length
          );

          // Log first document structure to see actual field names
          if (snapshot.docs.length > 0) {
            console.log("� First document data:", snapshot.docs[0].data());
            console.log("📄 First document ID:", snapshot.docs[0].id);
          }

          const jobsData = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              // Add display helpers
              title: data.baslik || "",
              description: data.detaylar || "",
              category: data.kategori || "",
              photos: data.fotograflar || [],
              createdBy: data.userId || "",
              createdAt: data.olusturulmaTarihi,
              isActive:
                data.durum !== "tamamlandi" && data.isVisibleToOthers !== false,
            } as JobDisplay;
          });

          console.log("📦 Jobs data:", jobsData);
          setJobs(jobsData);
          setIsLoading(false);
        },
        (err) => {
          console.error("❌ Error fetching jobs:", err);
          setError(err as Error);
          setIsLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error("❌ Error setting up jobs listener:", err);
      setError(err as Error);
      setIsLoading(false);
    }
  }, [options.status, options.city, options.category, options.limit]);

  return {
    jobs,
    isLoading,
    error,
    totalCount: jobs.length,
  };
}

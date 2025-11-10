"use client";

import { useQuery } from "@tanstack/react-query";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => {
      try {
        // Get all collections in parallel
        const [usersSnap, jobsSnap, reviewsSnap] = await Promise.all([
          getDocs(collection(db, "users")).catch(() => ({ docs: [], size: 0 })),
          getDocs(collection(db, "jobs")).catch(() => ({ docs: [], size: 0 })),
          getDocs(collection(db, "reviews")).catch(() => ({ docs: [], size: 0 })),
        ]);

      // Calculate this month's date range
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Users stats
      const totalUsers = usersSnap.size;
      const activeUsers = usersSnap.docs.filter(
        (doc) => doc.data().isActive !== false
      ).length;
      const bannedUsers = usersSnap.docs.filter(
        (doc) => doc.data().isBanned === true
      ).length;
      
      const newUsersThisMonth = usersSnap.docs.filter((doc) => {
        const createdAt = doc.data().createdAt?.toDate();
        return createdAt && createdAt >= firstDayOfMonth && createdAt <= lastDayOfMonth;
      }).length;

      // Jobs stats
      const totalJobs = jobsSnap.size;
      const activeJobs = jobsSnap.docs.filter(
        (doc) => doc.data().status === "active"
      ).length;
      const completedJobs = jobsSnap.docs.filter(
        (doc) => doc.data().status === "completed"
      ).length;
      
      const newJobsThisMonth = jobsSnap.docs.filter((doc) => {
        const createdAt = doc.data().createdAt?.toDate();
        return createdAt && createdAt >= firstDayOfMonth && createdAt <= lastDayOfMonth;
      }).length;

      // Reviews stats
      const totalReviews = reviewsSnap.size;
      const averageRating =
        reviewsSnap.docs.reduce((sum, doc) => sum + (doc.data().rating || 0), 0) /
        (totalReviews || 1);
      
      const newReviewsThisMonth = reviewsSnap.docs.filter((doc) => {
        const createdAt = doc.data().createdAt?.toDate();
        return createdAt && createdAt >= firstDayOfMonth && createdAt <= lastDayOfMonth;
      }).length;

      return {
        users: {
          total: totalUsers,
          active: activeUsers,
          banned: bannedUsers,
          newThisMonth: newUsersThisMonth,
        },
        jobs: {
          total: totalJobs,
          active: activeJobs,
          completed: completedJobs,
          newThisMonth: newJobsThisMonth,
        },
        reviews: {
          total: totalReviews,
          averageRating: averageRating.toFixed(1),
          newThisMonth: newReviewsThisMonth,
        },
      };
      } catch (error) {
        console.error("Dashboard stats error:", error);
        return {
          users: { total: 0, active: 0, banned: 0, newThisMonth: 0 },
          jobs: { total: 0, active: 0, completed: 0, newThisMonth: 0 },
          reviews: { total: 0, averageRating: "0.0", newThisMonth: 0 },
        };
      }
    },
    staleTime: 60000, // 1 minute
    refetchInterval: 60000, // Auto-refetch every minute
  });
}

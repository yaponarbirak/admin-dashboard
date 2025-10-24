import { useState, useEffect } from "react";
import { db } from "@/lib/firebase/client";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  where,
  QueryConstraint,
} from "firebase/firestore";

export interface Review {
  id: string;
  comment: string | null;
  communicationRating: number | null;
  contractId: string;
  createdAt: any;
  hasResponse: boolean;
  ilanId: string;
  isPublic: boolean;
  isVerified: boolean;
  priceRating: number | null;
  qualityRating: number | null;
  rating: number;
  respondedAt: any;
  responseText: string | null;
  reviewType: "advertiserToProvider" | "providerToAdvertiser";
  reviewedBusinessName: string | null;
  reviewedId: string;
  reviewerId: string;
  reviewerName: string;
  timelinessRating: number | null;
  updatedAt: any;
}

export interface ReviewDisplay extends Review {
  createdAtDate: Date;
  updatedAtDate: Date;
  respondedAtDate: Date | null;
  averageRating: number;
}

interface UseReviewsResult {
  reviews: ReviewDisplay[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  publicCount: number;
  pendingCount: number;
  withCommentCount: number;
}

export function useReviews(
  filterStatus: "all" | "public" | "pending" | "withComment" = "all"
): UseReviewsResult {
  const [reviews, setReviews] = useState<ReviewDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);

    const constraints: QueryConstraint[] = [];

    // Filter by status
    if (filterStatus === "public") {
      constraints.push(where("isPublic", "==", true));
    } else if (filterStatus === "pending") {
      constraints.push(where("isPublic", "==", false));
    }

    // Order by creation date
    constraints.push(orderBy("createdAt", "desc"));

    const q = query(collection(db, "reviews"), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const reviewsData = snapshot.docs.map((doc) => {
          const data = doc.data() as Omit<Review, "id">;

          // Calculate average rating from individual ratings
          const ratings = [
            data.communicationRating,
            data.priceRating,
            data.qualityRating,
            data.timelinessRating,
          ].filter((r): r is number => r !== null && r !== undefined);

          const averageRating =
            ratings.length > 0
              ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
              : data.rating;

          return {
            id: doc.id,
            ...data,
            createdAtDate: data.createdAt?.toDate() || new Date(),
            updatedAtDate: data.updatedAt?.toDate() || new Date(),
            respondedAtDate: data.respondedAt?.toDate() || null,
            averageRating,
          } as ReviewDisplay;
        });

        // Apply client-side filter for withComment
        const filteredReviews =
          filterStatus === "withComment"
            ? reviewsData.filter((r) => r.comment && r.comment.trim() !== "")
            : reviewsData;

        setReviews(filteredReviews);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Error fetching reviews:", err);
        setError(err.message);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [filterStatus]);

  // Calculate stats
  const totalCount = reviews.length;
  const publicCount = reviews.filter((r) => r.isPublic).length;
  const pendingCount = reviews.filter((r) => !r.isPublic).length;
  const withCommentCount = reviews.filter(
    (r) => r.comment && r.comment.trim() !== ""
  ).length;

  return {
    reviews,
    isLoading,
    error,
    totalCount,
    publicCount,
    pendingCount,
    withCommentCount,
  };
}

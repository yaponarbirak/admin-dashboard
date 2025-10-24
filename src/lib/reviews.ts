import { db } from "@/lib/firebase/client";
import {
  doc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

/**
 * Toggle review public status
 */
export async function toggleReviewPublic(
  reviewId: string,
  currentPublic: boolean
): Promise<void> {
  const reviewRef = doc(db, "reviews", reviewId);
  await updateDoc(reviewRef, {
    isPublic: !currentPublic,
    updatedAt: new Date(),
  });
}

/**
 * Toggle review verified status
 */
export async function toggleReviewVerified(
  reviewId: string,
  currentVerified: boolean
): Promise<void> {
  const reviewRef = doc(db, "reviews", reviewId);
  await updateDoc(reviewRef, {
    isVerified: !currentVerified,
    updatedAt: new Date(),
  });
}

/**
 * Delete a review
 */
export async function deleteReview(reviewId: string): Promise<void> {
  const reviewRef = doc(db, "reviews", reviewId);
  await deleteDoc(reviewRef);
}

/**
 * Add admin response to review
 */
export async function addReviewResponse(
  reviewId: string,
  responseText: string
): Promise<void> {
  const reviewRef = doc(db, "reviews", reviewId);
  await updateDoc(reviewRef, {
    responseText,
    hasResponse: true,
    respondedAt: new Date(),
    updatedAt: new Date(),
  });
}

/**
 * Remove admin response from review
 */
export async function removeReviewResponse(reviewId: string): Promise<void> {
  const reviewRef = doc(db, "reviews", reviewId);
  await updateDoc(reviewRef, {
    responseText: null,
    hasResponse: false,
    respondedAt: null,
    updatedAt: new Date(),
  });
}

/**
 * Get review count for a specific job
 */
export async function getJobReviewCount(ilanId: string): Promise<number> {
  const q = query(collection(db, "reviews"), where("ilanId", "==", ilanId));
  const snapshot = await getDocs(q);
  return snapshot.size;
}

/**
 * Get review count for a specific user (as reviewer)
 */
export async function getUserReviewCount(userId: string): Promise<number> {
  const q = query(collection(db, "reviews"), where("reviewerId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.size;
}

/**
 * Get review count for a specific user (as reviewed)
 */
export async function getUserReceivedReviewCount(
  userId: string
): Promise<number> {
  const q = query(collection(db, "reviews"), where("reviewedId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.size;
}

import {
  doc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { getStorage, ref, deleteObject } from "firebase/storage";

/**
 * İlan görünürlüğünü değiştirir (gizle/göster)
 */
export async function toggleJobVisibility(
  jobId: string,
  currentVisibility: boolean
): Promise<void> {
  try {
    const jobRef = doc(db, "ilanlar", jobId);
    await updateDoc(jobRef, {
      isVisibleToOthers: !currentVisibility,
      guncellemeTarihi: new Date(),
    });
  } catch (error) {
    console.error("Error toggling job visibility:", error);
    throw error;
  }
}

/**
 * İlana yapılan başvuru sayısını getirir
 */
export async function getJobApplicationCount(jobId: string): Promise<number> {
  try {
    const applicationsQuery = query(
      collection(db, "job_applications"),
      where("ilanId", "==", jobId)
    );
    const snapshot = await getDocs(applicationsQuery);
    return snapshot.size;
  } catch (error) {
    console.error("Error getting application count:", error);
    return 0;
  }
}

/**
 * İlanı ve ilgili tüm verileri siler
 */
export async function deleteJob(jobId: string): Promise<void> {
  try {
    const batch = writeBatch(db);

    // 1. İlanı sil
    const jobRef = doc(db, "ilanlar", jobId);
    batch.delete(jobRef);

    // 2. İlana ait başvuruları sil
    const applicationsQuery = query(
      collection(db, "job_applications"),
      where("ilanId", "==", jobId)
    );
    const applicationsSnapshot = await getDocs(applicationsQuery);
    applicationsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // 3. Batch işlemini gerçekleştir
    await batch.commit();

    console.log(`✅ İlan ve ${applicationsSnapshot.size} başvuru silindi`);
  } catch (error) {
    console.error("Error deleting job:", error);
    throw error;
  }
}

/**
 * İlan fotoğraflarını storage'dan siler
 */
export async function deleteJobPhotos(photoUrls: string[]): Promise<void> {
  try {
    const storage = getStorage();
    const deletePromises = photoUrls.map(async (url) => {
      try {
        // URL'den storage path'ini çıkar
        const path = extractStoragePathFromUrl(url);
        if (path) {
          const photoRef = ref(storage, path);
          await deleteObject(photoRef);
        }
      } catch (error) {
        console.warn("Fotoğraf silinirken hata:", error);
      }
    });

    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Error deleting job photos:", error);
    throw error;
  }
}

/**
 * Storage URL'den dosya yolunu çıkarır
 */
function extractStoragePathFromUrl(url: string): string | null {
  try {
    const urlParts = url.split("/o/");
    if (urlParts.length > 1) {
      const pathPart = urlParts[1].split("?")[0];
      return decodeURIComponent(pathPart);
    }
    return null;
  } catch (error) {
    console.warn("URL'den dosya yolu çıkarılamadı:", error);
    return null;
  }
}

'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase, 
  Star,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  MessageSquare,
  FileText
} from 'lucide-react';

interface UserInfo {
  uid: string;
  email: string;
  fullName?: string;
  businessName?: string;
  phoneNumber?: string;
  city?: string;
  district?: string;
  profileType?: 'customer' | 'serviceProvider';
  isActive?: boolean;
  emailVerified?: boolean;
  createdAt?: Date;
  lastLoginAt?: Date;
  // Service Provider specific
  businessDescription?: string;
  servicesOffered?: string[];
  yearsOfExperience?: number;
  portfolio?: string[];
  rating?: number;
  reviewCount?: number;
  completedJobsCount?: number;
}

interface UserStats {
  totalIlans: number;
  activeIlans: number;
  completedContracts: number;
  activeContracts: number;
  totalMessages: number;
  averageRating: number;
}

export default function UserInfoPanel({ userId }: { userId: string }) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    
    fetchUserInfo();
    fetchUserStats();
  }, [userId]);

  const fetchUserInfo = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserInfo({
          uid: userDoc.id,
          email: data.email,
          fullName: data.fullName,
          businessName: data.businessName,
          phoneNumber: data.phoneNumber,
          city: data.city,
          district: data.district,
          profileType: data.profileType,
          isActive: data.isActive,
          emailVerified: data.emailVerified,
          createdAt: data.createdAt?.toDate(),
          lastLoginAt: data.lastLoginAt?.toDate(),
          businessDescription: data.businessDescription,
          servicesOffered: data.servicesOffered || [],
          yearsOfExperience: data.yearsOfExperience,
          portfolio: data.portfolio || [],
          rating: data.rating,
          reviewCount: data.reviewCount,
          completedJobsCount: data.completedJobsCount,
        });
      }
    } catch (error) {
      console.error('Kullanıcı bilgisi alınamadı:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      // İlan istatistikleri
      const ilansQuery = query(
        collection(db, 'ilanlar'),
        where('kullaniciId', '==', userId)
      );
      const ilansSnapshot = await getDocs(ilansQuery);
      const totalIlans = ilansSnapshot.size;
      const activeIlans = ilansSnapshot.docs.filter(doc => doc.data().durum === 'aktif').length;

      // Sözleşme istatistikleri
      const contractsQuery = query(
        collection(db, 'job_contracts'),
        where('advertiserId', '==', userId)
      );
      const contractsSnapshot = await getDocs(contractsQuery);
      const totalContracts = contractsSnapshot.size;
      const completedContracts = contractsSnapshot.docs.filter(
        doc => doc.data().status === 'completed'
      ).length;
      const activeContracts = contractsSnapshot.docs.filter(
        doc => ['pending', 'accepted', 'in_progress'].includes(doc.data().status)
      ).length;

      // Mesaj istatistikleri
      const messagesQuery = query(
        collection(db, 'admin_messages'),
        where('userId', '==', userId)
      );
      const messagesSnapshot = await getDocs(messagesQuery);

      // Ortalama puan (hizmet veren için)
      let averageRating = 0;
      if (userInfo?.profileType === 'serviceProvider') {
        const reviewsQuery = query(
          collection(db, 'reviews'),
          where('businessId', '==', userId)
        );
        const reviewsSnapshot = await getDocs(reviewsQuery);
        if (reviewsSnapshot.size > 0) {
          const totalRating = reviewsSnapshot.docs.reduce(
            (sum, doc) => sum + (doc.data().rating || 0),
            0
          );
          averageRating = totalRating / reviewsSnapshot.size;
        }
      }

      setUserStats({
        totalIlans,
        activeIlans,
        completedContracts,
        activeContracts,
        totalMessages: messagesSnapshot.size,
        averageRating,
      });
    } catch (error) {
      console.error('İstatistikler alınamadı:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="p-6 text-center text-gray-500">
        Kullanıcı bilgisi bulunamadı
      </div>
    );
  }

  const displayName = userInfo.profileType === 'serviceProvider' 
    ? userInfo.businessName 
    : userInfo.fullName;

  return (
    <div className="h-full overflow-y-auto bg-white">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
            {displayName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold">{displayName}</h2>
            <p className="text-blue-100 text-sm flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {userInfo.email}
            </p>
          </div>
        </div>
        
        <div className="mt-4 flex gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            userInfo.profileType === 'serviceProvider' 
              ? 'bg-purple-500/30 text-white' 
              : 'bg-blue-500/30 text-white'
          }`}>
            {userInfo.profileType === 'serviceProvider' ? '🔧 Hizmet Veren' : '👤 Müşteri'}
          </span>
          
          {userInfo.isActive && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/30 text-white flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Aktif
            </span>
          )}
          
          {userInfo.emailVerified && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/30 text-white">
              ✓ Doğrulanmış
            </span>
          )}
        </div>
      </div>

      {/* İstatistikler */}
      {userStats && (
        <div className="p-4 bg-gray-50 border-b">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">İstatistikler</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-lg border">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">İlanlar</p>
                  <p className="text-lg font-bold text-gray-900">
                    {userStats.totalIlans}
                  </p>
                  <p className="text-xs text-green-600">
                    {userStats.activeIlans} aktif
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-xs text-gray-500">Sözleşmeler</p>
                  <p className="text-lg font-bold text-gray-900">
                    {userStats.completedContracts}
                  </p>
                  <p className="text-xs text-green-600">
                    {userStats.activeContracts} aktif
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-xs text-gray-500">Mesajlar</p>
                  <p className="text-lg font-bold text-gray-900">
                    {userStats.totalMessages}
                  </p>
                </div>
              </div>
            </div>

            {userInfo.profileType === 'serviceProvider' && (
              <div className="bg-white p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-600" />
                  <div>
                    <p className="text-xs text-gray-500">Puan</p>
                    <p className="text-lg font-bold text-gray-900">
                      {userStats.averageRating.toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {userInfo.reviewCount || 0} değerlendirme
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Kişisel Bilgiler */}
      <div className="p-4 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Kişisel Bilgiler</h3>
          <div className="space-y-3">
            {userInfo.phoneNumber && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Telefon</p>
                  <p className="text-sm font-medium text-gray-900">{userInfo.phoneNumber}</p>
                </div>
              </div>
            )}

            {(userInfo.city || userInfo.district) && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Konum</p>
                  <p className="text-sm font-medium text-gray-900">
                    {userInfo.district && `${userInfo.district}, `}
                    {userInfo.city}
                  </p>
                </div>
              </div>
            )}

            {userInfo.createdAt && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Kayıt Tarihi</p>
                  <p className="text-sm font-medium text-gray-900">
                    {format(userInfo.createdAt, 'dd MMMM yyyy', { locale: tr })}
                  </p>
                </div>
              </div>
            )}

            {userInfo.lastLoginAt && (
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Son Giriş</p>
                  <p className="text-sm font-medium text-gray-900">
                    {format(userInfo.lastLoginAt, 'dd MMMM yyyy HH:mm', { locale: tr })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hizmet Veren Ek Bilgileri */}
        {userInfo.profileType === 'serviceProvider' && (
          <>
            {userInfo.businessDescription && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">İşletme Açıklaması</h3>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {userInfo.businessDescription}
                </p>
              </div>
            )}

            {userInfo.servicesOffered && userInfo.servicesOffered.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Hizmetler</h3>
                <div className="flex flex-wrap gap-2">
                  {userInfo.servicesOffered.map((service, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {userInfo.yearsOfExperience && (
              <div className="flex items-center gap-3">
                <TrendingUp className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Deneyim</p>
                  <p className="text-sm font-medium text-gray-900">
                    {userInfo.yearsOfExperience} yıl
                  </p>
                </div>
              </div>
            )}

            {userInfo.completedJobsCount !== undefined && (
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-xs text-gray-500">Tamamlanan İşler</p>
                  <p className="text-sm font-medium text-gray-900">
                    {userInfo.completedJobsCount} iş
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* UID (Admin için) */}
        <div className="pt-4 border-t">
          <p className="text-xs text-gray-400 font-mono">
            ID: {userInfo.uid}
          </p>
        </div>
      </div>
    </div>
  );
}

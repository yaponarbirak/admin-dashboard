'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  addDoc,
  serverTimestamp,
  where,
  getDocs,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface AdminMessage {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  message: string;
  createdAt: Date;
  isAdminReply: boolean;
  isRead: boolean;
  adminId?: string;
  adminName?: string;
}

interface Conversation {
  userId: string;
  userName: string;
  userEmail: string;
  lastMessage: string;
  lastMessageTime: Date;
  isAdminReply: boolean;
  unreadCount: number;
}

export default function SupportMessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Tüm konuşmaları dinle
  useEffect(() => {
    const q = query(
      collection(db, 'admin_messages'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const conversationsMap = new Map<string, Conversation>();

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const message: AdminMessage = {
          id: doc.id,
          userId: data.userId,
          userName: data.userName,
          userEmail: data.userEmail,
          message: data.message,
          createdAt: data.createdAt?.toDate() || new Date(),
          isAdminReply: data.isAdminReply || false,
          isRead: data.isRead || false,
          adminId: data.adminId,
          adminName: data.adminName,
        };

        if (!conversationsMap.has(message.userId)) {
          // Okunmamış mesaj sayısını hesapla
          const unreadCount = snapshot.docs.filter((d) => {
            const m = d.data();
            return m.userId === message.userId && 
                   !m.isRead && 
                   !m.isAdminReply;
          }).length;

          conversationsMap.set(message.userId, {
            userId: message.userId,
            userName: message.userName,
            userEmail: message.userEmail,
            lastMessage: message.message,
            lastMessageTime: message.createdAt,
            isAdminReply: message.isAdminReply,
            unreadCount,
          });
        }
      });

      const convArray = Array.from(conversationsMap.values());
      convArray.sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());
      
      setConversations(convArray);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Seçili kullanıcının mesajlarını dinle
  useEffect(() => {
    if (!selectedUserId) {
      setMessages([]);
      return;
    }

    const q = query(
      collection(db, 'admin_messages'),
      where('userId', '==', selectedUserId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: AdminMessage[] = [];
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        msgs.push({
          id: doc.id,
          userId: data.userId,
          userName: data.userName,
          userEmail: data.userEmail,
          message: data.message,
          createdAt: data.createdAt?.toDate() || new Date(),
          isAdminReply: data.isAdminReply || false,
          isRead: data.isRead || false,
          adminId: data.adminId,
          adminName: data.adminName,
        });
      });
      setMessages(msgs);
      
      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    return () => unsubscribe();
  }, [selectedUserId]);

  // Cevap gönder
  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedUserId || !user) return;

    setSending(true);
    try {
      // Admin cevabı gönder
      await addDoc(collection(db, 'admin_messages'), {
        userId: selectedUserId,
        userName: '',
        userEmail: '',
        message: replyText.trim(),
        createdAt: serverTimestamp(),
        isAdminReply: true,
        isRead: true,
        adminId: user.uid,
        adminName: user.displayName || user.email || 'Admin',
      });

      // Kullanıcının okunmamış mesajlarını işaretle
      const unreadQuery = query(
        collection(db, 'admin_messages'),
        where('userId', '==', selectedUserId),
        where('isRead', '==', false),
        where('isAdminReply', '==', false)
      );

      const unreadSnapshot = await getDocs(unreadQuery);
      if (!unreadSnapshot.empty) {
        const batch = writeBatch(db);
        unreadSnapshot.docs.forEach((doc) => {
          batch.update(doc.ref, { isRead: true });
        });
        await batch.commit();
      }

      setReplyText('');
    } catch (error) {
      console.error('Cevap gönderme hatası:', error);
      alert('Cevap gönderilemedi!');
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return 'Şimdi';
    if (diffInMinutes < 60) return `${diffInMinutes} dk önce`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} saat önce`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)} gün önce`;
    
    return format(date, 'dd MMM yyyy', { locale: tr });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Destek Mesajları</h1>
        <p className="mt-2 text-gray-600">
          Kullanıcılardan gelen destek taleplerini görüntüleyin ve cevaplayın
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
        {/* Konuşma Listesi */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Konuşmalar ({conversations.length})
            </h2>
          </div>
          
          <div className="overflow-y-auto h-full">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p className="mt-2">Henüz mesaj yok</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.userId}
                  onClick={() => setSelectedUserId(conv.userId)}
                  className={`w-full p-4 border-b hover:bg-gray-50 transition-colors text-left ${
                    selectedUserId === conv.userId ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {conv.userName}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{conv.userEmail}</p>
                      <p className="mt-1 text-sm text-gray-600 truncate">
                        {conv.isAdminReply && <span className="text-blue-600">Siz: </span>}
                        {conv.lastMessage}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 ml-2 flex-shrink-0">
                      {formatMessageTime(conv.lastMessageTime)}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Mesaj Alanı */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow flex flex-col">
          {selectedUserId ? (
            <>
              {/* Header */}
              <div className="p-4 bg-gray-50 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {conversations.find((c) => c.userId === selectedUserId)?.userName}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {conversations.find((c) => c.userId === selectedUserId)?.userEmail}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mesajlar */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isAdminReply ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        msg.isAdminReply
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {msg.isAdminReply && msg.adminName && (
                        <p className="text-xs opacity-80 mb-1">{msg.adminName}</p>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.isAdminReply ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {formatMessageTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Cevap Alanı */}
              <div className="p-4 bg-gray-50 border-t">
                <div className="flex gap-2">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendReply();
                      }
                    }}
                    placeholder="Cevabınızı yazın... (Enter ile gönder)"
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={!replyText.trim() || sending}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {sending ? (
                      <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
                      'Gönder'
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p className="mt-2">Bir konuşma seçin</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

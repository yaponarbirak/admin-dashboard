# YOB Admin Panel - RFC Documentation

Bu klasör, Yap Onar Bırak Admin Panel projesinin Request for Comments (RFC) dokümanlarını içerir.

## 📚 RFC Listesi

| RFC #                                               | Başlık                                    | Durum           | Tarih        |
| --------------------------------------------------- | ----------------------------------------- | --------------- | ------------ |
| [RFC-001](./RFC-001-project-overview.md)            | Proje Genel Bakış                         | ✅ Onaylandı    | 24 Ekim 2025 |
| [RFC-002](./RFC-002-sprint-1-foundation.md)         | Sprint 1 - Temel Kurulum & Authentication | 🚧 Devam Ediyor | 24 Ekim 2025 |
| [RFC-003](./RFC-003-sprint-2-user-management.md)    | Sprint 2 - Kullanıcı Yönetimi             | 📋 Planlama     | 24 Ekim 2025 |
| [RFC-004](./RFC-004-sprint-3-notifications.md)      | Sprint 3 - Bildirim Sistemi               | 📋 Planlama     | 24 Ekim 2025 |
| [RFC-005](./RFC-005-sprint-4-content-management.md) | Sprint 4 - İçerik Yönetimi                | 📋 Planlama     | 24 Ekim 2025 |
| [RFC-006](./RFC-006-sprint-5-analytics.md)          | Sprint 5 - Analytics & Raporlama          | 📋 Planlama     | 24 Ekim 2025 |
| [RFC-007](./RFC-007-sprint-6-security.md)           | Sprint 6 - Güvenlik & Optimizasyon        | 📋 Planlama     | 24 Ekim 2025 |

## 🎯 Durum Göstergeleri

- ✅ **Onaylandı**: RFC onaylandı ve implementasyon başladı/tamamlandı
- 🚧 **Devam Ediyor**: Aktif olarak üzerinde çalışılıyor
- 📋 **Planlama**: Henüz başlanmadı, planlama aşamasında
- ❌ **Reddedildi**: RFC reddedildi veya iptal edildi
- 🔄 **Revizyon**: RFC gözden geçiriliyor/güncelleniyor

## 📖 RFC Nasıl Okunur?

1. **RFC-001** ile başlayın - Proje genel bakışını verir
2. Sprint sırasına göre ilerleyin (RFC-002 → RFC-007)
3. Her RFC kendi içinde bağımsız ancak birbirine referans verir

## 🏗️ Proje Yapısı

```
Sprint 1: Temel Kurulum (Hafta 1)
├─ Firebase SDK kurulumu
├─ Authentication sistemi
└─ Dashboard layout

Sprint 2: Kullanıcı Yönetimi (Hafta 2)
├─ Kullanıcı listesi
├─ Detay sayfası
└─ Ban/delete işlemleri

Sprint 3: Bildirim Sistemi (Hafta 3)
├─ Toplu bildirim
├─ Filtrelenmiş bildirim
└─ Template sistemi

Sprint 4: İçerik Yönetimi (Hafta 4)
├─ İlan yönetimi
├─ Başvuru yönetimi
└─ Yorum moderasyonu

Sprint 5: Analytics (Hafta 5)
├─ Dashboard stats
├─ Grafikler
└─ Export özelliği

Sprint 6: Güvenlik & Prod (Hafta 6)
├─ Security hardening
├─ Performance optimization
└─ Production deployment
```

## 💡 Katkıda Bulunma

Yeni bir RFC önermek veya mevcut birini güncellemek için:

1. Yeni RFC için template oluşturun
2. RFC numarasını sırayla verin
3. İlgili RFC'leri referans edin
4. Net ve anlaşılır yazın
5. Teknik detayları atlamamaya özen gösterin

## 🔗 İlgili Dokümanlar

- [Ana README](../../README.md)
- [Firebase Deployment Guide](../../../FIREBASE_DEPLOYMENT.md)
- [Flutter App README](../../../README.md)

## 📝 Notlar

- Her sprint için ayrı RFC var
- RFC'ler implementation sırasında güncellenebilir
- Tamamlanan sprint'ler için RFC durum güncellenir
- Önemli kararlar ve alternatifler RFC'lerde dokumentlenir

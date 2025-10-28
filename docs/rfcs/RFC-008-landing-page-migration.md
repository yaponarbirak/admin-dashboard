# RFC-008: Landing Page Migration to Next.js + Tailwind

**Status:** In Progress  
**Created:** 2025-10-28  
**Author:** GitHub Copilot

## Özet

Mevcut static HTML/CSS/jQuery tabanlı homepage'i modern Next.js + Tailwind CSS kullanarak yeniden oluşturma.

## Motivasyon

- Mevcut homepage Owl Carousel ve eski jQuery plugin'leri kullanıyor
- Next.js projesi içinde static HTML inject etmek sorunlara yol açıyor
- Modern, maintainable, responsive bir çözüm gerekli
- Tailwind CSS kullanarak daha temiz kod yapısı

## Teknik Detaylar

### Mevcut Yapı Analizi

**Sections (Bölümler):**

1. Hero/Slider Section - 3 slide (Owl Carousel)
2. Features Section - 6 özellik kartı
3. How It Works Section - 3 adım
4. Screenshots Section - Ekran görüntüleri galerisi
5. More Apps Section - Platform tanıtımı
6. Navigation - Dot menu (scroll navigation)

**Assets:**

- Slider images: 001.png, 002.png, 003.png
- Feature icons ve images
- Bootstrap 3.3.5 (gerekli değil, Tailwind'e geçilecek)
- Font Awesome 4.6.1 (modern versiyona güncellenecek)

### Yeni Yapı

**Tech Stack:**

- Next.js 16.0.0
- Tailwind CSS
- Framer Motion (animasyonlar için)
- Embla Carousel veya Swiper (modern slider için)
- React Icons (Font Awesome yerine)

**Component Hierarchy:**

```
src/app/page.tsx (Landing Page)
├── components/landing/
│   ├── Hero.tsx (Slider section)
│   ├── Features.tsx
│   ├── HowItWorks.tsx
│   ├── Screenshots.tsx
│   ├── MoreApps.tsx
│   └── Navigation.tsx (Dot menu)
```

## Implementation Plan

### ✅ Aşama 0: RFC & Planlama

- [x] RFC dokümanı oluştur
- [ ] Tasarım analizi

### 🎯 Aşama 1: Temel Yapı & Hero Section (En Kritik)

- [ ] Landing components klasör yapısı oluştur
- [ ] Modern slider kütüphanesi kur (embla-carousel)
- [ ] Hero/Slider component'i oluştur
  - 3 slide içeriği
  - Auto-play
  - Navigation dots
  - Responsive tasarım
- [ ] Resimleri Next.js Image'e çevir
- [ ] Ana sayfa layout'unu düzenle

**Çıktı:** Çalışan, modern slider ile hero section

### 🎯 Aşama 2: Features Section

- [ ] Features component oluştur
- [ ] 6 özellik kartı (grid layout)
- [ ] İkonlar (React Icons)
- [ ] Hover animasyonları
- [ ] Responsive grid

**Çıktı:** Özellikler bölümü tamamlandı

### 🎯 Aşama 3: How It Works Section

- [ ] HowItWorks component oluştur
- [ ] 3 adım kartları
- [ ] Step indicators
- [ ] Animasyonlar

**Çıktı:** Nasıl çalışır bölümü tamamlandı

### 🎯 Aşama 4: Screenshots & More Apps

- [ ] Screenshots gallery component
- [ ] MoreApps section (platform tanıtımı)
- [ ] Download buttons

**Çıktı:** Tüm content sections tamamlandı

### 🎯 Aşama 5: Navigation & Polish

- [ ] Scroll navigation (dot menu)
- [ ] Smooth scroll behavior
- [ ] Loading animations
- [ ] SEO optimizasyonları
- [ ] Performance optimizasyonu

**Çıktı:** Fully functional landing page

### 🎯 Aşama 6: Cleanup

- [ ] Eski homepage klasörünü temizle
- [ ] Kullanılmayan assets'leri sil
- [ ] Documentation güncelle

## Tasarım Prensipleri

1. **Minimal Değişiklik:** Mevcut tasarımın görünümünü olabildiğince koru
2. **Modern Stack:** Eski jQuery plugin'leri yerine modern React/Next.js çözümleri
3. **Performance:** Next.js Image, lazy loading, optimizasyon
4. **Responsive:** Mobile-first approach
5. **Accessible:** ARIA labels, semantic HTML

## Color Scheme (Mevcut)

- Primary: Mavi/Turuncu tonları (main-color.css'den)
- Background: Light/Dark sections alternating
- Text: Dark on light, light on dark

## Typography

- Headings: Bold, büyük fontlar
- Body: Readable, medium size
- Buttons: Clear CTAs

## Risks & Mitigations

**Risk:** Tasarım tam olarak aynı görünmeyebilir
**Mitigation:** Mevcut CSS'den renk ve spacing değerlerini al

**Risk:** Animasyonlar farklı davranabilir
**Mitigation:** Framer Motion ile kontrollü animasyonlar

## Success Criteria

- ✅ Landing page tamamen functional
- ✅ Slider düzgün çalışıyor
- ✅ Tüm bölümler responsive
- ✅ Performance iyi (Lighthouse > 90)
- ✅ Eski homepage klasörü kaldırılabilir

## Timeline

Tahmini süre: 2-3 saat

- Aşama 1: 45 dakika
- Aşama 2-4: 60 dakika
- Aşama 5-6: 30 dakika

## Next Steps

1. Modern slider kütüphanesi kur
2. Hero component'i oluştur
3. İçeriği transfer et

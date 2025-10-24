# Firebase Admin SDK Kurulum Rehberi

Bu rehber, Firebase Admin SDK için gerekli service account key'in nasıl oluşturulacağını adım adım anlatır.

## 📋 Gerekli Adımlar

### 1. Firebase Console'a Giriş

[Firebase Console](https://console.firebase.google.com/) adresine gidin ve `yaponarbirak-2a7dc` projenizi seçin.

### 2. Service Account Sayfasına Git

1. Sol menüden **⚙️ Project Settings** (Proje Ayarları) tıklayın
2. Üst menüden **Service Accounts** sekmesine geçin

Veya doğrudan buraya gidebilirsiniz:  
https://console.firebase.google.com/project/yaponarbirak-2a7dc/settings/serviceaccounts/adminsdk

### 3. Private Key Oluşturma

1. **"Generate New Private Key"** (Yeni Özel Anahtar Oluştur) butonuna tıklayın
2. Açılan uyarıda **"Generate Key"** (Anahtar Oluştur) butonuna tıklayın
3. Bir JSON dosyası otomatik olarak indirilecek (örn: `yaponarbirak-2a7dc-firebase-adminsdk-xxxxx.json`)

⚠️ **ÖNEMLİ:** Bu dosya çok hassastır! Güvenli bir yerde saklayın ve ASLA public repository'ye commit etmeyin.

### 4. JSON Dosyasını İnceleme

İndirilen JSON dosyası şu formatta olacak:

```json
{
  "type": "service_account",
  "project_id": "yaponarbirak-2a7dc",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@yaponarbirak-2a7dc.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

### 5. Environment Variables'a Ekleme

`.env.local` dosyanızı açın ve aşağıdaki değerleri JSON dosyasından kopyalayın:

```env
# Firebase Admin SDK (Server Only)
FIREBASE_PROJECT_ID=yaponarbirak-2a7dc
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@yaponarbirak-2a7dc.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nXXXXXXXXXXXX...\n-----END PRIVATE KEY-----\n"
```

**Önemli Notlar:**

- `FIREBASE_PRIVATE_KEY` değerini **çift tırnak içinde** yazın
- `\n` karakterlerini olduğu gibi bırakın (değiştirmeyin)
- Private key çok uzun olabilir, tamamını kopyalayın

### 6. Doğrulama

Kurulumun doğru yapıldığını test etmek için:

```bash
node scripts/create-admin.js --env
```

Eğer aşağıdaki gibi bir çıktı görürseniz kurulum başarılı:

```
✅ Firebase Admin SDK initialized
🔄 Creating admin user from environment variables...
...
```

Hata alırsanız:

- `.env.local` dosyasındaki değerleri kontrol edin
- Private key'in tam olduğundan emin olun
- Çift tırnakları kontrol edin

## 🔒 Güvenlik Önerileri

### ❌ YAPMAYIN:

- Service account JSON dosyasını Git'e commit etmeyin
- `.env.local` dosyasını commit etmeyin
- Private key'i public bir yerde paylaşmayın
- Screenshot alıp paylaşmayın

### ✅ YAPIN:

- JSON dosyasını güvenli bir yerde saklayın (password manager)
- `.env.local` dosyasının `.gitignore`'da olduğundan emin olun
- Production'da environment variables kullanın (Vercel/Firebase Hosting)
- Düzenli olarak keys'leri rotate edin

## 🚀 Sonraki Adımlar

Service account kurulumu tamamlandıktan sonra:

1. ✅ İlk admin kullanıcısını oluşturun:

   ```bash
   node scripts/create-admin.js
   ```

2. ✅ Development server'ı başlatın:

   ```bash
   npm run dev
   ```

3. ✅ Sprint 1'in kalan görevlerine geçin (Auth Provider, Login Page vb.)

## ❓ Sorun Giderme

### Hata: "Missing Firebase Admin SDK credentials"

**Sebep:** Environment variables eksik veya yanlış

**Çözüm:**

1. `.env.local` dosyasının mevcut olduğundan emin olun
2. Tüm required değerlerin dolu olduğunu kontrol edin
3. Server'ı yeniden başlatın (`npm run dev`)

### Hata: "Invalid private key"

**Sebep:** Private key formatı bozuk

**Çözüm:**

1. Private key'i JSON dosyasından tekrar kopyalayın
2. Çift tırnakların doğru olduğundan emin olun
3. `\n` karakterlerinin değişmediğinden emin olun

### Hata: "Permission denied"

**Sebep:** Service account yeterli yetkiye sahip değil

**Çözüm:**

1. Firebase Console'da service account rollerini kontrol edin
2. "Firebase Admin SDK Admin Service Agent" rolü olmalı
3. Gerekirse yeni bir key oluşturun

## 📞 Destek

Daha fazla yardım için:

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- RFC dokümanlarını inceleyin

---

**Son Güncelleme:** 24 Ekim 2025

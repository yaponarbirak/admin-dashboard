#!/usr/bin/env node

/**
 * Firebase Migration Script
 * 
 * Bu script Sanity'den export edilen verileri Firebase Firestore'a migrate eder.
 * 
 * Gereksinimler:
 * - Firebase Admin SDK service account credentials
 * - Sanity export dosyaları (sanity-export/ klasöründe)
 * 
 * Kullanım:
 *   node migrate-to-firebase.js
 */

require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Firebase Admin SDK initialization
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
  console.error('❌ Firebase Admin SDK credentials eksik!');
  console.error('Lütfen .env dosyasında şu değişkenleri ayarlayın:');
  console.error('  - FIREBASE_PROJECT_ID');
  console.error('  - FIREBASE_CLIENT_EMAIL');
  console.error('  - FIREBASE_PRIVATE_KEY');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.projectId,
});

const db = admin.firestore();

// Export dosyalarının yolu
const EXPORT_DIR = path.join(__dirname, '../../Sanity/sanity-export');

/**
 * Slug'a göre category ID döndürür
 */
function getCategoryIdFromSlug(slug) {
  return slug; // Slug'ı ID olarak kullanıyoruz
}

/**
 * Advertisement Preferences'ı migrate et (repair_categories)
 */
async function migrateRepairCategories() {
  console.log('\n📂 Migrating Repair Categories...');
  
  const filePath = path.join(EXPORT_DIR, 'advertisement-preferences.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const item of data) {
    try {
      const docData = {
        id: item.slug,
        title: item.title,
        slug: item.slug,
        order: 0, // Manuel ayarlanacak
        isActive: true,
        createdAt: admin.firestore.Timestamp.fromDate(new Date(item._createdAt)),
        updatedAt: admin.firestore.Timestamp.fromDate(new Date(item._updatedAt)),
        createdBy: 'migration-script',
        updatedBy: 'migration-script',
      };
      
      await db.collection('repair_categories').doc(item.slug).set(docData);
      console.log(`✅ Category: ${item.title} (${item.slug})`);
      successCount++;
    } catch (error) {
      console.error(`❌ Error migrating category ${item.title}:`, error.message);
      errorCount++;
    }
  }
  
  console.log(`\n✨ Categories: ${successCount} başarılı, ${errorCount} hatalı`);
  return { successCount, errorCount };
}

/**
 * Advertisement Types'ı migrate et (repair_types)
 */
async function migrateRepairTypes() {
  console.log('\n📂 Migrating Repair Types...');
  
  const filePath = path.join(EXPORT_DIR, 'advertisement-types.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const item of data) {
    try {
      const docData = {
        id: item.slug,
        title: item.title,
        slug: item.slug,
        icon: item.icon || '',
        order: item.order || 0,
        categoryId: item.categoryId || '',
        subCategoryId: item.subCategoryId || null,
        exampleSentences: item.exampleSentences || [],
        isActive: true,
        createdAt: admin.firestore.Timestamp.fromDate(new Date(item._createdAt)),
        updatedAt: admin.firestore.Timestamp.fromDate(new Date(item._updatedAt)),
        createdBy: 'migration-script',
        updatedBy: 'migration-script',
      };
      
      await db.collection('repair_types').doc(item.slug).set(docData);
      console.log(`✅ Type: ${item.title} (${item.slug})`);
      successCount++;
    } catch (error) {
      console.error(`❌ Error migrating type ${item.title}:`, error.message);
      errorCount++;
    }
  }
  
  console.log(`\n✨ Types: ${successCount} başarılı, ${errorCount} hatalı`);
  return { successCount, errorCount };
}

/**
 * Sliders'ı migrate et (home_sliders)
 */
async function migrateHomeSliders() {
  console.log('\n📂 Migrating Home Sliders...');
  
  const filePath = path.join(EXPORT_DIR, 'sliders.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const sliderDoc of data) {
    if (!sliderDoc.slides || sliderDoc.slides.length === 0) {
      console.log('⚠️ Slider dokümanda slide yok, atlanıyor...');
      continue;
    }
    
    for (let i = 0; i < sliderDoc.slides.length; i++) {
      const slide = sliderDoc.slides[i];
      try {
        const docId = `slider-${i + 1}`;
        const docData = {
          id: docId,
          title: slide.title || `Slider ${i + 1}`,
          imageUrl: slide.imageUrl || '',
          order: i + 1,
          isActive: true,
          createdAt: admin.firestore.Timestamp.fromDate(new Date(sliderDoc._createdAt)),
          updatedAt: admin.firestore.Timestamp.fromDate(new Date(sliderDoc._updatedAt)),
          createdBy: 'migration-script',
          updatedBy: 'migration-script',
        };
        
        await db.collection('home_sliders').doc(docId).set(docData);
        console.log(`✅ Slider: ${slide.title} (${docId})`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error migrating slider ${slide.title}:`, error.message);
        errorCount++;
      }
    }
  }
  
  console.log(`\n✨ Sliders: ${successCount} başarılı, ${errorCount} hatalı`);
  return { successCount, errorCount };
}

/**
 * Home Cards'ı migrate et (home_cards)
 */
async function migrateHomeCards() {
  console.log('\n📂 Migrating Home Cards...');
  
  const filePath = path.join(EXPORT_DIR, 'home-cards.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const cardsDoc of data) {
    if (!cardsDoc.cards || cardsDoc.cards.length === 0) {
      console.log('⚠️ Home cards dokümanda kart yok, atlanıyor...');
      continue;
    }
    
    for (const card of cardsDoc.cards) {
      try {
        // Action key'e göre ID oluştur
        const docId = `card-${card.actionKey}`;
        const docData = {
          id: docId,
          title: card.title || '',
          imageUrl: card.imageUrl || '',
          actionKey: card.actionKey || 'repair',
          order: card.order || 1,
          isActive: true,
          createdAt: admin.firestore.Timestamp.fromDate(new Date(cardsDoc._createdAt)),
          updatedAt: admin.firestore.Timestamp.fromDate(new Date(cardsDoc._updatedAt)),
          createdBy: 'migration-script',
          updatedBy: 'migration-script',
        };
        
        await db.collection('home_cards').doc(docId).set(docData);
        console.log(`✅ Card: ${card.title} (${docId})`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error migrating card ${card.title}:`, error.message);
        errorCount++;
      }
    }
  }
  
  console.log(`\n✨ Home Cards: ${successCount} başarılı, ${errorCount} hatalı`);
  return { successCount, errorCount };
}

/**
 * Migration summary'yi göster
 */
function showSummary(results) {
  console.log('\n' + '═'.repeat(50));
  console.log('📊 MIGRATION SUMMARY');
  console.log('═'.repeat(50));
  
  const totalSuccess = Object.values(results).reduce((sum, r) => sum + r.successCount, 0);
  const totalErrors = Object.values(results).reduce((sum, r) => sum + r.errorCount, 0);
  
  console.log(`\n✅ Total Success: ${totalSuccess}`);
  console.log(`❌ Total Errors: ${totalErrors}`);
  console.log('\nDetails:');
  console.log(`  Repair Categories: ${results.categories.successCount}/${results.categories.successCount + results.categories.errorCount}`);
  console.log(`  Repair Types: ${results.types.successCount}/${results.types.successCount + results.types.errorCount}`);
  console.log(`  Home Sliders: ${results.sliders.successCount}/${results.sliders.successCount + results.sliders.errorCount}`);
  console.log(`  Home Cards: ${results.cards.successCount}/${results.cards.successCount + results.cards.errorCount}`);
  
  console.log('\n' + '═'.repeat(50));
  
  if (totalErrors === 0) {
    console.log('✨ Migration completed successfully!\n');
  } else {
    console.log('⚠️ Migration completed with some errors.\n');
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting Firebase Migration...');
  console.log(`📍 Export Directory: ${EXPORT_DIR}\n`);
  
  // Export dosyalarının varlığını kontrol et
  const requiredFiles = [
    'advertisement-preferences.json',
    'advertisement-types.json',
    'sliders.json',
    'home-cards.json',
  ];
  
  for (const file of requiredFiles) {
    const filePath = path.join(EXPORT_DIR, file);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Export dosyası bulunamadı: ${file}`);
      console.error(`Lütfen önce Sanity export scriptini çalıştırın.`);
      process.exit(1);
    }
  }
  
  try {
    const results = {
      categories: await migrateRepairCategories(),
      types: await migrateRepairTypes(),
      sliders: await migrateHomeSliders(),
      cards: await migrateHomeCards(),
    };
    
    showSummary(results);
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the script
main();

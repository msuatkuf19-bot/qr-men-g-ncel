/**
 * Demo Request CRM Migration Helper
 * 
 * Bu script veritabanını yeni CRM yapısına geçirmek için kullanılır.
 * 
 * Yapılacaklar:
 * 1. Yeni PotentialStatus enum'ını oluştur
 * 2. Eski status ve potential değerlerini potentialStatus'a map et
 * 3. Kullanılmayan kolonları kaldır (membershipStartDate, membershipEndDate)
 * 4. Eski enum'ları kaldır
 * 
 * KULLANIM:
 * Prisma migrate kullanmak için:
 *   npx prisma migrate dev --name demo_request_crm_update
 * 
 * Manuel olarak uygulamak için:
 *   psql veya pgAdmin ile migration.sql dosyasını çalıştırın
 */

console.log('✅ Demo Request CRM Migration scripti hazır');
console.log('📝 Lütfen aşağıdaki adımları takip edin:\n');
console.log('1. Backend klasöründe:');
console.log('   cd backend');
console.log('   npx prisma migrate dev --name demo_request_crm_update\n');
console.log('2. Migration otomatik olarak uygulanacak\n');
console.log('3. Prisma Client yeniden generate edilecek\n');
console.log('⚠️  Not: Mevcut demo request kayıtları otomatik olarak yeni yapıya aktarılacak');

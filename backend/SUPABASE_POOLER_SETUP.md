# Supabase Pooler (Supavisor) Yapılandırması

## İlk Okuma Gecikmesi Çözümü

QR menü sisteminde ilk okuma gecikmesi genellikle şu nedenlerden kaynaklanır:

1. **Cold Start**: Sunucu ilk kez çalışmaya başladığında veritabanı bağlantısı kurulması
2. **Direct Connection**: Supabase'e doğrudan bağlantı yerine pooler kullanılmaması
3. **Connection Pool**: Her istekte yeni bağlantı açılması

## DATABASE_URL Yapılandırması

### ❌ Eski (Direct Connection - Yavaş)
```
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

### ✅ Yeni (Pooler Connection - Hızlı)
```
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=10&pool_timeout=20"
```

## Supabase Dashboard'dan Pooler URL Alma

1. [Supabase Dashboard](https://supabase.com/dashboard) → Projenizi seçin
2. **Settings** → **Database** → **Connection String** 
3. **Mode: Session** veya **Mode: Transaction** seçin
4. **URI** kopyalayın (6543 portlu olan)

## Önemli Parametreler

| Parametre | Değer | Açıklama |
|-----------|-------|----------|
| `pgbouncer` | `true` | Pooler modunu aktifleştirir |
| `connection_limit` | `10` | Maksimum eşzamanlı bağlantı (fazla olmasın) |
| `pool_timeout` | `20` | Bağlantı havuzu timeout (saniye) |

## Prisma Schema Ayarları

`prisma/schema.prisma` dosyasında:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")        // Pooler URL (6543 port)
  directUrl = env("DIRECT_URL")          // Direct URL (5432 port) - migrations için
}
```

## .env Örneği

```env
# Supabase Pooler URL (günlük sorgular için - hızlı)
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=10&pool_timeout=20"

# Direct URL (migrations için - yavaş ama gerekli)
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

## Timing Log Çıktısı Analizi

Deploy sonrası logları kontrol edin:

```
[TIMING][QR-MENU] slug=restoran-adi
  t0: Request received
  t1: DB connect: 5ms       ← 1000ms+ ise pooler sorunu
  t2: Restaurant query: 15ms
  t2: Categories query: 25ms
  t2: Analytics upsert: 3ms
  t3: Total response: 50ms   ← 100ms altı ideal
```

### Gecikme Analizi

| t1 (DB Connect) | Anlam |
|-----------------|-------|
| < 10ms | ✅ Mükemmel (warm bağlantı) |
| 10-50ms | ✅ İyi (pooler çalışıyor) |
| 50-200ms | ⚠️ Kabul edilebilir (cold start) |
| 200-1000ms | ❌ Sorun var (pooler yok veya yanlış) |
| > 1000ms | ❌ Kritik (direct connection kullanılıyor) |

## Kontrol Listesi

- [ ] DATABASE_URL'de port `6543` mi? (5432 değil)
- [ ] `pgbouncer=true` parametresi var mı?
- [ ] `connection_limit` çok yüksek değil mi? (10-20 ideal)
- [ ] Prisma schema'da `directUrl` tanımlı mı?
- [ ] Server başlangıcında warm-up yapılıyor mu?

## Ek Optimizasyonlar (Zaten Uygulandı)

1. ✅ **PrismaClient Global Singleton**: Tüm ortamlarda tek instance
2. ✅ **Database Warm-up**: Server başlangıcında bağlantı açılır
3. ✅ **Analytics Fire-and-Forget**: Response'u bekletmez
4. ✅ **Cache-Control Headers**: CDN cache aktif
5. ✅ **Timing Logs**: Performans ölçümü

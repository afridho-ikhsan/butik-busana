# PWA & Push Notification Setup

## Fitur Notifikasi

| Trigger | Judul | Penerima |
|---------|-------|----------|
| Midtrans: pembayaran gagal (deny/cancel/expire/failure) | Pembayaran Gagal | Customer (pembeli) |
| Midtrans: pembayaran berhasil (settlement/capture) | Pembayaran Berhasil | Customer |
| Admin approve pembayaran (manual) | Pembayaran Disetujui | Customer |
| Cron payment reminder (order NOT_PAID > 24 jam) | Reminder: Belum Bayar | Customer |

Customer harus login, klik "Aktifkan notifikasi" di navbar, dan mengizinkan permission browser.

---

## 1. Install dependencies

```bash
npm install
```

## 2. Generate VAPID keys (untuk Web Push)

```bash
node scripts/generate-vapid.js
```

Salin output ke `.env.local`:
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`

## 3. Tambah ikon PWA

Letakkan file di `public/`:
- `icon-192.png` (192x192 px)
- `icon-512.png` (512x512 px)

## 4. Cron (opsional)

**Payment reminder** – kirim push ke user yang punya order NOT_PAID &gt; 24 jam:
`GET /api/cron/payment-reminder`

**Cancel expired orders** – batalkan otomatis order NOT_PAID yang sudah lewat 24 jam:
`GET /api/cron/cancel-expired-orders`

Tambah `CRON_SECRET` di env dan set header:
`Authorization: Bearer <CRON_SECRET>`

Contoh Vercel cron di `vercel.json`:
```json
{
  "crons": [
    { "path": "/api/cron/payment-reminder", "schedule": "0 */6 * * *" },
    { "path": "/api/cron/cancel-expired-orders", "schedule": "0 * * * *" }
  ]
}
```

## 5. Jalankan migrasi

```bash
npx prisma db push
```

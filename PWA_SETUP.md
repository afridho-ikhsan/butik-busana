# PWA & Push Notification Setup

## Fitur Notifikasi

| Trigger | Judul | Penerima |
|---------|-------|----------|
| Midtrans: pembayaran gagal (deny/cancel/expire/failure) | Pembayaran Gagal | Customer (pembeli) |
| Midtrans: pembayaran berhasil (settlement/capture) | Pembayaran Berhasil | Customer |
| Admin approve pembayaran (manual) | Pembayaran Disetujui | Customer |
| Cron payment reminder (order NOT_PAID > 24 jam) | Reminder: Belum Bayar | Customer |
| Cron payment deadline (sisa 30 / 15 / 5 menit) | Pembayaran X menit lagi habis | Customer |

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

## 4. Cron

Tambah `CRON_SECRET` di env. Setiap request cron pakai header:
`Authorization: Bearer <CRON_SECRET>`

| Endpoint | Fungsi |
|----------|--------|
| `GET /api/cron/payment-deadline-reminder` | Push saat sisa waktu pembayaran 30, 15, dan 5 menit (deadline = 24 jam sejak order dibuat) |
| `GET /api/cron/payment-reminder` | Push order NOT_PAID &gt; 24 jam (opsional) |
| `GET /api/cron/cancel-expired-orders` | Batalkan order NOT_PAID lewat 24 jam |

### cron-job.org (payment deadline, tiap 1 menit)

1. Buat akun di [cron-job.org](https://cron-job.org).
2. **Create cronjob** → URL production:
   `https://<domain-anda>/api/cron/payment-deadline-reminder`
3. **Schedule**: Every 1 minute (`* * * * *` atau pilih interval 1 menit di UI).
4. **Request method**: GET.
5. **Headers** (Advanced):
   - Name: `Authorization`
   - Value: `Bearer <CRON_SECRET>` (sama dengan nilai `CRON_SECRET` di `.env`).
6. Simpan dan aktifkan job.

Tanpa cron tiap menit, jendela 30/15/5 menit bisa terlewat.

Cron lain (cancel, reminder 24 jam) bisa job terpisah di cron-job.org dengan jadwal sendiri, atau Vercel cron jika dipakai.

## 5. Jalankan migrasi

```bash
npx prisma db push
```

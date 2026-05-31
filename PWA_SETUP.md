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

### Deadline pembayaran (env)

Semua timer UI, cancel otomatis, dan cron push memakai `src/lib/payment-deadline.ts`.

| Variabel | Default | Keterangan |
|----------|---------|------------|
| `PAYMENT_DEADLINE_MINUTES` | `1440` (24 jam) | Lama order boleh belum bayar sebelum dibatalkan |
| `PAYMENT_DEADLINE_REMINDER_MINUTES` | `30,15,5` | Push saat **sisa** waktu tepat X menit (maks. 3 nilai) |

**Tes di production (deadline 16 menit, 3 push cepat):**

```env
PAYMENT_DEADLINE_MINUTES=16
PAYMENT_DEADLINE_REMINDER_MINUTES=14,15,16
```

Setelah deploy + restart app, buat order baru → aktifkan notifikasi → tunggu ±1–2 menit (push 16 & 15 menit), lalu ±11 menit (push 14 menit = sisa ~14 menit dari total 16). Sesuaikan angka reminder agar semua ≤ `PAYMENT_DEADLINE_MINUTES`.

Jadwalkan juga `cancel-expired-orders` (mis. tiap 1 menit saat tes) supaya order dibatalkan setelah 16 menit.

Setelah tes, hapus atau kembalikan ke `1440` dan `30,15,5`.

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
| `GET /api/cron/payment-deadline-reminder` | Push sesuai `PAYMENT_DEADLINE_REMINDER_MINUTES` |
| `GET /api/cron/payment-reminder` | Push order NOT_PAID lewat deadline (opsional) |
| `GET /api/cron/cancel-expired-orders` | Batalkan order NOT_PAID lewat deadline |

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

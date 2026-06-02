# Butik Busana Fashion

Platform **e-commerce PWA** untuk toko busana wanita muslim — gamis, tunik, dress, hijab, outerwear, dan aksesoris. Mendukung pembayaran **Midtrans** (Virtual Account, QRIS, e-wallet), bukti transfer manual, serta **notifikasi push** untuk status pesanan dan pengingat deadline pembayaran.

---

## Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Tech Stack](#tech-stack)
- [Prasyarat](#prasyarat)
- [Instalasi](#instalasi)
- [Konfigurasi Environment](#konfigurasi-environment)
- [Database & Seed](#database--seed)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Panduan Fitur — Pemilik Toko / Admin](#panduan-fitur--pemilik-toko--admin)
- [Panduan Fitur — Pelanggan](#panduan-fitur--pelanggan)
- [Panduan Developer](#panduan-developer)
- [PWA & Notifikasi Push](#pwa--notifikasi-push)
- [Cron Job](#cron-job)
- [Pengujian](#pengujian)
- [Deploy](#deploy)
- [Dokumentasi Tambahan](#dokumentasi-tambahan)

---

## Fitur Utama

### Pelanggan (front office)

| Fitur | Keterangan |
|-------|------------|
| Otentikasi | Register, login, logout (NextAuth + credentials) |
| Katalog produk | Lihat produk, filter koleksi, detail produk |
| Keranjang | Tambah/hapus item; tamu pakai localStorage, user login disimpan di server |
| Checkout & pesanan | Buat pesanan, pilih kurir, halaman pembayaran |
| Pembayaran Midtrans | VA, QRIS, e-wallet via Midtrans Snap |
| Transfer manual | Upload bukti pembayaran (Cloudinary) |
| Transaksi | Daftar pesanan, batalkan manual (belum bayar), lacak status |
| Notifikasi push | Aktifkan/nonaktifkan dari navbar; pengingat deadline 30/15/5 menit |

### Admin (back office)

| Fitur | Keterangan |
|-------|------------|
| Dashboard | Ringkasan toko di `/admin` |
| Produk & koleksi | CRUD produk, varian, gambar, koleksi |
| Pesanan | Lihat detail, approve pembayaran manual, unduh invoice PDF |
| Rekening bank | Kelola rekening untuk transfer manual |
| Slider & marquee | Konten beranda |
| Pengguna | Manajemen user |

### PWA & integrasi

- Installable PWA (`manifest.json`, service worker Workbox)
- Web Push (VAPID) — pembayaran, pembatalan, pengingat deadline
- Midtrans webhook — update status bayar otomatis
- Cron eksternal — reminder deadline & batalkan pesanan kedaluwarsa

---

## Tech Stack

| Lapisan | Teknologi |
|---------|-----------|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| UI | Ant Design, Tailwind CSS |
| Auth | NextAuth.js (JWT, credentials) |
| Database | MongoDB + Prisma ORM |
| State & data | TanStack React Query, Zustand |
| Pembayaran | Midtrans Snap |
| Media | Cloudinary |
| PWA | `@ducanh2912/next-pwa`, Workbox |
| Push | `web-push`, service worker `public/sw-push.js` |

---

## Prasyarat

- **Node.js** 18 atau lebih baru
- **npm** (atau pnpm/yarn)
- Akun **MongoDB** (Atlas atau lokal)
- Akun **Midtrans** (Sandbox untuk development)
- Akun **Cloudinary** (upload gambar)
- (Production) Akun **cron-job.org** atau scheduler serupa untuk endpoint cron

---

## Instalasi

```bash
git clone <url-repository-anda>
cd butik-busana
npm install
```

Generate kunci VAPID untuk Web Push:

```bash
npm run generate-vapid
```

Salin output ke file environment (langkah berikutnya).

---

## Konfigurasi Environment

Buat file `.env` atau `.env.local` di root proyek:

```env
# Database
DATABASE_URL="mongodb+srv://..."

# NextAuth
NEXTAUTH_SECRET="random-secret-min-32-char"
NEXTAUTH_URL="http://localhost:3000"

# URL aplikasi
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_LOGIN_REDIRECT_URL="http://localhost:3000"

# Midtrans (Sandbox contoh)
NEXT_PUBLIC_MIDTRANS_CLIENT="SB-Mid-client-..."
NEXT_PUBLIC_MIDTRANS_SNAP_URL="https://app.sandbox.midtrans.com/snap/snap.js"
MIDTRANS_ID_SECRET="SB-Mid-server-..."
MIDTRANS_IS_PRODUCTION="false"

# Cloudinary
NEXT_PUBLIC_UPLOAD_PRESET="nama_upload_preset"

# Web Push (VAPID)
NEXT_PUBLIC_VAPID_PUBLIC_KEY="..."
VAPID_PRIVATE_KEY="..."

# Cron (production)
CRON_SECRET="secret-untuk-cron-job"

# Deadline pembayaran (opsional)
PAYMENT_DEADLINE_MINUTES=1440
PAYMENT_DEADLINE_REMINDER_MINUTES=30,15,5

# Dev: tombol test push di navbar (opsional)
NEXT_PUBLIC_PUSH_TEST_ENABLED="true"
```

| Variabel | Wajib | Keterangan |
|----------|:-----:|------------|
| `DATABASE_URL` | ✓ | Connection string MongoDB |
| `NEXTAUTH_SECRET` | ✓ | Secret sesi NextAuth |
| `NEXTAUTH_URL` | ✓ | URL base aplikasi |
| `NEXT_PUBLIC_MIDTRANS_*` | ✓ | Client key & URL Snap Midtrans |
| `MIDTRANS_ID_SECRET` | ✓ | Server key Midtrans |
| `NEXT_PUBLIC_UPLOAD_PRESET` | ✓ | Preset unsigned Cloudinary |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | ✓* | *Wajib jika push dipakai |
| `VAPID_PRIVATE_KEY` | ✓* | Pasangan VAPID public key |
| `CRON_SECRET` | Prod | Bearer token untuk endpoint cron |
| `PAYMENT_DEADLINE_MINUTES` | — | Default `1440` (24 jam) |
| `PAYMENT_DEADLINE_REMINDER_MINUTES` | — | Default `30,15,5` |

---

## Database & Seed

Sinkronkan schema ke MongoDB:

```bash
npm run db:push
```

Isi data awal (role, admin, koleksi, produk contoh):

```bash
npm run db:seed
```

**Akun admin default (seed):**

| Field | Nilai |
|-------|-------|
| Email | `admin@butik-busana.com` |
| Password | `password123` |

Login admin → buka `/admin`.

---

## Menjalankan Aplikasi

**Development** (PWA dinonaktifkan di dev):

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

**Production lokal:**

```bash
npm run build
npm start
```

**Lint:**

```bash
npm run lint
```

---

## Panduan Fitur — Pemilik Toko / Admin

1. **Login** di `/login` dengan akun admin/owner.
2. **Dashboard** — `/admin` untuk navigasi modul.
3. **Produk** — `/admin/products`: tambah/edit produk, varian, harga, stok, gambar.
4. **Koleksi** — `/admin/collections`: kategori (Gamis, Dress, Hijab, dll.).
5. **Pesanan** — `/admin/orders`: lihat status, bukti transfer, **Approve** jika pelanggan bayar manual.
6. **Rekening bank** — `/admin/rekening-bank`: data rekening tampil di halaman pembayaran pelanggan.
7. **Slider & marquee** — konten promosi di halaman utama.

> Setelah approve manual, pelanggan menerima push **Pembayaran Disetujui** (jika notifikasi sudah diaktifkan).

---

## Panduan Fitur — Pelanggan

1. **Jelajahi katalog** — `/products`, klik produk untuk detail.
2. **Keranjang** — tambah barang dari modal keranjang (ikon navbar).
3. **Checkout** — isi alamat & kurir, buat pesanan.
4. **Bayar** — modal pembayaran:
   - **Midtrans**: tombol *Bayar Virtual Account / QRIS* (wajib login).
   - **Transfer manual**: salin rekening, upload bukti, kirim.
5. **Transaksi** — `/user/{slug}/transactions`: lihat status, bayar, **Batalkan** (belum bayar).
6. **Notifikasi** — klik *Aktifkan notifikasi* di navbar, izinkan di browser.

**Notifikasi otomatis yang diterima pelanggan:**

| Trigger | Judul notifikasi |
|---------|------------------|
| Pembayaran Midtrans sukses | Pembayaran Berhasil |
| Pembayaran Midtrans gagal | Pembayaran Gagal |
| Admin approve bukti manual | Pembayaran Disetujui |
| Batalkan pesanan manual | Pesanan Dibatalkan |
| Cron batalkan kedaluwarsa | Pesanan Dibatalkan |
| Cron sisa 30 / 15 / 5 menit | Pembayaran X menit lagi habis |

---

## Panduan Developer

### Struktur folder utama

```
src/
├── app/
│   ├── (customer)/     # Halaman pelanggan
│   ├── (admin)/        # Panel admin
│   └── api/            # REST API & cron
├── components/         # UI React
├── hooks/              # Custom hooks (API ke halaman)
├── services/           # Pemanggilan axios
├── lib/                # Auth, push, prisma, payment-deadline
└── actions.ts          # Server actions (Midtrans token, cancel order, dll.)

prisma/
├── schema.prisma       # Model database
└── seed.ts             # Data awal

diagrams/               # PlantUML skripsi (use case, activity, sequence, ERD)
public/
├── manifest.json       # PWA manifest
└── sw-push.js          # Handler push notification
```

### Pola kode frontend (API)

```
axios client → service → hook → page/component
```

Contoh: keranjang memakai `useCart` → `cart.service` → `/api/cart`.

### Endpoint cron (GET, header `Authorization: Bearer <CRON_SECRET>`)

| Endpoint | Fungsi |
|----------|--------|
| `/api/cron/payment-deadline-reminder` | Push pengingat 30/15/5 menit |
| `/api/cron/cancel-expired-orders` | Batalkan pesanan lewat deadline |
| `/api/cron/payment-reminder` | Reminder order belum bayar (opsional) |

### Webhook Midtrans

`POST /api/midtrans-notification` — dipanggil Midtrans saat status transaksi berubah.

---

## PWA & Notifikasi Push

Detail setup: lihat **[PWA_SETUP.md](./PWA_SETUP.md)**.

Ringkas:

1. `npm run generate-vapid` → isi VAPID di `.env`
2. Pastikan `public/logo-butik.png` ada (ikon PWA)
3. Production: build dengan `npm run build` (PWA aktif)
4. Pelanggan: *Aktifkan notifikasi* di navbar
5. Jadwalkan cron di [cron-job.org](https://cron-job.org) (interval 1 menit untuk reminder)

---

## Cron Job

Contoh konfigurasi di **cron-job.org**:

- **URL:** `https://domain-anda.com/api/cron/payment-deadline-reminder`
- **Method:** GET
- **Header:** `Authorization: Bearer <CRON_SECRET>`
- **Schedule:** setiap 1 menit (agar jendela 30/15/5 menit tidak terlewat)

Ulangi untuk `/api/cron/cancel-expired-orders`.

---

## Pengujian

Validasi kualitas sistem (sesuai dokumentasi skripsi):

| Jenis | Metode | Bukti |
|-------|--------|-------|
| **Black Box Testing** | Pengujian fungsional per use case (login, keranjang, pembayaran, push, dll.) | Laporan Testing (dokumen terpisah) |
| **Lighthouse** | Audit PWA, Performance, Accessibility, SEO | Screenshot skor Lighthouse di Chrome DevTools |

**Menjalankan Lighthouse:**

1. Build production: `npm run build && npm start`
2. Buka Chrome → DevTools → tab **Lighthouse**
3. Pilih kategori (Performance, PWA, Accessibility, Best Practices, SEO)
4. Generate report untuk halaman utama dan halaman produk

---

## Deploy

1. Set semua variabel environment di platform hosting (Vercel, VPS, dll.).
2. `npm run build`
3. Pastikan `DATABASE_URL` mengarah ke MongoDB production.
4. Set `MIDTRANS_IS_PRODUCTION=true` saat go-live Midtrans.
5. Daftarkan URL webhook Midtrans: `https://domain-anda.com/api/midtrans-notification`
6. Aktifkan cron job production dengan `CRON_SECRET`.

---

## Dokumentasi Tambahan

| File / Folder | Isi |
|---------------|-----|
| [PWA_SETUP.md](./PWA_SETUP.md) | Setup push, VAPID, cron, env deadline |
| [diagrams/](./diagrams/) | Use case, activity, sequence diagram, class diagram, ERD (`.dbml`) |
| `prisma/schema.prisma` | Model data lengkap |

---

## Scripts npm

| Perintah | Fungsi |
|----------|--------|
| `npm run dev` | Server development |
| `npm run build` | Build production (+ PWA) |
| `npm start` | Jalankan build production |
| `npm run lint` | ESLint |
| `npm run db:push` | Sync schema Prisma → MongoDB |
| `npm run db:seed` | Isi data awal |
| `npm run generate-vapid` | Generate pasangan kunci VAPID |

---

## Lisensi

Proyek skripsi — hak cipta mengikuti kebijakan institusi penulis.

<div align="center">

  # CashMap

![CashMap Logo](public/apple-touch-icon.png)

**Master Your Money Flow.** Lacak pengeluaran, atur anggaran ketat, dan capai target tabungan. Semua dalam satu dasbor yang bersih dan bebas gangguan.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-purple?style=for-the-badge&logo=pwa)](https://web.dev/progressive-web-apps/)

[Lihat Demo](https://cash-map.vercel.app/) · [Lapor Bug](https://github.com/rizasaputra29/cashmap/issues) · [Request Fitur](https://github.com/rizasaputra29/cashmap/issues)

</div>

---

## 📖 Tentang Proyek

**CashMap** adalah aplikasi pelacak keuangan modern yang dibangun sebagai **Progressive Web App (PWA)**. Aplikasi ini membantu pengguna mendapatkan kendali penuh atas keuangan mereka melalui kategorisasi cerdas, perhitungan anggaran *real-time*, dan pelacakan tujuan tabungan.

Berbeda dengan pelacak biasa, CashMap berfokus pada analitik **"Daily Safe-to-Spend"** — menghitung secara otomatis berapa banyak yang aman untuk dibelanjakan hari ini tanpa melanggar batas anggaran bulanan Anda, yang menyesuaikan diri secara dinamis setiap hari.

### ✨ Fitur Utama

* **📱 Progressive Web App (PWA):** Dapat diinstal di perangkat seluler (iOS/Android) untuk pengalaman seperti aplikasi native.
* **📊 Dasbor Pintar:** Tinjauan *real-time* Total Saldo, Pemasukan vs Pengeluaran, dan aktivitas transaksi terbaru.
* **📉 Dynamic Budgeting:** Tetapkan rentang tanggal dan total anggaran. Aplikasi menghitung **Batas Harian (Daily Limit)** secara otomatis berdasarkan sisa hari dan dana.
* **🎯 Savings Goals:** Visualisasikan kemajuan Anda menuju target tertentu (misal: HP Baru, Liburan) dengan indikator persentase.
* **📝 Manajemen Transaksi:** Catat pemasukan/pengeluaran dengan mudah, kategorisasi, dan filter berdasarkan tanggal.
* **🔐 Keamanan:** Sistem autentikasi kustom dengan *password hashing* (bcrypt) dan pertanyaan keamanan untuk pemulihan akun.
* **💾 Kedaulatan Data:** Fitur **Backup & Restore** mandiri. Ekspor data keuangan ke format JSON dan impor kembali kapan saja untuk memindahkan data antar perangkat.
* **🎨 UI Modern:** Dibangun dengan **Shadcn UI** dan **Framer Motion** untuk antarmuka yang halus, responsif, dan estetis.

---

## 📸 Screenshot

<div align="center">
  <img src="public/landing-mockup.png" alt="Landing Page" width="45%">
  <img src="public/dashboard-mockup.png" alt="Dashboard" width="45%">
</div>

---

## 🛠️ Tech Stack

Proyek ini dibangun menggunakan teknologi web modern terkini:

| Kategori | Teknologi |
| :--- | :--- |
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) |
| **Bahasa** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) |
| **ORM** | [Prisma](https://www.prisma.io/) |
| **Ikon** | [Lucide React](https://lucide.dev/) |
| **Animasi** | [Framer Motion](https://www.framer.com/motion/) |
| **Media** | [Next Cloudinary](https://next.cloudinary.dev/) (Upload Avatar) |
| **Enkripsi** | [Bcrypt.js](https://www.npmjs.com/package/bcryptjs) |

---

## 🚀 Mulai Menggunakan (Localhost)

Ikuti langkah-langkah ini untuk menjalankan proyek secara lokal di mesin Anda.

### Prasyarat

* Node.js (v18 atau lebih baru)
* PostgreSQL Database (Lokal atau Cloud seperti Neon/Supabase)
* Akun Cloudinary (untuk fitur upload foto profil)

### Instalasi

1.  **Clone repositori**
    ```bash
    git clone [https://github.com/rizasaputra29/cashmap.git](https://github.com/rizasaputra29/cashmap.git)
    cd cashmap
    ```

2.  **Instal dependensi**
    ```bash
    npm install
    # atau
    yarn install
    ```

3.  **Konfigurasi Environment Variables**
    Buat file `.env` di root direktori dan tambahkan konfigurasi berikut:

    ```env
    # Koneksi Database (PostgreSQL)
    DATABASE_URL="postgresql://user:password@localhost:5432/cashmap?schema=public"

    # Cloudinary (Untuk Upload Avatar)
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="nama_cloud_anda"
    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="preset_upload_anda"
    ```

4.  **Setup Database (Prisma)**
    Jalankan migrasi untuk membuat tabel di database Anda:
    ```bash
    npx prisma generate
    npx prisma db push
    ```

5.  **Jalankan server pengembangan**
    ```bash
    npm run dev
    ```

6.  **Buka aplikasi**
    Buka browser dan kunjungi `http://localhost:3000`.

---

## 🤝 Berkontribusi

Kontribusi adalah hal yang membuat komunitas open source menjadi tempat yang luar biasa untuk belajar, inspirasi, dan berkreasi. Segala bentuk kontribusi sangat **dihargai**.

1.  Fork Proyek ini
2.  Buat Feature Branch Anda (`git checkout -b feature/FiturKeren`)
3.  Commit Perubahan Anda (`git commit -m 'Menambahkan fitur keren'`)
4.  Push ke Branch (`git push origin feature/FiturKeren`)
5.  Buka Pull Request

---


<div align="center">

**Dibuat dengan ❤️ oleh [Riza Saputra](https://github.com/rizasaputra29)**

</div>

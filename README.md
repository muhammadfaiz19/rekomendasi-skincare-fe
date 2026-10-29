# 🧴 Glamora (Skinwise) — Frontend Skincare Recommendation System

Frontend aplikasi web modern untuk sistem rekomendasi perawatan kulit (skincare) cerdas berbasis Artificial Intelligence (AI). Dikembangkan menggunakan **Next.js 15 (App Router)**, **TypeScript**, dan **Tailwind CSS**.

Aplikasi ini memberikan pengalaman konsultasi skincare personal: mulai dari pemindaian wajah (*face skin scan*) berbasis Computer Vision, konsultasi virtual via Chatbot AI (LLM), hingga katalog produk dan panel manajemen admin.

---

## ✨ Fitur Utama

- 📸 **AI Skin Face Scan**: Pemindaian wajah interaktif secara langsung melalui kamera web (*webcam*) atau unggah foto wajah untuk mendeteksi permasalahan kulit seperti jerawat (*acne*), noda hitam (*dark spot*), pori-pori besar (*pores*), dan kemerahan (*redness*).
- 💡 **Rekomendasi Skincare Cerdas**: Rekomendasi produk skincare terkurasi yang disesuaikan secara otomatis dengan hasil analisis kondisi kulit.
- 💬 **AI Skincare Consultant Chatbot**: Chatbot interaktif bertenaga Large Language Model (Groq / Llama 3) untuk tanya jawab seputar rutinitas skincare, tips bahan aktif, dan solusi masalah kulit.
- 🛍️ **Katalog & Detail Produk**: Eksplorasi katalog produk berdasarkan kategori (Cleanser, Toner, Serum, Moisturizer, Sunscreen) dengan informasi detail, bahan aktif, dan panduan pemakaian.
- 🔐 **Autentikasi & RBAC (Role-Based Access Control)**: Sistem registrasi dan login aman menggunakan token JWT untuk membedakan hak akses `user` dan `admin`.
- 📊 **Dashboard Admin**: Panel manajemen lengkap untuk mengelola produk skincare, kategori, dan informasi toko dengan antarmuka tabel interaktif, pencarian, dan paginasi.
- 📱 **Desain Responsif & Modern**: Tampilan visual elegan dengan tema warna terpadu, animasi halus, dan tata letak responsif untuk perangkat mobile maupun desktop.

---

## 🔗 Ketergantungan Backend (PENTING)

Frontend ini memerlukan servis **Glamora Backend API (FastAPI & AI Model)** agar fitur autentikasi, analisis wajah, chatbot AI, dan data produk dapat berjalan secara normal.

* **Repository Backend:** [https://github.com/muhammadfaiz19/rekomendasi-skincare-be.git](https://github.com/muhammadfaiz19/rekomendasi-skincare-be.git)

> [!WARNING]
> **FYI — Repositori Backend Berstatus Private!**
> Repositori backend saat ini diset sebagai **Private**. Pastikan Anda telah mendapatkan izin akses / diundang sebagai kolaborator oleh pemilik repositori ([@muhammadfaiz19](https://github.com/muhammadfaiz19)), atau gunakan Personal Access Token (PAT) / SSH Key akun yang berwenang untuk melakukan *clone*.

### Panduan Singkat Clone & Setup Backend:
1. Clone repositori backend (dengan akun yang memiliki akses):
   ```bash
   git clone https://github.com/muhammadfaiz19/rekomendasi-skincare-be.git
   cd rekomendasi-skincare-be
   ```
2. Jalankan backend sesuai panduan di `README.md` pada repositori backend (FastAPI aktif di `http://127.0.0.1:8000`).

---

## 🚀 Panduan Menjalankan (How to Run)

### 📋 Prasyarat Sistem
- **Node.js**: Versi `18.x` atau `20.x` LTS
- **npm** (atau `yarn` / `pnpm` / `bun`)
- **Backend API**: Sudah berjalan di `http://127.0.0.1:8000`

---

### 1️⃣ Clone Repositori Frontend
```bash
git clone https://github.com/muhammadfaiz19/rekomendasi-skincare-fe.git
cd rekomendasi-skincare-fe
```

---

### 2️⃣ Konfigurasi Environment Variable
Salin file `.env.example` menjadi `.env.local`:
```bash
# Windows Command Prompt
copy .env.example .env.local

# Windows PowerShell / Linux / macOS
cp .env.example .env.local
```

Pastikan isi `.env.local` mengarah ke endpoint API backend Anda:
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

---

### 3️⃣ Instalasi Dependensi
```bash
npm install
```

---

### 4️⃣ Jalankan Server Frontend (Development)
```bash
npm run dev
```

Aplikasi web dapat diakses melalui browser di:
👉 **[http://localhost:3000](http://localhost:3000)**

---

### 5️⃣ Akun Demo / Default Admin
Jika Anda telah menjalankan seeder database di sisi backend, Anda dapat login ke dashboard admin dengan kredensial:
- **Halaman Login:** `http://localhost:3000/login`
- **Email:** `admin@glamora.com`
- **Password:** `admin123`

---

## 📁 Struktur Folder Proyek

```
rekomendasi-skincare-fe/
├── app/                      # Next.js App Router (Halaman & Layout)
│   ├── admin/                # Halaman Dashboard Admin (Produk, Kategori, Profil)
│   ├── chatbot/              # Halaman Konsultasi AI Chatbot
│   ├── login/                # Halaman Autentikasi Login
│   ├── products/             # Halaman Katalog & Detail Produk
│   ├── register/             # Halaman Registrasi Akun
│   ├── scan/                 # Halaman AI Face Skin Scan & Hasil Rekomendasi
│   ├── layout.tsx            # Global Root Layout
│   └── page.tsx              # Landing Page / Beranda
├── components/               # Komponen UI Reusable (Navbar, Footer, Modal, Card, dll.)
├── lib/                      # Utilitas, konfigurasi client, helper API
├── public/                   # Asset statis (gambar, icon, logo)
├── types/                    # Deklarasi tipe TypeScript
├── .env.example              # Contoh konfigurasi environment
├── .gitignore                # Aturan file yang diabaikan Git
├── next.config.ts            # Konfigurasi Next.js
├── package.json              # Daftar paket dependensi npm
├── tailwind.config.ts        # Konfigurasi Tailwind CSS
└── tsconfig.json             # Konfigurasi TypeScript compiler
```

---

## 🛠️ Teknologi yang Digunakan

- **Framework**: [Next.js](https://nextjs.org/) (React 19, App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **HTTP Client**: Native Fetch API dengan JWT Authorization Header

---

## 📄 Lisensi & Kontributor

Dikembangkan oleh **Muhammad Faiz** ([@muhammadfaiz19](https://github.com/muhammadfaiz19)) untuk proyek sistem rekomendasi skincare cerdas Glamora.

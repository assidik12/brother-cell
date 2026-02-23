# **AI RULES & CODING STANDARDS (MASTER DOCUMENT) \- PROJECT BROTHER CELL**

Anda adalah seorang **Senior Software Engineer**. Tugas Anda adalah bertindak sebagai "Tukang" yang ahli, sementara saya adalah "Mandor". Anda harus mengikuti aturan di bawah ini secara ketat untuk setiap tugas yang diberikan dalam pengembangan project Brother Cell.

## **1\. PERSONA & KOMUNIKASI**

- **Bahasa:** Selalu gunakan Bahasa Indonesia untuk penjelasan dan komentar kompleks, namun biarkan kode (variable, function, class, database schema) dalam Bahasa Inggris.
- **Efisiensi:** Jangan memberikan penjelasan yang terlalu panjang. Fokus pada implementasi kode yang benar sesuai aturan.
- **Gaya Penulisan:** Ikuti prinsip "Clean Code" dan "SOLID Principles".

## **2\. TECH STACK (BROTHER CELL SPECIFIC)**

- **Language:** TypeScript
- **Framework:** Next.js (App Router)
- **Database:** PostgreSQL
- **Library Utama:**
  - ORM: Prisma (atau Supabase Client dengan Transaction support)
  - Validation: Zod
  - Payment: Midtrans Node.js SDK
  - SMS: Axios (untuk integrasi Zenziva/SMS Gateway API)
  - Styling: TailwindCSS
  - Authentication: NextAuth.js

## **3\. ARSITEKTUR & STRUKTUR LAYER**

Setiap fitur baru WAJIB mengikuti struktur 3-layer untuk memisahkan logika bisnis dari API Route:

1. **Controller/Handler (/app/api/.../route.ts):** Hanya menangani request/response, validasi input awal (Zod), dan memanggil Service.
2. **Service/Business Logic (/app/services/...):** Tempat semua logika bisnis utama (misal: kalkulasi harga, logika webhook, pengecekan signature). Tidak boleh ada query database mentah di sini.
3. **Repository/Data Access (/app/repositories/...):** Tempat query database menggunakan Prisma/Supabase. Hanya mengembalikan data mentah atau entity ke Service.

**Aturan Penamaan File:**

- Route/Controller: app/api/\[feature\]/route.ts
- Service: \[name\].service.ts
- Repository: \[name\].repository.ts
- Schema/Type: \[name\].schema.ts (untuk Zod) atau \[name\].entity.ts

## **4\. CODING RULES (MANDATORY & CRITICAL)**

- **Anti-Double Selling (Race Condition):** Untuk pengambilan voucher, WAJIB menggunakan Database Transaction dengan Row Locking (SELECT ... FOR UPDATE). Jangan pernah mengandalkan pengecekan logic di sisi aplikasi saja.
- **Nol Halusinasi:** Jangan gunakan library atau fungsi yang tidak ada dalam tech stack yang ditentukan.
- **Error Handling:** Gunakan global error handler atau wrapper. Setiap error harus memiliki pesan yang jelas dan status code yang sesuai (misal: 400 untuk bad request, 402 untuk payment required).
- **Validasi:** Semua input dari user (body, query, params) WAJIB divalidasi menggunakan **Zod** sebelum diproses di layer service.
- **Webhook Security:** API untuk callback payment gateway WAJIB menyertakan logika verifikasi signature sesuai dokumentasi Midtrans.

## **5\. DATABASE & ENTITY RULES**

- Gunakan **camelCase** untuk property di kode dan **snake_case** untuk column di database.
- Setiap tabel wajib memiliki: id (UUID), created_at (timestamptz), dan updated_at (timestamptz).
- Jangan pernah melakukan SELECT \*. Selalu definisikan kolom yang dibutuhkan (Prisma select object).
- Gunakan Enums untuk kolom status (misal: TRANSACTION_STATUS: PENDING, SUCCESS, FAILED).

## **6\. WORKFLOW PENAMBAHAN FITUR**

Setiap kali saya meminta "Tambah fitur \[X\]", Anda harus:

1. Membaca struktur folder yang sudah ada.
2. Mengecek file ai_project_rules.md ini sebagai acuan utama.
3. Membuatkan boilerplate dari Layer bawah secara berurutan:
   - **Database Schema** (jika ada tabel baru).
   - **Repository Layer** (Query database).
   - **Service Layer** (Logika bisnis & integrasi API pihak ke-3).
   - **Controller Layer** (API Route Next.js).
4. Memastikan semua tipe data (TypeScript Interfaces) sinkron antar layer.

**PENTING:** Jika instruksi saya di chat bertentangan dengan aturan di file ini, prioritaskan aturan di file ini kecuali saya secara eksplisit mengatakan "Abaikan aturan nomor X".

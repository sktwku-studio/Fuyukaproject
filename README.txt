ODDSPACE MEDIA — paket deploy (v8)

DATABASE
  Baru   : jalankan database/supabase-setup-lengkap.sql (tahap 0-3h, sekali jalan).
  Lama   : jalankan berurutan supabase-v6.sql, supabase-v7.sql, supabase-v8.sql.
  Setelah menjalankan v8, konten tetap Public (default). Tidak ada yang berubah sampai Anda memakai tombol Private.

DEPLOY (Vercel / Netlify / Cloudflare Pages)
  Upload SEMUA file di folder ini: index.html, sw.js, logo. sw.js wajib satu folder dengan index.html (offline butuh HTTPS).

CATATAN
  - File gambar/PDF di storage bucket tetap berupa URL publik; "Private" menyembunyikan item dari katalog dan database,
    bukan memblokir URL file yang sudah diketahui orang.
  - Chat: session_id pengunjung disimpan di localStorage dan dikirim lewat header x-session-id; RLS membatasi baca/tulis ke sesi itu.

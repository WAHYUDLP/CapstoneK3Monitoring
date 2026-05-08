# FRONTEND React + Vite

Frontend ini membaca backend dari environment variable `VITE_API_BASE`.

Default backend yang dipakai sekarang:

```text
http://127.0.0.1:9001
```

## Cara Menjalankan
1. Pastikan backend sudah jalan di port `9001`.
2. Masuk ke folder `FRONTEND`.
3. Install dependency frontend dengan `npm install`.
4. Jalankan frontend dengan `npm run dev`.

## Konfigurasi Backend
Kalau perlu ganti alamat backend, buat file `.env` di folder `FRONTEND`:

```env
VITE_API_BASE=http://127.0.0.1:9001
```

Kalau backend pindah port, ubah nilai `VITE_API_BASE` tanpa perlu edit source code.

# CapstoneK3Monitoring

Sistem monitoring K3 (Keselamatan dan Kesehatan Kerja) yang menggabungkan deteksi pelanggaran APD, dashboard ringkasan, laporan PDF, dan log pelanggaran. Proyek ini terdiri dari:

- Backend FastAPI untuk API, ringkasan dashboard, laporan PDF, dan integrasi database.
- Frontend React + Vite untuk UI dashboard, laporan, dan log.
- Model/Camera runner untuk proses deteksi dan pengiriman hasil pelanggaran.

## Fitur Utama
- Deteksi pelanggaran APD (helm, rompi, masker, dll).
- Dashboard ringkasan (compliance, total pelanggaran, grafik).
- Log pelanggaran dengan filter area dan tanggal.
- Laporan PDF dengan preview dan download.
- Notifikasi Telegram (opsional) dan integrasi MySQL.

## Struktur Folder
- BACKEND/ - FastAPI API server
- FRONTEND/ - React + Vite UI
- MODEL/ - model, weights, dan camera runner

## Quick Start (Windows)

### 1) Backend (FastAPI)
Jalankan dari root project:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
& ".\MODEL\.venv\Scripts\Activate.ps1"
.\MODEL\.venv\Scripts\python.exe -m uvicorn BACKEND.server:app --host 127.0.0.1 --port 9001
```

Jika dependency belum terpasang:

```powershell
.\MODEL\.venv\Scripts\python.exe -m pip install -r .\BACKEND\requirements.txt
```

### 2) Frontend (Vite)

```powershell
cd FRONTEND
npm install
npm run dev
```

### 3) Kamera / Model Runner
Jalankan dari root project:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
& ".\MODEL\.venv\Scripts\Activate.ps1"
.\MODEL\.venv\Scripts\python.exe .\MODEL\mainWithLinkImgb.py
```

### 4) Setup Database MySQL
Agar data log pelanggaran dan laporan bisa tersimpan dan tampil di dashboard:
1. Pastikan MySQL Server sudah terinstall dan berjalan (menggunakan XAMPP, Laragon, atau instalasi native MySQL).
2. Buat database baru bernama `k3_project`:
   ```sql
   CREATE DATABASE k3_project;
   ```
3. Tabel akan dibuat secara otomatis oleh backend ketika pertama kali dijalankan (via SQLAlchemy).

## Konfigurasi
- Backend URL untuk frontend diatur lewat `VITE_API_BASE` (lihat FRONTEND/README.md).
- Konfigurasi database ada di `BACKEND/config.py` atau via environment variable. Pastikan kredensial (username, password, host, port) sesuai dengan server MySQL lokal Anda.

## Catatan
- Pastikan MySQL berjalan dan database `k3_project` tersedia.
- Jalankan backend dan camera runner sebagai proses terpisah.
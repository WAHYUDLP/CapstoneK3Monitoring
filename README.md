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
 atau

 ```powershell
cd BACKEND
python -m uvicorn server:app --host 127.0.0.1 --port 9001 --reload 
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

## Konfigurasi
- Backend URL untuk frontend diatur lewat `VITE_API_BASE` (lihat FRONTEND/README.md).
- Konfigurasi database ada di BACKEND/config.py.

## Catatan
- Pastikan MySQL berjalan dan database `k3_project` tersedia.
- Jalankan backend dan camera runner sebagai proses terpisah.
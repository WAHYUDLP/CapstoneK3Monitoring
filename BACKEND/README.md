# BACKEND FastAPI

Backend ini menangani:
- koneksi database MySQL
- API routing untuk pelaporan pelanggaran
- anti-spam cooldown
- pengiriman notifikasi Telegram
- dashboard summary
- generate laporan PDF

## Struktur Singkat
- `server.py` = entrypoint utama FastAPI
- `config.py` = konfigurasi dan mapping label
- `db.py` = koneksi SQLAlchemy
- `schemas.py` = schema request/response
- `routers/` = route FastAPI
- `services/` = logika bisnis
- `utils/` = helper umum

## Cara Menjalankan Backend di Windows

### 1. Buka terminal di root project
Pastikan posisi folder kerja ada di:
`CapstoneK3Monitoring`

### 2. Aktifkan virtual environment
Kalau environment Python sudah ada di `MODEL/.venv`, aktifkan dengan:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
& ".\MODEL\.venv\Scripts\Activate.ps1"
```

### 3. Install dependency
Kalau terminal kamu sedang di folder `BACKEND`, install dependency dengan:

```powershell
..\MODEL\.venv\Scripts\python.exe -m pip install -r .\requirements.txt
```

Kalau kamu menjalankan dari root project, pakai:

```powershell
.\MODEL\.venv\Scripts\python.exe -m pip install -r .\BACKEND\requirements.txt
```

Kalau kamu pakai VS Code, pastikan interpreter Python yang aktif mengarah ke `MODEL/.venv`.

### 4. Jalankan server FastAPI
Kalau terminal kamu sedang di folder `BACKEND`, jalankan:

```powershell
..\MODEL\.venv\Scripts\python.exe -m uvicorn server:app --host 127.0.0.1 --port 9001
```

Kalau kamu menjalankan dari root project, pakai:

```powershell
.\MODEL\.venv\Scripts\python.exe -m uvicorn BACKEND.server:app --host 127.0.0.1 --port 9001
```

Kalau import package bermasalah, pastikan kamu menjalankan perintah dari folder yang sesuai: `BACKEND` untuk `server:app`, atau root project untuk `BACKEND.server:app`.

Kalau kamu butuh auto-reload saat ngoding, coba tambahkan `--reload` setelah server sudah jalan stabil. Di beberapa Windows setup, `--reload` bisa memicu error socket seperti `WinError 10013`.

### 5. Cek server
Buka endpoint berikut di browser atau Postman:
- `http://127.0.0.1:8000/ping`
- `http://127.0.0.1:8000/docs`

## Endpoint Utama
- `POST /report-violation`
- `GET /ping`
- `GET /violations`
- `GET /dashboard-summary`
- `POST /report-pdf`

## Catatan
- Pastikan MySQL aktif dan database `k3_project` sudah tersedia.
- Pastikan credential MySQL di `config.py` sesuai dengan perangkatmu.
- Pastikan bot Telegram masih valid kalau fitur notifikasi dipakai.
- Kalau muncul error import seperti `fastapi` atau `sqlalchemy`, biasanya environment Python belum diarahkan ke virtual environment yang benar.

## Troubleshooting

### `Fatal error in launcher` saat `pip install`
Kalau `pip` masih menunjuk ke environment lama, jangan pakai `pip` langsung. Pakai:

```powershell
..\MODEL\.venv\Scripts\python.exe -m pip install -r .\BACKEND\requirements.txt
```

Kalau masih aneh, cek Python yang aktif dengan:

```powershell
where python
python --version
```

### `WinError 10013` saat menjalankan Uvicorn
Error ini biasanya muncul karena mode reload atau port yang dipakai bermasalah.
Pakai command stabil tanpa reload dulu:

```powershell
.\MODEL\.venv\Scripts\python.exe -m uvicorn BACKEND.server:app --host 127.0.0.1 --port 9001
```

Kalau masih gagal:
- tutup proses Python/Uvicorn lain yang masih nyangkut
- jalankan terminal sebagai Administrator
- pastikan firewall atau antivirus tidak memblokir port yang dipakai
- kalau kamu menjalankan dari folder `BACKEND`, ganti `BACKEND.server:app` menjadi `server:app`

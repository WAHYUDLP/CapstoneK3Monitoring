from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    # Support both `BACKEND.server:app` and `server:app`.
    from .config import CORS_ORIGINS
    from .routers import dashboard, health, reports, violations, active_camera, video_feed
except ImportError:
    from config import CORS_ORIGINS
    from routers import dashboard, health, reports, violations, active_camera, video_feed

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(violations.router)
app.include_router(dashboard.router)
app.include_router(reports.router)
app.include_router(active_camera.router)
app.include_router(video_feed.router)

## Ini yang lama ya
# from reportlab.lib.colors import HexColor, black, gray # Tambahkan ini
# from fastapi import FastAPI, BackgroundTasks
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# from typing import Optional, Dict
# from datetime import datetime, timedelta
# from collections import Counter
# from io import BytesIO
# import requests
# import time
# from sqlalchemy import create_engine, text # Digabung biar rapi
# from sqlalchemy.orm import sessionmaker
# from .model import Violation, Base 
# from fastapi.responses import StreamingResponse
# from reportlab.pdfgen import canvas
# from reportlab.lib.pagesizes import A4
# from reportlab.lib.units import mm
# from reportlab.lib.utils import simpleSplit

# app = FastAPI()

# # Allow CORS for local frontend during development
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # 1. SETUP KONEKSI DATABASE
# DATABASE_URL = "mysql+pymysql://root:@localhost/k3_project"
# engine = create_engine(DATABASE_URL)
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# # 2. KONFIGURASI TELEGRAM
# TOKEN = "8707229189:AAEPf1wB8XJ3b-_HieOR23qsVBi85zBKiks"
# CHAT_ID = "-1003886366274"

# # 3. ANTI-SPAM
# cooldown_cache = {}

# # Kamus terjemahan 
# LABEL_MAP = {
#     "not_wearing_helmet": "Tidak Memakai Helm",
#     "not_wearing_vest": "Tidak Memakai Rompi (Vest)",
#     "not_wearing_mask": "Tidak Memakai Masker",
#     "not_wearing_any_apd": "Tidak Memakai APD Lengkap",
#     "attempt_remove_helmet": "Mencoba Melepas Helm",
#     "attempt_remove_vest": "Mencoba Melepas Rompi",
#     "attempt_remove_mask": "Mencoba Melepas Masker"
# }

# PPE_TYPE_MAP = {
#     "not_wearing_helmet": "PPE-01",
#     "not_wearing_vest": "PPE-02",
#     "not_wearing_mask": "PPE-03",
#     "not_wearing_any_apd": "PPE-04",
#     "attempt_remove_helmet": "PPE-05",
#     "attempt_remove_vest": "PPE-06",
#     "attempt_remove_mask": "PPE-07",
# }

# PPE_LABEL_MAP = {
#     "PPE-01": "Tidak Memakai Helm",
#     "PPE-02": "Tidak Memakai Rompi (Vest)",
#     "PPE-03": "Tidak Memakai Masker",
#     "PPE-04": "Tidak Memakai APD Lengkap",
#     "PPE-05": "Mencoba Melepas Helm",
#     "PPE-06": "Mencoba Melepas Rompi",
#     "PPE-07": "Mencoba Melepas Masker",
# }

# # Payload 
# class ViolationData(BaseModel):
#     camera_id: str
#     label: str
#     image_path: str 
#     id_pekerja: Optional[str] = "Tidak diketahui" 


# class ReportRequest(BaseModel):
#     start_date: str
#     end_date: str
#     shift: Optional[str] = "All"
#     area: Optional[str] = "All"
#     pengawas: Optional[str] = ""
#     cek_sebelum: Optional[str] = ""
#     cek_selama: Optional[str] = ""
#     catatan: Optional[str] = ""
#     tindakan_map: Optional[Dict[str, str]] = None

# def send_to_telegram(data: ViolationData):
#     url = f"https://api.telegram.org/bot{TOKEN}/sendPhoto"
    
#     # Terjemahkan label AI ke Bahasa Indonesia
#     jenis_pelanggaran = LABEL_MAP.get(data.label, data.label.replace("_", " ").title())
    
#     caption = (
#         f"⚠️ *PELANGGARAN K3 TERDETEKSI* ⚠️\n\n"
#         f"⏰ *Waktu:* {time.strftime('%Y-%m-%d %H:%M:%S')}\n"
#         f"📍 *Lokasi:* {data.camera_id}\n"
#         f"👤 *Jenis:* {jenis_pelanggaran}\n"
#     )

#     # Kirim URL IMG
#     payload = {
#         'chat_id': CHAT_ID, 
#         'photo': data.image_path, 
#         'caption': caption, 
#         'parse_mode': 'Markdown'
#     }

#     try:
#         res = requests.post(url, data=payload)
#         if res.status_code != 200:
#             print(f"❌ Gagal kirim Telegram: {res.text}")
#     except Exception as e:
#         print(f"❌ ERROR API Telegram: {e}")

# # ENDPOINT UTAMA (Nerima Data dari AI)
# @app.post("/report-violation")
# async def report_violation(data: ViolationData, background_tasks: BackgroundTasks):
#     # CEK ANTI SPAM
#     key = f"{data.camera_id}_{data.label}_{data.id_pekerja}"
#     current_time = time.time()
    
#     if key in cooldown_cache and (current_time - cooldown_cache[key] < 30):
#         return {"status": "ignored", "reason": "Masih dalam cooldown (Anti-Spam)"}
    
#     cooldown_cache[key] = current_time

#     # SIMPAN KE DATABASE
#     try:
#         db = SessionLocal()
#         db_item = Violation(
#             camera_id=data.camera_id,
#             id_pekerja=data.id_pekerja,
#             violation_type=data.label,
#             image_path=data.image_path 
#         )
#         db.add(db_item)
#         db.commit()
#         db.refresh(db_item)
#     except Exception as e:
#         print(f"❌ Gagal simpan ke database: {e}")
#     finally:
#         db.close()
        
#     # KIRIM KE TELEGRAM (INI HARUSNYA DI SINI)
#     background_tasks.add_task(send_to_telegram, data)

#     # BALESAN KE AI (INI JUGA HARUSNYA DI SINI)
#     return {"status": "success", "message": "Data berhasil diproses Backend!"}

# # ENDPOINT HEALTH CHECK (Buat Dashboard Admin)
# @app.get("/ping")
# async def health_check():
#     db_status = "Disconnected ❌"
    
#     try:
#         # Mencoba ngetuk pintu database
#         db = SessionLocal()
#         db.execute(text("SELECT 1")) 
#         db_status = "Connected ✅"
#         db.close()
#     except Exception as e:
#         print(f"Error DB Ping: {e}")
#         db_status = "Error Database"

#     return {
#         "status_server": "Online ✅",
#         "status_database": db_status,
#         "pesan": "Backend Sistem K3 Aktif dan Siap Menerima Data!"
#     }


# # Endpoint: ambil daftar pelanggaran (dipakai oleh frontend PetugasHSE)
# @app.get("/violations")
# async def get_violations(limit: int = 100, start_date: Optional[str] = None, end_date: Optional[str] = None, shift: str = "All", area: str = "All"):
#     try:
#         db = SessionLocal()
#         query = db.query(Violation)

#         if start_date:
#             start_dt = datetime.strptime(start_date, "%Y-%m-%d")
#             query = query.filter(Violation.created_at >= start_dt)
#         if end_date:
#             end_dt = datetime.strptime(end_date, "%Y-%m-%d") + timedelta(days=1) - timedelta(seconds=1)
#             query = query.filter(Violation.created_at <= end_dt)

#         rows = query.order_by(Violation.created_at.desc()).limit(limit).all()
#         if shift or area:
#             rows = filter_rows(rows, area, shift)

#         results = []
#         for r in rows:
#             code = PPE_TYPE_MAP.get(r.violation_type, None)
#             results.append({
#                 "id": r.id,
#                 "camera_id": r.camera_id,
#                 "id_pekerja": r.id_pekerja,
#                 "violation_type": r.violation_type,
#                 "violation_code": code,
#                 "violation_label": PPE_LABEL_MAP.get(code) if code else LABEL_MAP.get(r.violation_type),
#                 "image_path": r.image_path,
#                 "created_at": r.created_at.isoformat() if r.created_at else None,
#             })
#         db.close()
#         return {"status": "success", "data": results}
#     except Exception as e:
#         print(f"Error fetching violations: {e}")
#         return {"status": "error", "message": str(e)}


# def format_int_id(value: int) -> str:
#     return f"{value:,}".replace(",", ".")


# def format_date_id(date_value: datetime) -> str:
#     # Kamus nama bulan dalam Bahasa Indonesia
#     bulan_indo = [
#         "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
#         "Juli", "Agustus", "September", "Oktober", "November", "Desember"
#     ]
    
#     # Ambil hari (01-31), bulan (1-12), dan tahun (YYYY)
#     hari = date_value.strftime("%d")
#     bulan = bulan_indo[date_value.month]
#     tahun = date_value.strftime("%Y")
    
#     return f"{hari} {bulan} {tahun}"


# def format_shift_label(value: str) -> str:
#     if not value or value == "All":
#         return "Semua Shift"
#     if value == "Morning":
#         return "Pagi (08:00 - 16:00)"
#     if value == "Afternoon":
#         return "Sore (16:00 - 00:00)"
#     if value == "Night":
#         return "Malam (00:00 - 08:00)"
#     return value


# def format_area_label(value: str) -> str:
#     if not value or value == "All":
#         return "Semua Area"
#     return value


# def compute_compliance(total: int) -> int:
#     if total <= 0:
#         return 100
#     return max(0, round(100 * (1 - (total / (total + 100)))))


# def get_period_range(period: str):
#     now = datetime.now()
#     if period == "Today":
#         start = now.replace(hour=0, minute=0, second=0, microsecond=0)
#         end = now
#         prev_start = start - timedelta(days=1)
#         prev_end = start
#         compare_text = "vs yesterday"
#         most_period = "This day"
#         labels = ["08.00", "10.00", "12.00", "14.00", "16.00", "18.00", "20.00", "22.00", "00.00"]
#     elif period == "Weekly":
#         start = now - timedelta(days=7)
#         end = now
#         prev_start = start - timedelta(days=7)
#         prev_end = start
#         compare_text = "vs last week"
#         most_period = "This week"
#         labels = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]
#     elif period == "Monthly":
#         start = now - timedelta(days=30)
#         end = now
#         prev_start = start - timedelta(days=30)
#         prev_end = start
#         compare_text = "vs last month"
#         most_period = "This month"
#         labels = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"]
#     else:
#         start = now - timedelta(days=30)
#         end = now
#         prev_start = start - timedelta(days=30)
#         prev_end = start
#         compare_text = "vs previous period"
#         most_period = "This period"
#         labels = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"]

#     return start, end, prev_start, prev_end, compare_text, most_period, labels


# def filter_rows(rows, area: str, shift: str):
#     def match_area(row):
#         if not area or area == "All":
#             return True
#         return area.lower() in (row.camera_id or "").lower()

#     def match_shift(row):
#         if not shift or shift == "All":
#             return True
#         if not row.created_at:
#             return False
#         hour = row.created_at.hour
#         if shift == "Morning":
#             return 8 <= hour < 16
#         if shift == "Afternoon":
#             return 16 <= hour < 24
#         if shift == "Night":
#             return 0 <= hour < 8
#         return True

#     return [row for row in rows if match_area(row) and match_shift(row)]


# def build_time_series(rows, period: str, start: datetime, labels):
#     if period == "Today":
#         buckets = [0] * len(labels)
#         for row in rows:
#             if not row.created_at:
#                 continue
#             hour = row.created_at.hour
#             if 8 <= hour <= 9:
#                 idx = 0
#             elif 10 <= hour <= 11:
#                 idx = 1
#             elif 12 <= hour <= 13:
#                 idx = 2
#             elif 14 <= hour <= 15:
#                 idx = 3
#             elif 16 <= hour <= 17:
#                 idx = 4
#             elif 18 <= hour <= 19:
#                 idx = 5
#             elif 20 <= hour <= 21:
#                 idx = 6
#             elif 22 <= hour <= 23:
#                 idx = 7
#             elif 0 <= hour <= 1:
#                 idx = 8
#             else:
#                 continue
#             buckets[idx] += 1
#         return buckets

#     if period == "Weekly":
#         buckets = [0] * len(labels)
#         for row in rows:
#             if not row.created_at:
#                 continue
#             idx = row.created_at.weekday()
#             buckets[idx] += 1
#         return buckets

#     buckets = [0] * len(labels)
#     for row in rows:
#         if not row.created_at:
#             continue
#         days = (row.created_at - start).days
#         idx = min(max(days // 7, 0), len(labels) - 1)
#         buckets[idx] += 1
#     return buckets


# def build_bar_values(rows):
#     counts = Counter(PPE_TYPE_MAP.get((r.violation_type or ""), None) for r in rows)
#     return [
#         counts.get("PPE-01", 0),
#         counts.get("PPE-02", 0),
#         counts.get("PPE-03", 0),
#         counts.get("PPE-04", 0),
#         counts.get("PPE-05", 0),
#     ]


# @app.get("/dashboard-summary")
# async def get_dashboard_summary(period: str = "Today", shift: str = "All", area: str = "All"):
#     if period not in {"Today", "Weekly", "Monthly", "All"}:
#         period = "Today"

#     start, end, prev_start, prev_end, compare_text, most_period, labels = get_period_range(period)

#     try:
#         db = SessionLocal()
#         current_rows = db.query(Violation).filter(Violation.created_at >= start, Violation.created_at <= end).all()
#         prev_rows = db.query(Violation).filter(Violation.created_at >= prev_start, Violation.created_at <= prev_end).all()
#         db.close()

#         current_rows = filter_rows(current_rows, area, shift)
#         prev_rows = filter_rows(prev_rows, area, shift)

#         total = len(current_rows)
#         prev_total = len(prev_rows)

#         compliance = compute_compliance(total)
#         prev_compliance = compute_compliance(prev_total)
#         compliance_delta = compliance - prev_compliance
#         compliance_delta_text = f"{compliance_delta:+d}%"
#         compliance_delta_color = "text-[#65d738]" if compliance_delta >= 0 else "text-[#e24b4b]"

#         if prev_total <= 0:
#             violation_delta_text = "0%"
#             violation_delta_color = "text-[#65d738]"
#         else:
#             delta_percent = round(((total - prev_total) / prev_total) * 100)
#             violation_delta_text = f"{delta_percent:+d}%"
#             violation_delta_color = "text-[#e24b4b]" if delta_percent > 0 else "text-[#65d738]"

#         type_counts = Counter(r.violation_type for r in current_rows if r.violation_type)
#         most_violate = type_counts.most_common(1)[0][0] if type_counts else "-"
#         most_code = PPE_TYPE_MAP.get(most_violate) if most_violate != "-" else "-"
#         most_label = PPE_LABEL_MAP.get(most_code) if most_code and most_code != "-" else "-"

#         line_values = build_time_series(current_rows, period, start, labels)
#         bar_values = build_bar_values(current_rows)

#         return {
#             "status": "success",
#             "data": {
#                 "compliance": f"{compliance}%",
#                 "complianceDelta": compliance_delta_text,
#                 "complianceDeltaColor": compliance_delta_color,
#                 "violationTotal": format_int_id(total),
#                 "violationDelta": violation_delta_text,
#                 "violationDeltaColor": violation_delta_color,
#                 "mostViolated": most_code if most_code else "-",
#                 "mostViolatedLabel": most_label,
#                 "mostViolatedPeriod": most_period,
#                 "compareText": compare_text,
#                 "lineValues": line_values,
#                 "lineLabels": labels,
#                 "barValues": bar_values,
#             },
#         }
#     except Exception as e:
#         print(f"Error dashboard summary: {e}")
#         return {"status": "error", "message": str(e)}


# @app.post("/report-pdf")
# async def generate_report_pdf(payload: ReportRequest):
#     try:
#         start_dt = datetime.strptime(payload.start_date, "%Y-%m-%d")
#         end_dt = datetime.strptime(payload.end_date, "%Y-%m-%d") + timedelta(days=1) - timedelta(seconds=1)

#         db = SessionLocal()
#         rows = (
#             db.query(Violation)
#             .filter(Violation.created_at >= start_dt, Violation.created_at <= end_dt)
#             .order_by(Violation.created_at.asc())
#             .all()
#         )
#         db.close()

#         rows = filter_rows(rows, payload.area or "All", payload.shift or "All")
#         tindakan_map = payload.tindakan_map or {}

#         buffer = BytesIO()
#         pdf = canvas.Canvas(buffer, pagesize=A4)
#         width, height = A4
#         margin_x = 18 * mm
#         y = height - 20 * mm

#         # ================= HEADER =================
#         epson_blue = HexColor("#003399")
#         pdf.setFont("Helvetica-Bold", 32)
#         pdf.setFillColor(epson_blue)
#         pdf.drawString(margin_x, y - 2*mm, "EPSON")
        
#         # Garis Vertikal Pemisah
#         pdf.setStrokeColor(black)
#         pdf.setLineWidth(1)
#         pdf.line(margin_x + 42*mm, y + 8*mm, margin_x + 42*mm, y - 2*mm)

#         pdf.setFillColor(black)
#         pdf.setFont("Helvetica-Bold", 11)
#         pdf.drawString(margin_x + 45*mm, y + 4*mm, "Laporan Harian Keamanan dan Kesehatan Kerja")
#         pdf.drawString(margin_x + 45*mm, y - 1*mm, "PT. Indonesia Epson Industry")

#         # Garis Horizontal Bawah Header
#         y -= 10 * mm
#         pdf.setStrokeColor(epson_blue)
#         pdf.setLineWidth(1.5)
#         pdf.line(margin_x, y, width - margin_x, y)
#         pdf.setStrokeColor(black)
#         pdf.setLineWidth(1)
        
#         # ================= INFO META =================
#         y -= 12 * mm
#         pdf.setFont("Helvetica", 10)
#         tanggal_label = f"{format_date_id(start_dt)} - {format_date_id(end_dt)}" if start_dt.date() != end_dt.date() else format_date_id(start_dt)
        
#         # Kolom Kiri
#         pdf.drawString(margin_x, y, "Tanggal")
#         pdf.drawString(margin_x + 20*mm, y, f": {tanggal_label}")
#         pdf.drawString(margin_x, y - 7*mm, "Shift Kerja")
#         pdf.drawString(margin_x + 20*mm, y - 7*mm, f": {format_shift_label(payload.shift or 'All')}")
#         pdf.drawString(margin_x, y - 14*mm, "Area")
#         pdf.drawString(margin_x + 20*mm, y - 14*mm, f": {format_area_label(payload.area or 'All')}")

#         # Kolom Kanan
#         col2_x = margin_x + 85 * mm
#         pdf.drawString(col2_x, y, "Tanggal Terbit")
#         pdf.drawString(col2_x + 25*mm, y, f": {format_date_id(datetime.now())}")
#         pdf.drawString(col2_x, y - 7*mm, "Pengawas")
#         pdf.drawString(col2_x + 25*mm, y - 7*mm, f": {payload.pengawas or ''}")
        
#         # Garis Underline Abu-abu buat Pengawas
#         pdf.setStrokeColor(gray)
#         pdf.setLineWidth(0.5)
#         pdf.line(col2_x + 28*mm, y - 8*mm, width - margin_x, y - 8*mm)
#         pdf.setStrokeColor(black)
#         pdf.setLineWidth(1)

#         y -= 25 * mm

#         # ================= CEKLIS HARIAN =================
#         pdf.setFont("Helvetica-Bold", 10)
#         pdf.drawString(margin_x, y, "Ceklis Harian:")
#         y -= 8 * mm

#         def draw_radio(x_pos, y_pos, label, is_checked):
#             pdf.setStrokeColor(gray)
#             pdf.circle(x_pos, y_pos + 1*mm, 2*mm, fill=0) # Lingkaran Luar
#             if is_checked:
#                 pdf.setFillColor(epson_blue)
#                 pdf.circle(x_pos, y_pos + 1*mm, 1*mm, fill=1) # Lingkaran Dalam (Aktif)
#                 pdf.setFillColor(black)
#             pdf.setStrokeColor(black)
#             pdf.setFont("Helvetica", 10)
#             pdf.drawString(x_pos + 4*mm, y_pos, label)

#         cek_sebelum_str = (payload.cek_sebelum or "").strip().lower()
#         cek_selama_str = (payload.cek_selama or "").strip().lower()

#         pdf.setFont("Helvetica-Bold", 10)
#         pdf.drawString(margin_x, y, "1. Pengecekan APD Sebelum Produksi:")
#         y -= 6 * mm
#         draw_radio(margin_x + 4*mm, y, "Ya", cek_sebelum_str == "ya")
#         draw_radio(margin_x + 22*mm, y, "Tidak", cek_sebelum_str == "tidak")
#         y -= 8 * mm

#         pdf.setFont("Helvetica-Bold", 10)
#         pdf.drawString(margin_x, y, "2. Kepatuhan APD Selama Produksi:")
#         y -= 6 * mm
#         draw_radio(margin_x + 4*mm, y, "Ya", cek_selama_str == "ya")
#         draw_radio(margin_x + 22*mm, y, "Tidak", cek_selama_str == "tidak")
#         y -= 12 * mm

#         # ================= CATATAN PENGAWAS =================
#         pdf.setFont("Helvetica-Bold", 10)
#         pdf.drawString(margin_x, y, "Catatan Pengawas:")
#         y -= 6 * mm
        
#         pdf.setFont("Helvetica", 10)
#         pdf.setLineWidth(1)
#         if payload.catatan:
#             note_lines = simpleSplit(payload.catatan, "Helvetica", 10, width - 2 * margin_x)
#             for line in note_lines:
#                 pdf.drawString(margin_x, y, line)
#                 pdf.line(margin_x, y - 2*mm, width - margin_x, y - 2*mm)
#                 y -= 8 * mm
#             # Pastikan minimal ada 3 garis walaupun teksnya pendek
#             for _ in range(3 - len(note_lines)):
#                 pdf.line(margin_x, y - 2*mm, width - margin_x, y - 2*mm)
#                 y -= 8 * mm
#         else:
#             for _ in range(3):
#                 pdf.line(margin_x, y - 2*mm, width - margin_x, y - 2*mm)
#                 y -= 8 * mm

#         y -= 6 * mm

#       # ================= TABEL LOG PELANGGARAN =================
#         pdf.setFont("Helvetica-Bold", 10)
#         pdf.drawString(margin_x, y, "Log Pelanggaran:")
#         y -= 4 * mm

#         # UBAH: Tambah 1 kolom untuk Tanggal (Total = 174 mm)
#         col_w = [22 * mm, 18 * mm, 44 * mm, 45 * mm, 45 * mm] 
        
#         def draw_table_header(y_pos):
#             pdf.setLineWidth(1)
#             pdf.setStrokeColor(black)
#             pdf.rect(margin_x, y_pos - 10*mm, sum(col_w), 10*mm)
#             x = margin_x
#             for w in col_w[:-1]:
#                 x += w
#                 pdf.line(x, y_pos - 10*mm, x, y_pos)

#             pdf.setFont("Helvetica-Bold", 9)
#             pdf.drawString(margin_x + 2*mm, y_pos - 6*mm, "Tanggal") # Baru
#             pdf.drawString(margin_x + col_w[0] + 2*mm, y_pos - 6*mm, "Waktu")
#             pdf.drawString(margin_x + col_w[0] + col_w[1] + 2*mm, y_pos - 4*mm, "Kode")
#             pdf.drawString(margin_x + col_w[0] + col_w[1] + 2*mm, y_pos - 8*mm, "Pelanggaran")
#             pdf.drawString(margin_x + col_w[0] + col_w[1] + col_w[2] + 2*mm, y_pos - 6*mm, "Bukti Pelanggaran")
#             pdf.drawString(margin_x + col_w[0] + col_w[1] + col_w[2] + col_w[3] + 2*mm, y_pos - 6*mm, "Tindakan")

#         draw_table_header(y)
#         y -= 10 * mm

#         for r in rows:
#             row_h = 14 * mm
#             if y - row_h < 15 * mm:
#                 pdf.showPage()
#                 y = height - 20 * mm
#                 draw_table_header(y)
#                 y -= 10 * mm

#             pdf.setStrokeColor(black)
#             pdf.setLineWidth(1)
#             pdf.rect(margin_x, y - row_h, sum(col_w), row_h)
#             x_line = margin_x
#             for w in col_w[:-1]:
#                 x_line += w
#                 pdf.line(x_line, y - row_h, x_line, y)

#             # EXTRAKSI DATA (Tambah format tanggal)
#             tanggal = r.created_at.strftime("%d/%m/%Y") if r.created_at else "-"
#             waktu = r.created_at.strftime("%H.%M.%S") if r.created_at else "-"
#             code = PPE_TYPE_MAP.get(r.violation_type, "-")
#             label = PPE_LABEL_MAP.get(code, "-") if code != "-" else "-"
#             bukti = (r.image_path or "-").split("/")[-1]
#             tindakan = tindakan_map.get(str(r.id), "")

#             # 1. Kolom Tanggal
#             pdf.setFont("Helvetica", 8)
#             pdf.setFillColor(black)
#             pdf.drawString(margin_x + 2*mm, y - 8*mm, tanggal)

#             # 2. Kolom Waktu
#             pdf.setFont("Helvetica", 9)
#             pdf.drawString(margin_x + col_w[0] + 2*mm, y - 8*mm, waktu)

#             # 3. Kolom Kode Pelanggaran
#             pdf.setFont("Helvetica-Bold", 9)
#             pdf.drawString(margin_x + col_w[0] + col_w[1] + 2*mm, y - 5*mm, code)
#             pdf.setFont("Helvetica", 8)
#             pdf.setFillColor(gray)
#             pdf.drawString(margin_x + col_w[0] + col_w[1] + 2*mm, y - 10*mm, label)
            
#             # 4. Kolom Bukti
#             pdf.setFont("Helvetica", 9)
#             pdf.setFillColor(HexColor("#0056b3"))
#             bukti_x = margin_x + col_w[0] + col_w[1] + col_w[2] + 2*mm
#             bukti_y = y - 8*mm
#             pdf.drawString(bukti_x, bukti_y, bukti)
#             pdf.setStrokeColor(HexColor("#0056b3"))
#             pdf.setLineWidth(0.5)
#             text_width = pdf.stringWidth(bukti, "Helvetica", 9)
#             pdf.line(bukti_x, bukti_y - 1*mm, bukti_x + text_width, bukti_y - 1*mm)
#             pdf.setStrokeColor(black)
            
#            # 5. Kolom Tindakan
#             tindakan_x = margin_x + col_w[0] + col_w[1] + col_w[2] + col_w[3] + 2*mm
#             if tindakan:
#                 pdf.setFont("Helvetica", 9)
#                 pdf.setFillColor(black)
#                 pdf.drawString(tindakan_x, y - 8*mm, str(tindakan))

#             pdf.setFillColor(black)
#             y -= row_h
            
#         pdf.showPage()
#         pdf.save()
#         buffer.seek(0)

#         filename = f"laporan-k3-{payload.start_date}-sampai-{payload.end_date}.pdf"
#         headers = {"Content-Disposition": f"inline; filename={filename}"}
#         return StreamingResponse(buffer, media_type="application/pdf", headers=headers)
#     except Exception as e:
#         print(f"Error generate report pdf: {e}")
#         return {"status": "error", "message": str(e)}
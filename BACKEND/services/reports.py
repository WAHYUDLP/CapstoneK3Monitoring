import textwrap
from datetime import datetime, timedelta 
from io import BytesIO

from reportlab.lib.colors import HexColor, black, gray
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas

try:
    from ..config import PPE_LABEL_MAP, PPE_TYPE_MAP
    from ..model import Violation
    from ..schemas import ReportRequest
    from ..utils.filters import filter_rows
    from ..utils.formatters import format_area_label, format_date_id, format_shift_label
except ImportError:
    from config import PPE_LABEL_MAP, PPE_TYPE_MAP
    from model import Violation
    from schemas import ReportRequest
    from utils.filters import filter_rows
    from utils.formatters import format_area_label, format_date_id, format_shift_label


# === FUNGSI BARU ANTI-BABLAS ===
def wrap_text(text, max_chars):
    """
    Memotong teks berdasarkan jumlah KARAKTER, bukan milimeter font.
    Dijamin 100% teks panjang (seperti 'aaaaa') akan turun ke bawah.
    """
    if not text or str(text).strip() == "":
        return ["-"]
    
    lines = []
    for paragraph in str(text).split('\n'):
        if not paragraph.strip():
            continue
        # break_long_words=True akan memaksa teks nempel (tanpa spasi) terpotong
        wrapped = textwrap.wrap(paragraph, width=max_chars, break_long_words=True)
        lines.extend(wrapped)
    
    return lines if lines else ["-"]
# ===============================


def generate_report_pdf(db, payload: ReportRequest):
    start_dt = datetime.strptime(payload.start_date, "%Y-%m-%d")
    end_dt = datetime.strptime(payload.end_date, "%Y-%m-%d") + timedelta(days=1) - timedelta(seconds=1)

    rows = (
        db.query(Violation)
        .filter(Violation.created_at >= start_dt, Violation.created_at <= end_dt)
        .order_by(Violation.created_at.asc())
        .all()
    )

    rows = filter_rows(rows, payload.area or "All", payload.shift or "All")
    tindakan_map = payload.tindakan_map or {}

    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    margin_x = 18 * mm
    y = height - 20 * mm

    epson_blue = HexColor("#003399")
    pdf.setFont("Helvetica-Bold", 32)
    pdf.setFillColor(epson_blue)
    pdf.drawString(margin_x, y - 2 * mm, "EPSON")

    pdf.setStrokeColor(black)
    pdf.setLineWidth(1)
    pdf.line(margin_x + 42 * mm, y + 8 * mm, margin_x + 42 * mm, y - 2 * mm)

    pdf.setFillColor(black)
    pdf.setFont("Helvetica-Bold", 11)
    pdf.drawString(margin_x + 45 * mm, y + 4 * mm, "Laporan Harian Keamanan dan Kesehatan Kerja")
    pdf.drawString(margin_x + 45 * mm, y - 1 * mm, "PT. Indonesia Epson Industry")

    y -= 10 * mm
    pdf.setStrokeColor(epson_blue)
    pdf.setLineWidth(1.5)
    pdf.line(margin_x, y, width - margin_x, y)
    pdf.setStrokeColor(black)
    pdf.setLineWidth(1)

    y -= 12 * mm
    pdf.setFont("Helvetica", 10)
    tanggal_label = (
        f"{format_date_id(start_dt)} - {format_date_id(end_dt)}"
        if start_dt.date() != end_dt.date()
        else format_date_id(start_dt)
    )

    pdf.drawString(margin_x, y, "Tanggal")
    pdf.drawString(margin_x + 20 * mm, y, f": {tanggal_label}")
    pdf.drawString(margin_x, y - 7 * mm, "Shift Kerja")
    pdf.drawString(margin_x + 20 * mm, y - 7 * mm, f": {format_shift_label(payload.shift or 'All')}")
    pdf.drawString(margin_x, y - 14 * mm, "Area")
    pdf.drawString(margin_x + 20 * mm, y - 14 * mm, f": {format_area_label(payload.area or 'All')}")

    col2_x = margin_x + 85 * mm
    pdf.drawString(col2_x, y, "Tanggal Terbit")
    pdf.drawString(col2_x + 25 * mm, y, f": {format_date_id(datetime.now())}")
    pdf.drawString(col2_x, y - 7 * mm, "Pengawas")
    pdf.drawString(col2_x + 25 * mm, y - 7 * mm, f": {payload.pengawas or ''}")

    pdf.setStrokeColor(gray)
    pdf.setLineWidth(0.5)
    pdf.line(col2_x + 28 * mm, y - 8 * mm, width - margin_x, y - 8 * mm)
    pdf.setStrokeColor(black)
    pdf.setLineWidth(1)

    y -= 25 * mm

    pdf.setFont("Helvetica-Bold", 10)
    pdf.drawString(margin_x, y, "Ceklis Harian:")
    y -= 8 * mm

    def draw_radio(x_pos, y_pos, label, is_checked):
        pdf.setStrokeColor(gray)
        pdf.circle(x_pos, y_pos + 1 * mm, 2 * mm, fill=0)
        if is_checked:
            pdf.setFillColor(epson_blue)
            pdf.circle(x_pos, y_pos + 1 * mm, 1 * mm, fill=1)
            pdf.setFillColor(black)
        pdf.setStrokeColor(black)
        pdf.setFont("Helvetica", 10)
        pdf.drawString(x_pos + 4 * mm, y_pos, label)

    cek_sebelum_str = (payload.cek_sebelum or "").strip().lower()
    cek_selama_str = (payload.cek_selama or "").strip().lower()

    pdf.setFont("Helvetica-Bold", 10)
    pdf.drawString(margin_x, y, "1. Pengecekan APD Sebelum Produksi:")
    y -= 6 * mm
    draw_radio(margin_x + 4 * mm, y, "Ya", cek_sebelum_str == "ya")
    draw_radio(margin_x + 22 * mm, y, "Tidak", cek_sebelum_str == "tidak")
    y -= 8 * mm

    pdf.setFont("Helvetica-Bold", 10)
    pdf.drawString(margin_x, y, "2. Kepatuhan APD Selama Produksi:")
    y -= 6 * mm
    draw_radio(margin_x + 4 * mm, y, "Ya", cek_selama_str == "ya")
    draw_radio(margin_x + 22 * mm, y, "Tidak", cek_selama_str == "tidak")
    y -= 12 * mm

    pdf.setFont("Helvetica-Bold", 10)
    pdf.drawString(margin_x, y, "Catatan Pengawas:")
    y -= 6 * mm

    pdf.setFont("Helvetica", 10)
    pdf.setLineWidth(1)
    if payload.catatan:
        # Pake wrap_text aja biar aman 100%
        note_lines = wrap_text(payload.catatan, 90) 
        for line in note_lines:
            pdf.drawString(margin_x, y, line)
            pdf.line(margin_x, y - 2 * mm, width - margin_x, y - 2 * mm)
            y -= 8 * mm
        for _ in range(3 - len(note_lines)):
            pdf.line(margin_x, y - 2 * mm, width - margin_x, y - 2 * mm)
            y -= 8 * mm
    else:
        for _ in range(3):
            pdf.line(margin_x, y - 2 * mm, width - margin_x, y - 2 * mm)
            y -= 8 * mm

    y -= 6 * mm

    pdf.setFont("Helvetica-Bold", 10)
    pdf.drawString(margin_x, y, "Log Pelanggaran:")
    y -= 4 * mm

    col_w = [22 * mm, 18 * mm, 44 * mm, 45 * mm, 45 * mm]

    def draw_table_header(y_pos):
        pdf.setLineWidth(1)
        pdf.setStrokeColor(black)
        pdf.rect(margin_x, y_pos - 10 * mm, sum(col_w), 10 * mm)
        x = margin_x
        for w in col_w[:-1]:
            x += w
            pdf.line(x, y_pos - 10 * mm, x, y_pos)

        pdf.setFont("Helvetica-Bold", 9)
        pdf.drawString(margin_x + 2 * mm, y_pos - 6 * mm, "Tanggal")
        pdf.drawString(margin_x + col_w[0] + 2 * mm, y_pos - 6 * mm, "Waktu")
        pdf.drawString(margin_x + col_w[0] + col_w[1] + 2 * mm, y_pos - 4 * mm, "Kode")
        pdf.drawString(margin_x + col_w[0] + col_w[1] + 2 * mm, y_pos - 8 * mm, "Pelanggaran")
        pdf.drawString(margin_x + col_w[0] + col_w[1] + col_w[2] + 2 * mm, y_pos - 6 * mm, "Bukti Pelanggaran")
        pdf.drawString(margin_x + col_w[0] + col_w[1] + col_w[2] + col_w[3] + 2 * mm, y_pos - 6 * mm, "Tindakan")

    draw_table_header(y)
    y -= 10 * mm

    for r in rows:
        tanggal = r.created_at.strftime("%d/%m/%Y") if r.created_at else "-"
        waktu = r.created_at.strftime("%H.%M.%S") if r.created_at else "-"

        vtype = (r.violation_type or "").strip()
        codes_list = []
        labels_list = []

        def _append_code_label(key):
            code_val = PPE_TYPE_MAP.get(key)
            if code_val:
                codes_list.append(code_val)
                labels_list.append(PPE_LABEL_MAP.get(code_val, key.replace("_", " ").title()))
            else:
                codes_list.append("-")
                labels_list.append(key.replace("_", " ").title())

        if "_and_" in vtype:
            if vtype.startswith("not_wearing_"):
                parts = vtype[len("not_wearing_"):].split("_and_")
                for p in parts:
                    _append_code_label("not_wearing_" + p)
            elif vtype.startswith("attempt_remove_"):
                parts = vtype[len("attempt_remove_"):].split("_and_")
                for p in parts:
                    _append_code_label("attempt_remove_" + p)
            else:
                for p in vtype.split("_and_"):
                    _append_code_label(p)
        else:
            _append_code_label(vtype)

        code = ", ".join([c for c in codes_list if c and c != "-"]) or "-"
        label = ", ".join(labels_list) if labels_list else (vtype.replace("_", " ").title() or "-")

        full_image_url = (r.image_path or "-")
        bukti = full_image_url.split("/")[-1]

        # === 1. PERSIAPKAN TEKS DENGAN BATAS KARAKTER PASTI (ANTI BABLAS) ===
        # Kode & Label di kolom 44mm -> max 23 huruf
        code_lines = wrap_text(code, 23)
        label_lines = wrap_text(label, 23)
        h_code = (len(code_lines) * 4 * mm) + (len(label_lines) * 4 * mm)

        # Bukti Filename di kolom 45mm -> max 24 huruf
        bukti_lines = wrap_text(bukti, 24)
        h_bukti = len(bukti_lines) * 4 * mm

        # Tindakan di kolom 45mm -> max 24 huruf
        tindakan_str = str(tindakan_map.get(str(r.id), ""))
        tindakan_lines = wrap_text(tindakan_str, 24)
        h_tindakan = len(tindakan_lines) * 4 * mm

        # Hitung tinggi baris aktual (ambil yang butuh ruang paling tinggi)
        row_h = max(14 * mm, h_code + 6 * mm, h_bukti + 6 * mm, h_tindakan + 6 * mm)

        # Cek sisa halaman
        if y - row_h < 15 * mm:
            pdf.showPage()
            y = height - 20 * mm
            draw_table_header(y)
            y -= 10 * mm

        # Gambar kotak tabel
        pdf.setStrokeColor(black)
        pdf.setLineWidth(1)
        pdf.rect(margin_x, y - row_h, sum(col_w), row_h)
        x_line = margin_x
        for w in col_w[:-1]:
            x_line += w
            pdf.line(x_line, y - row_h, x_line, y)

        # === 2. GAMBAR TEKS KE DALAM KOTAK ===
        # Tanggal & Waktu
        pdf.setFont("Helvetica", 8)
        pdf.setFillColor(black)
        pdf.drawString(margin_x + 2 * mm, y - 6 * mm, tanggal)
        pdf.setFont("Helvetica", 9)
        pdf.drawString(margin_x + col_w[0] + 2 * mm, y - 6 * mm, waktu)

        # Kode & Pelanggaran
        pdf.setFont("Helvetica-Bold", 9)
        code_x = margin_x + col_w[0] + col_w[1] + 2 * mm
        curr_y = y - 6 * mm
        for code_line in code_lines:
            pdf.drawString(code_x, curr_y, code_line)
            curr_y -= 4 * mm
        
        curr_y -= 1 * mm 
        pdf.setFont("Helvetica", 8)
        pdf.setFillColor(gray)
        for label_line in label_lines:
            pdf.drawString(code_x, curr_y, label_line)
            curr_y -= 4 * mm

        # Bukti Pelanggaran (HANYA Nama File + Garis Bawah)
        pdf.setFont("Helvetica", 9)
        pdf.setFillColor(HexColor("#0056b3"))
        bukti_x = margin_x + col_w[0] + col_w[1] + col_w[2] + 2 * mm
        curr_y = y - 6 * mm
        for bukti_line in bukti_lines:
            pdf.drawString(bukti_x, curr_y, bukti_line)
            # Gambar garis bawah 
            pdf.setStrokeColor(HexColor("#0056b3"))
            pdf.setLineWidth(0.5)
            # Menggunakan estimasi matematika sederhana biar gak kena bug stringWidth OS lagi
            text_w = len(bukti_line) * 1.5 * mm 
            pdf.line(bukti_x, curr_y - 1 * mm, bukti_x + text_w, curr_y - 1 * mm)
            curr_y -= 4 * mm

        # Tindakan
        tindakan_x = margin_x + col_w[0] + col_w[1] + col_w[2] + col_w[3] + 2 * mm
        pdf.setFont("Helvetica", 9)
        pdf.setFillColor(black)
        curr_y = y - 6 * mm
        for tind_line in tindakan_lines:
            pdf.drawString(tindakan_x, curr_y, tind_line)
            curr_y -= 4 * mm

        # Reset warna untuk baris berikutnya
        pdf.setFillColor(black)
        pdf.setStrokeColor(black)
        
        y -= row_h

    pdf.showPage()
    pdf.save()
    buffer.seek(0)

    filename = f"laporan-k3-{payload.start_date}-sampai-{payload.end_date}.pdf"
    headers = {"Content-Disposition": f"inline; filename={filename}"}
    return buffer, headers
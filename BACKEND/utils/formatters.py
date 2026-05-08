from datetime import datetime


def format_int_id(value: int) -> str:
    return f"{value:,}".replace(",", ".")


def format_date_id(date_value: datetime) -> str:
    bulan_indo = [
        "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    ]

    hari = date_value.strftime("%d")
    bulan = bulan_indo[date_value.month]
    tahun = date_value.strftime("%Y")

    return f"{hari} {bulan} {tahun}"


def format_shift_label(value: str) -> str:
    if not value or value == "All":
        return "Semua Shift"
    if value == "Morning":
        return "Pagi (08:00 - 16:00)"
    if value == "Afternoon":
        return "Sore (16:00 - 00:00)"
    if value == "Night":
        return "Malam (00:00 - 08:00)"
    return value


def format_area_label(value: str) -> str:
    if not value or value == "All":
        return "Semua Area"
    return value


def compute_compliance(total: int) -> int:
    if total <= 0:
        return 100
    return max(0, round(100 * (1 - (total / (total + 100)))))

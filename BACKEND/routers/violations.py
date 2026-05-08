import time
from typing import Optional

from fastapi import APIRouter, BackgroundTasks

try:
    from ..config import COOLDOWN_SECONDS
    from ..db import SessionLocal
    from ..schemas import ViolationData
    from ..services.telegram import send_to_telegram
    from ..services.violations import fetch_violations, save_violation, serialize_violation
    from ..utils.filters import filter_rows
except ImportError:
    from config import COOLDOWN_SECONDS
    from db import SessionLocal
    from schemas import ViolationData
    from services.telegram import send_to_telegram
    from services.violations import fetch_violations, save_violation, serialize_violation
    from utils.filters import filter_rows

router = APIRouter()

#Anti spam sederhana untuk mencegah laporan duplikat dalam waktu singkat
cooldown_cache = {}


@router.post("/report-violation")
async def report_violation(data: ViolationData, background_tasks: BackgroundTasks):
    key = f"{data.camera_id}_{data.label}_{data.id_pekerja}"
    current_time = time.time()

    if key in cooldown_cache and (current_time - cooldown_cache[key] < COOLDOWN_SECONDS):
        return {"status": "ignored", "reason": "Masih dalam cooldown (Anti-Spam)"}

    cooldown_cache[key] = current_time

    try:
        db = SessionLocal()
        save_violation(db, data)
    except Exception as exc:
        print(f"\u274c Gagal simpan ke database: {exc}")
    finally:
        db.close()

    background_tasks.add_task(send_to_telegram, data)

    return {"status": "success", "message": "Data berhasil diproses Backend!"}


@router.get("/violations")
async def get_violations(
    limit: int = 100,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    shift: str = "All",
    area: str = "All",
):
    try:
        db = SessionLocal()
        rows = fetch_violations(db, limit=limit, start_date=start_date, end_date=end_date)
        if shift or area:
            rows = filter_rows(rows, area, shift)

        results = [serialize_violation(row) for row in rows]
        db.close()
        return {"status": "success", "data": results}
    except Exception as exc:
        print(f"Error fetching violations: {exc}")
        return {"status": "error", "message": str(exc)}

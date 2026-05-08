from fastapi import APIRouter
from sqlalchemy import text

try:
    from ..db import SessionLocal
except ImportError:
    from db import SessionLocal

router = APIRouter()


@router.get("/ping")
async def health_check():
    db_status = "Disconnected \u274c"

    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db_status = "Connected \u2705"
        db.close()
    except Exception as exc:
        print(f"Error DB Ping: {exc}")
        db_status = "Error Database"

    return {
        "status_server": "Online \u2705",
        "status_database": db_status,
        "pesan": "Backend Sistem K3 Aktif dan Siap Menerima Data!",
    }

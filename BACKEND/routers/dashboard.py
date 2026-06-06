from fastapi import APIRouter

try:
    from ..db import SessionLocal
    from ..services.dashboard import build_dashboard_summary
except ImportError:
    from db import SessionLocal
    from services.dashboard import build_dashboard_summary

router = APIRouter()


@router.get("/dashboard-summary")
async def get_dashboard_summary(period: str = "Today", shift: str = "All", area: str = "All"):
    try:
        db = SessionLocal()
        response = build_dashboard_summary(db, period=period, shift=shift, area=area)
        db.close()
        return response
    except Exception as exc:
        print(f"Error dashboard summary: {exc}")
        return {"status": "error", "message": str(exc)}

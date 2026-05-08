from fastapi import APIRouter
from fastapi.responses import StreamingResponse

try:
    from ..db import SessionLocal
    from ..schemas import ReportRequest
    from ..services.reports import generate_report_pdf
except ImportError:
    from db import SessionLocal
    from schemas import ReportRequest
    from services.reports import generate_report_pdf

router = APIRouter()


@router.post("/report-pdf")
async def generate_report_pdf_endpoint(payload: ReportRequest):
    try:
        db = SessionLocal()
        buffer, headers = generate_report_pdf(db, payload)
        db.close()

        return StreamingResponse(buffer, media_type="application/pdf", headers=headers)
    except Exception as exc:
        print(f"Error generate report pdf: {exc}")
        return {"status": "error", "message": str(exc)}

from datetime import datetime, timedelta
from typing import Optional

try:
    from ..config import LABEL_MAP, PPE_LABEL_MAP, PPE_TYPE_MAP
    from ..model import Violation
    from ..schemas import ViolationData
except ImportError:
    from config import LABEL_MAP, PPE_LABEL_MAP, PPE_TYPE_MAP
    from model import Violation
    from schemas import ViolationData


def save_violation(db, data: ViolationData) -> None:
    db_item = Violation(
        camera_id=data.camera_id,
        id_pekerja=data.id_pekerja,
        violation_type=data.label,
        image_path=data.image_path,
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)


def fetch_violations(
    db,
    limit: int = 100,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
):
    query = db.query(Violation)

    if start_date:
        start_dt = datetime.strptime(start_date, "%Y-%m-%d")
        query = query.filter(Violation.created_at >= start_dt)
    if end_date:
        end_dt = datetime.strptime(end_date, "%Y-%m-%d") + timedelta(days=1) - timedelta(seconds=1)
        query = query.filter(Violation.created_at <= end_dt)

    return query.order_by(Violation.created_at.desc()).limit(limit).all()


def serialize_violation(row: Violation) -> dict:
    vtype = (row.violation_type or "").strip()

    codes = []
    labels = []

    def _append(key):
        c = PPE_TYPE_MAP.get(key)
        if c:
            codes.append(c)
            labels.append(PPE_LABEL_MAP.get(c, key.replace("_", " ").title()))
        else:
            # fallback: try LABEL_MAP or humanize
            labels.append(LABEL_MAP.get(key, key.replace("_", " ").title()))

    if "_and_" in vtype:
        if vtype.startswith("not_wearing_"):
            rest = vtype[len("not_wearing_"):]
            parts = rest.split("_and_")
            for p in parts:
                _append("not_wearing_" + p)
        elif vtype.startswith("attempt_remove_"):
            rest = vtype[len("attempt_remove_"):]
            parts = rest.split("_and_")
            for p in parts:
                _append("attempt_remove_" + p)
        else:
            parts = vtype.split("_and_")
            for p in parts:
                _append(p)
    else:
        _append(vtype)

    violation_code = ", ".join(codes) if codes else None
    violation_label = ", ".join(labels) if labels else (LABEL_MAP.get(vtype) or vtype.replace("_", " ").title())

    return {
        "id": row.id,
        "camera_id": row.camera_id,
        "id_pekerja": row.id_pekerja,
        "violation_type": row.violation_type,
        "violation_code": violation_code,
        "violation_label": violation_label,
        "image_path": row.image_path,
        "created_at": row.created_at.isoformat() if row.created_at else None,
    }

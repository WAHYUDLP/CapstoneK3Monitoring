from collections import Counter
from datetime import datetime, timedelta

try:
    from ..config import PPE_LABEL_MAP, PPE_TYPE_MAP
    from ..model import Violation
    from ..utils.filters import build_bar_values, build_time_series, filter_rows
    from ..utils.formatters import compute_compliance, format_int_id
except ImportError:
    from config import PPE_LABEL_MAP, PPE_TYPE_MAP
    from model import Violation
    from utils.filters import build_bar_values, build_time_series, filter_rows
    from utils.formatters import compute_compliance, format_int_id


def get_period_range(period: str):
    now = datetime.now()
    if period == "Today":
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end = now
        prev_start = start - timedelta(days=1)
        prev_end = start
        compare_text = "vs yesterday"
        most_period = "This day"
        labels = ["08.00", "10.00", "12.00", "14.00", "16.00", "18.00", "20.00", "22.00", "00.00"]
    elif period == "Weekly":
        start = now - timedelta(days=7)
        end = now
        prev_start = start - timedelta(days=7)
        prev_end = start
        compare_text = "vs last week"
        most_period = "This week"
        labels = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]
    elif period == "Monthly":
        start = now - timedelta(days=30)
        end = now
        prev_start = start - timedelta(days=30)
        prev_end = start
        compare_text = "vs last month"
        most_period = "This month"
        labels = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"]
    else:
        start = now - timedelta(days=30)
        end = now
        prev_start = start - timedelta(days=30)
        prev_end = start
        compare_text = "vs previous period"
        most_period = "This period"
        labels = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"]

    return start, end, prev_start, prev_end, compare_text, most_period, labels


def build_dashboard_summary(db, period: str, shift: str, area: str) -> dict:
    if period not in {"Today", "Weekly", "Monthly", "All"}:
        period = "Today"

    start, end, prev_start, prev_end, compare_text, most_period, labels = get_period_range(period)

    current_rows = db.query(Violation).filter(Violation.created_at >= start, Violation.created_at <= end).all()
    prev_rows = db.query(Violation).filter(Violation.created_at >= prev_start, Violation.created_at <= prev_end).all()

    current_rows = filter_rows(current_rows, area, shift)
    prev_rows = filter_rows(prev_rows, area, shift)

    total = len(current_rows)
    prev_total = len(prev_rows)

    compliance = compute_compliance(total)
    prev_compliance = compute_compliance(prev_total)
    compliance_delta = compliance - prev_compliance
    compliance_delta_text = f"{compliance_delta:+d}%"
    compliance_delta_color = "text-[#65d738]" if compliance_delta >= 0 else "text-[#e24b4b]"

    if prev_total <= 0:
        violation_delta_text = "0%"
        violation_delta_color = "text-[#65d738]"
    else:
        delta_percent = round(((total - prev_total) / prev_total) * 100)
        violation_delta_text = f"{delta_percent:+d}%"
        violation_delta_color = "text-[#e24b4b]" if delta_percent > 0 else "text-[#65d738]"

    type_counts = Counter(r.violation_type for r in current_rows if r.violation_type)
    most_violate = type_counts.most_common(1)[0][0] if type_counts else "-"
    most_code = PPE_TYPE_MAP.get(most_violate) if most_violate != "-" else "-"
    most_label = PPE_LABEL_MAP.get(most_code) if most_code and most_code != "-" else "-"

    line_values = build_time_series(current_rows, period, start, labels)
    bar_values = build_bar_values(current_rows)

    return {
        "status": "success",
        "data": {
            "compliance": f"{compliance}%",
            "complianceDelta": compliance_delta_text,
            "complianceDeltaColor": compliance_delta_color,
            "violationTotal": format_int_id(total),
            "violationDelta": violation_delta_text,
            "violationDeltaColor": violation_delta_color,
            "mostViolated": most_code if most_code else "-",
            "mostViolatedLabel": most_label,
            "mostViolatedPeriod": most_period,
            "compareText": compare_text,
            "lineValues": line_values,
            "lineLabels": labels,
            "barValues": bar_values,
        },
    }

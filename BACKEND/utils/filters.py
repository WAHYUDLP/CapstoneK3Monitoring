from collections import Counter
from datetime import datetime

try:
    from ..config import PPE_TYPE_MAP
except ImportError:
    from config import PPE_TYPE_MAP


def filter_rows(rows, area: str, shift: str):
    def match_area(row):
        if not area or area == "All":
            return True
        return area.lower() in (row.camera_id or "").lower()

    def match_shift(row):
        if not shift or shift == "All":
            return True
        if not row.created_at:
            return False
        hour = row.created_at.hour
        if shift == "Morning":
            return 8 <= hour < 16
        if shift == "Afternoon":
            return 16 <= hour < 24
        if shift == "Night":
            return 0 <= hour < 8
        return True

    return [row for row in rows if match_area(row) and match_shift(row)]


def build_time_series(rows, period: str, start: datetime, labels):
    if period == "Today":
        buckets = [0] * len(labels)
        for row in rows:
            if not row.created_at:
                continue
            hour = row.created_at.hour
            if 8 <= hour <= 9:
                idx = 0
            elif 10 <= hour <= 11:
                idx = 1
            elif 12 <= hour <= 13:
                idx = 2
            elif 14 <= hour <= 15:
                idx = 3
            elif 16 <= hour <= 17:
                idx = 4
            elif 18 <= hour <= 19:
                idx = 5
            elif 20 <= hour <= 21:
                idx = 6
            elif 22 <= hour <= 23:
                idx = 7
            elif 0 <= hour <= 1:
                idx = 8
            else:
                continue
            buckets[idx] += 1
        return buckets

    if period == "Weekly":
        buckets = [0] * len(labels)
        for row in rows:
            if not row.created_at:
                continue
            idx = row.created_at.weekday()
            buckets[idx] += 1
        return buckets

    buckets = [0] * len(labels)
    for row in rows:
        if not row.created_at:
            continue
        days = (row.created_at - start).days
        idx = min(max(days // 7, 0), len(labels) - 1)
        buckets[idx] += 1
    return buckets


def build_bar_values(rows):
    counts = Counter(PPE_TYPE_MAP.get((r.violation_type or ""), None) for r in rows)
    return [
        counts.get("PPE-01", 0),
        counts.get("PPE-02", 0),
        counts.get("PPE-03", 0),
        counts.get("PPE-04", 0),
        counts.get("PPE-05", 0),
    ]

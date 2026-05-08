from typing import Dict, Optional

from pydantic import BaseModel


class ViolationData(BaseModel):
    camera_id: str
    label: str
    image_path: str
    id_pekerja: Optional[str] = "Tidak diketahui"


class ReportRequest(BaseModel):
    start_date: str
    end_date: str
    shift: Optional[str] = "All"
    area: Optional[str] = "All"
    pengawas: Optional[str] = ""
    cek_sebelum: Optional[str] = ""
    cek_selama: Optional[str] = ""
    catatan: Optional[str] = ""
    tindakan_map: Optional[Dict[str, str]] = None

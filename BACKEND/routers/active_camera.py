from fastapi import APIRouter
from pydantic import BaseModel
import json
import os

router = APIRouter()

_STATE_FILE = os.path.join(os.path.dirname(__file__), '..', 'active_camera.json')

def _load_state():
    try:
        if os.path.exists(_STATE_FILE):
            with open(_STATE_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
    except Exception:
        return None
    return None

def _save_state(obj):
    try:
        with open(_STATE_FILE, 'w', encoding='utf-8') as f:
            json.dump(obj or {}, f)
    except Exception:
        pass


class ActiveCamera(BaseModel):
    cameraId: int | None = None
    name: str | None = None


@router.get("/active-camera")
def get_active_camera():
    state = _load_state() or {"cameraId": None, "name": None}
    return state


@router.post("/active-camera")
def set_active_camera(payload: ActiveCamera):
    obj = {"cameraId": payload.cameraId, "name": payload.name}
    _save_state(obj)
    return {"ok": True, "active": obj}

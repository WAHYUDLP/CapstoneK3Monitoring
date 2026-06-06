import os
import json
import time
import requests
import psutil
from fastapi import APIRouter
from sqlalchemy import text


try:
    from ..db import SessionLocal
except ImportError:
    from db import SessionLocal

router = APIRouter()

# Cache for API status to prevent spamming Telegram and ImgBB APIs on short polling
_api_status_cache = {
    "telegram": "failed",
    "imgbb": "failed",
    "last_check": 0.0
}
CACHE_DURATION = 60.0  # seconds

def _check_api_status():
    global _api_status_cache
    now = time.time()
    if now - _api_status_cache["last_check"] > CACHE_DURATION:
        _api_status_cache["last_check"] = now
        
        # Load system_config.json to get active credentials
        config_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "system_config.json")
        telegram_token = ""
        imgbb_key = ""
        
        if os.path.exists(config_path):
            try:
                with open(config_path, "r") as f:
                    cfg = json.load(f)
                    telegram_token = cfg.get("telegram_token", "")
                    imgbb_key = cfg.get("imgbb_api_key", "")
            except Exception:
                pass
        
        # Test Telegram Token
        if telegram_token:
            try:
                res = requests.get(f"https://api.telegram.org/bot{telegram_token}/getMe", timeout=1.5)
                _api_status_cache["telegram"] = "success" if res.status_code == 200 else "failed"
            except Exception:
                _api_status_cache["telegram"] = "failed"
        else:
            _api_status_cache["telegram"] = "failed"

        # Test ImgBB API Key
        if imgbb_key:
            try:
                dummy_pixel = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                res = requests.post("https://api.imgbb.com/1/upload", data={"key": imgbb_key, "image": dummy_pixel}, timeout=2.0)
                _api_status_cache["imgbb"] = "success" if res.status_code == 200 else "failed"
            except Exception:
                _api_status_cache["imgbb"] = "failed"
        else:
            _api_status_cache["imgbb"] = "failed"


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

@router.get("/api/system-usage")
async def get_system_usage():
    # 1. CPU
    cpu_usage = psutil.cpu_percent(interval=1)
    
    # 2. RAM
    ram_info = psutil.virtual_memory()
    ram_usage = ram_info.percent

    # 3. STORAGE 
    disk_info = psutil.disk_usage('/') 
    disk_usage = disk_info.percent

    # Check API status with cache
    _check_api_status()

    return {
        "status": "success",
        "data": {
            "cpu_percent": cpu_usage,
            "memory_percent": ram_usage,
            "storage_percent": disk_usage,
            "api_status": {
                "telegram": _api_status_cache["telegram"],
                "imgbb": _api_status_cache["imgbb"]
            }
        }
    }
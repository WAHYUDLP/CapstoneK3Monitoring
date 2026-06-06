import os
import json
import requests
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

# Path to system_config.json inside BACKEND folder
CONFIG_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "system_config.json")

class SystemConfig(BaseModel):
    confidence_threshold: float
    iou_threshold: float
    min_detection_frames: int
    cooldown_seconds: int
    telegram_token: str | None = None
    imgbb_api_key: str | None = None
    camera_map: dict | None = None

class TelegramTestPayload(BaseModel):
    token: str

class ImgbbTestPayload(BaseModel):
    key: str

DEFAULT_CONFIG = {
    "confidence_threshold": 0.25,
    "iou_threshold": 0.01,
    "min_detection_frames": 5,
    "cooldown_seconds": 120,
    "telegram_token": "8541407692:AAFBxusrjfoDsU8fHxsb_tlKc6DfYGAs3C4",
    "imgbb_api_key": "158ee9e068a89b28e5b374a664a8e192",
    "camera_map": {
        "1": "",
        "2": "",
        "3": ""
    }
}

def load_config():
    if not os.path.exists(CONFIG_PATH):
        try:
            with open(CONFIG_PATH, "w") as f:
                json.dump(DEFAULT_CONFIG, f, indent=4)
            return DEFAULT_CONFIG
        except Exception as e:
            print(f"Error writing default config: {e}")
            return DEFAULT_CONFIG
    try:
        with open(CONFIG_PATH, "r") as f:
            data = json.load(f)
            # Ensure keys exist
            for k, v in DEFAULT_CONFIG.items():
                if k not in data:
                    data[k] = v
            return data
    except Exception as e:
        print(f"Error reading config: {e}")
        return DEFAULT_CONFIG

def save_config(config_data):
    try:
        with open(CONFIG_PATH, "w") as f:
            json.dump(config_data, f, indent=4)
        return True
    except Exception as e:
        print(f"Error saving config: {e}")
        return False

@router.get("/api/system-config")
async def get_system_config():
    config = load_config()
    return {"status": "success", "data": config}

@router.post("/api/system-config")
async def update_system_config(config: SystemConfig):
    config_dict = config.dict()
    # Validate ranges
    if not (0.0 <= config.confidence_threshold <= 1.0):
        raise HTTPException(status_code=400, detail="Confidence threshold must be between 0 and 1")
    if not (0.0 <= config.iou_threshold <= 1.0):
        raise HTTPException(status_code=400, detail="IoU threshold must be between 0 and 1")
    if config.min_detection_frames < 1:
        raise HTTPException(status_code=400, detail="Minimum detection frames must be at least 1")
    if config.cooldown_seconds < 0:
        raise HTTPException(status_code=400, detail="Cooldown seconds cannot be negative")
    
    current_config = load_config()
    # Keep API tokens if not provided in dynamic update
    if config_dict["telegram_token"] is None:
        config_dict["telegram_token"] = current_config.get("telegram_token", DEFAULT_CONFIG["telegram_token"])
    if config_dict["imgbb_api_key"] is None:
        config_dict["imgbb_api_key"] = current_config.get("imgbb_api_key", DEFAULT_CONFIG["imgbb_api_key"])

    if save_config(config_dict):
        return {"status": "success", "message": "Configuration updated successfully", "data": config_dict}
    else:
        raise HTTPException(status_code=500, detail="Failed to save configuration")

@router.post("/api/test-telegram")
async def test_telegram(payload: TelegramTestPayload):
    token = payload.token.strip()
    if not token:
         return {"status": "failed", "message": "Token Telegram tidak boleh kosong."}
    
    # Test Bot connection
    test_url = f"https://api.telegram.org/bot{token}/getMe"
    try:
        res = requests.get(test_url, timeout=5)
        if res.status_code == 200:
            # Update configuration file
            config_data = load_config()
            config_data["telegram_token"] = token
            save_config(config_data)
            return {"status": "success", "message": "Test Connection was successful!"}
        else:
            return {"status": "failed", "message": f"Test Connection was failed (status code: {res.status_code})"}
    except Exception as e:
        return {"status": "failed", "message": f"Test Connection was failed: {str(e)}"}

@router.post("/api/test-imgbb")
async def test_imgbb(payload: ImgbbTestPayload):
    key = payload.key.strip()
    if not key:
         return {"status": "failed", "message": "API Key ImgBB tidak boleh kosong."}

    # Test upload with a transparent 1x1 PNG base64 pixel
    dummy_pixel = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
    test_url = "https://api.imgbb.com/1/upload"
    try:
        res = requests.post(test_url, data={"key": key, "image": dummy_pixel}, timeout=8)
        if res.status_code == 200:
            # Update configuration file
            config_data = load_config()
            config_data["imgbb_api_key"] = key
            save_config(config_data)
            return {"status": "success", "message": "Test Connection was successful!"}
        else:
            return {"status": "failed", "message": f"Test Connection was failed (status code: {res.status_code})"}
    except Exception as e:
         return {"status": "failed", "message": f"Test Connection was failed: {str(e)}"}

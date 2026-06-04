import os
import json
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

DEFAULT_CONFIG = {
    "confidence_threshold": 0.25,
    "iou_threshold": 0.01,
    "min_detection_frames": 5,
    "cooldown_seconds": 120
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
            return json.load(f)
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
    
    if save_config(config_dict):
        return {"status": "success", "message": "Configuration updated successfully", "data": config_dict}
    else:
        raise HTTPException(status_code=500, detail="Failed to save configuration")

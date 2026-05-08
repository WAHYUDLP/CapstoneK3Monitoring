from fastapi import APIRouter, UploadFile, File
from fastapi.responses import StreamingResponse
import cv2
from pathlib import Path
import os
import time
import numpy as np

try:
    from ..config import CAMERA_ID, CAMERA_LOCATION
except ImportError:
    # Fallback sederhana jika file config belum ditambah variabel ini
    CAMERA_ID = "CCTV 01"
    CAMERA_LOCATION = "Area 1 - Packing"

try:
    from ultralytics import YOLO
except ImportError:  # pragma: no cover
    YOLO = None

router = APIRouter()

_MODEL = None


def _get_model():
    global _MODEL
    if _MODEL is not None:
        return _MODEL

    if YOLO is None:
        return None

    model_path = Path(__file__).resolve().parents[1] / "best.pt"
    if not model_path.exists():
        return None

    try:
        _MODEL = YOLO(str(model_path))
    except Exception:
        _MODEL = None
    return _MODEL


def _draw_predictions(frame):
    """Tambahkan bounding box ke frame jika model YOLO tersedia."""
    model = _get_model()
    if model is None:
        return frame

    try:
        # Placeholder / implementasi deteksi YOLO:
        # - jalankan inferensi pada frame
        # - baca hasil bbox, class id, confidence
        # - gambar rectangle + label di frame
        results = model.predict(frame, verbose=False, conf=0.25)
        if not results:
            return frame

        result = results[0]
        names = getattr(result, "names", None) or getattr(model, "names", {})

        if result.boxes is None:
            return frame

        for box in result.boxes:
            coords = box.xyxy[0].tolist()
            x1, y1, x2, y2 = map(int, coords)
            cls_id = int(box.cls[0]) if box.cls is not None else -1
            conf = float(box.conf[0]) if box.conf is not None else 0.0
            label_name = names.get(cls_id, f"class_{cls_id}") if isinstance(names, dict) else f"class_{cls_id}"
            caption = f"{label_name} {conf:.2f}"

            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            text_y = max(y1 - 10, 20)
            cv2.putText(
                frame,
                caption,
                (x1, text_y),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (0, 255, 0),
                2,
                cv2.LINE_AA,
            )
    except Exception:
        # Jika inferensi gagal, stream tetap jalan tanpa bounding box.
        return frame

    return frame


def generate_frames():
    frame_file = Path(__file__).resolve().parents[1] / "tmp" / "last_frame.jpg"

    def _open_capture(index=0):
        # Try a sequence of backends on Windows to avoid MSMF issues.
        backends = []
        if os.name == 'nt':
            # Try MSMF first (default), then DirectShow as fallback
            backends = [cv2.CAP_MSMF, cv2.CAP_DSHOW]
        else:
            backends = [0]

        for b in backends:
            try:
                cap = cv2.VideoCapture(index, b) if isinstance(b, int) else cv2.VideoCapture(index)
            except Exception:
                cap = cv2.VideoCapture(index)

            if cap is not None and cap.isOpened():
                return cap

        # Last resort: default capture without explicit backend
        cap = cv2.VideoCapture(index)
        if cap is not None and cap.isOpened():
            return cap

        return None

    cap = _open_capture(0)

    def _placeholder_frame():
        h, w = 480, 640
        img = np.zeros((h, w, 3), dtype=np.uint8)
        img[:] = (50, 50, 50)
        cv2.putText(img, "Camera unavailable", (30, int(h / 2) - 10), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (200, 200, 200), 2, cv2.LINE_AA)
        cv2.putText(img, "Check camera or capture backend", (30, int(h / 2) + 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (180, 180, 180), 1, cv2.LINE_AA)
        ok, buffer = cv2.imencode('.jpg', img)
        if not ok:
            return None
        return buffer.tobytes()

    try:
        # Ensure tmp dir exists
        frame_file.parent.mkdir(parents=True, exist_ok=True)

        # If detector pushes frames to `frame_file`, prefer serving that.
        while True:
            if frame_file.exists():
                try:
                    with open(frame_file, 'rb') as f:
                        data = f.read()
                    if data:
                        yield (
                            b"--frame\r\n"
                            b"Content-Type: image/jpeg\r\n\r\n" + data + b"\r\n"
                        )
                        time.sleep(0.1)
                        continue
                except Exception:
                    # fallback to capture below
                    pass

            # If no pushed frame, fall back to local capture
            if cap is None:
                placeholder = _placeholder_frame()
                if placeholder is None:
                    return
                yield (
                    b"--frame\r\n"
                    b"Content-Type: image/jpeg\r\n\r\n" + placeholder + b"\r\n"
                )
                time.sleep(0.25)
                continue

            success, frame = cap.read()
            if not success or frame is None:
                placeholder = _placeholder_frame()
                if placeholder is None:
                    time.sleep(0.5)
                    continue
                yield (
                    b"--frame\r\n"
                    b"Content-Type: image/jpeg\r\n\r\n" + placeholder + b"\r\n"
                )
                time.sleep(0.25)
                continue

            frame = _draw_predictions(frame)

            # Overlay info kamera
            cv2.putText(
                frame,
                f"{CAMERA_ID} - {CAMERA_LOCATION}",
                (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (0, 255, 255),
                2,
                cv2.LINE_AA,
            )

            ok, buffer = cv2.imencode(".jpg", frame)
            if not ok:
                continue

            frame_bytes = buffer.tobytes()
            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n" + frame_bytes + b"\r\n"
            )
    finally:
        try:
            if cap is not None:
                cap.release()
        except Exception:
            pass




@router.post('/api/push-frame')
async def push_frame(frame: UploadFile = File(...)):
    """Detector posts a JPEG frame here. Backend saves it to tmp/last_frame.jpg and video_feed serves it."""
    frame_file = Path(__file__).resolve().parents[1] / "tmp" / "last_frame.jpg"
    try:
        frame_file.parent.mkdir(parents=True, exist_ok=True)
        contents = await frame.read()
        with open(frame_file, 'wb') as f:
            f.write(contents)
        return {"ok": True}
    except Exception as e:
        return {"ok": False, "error": str(e)}


@router.get("/api/video-feed/1")
def video_feed_1():
    return StreamingResponse(
        generate_frames(),
        media_type="multipart/x-mixed-replace; boundary=frame",
    )

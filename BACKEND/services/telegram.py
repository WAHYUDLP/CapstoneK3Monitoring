import time

import requests

try:
    from ..config import LABEL_MAP, PPE_TYPE_MAP, TELEGRAM_CHAT_ID, TELEGRAM_TOKEN
    from ..schemas import ViolationData
except ImportError:
    from config import LABEL_MAP, PPE_TYPE_MAP, TELEGRAM_CHAT_ID, TELEGRAM_TOKEN
    from schemas import ViolationData


def _build_caption(data: ViolationData, jenis_pelanggaran: str, kode_pelanggaran: str) -> str:
    lokasi = data.site_location or data.camera_id
    return (
        "\u26a0\ufe0f PELANGGARAN K3 TERDETEKSI \u26a0\ufe0f\n\n"
        f"\u23f0 Waktu: {time.strftime('%Y-%m-%d %H:%M:%S')}\n"
        f"\U0001F4CD Lokasi: {lokasi}\n"
        f"\U0001F464 Jenis: {jenis_pelanggaran}\n"
        f"\U0001F3F7\ufe0f Kode Pelanggaran: {kode_pelanggaran}\n"
        f"\U0001F4F7 URL Foto: {data.image_path}\n"
    )


def _send_message_fallback(caption: str, image_path: str | None = None) -> None:
    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
    extra = f"\n\nFoto: {image_path}" if image_path else ""
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": f"{caption}{extra}",
        "disable_web_page_preview": True,
    }

    try:
        res = requests.post(url, data=payload, timeout=10)
        if res.status_code != 200:
            print(f"\u274c Gagal kirim fallback Telegram: {res.text}")
        else:
            print("\u2705 Fallback Telegram (text) terkirim")
    except Exception as exc:
        print(f"\u274c ERROR fallback Telegram: {exc}")


def send_to_telegram(data: ViolationData) -> None:
    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendPhoto"

    # Normalize combined labels (e.g. not_wearing_helmet_and_vest) into Indonesian human-friendly joined text
    raw_label = (data.label or "").strip()
    # normalize incoming label to snake_case lowercase so variants like
    # 'Not Wearing Helmet And Vest' or 'not wearing helmet and vest' match keys
    def _normalize_label(s: str) -> str:
        return s.strip().lower().replace(" ", "_").replace("-", "_")
    label_norm = _normalize_label(raw_label)

    # Fallback names in Indonesian for basic APD parts
    fallback_names = {
        "helmet": "Tidak Memakai Helm",
        "vest": "Tidak Memakai Rompi (Vest)",
        "mask": "Tidak Memakai Masker",
    }

    def resolve_name_for_part(part: str) -> str:
        # try multiple keys: not_wearing_{part}, part, plain
        keys = [f"not_wearing_{part}", part]
        for k in keys:
            if k in LABEL_MAP:
                return LABEL_MAP[k]
        if part in fallback_names:
            return fallback_names[part]
        return part.replace("_", " ").title()

    def resolve_code_for_part(part: str) -> str:
        # Try to get a code for the part from PPE_TYPE_MAP
        candidates = [f"not_wearing_{part}", part]
        for c in candidates:
            if c in PPE_TYPE_MAP:
                return PPE_TYPE_MAP[c]
        return "-"

    if "_and_" in label_norm:
        prefix = "not_wearing_"
        core = label_norm[len(prefix):] if label_norm.startswith(prefix) else label_norm
        parts = core.split("_and_")
        jenis_list = [resolve_name_for_part(p) for p in parts]
        jenis_pelanggaran = " dan ".join(jenis_list)

        kode_list = [resolve_code_for_part(p) for p in parts]
        # filter out unknown codes but preserve order; if all unknown, use '-'
        kode_nonempty = [k for k in kode_list if k and k != "-"]
        kode_pelanggaran = ", ".join(kode_nonempty) if kode_nonempty else "-"
    else:
        # single label case: try normalized label first, then stripped
        if label_norm in LABEL_MAP:
            jenis_pelanggaran = LABEL_MAP[label_norm]
        else:
            stripped = label_norm[len("not_wearing_"):] if label_norm.startswith("not_wearing_") else label_norm
            jenis_pelanggaran = LABEL_MAP.get(stripped, fallback_names.get(stripped, label_norm.replace("_", " ").title()))

        # code: try normalized, then stripped, else '-'
        kode_pelanggaran = PPE_TYPE_MAP.get(label_norm) or PPE_TYPE_MAP.get(stripped) or "-"

    caption = _build_caption(data, jenis_pelanggaran, kode_pelanggaran)

    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "photo": data.image_path,
        "caption": caption,
    }

    try:
        res = requests.post(url, data=payload, timeout=15)
        if res.status_code != 200:
            print(f"\u274c Gagal kirim Telegram: {res.text}")
            _send_message_fallback(caption, data.image_path)
        else:
            print("\u2705 Telegram photo terkirim")
    except Exception as exc:
        print(f"\u274c ERROR API Telegram: {exc}")
        _send_message_fallback(caption, data.image_path)

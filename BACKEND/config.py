# Configuration and static maps

DATABASE_URL = "mysql+pymysql://root:@localhost/k3_project"

#ini punya yahya nanti diaktifin pas presentasi atau pas ketemu
# TELEGRAM_TOKEN = "8707229189:AAEPf1wB8XJ3b-_HieOR23qsVBi85zBKiks"
# TELEGRAM_CHAT_ID = "-1003886366274"

#ini aku nyoba sendiri mau test biar ngga ganggu yahya heheh
# Token dari BotFather (Milik @NotifK3_bot)
TELEGRAM_TOKEN  = "8541407692:AAFBxusrjfoDsU8fHxsb_tlKc6DfYGAs3C4" 
TELEGRAM_CHAT_ID = "-1003870838631"

CORS_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"]

# Default camera info for the M-JPEG stream endpoint
# CAMERA_ID = "CCTV 01"
CAMERA_LOCATION = "Area 1 - Packing"

COOLDOWN_SECONDS = 60

LABEL_MAP = {
    "not_wearing_helmet": "Tidak Memakai Helm",
    "not_wearing_vest": "Tidak Memakai Rompi (Vest)",
    "not_wearing_mask": "Tidak Memakai Masker",
    "not_wearing_any_apd": "Tidak Memakai APD Lengkap",
    "attempt_remove_helmet": "Mencoba Melepas Helm",
    "attempt_remove_vest": "Mencoba Melepas Rompi",
    "attempt_remove_mask": "Mencoba Melepas Masker",
}

PPE_TYPE_MAP = {
    "not_wearing_helmet": "PPE-01",
    "not_wearing_vest": "PPE-02",
    "not_wearing_mask": "PPE-03",
    "not_wearing_any_apd": "PPE-04",
    "attempt_remove_helmet": "PPE-05",
    "attempt_remove_vest": "PPE-06",
    "attempt_remove_mask": "PPE-07",
}

PPE_LABEL_MAP = {
    "PPE-01": "Tidak Memakai Helm",
    "PPE-02": "Tidak Memakai Rompi (Vest)",
    "PPE-03": "Tidak Memakai Masker",
    "PPE-04": "Tidak Memakai APD Lengkap",
    "PPE-05": "Mencoba Melepas Helm",
    "PPE-06": "Mencoba Melepas Rompi",
    "PPE-07": "Mencoba Melepas Masker",
}

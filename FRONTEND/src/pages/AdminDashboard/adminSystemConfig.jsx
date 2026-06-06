import { useState, useEffect } from "react";
import "../../App.css";
import { fetchSystemConfig, updateSystemConfig, testTelegramConnection, testImgbbConnection } from "../../api";

function AdminSystemConfig() {
  const [config, setConfig] = useState({
    confidence_threshold: 0.25,
    iou_threshold: 0.01,
    min_detection_frames: 5,
    cooldown_seconds: 120,
  });
  
  const [telegramToken, setTelegramToken] = useState("");
  const [imgbbApiKey, setImgbbApiKey] = useState("");
  
  const [telegramTestStatus, setTelegramTestStatus] = useState(""); // "", "loading", "successful", "failed"
  const [imgbbTestStatus, setImgbbTestStatus] = useState(""); // "", "loading", "successful", "failed"
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    async function loadConfig() {
      try {
        const data = await fetchSystemConfig();
        if (data) {
          setConfig(data);
          setTelegramToken(data.telegram_token || "");
          setImgbbApiKey(data.imgbb_api_key || "");
        }
      } catch (err) {
        console.error("Gagal memuat konfigurasi:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadConfig();
  }, []);

  const handleTestTelegram = async () => {
    setTelegramTestStatus("loading");
    try {
      const res = await testTelegramConnection(telegramToken);
      if (res && res.status === "success") {
        setTelegramTestStatus("successful");
      } else {
        setTelegramTestStatus("failed");
      }
    } catch (err) {
      setTelegramTestStatus("failed");
    }
  };

  const handleTestImgbb = async () => {
    setImgbbTestStatus("loading");
    try {
      const res = await testImgbbConnection(imgbbApiKey);
      if (res && res.status === "success") {
        setImgbbTestStatus("successful");
      } else {
        setImgbbTestStatus("failed");
      }
    } catch (err) {
      setImgbbTestStatus("failed");
    }
  };

  const handleSaveSettings = async () => {
    setSaveStatus({ type: "loading", message: "Menyimpan pengaturan..." });
    
    const payload = {
      confidence_threshold: parseFloat(config.confidence_threshold),
      iou_threshold: parseFloat(config.iou_threshold),
      min_detection_frames: parseInt(config.min_detection_frames),
      cooldown_seconds: parseInt(config.cooldown_seconds),
      telegram_token: telegramToken,
      imgbb_api_key: imgbbApiKey,
    };

    setIsSaving(true);
    setSaveStatus({ type: "", message: "" });

    // Validasi input threshold
    if (isNaN(payload.confidence_threshold) || payload.confidence_threshold < 0 || payload.confidence_threshold > 1) {
      setSaveStatus({ type: "error", message: "Confidence threshold must be between 0 and 1" });
      setIsSaving(false);
      return;
    }
    if (isNaN(payload.iou_threshold) || payload.iou_threshold < 0 || payload.iou_threshold > 1) {
      setSaveStatus({ type: "error", message: "IoU threshold must be between 0 and 1" });
      setIsSaving(false);
      return;
    }
    if (isNaN(payload.min_detection_frames) || payload.min_detection_frames < 1) {
      setSaveStatus({ type: "error", message: "Minimum detection frames must be at least 1" });
      setIsSaving(false);
      return;
    }
    if (isNaN(payload.cooldown_seconds) || payload.cooldown_seconds < 0) {
      setSaveStatus({ type: "error", message: "Cooldown seconds cannot be negative" });
      setIsSaving(false);
      return;
    }

    const res = await updateSystemConfig(payload);
    setIsSaving(false);
    
    if (res && res.status === "success") {
      setSaveStatus({ type: "success", message: "Saved successfully!" });
      setTimeout(() => setSaveStatus({ type: "", message: "" }), 3000);
    } else {
      setSaveStatus({ type: "error", message: res.message || "Failed to save settings." });
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl">
      <div>
        <h1 className="text-[28px] font-bold text-[#00265d] mb-2">System Configuration</h1>
        <hr className="border-[#003f98]/20" />
      </div>

      {/* API SETTINGS */}
      <div className="bg-[#f0f4f9] rounded-xl border border-[#003f98] p-6 shadow-sm">
        <h2 className="text-[22px] font-bold text-[#003f98] mb-6">API Settings</h2>

        {/* TELEGRAM */}
        <div className="mb-6">
          <label className="block text-[16px] font-bold text-[#003f98] mb-2">Telegram</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              placeholder="Insert Telegram Token Here"
              value={telegramToken}
              onChange={(e) => {
                setTelegramToken(e.target.value);
                setTelegramTestStatus("");
              }}
              className="flex-1 px-4 py-2.5 rounded-lg border border-[#c8d6ea] bg-white text-[#00265d] font-medium focus:outline-none focus:ring-2 focus:ring-[#003f98]"
            />
            <button
              onClick={handleTestTelegram}
              disabled={telegramTestStatus === "loading"}
              className="w-full sm:w-auto bg-[#003f98] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#002c6a] disabled:opacity-50 transition-colors"
            >
              {telegramTestStatus === "loading" ? "Testing..." : "Test Connection"}
            </button>
          </div>
          {telegramTestStatus === "successful" && (
            <p className="mt-2 text-sm text-[#65d738] font-bold">Test Connection was successful</p>
          )}
          {telegramTestStatus === "failed" && (
            <p className="mt-2 text-sm text-[#e24b4b] font-bold">Test Connection was failed</p>
          )}
          <p className="mt-3 text-[13px] text-[#6b90c3] font-medium leading-relaxed">
            <span className="font-bold text-[#003f98]">Info:</span> Tests if the Telegram Bot Token is valid by pinging the Telegram server. If successful, the backend is ready to send violation photo notifications.
          </p>
        </div>

        {/* IMGBB */}
        <div>
          <label className="block text-[16px] font-bold text-[#003f98] mb-2">Database (ImgBB)</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              placeholder="Insert API DB Here"
              value={imgbbApiKey}
              onChange={(e) => {
                setImgbbApiKey(e.target.value);
                setImgbbTestStatus("");
              }}
              className="flex-1 px-4 py-2.5 rounded-lg border border-[#c8d6ea] bg-white text-[#00265d] font-medium focus:outline-none focus:ring-2 focus:ring-[#003f98]"
            />
            <button
              onClick={handleTestImgbb}
              disabled={imgbbTestStatus === "loading"}
              className="w-full sm:w-auto bg-[#003f98] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#002c6a] disabled:opacity-50 transition-colors"
            >
              {imgbbTestStatus === "loading" ? "Testing..." : "Test Connection"}
            </button>
          </div>
          {imgbbTestStatus === "successful" && (
            <p className="mt-2 text-sm text-[#65d738] font-bold">Test Connection was successful</p>
          )}
          {imgbbTestStatus === "failed" && (
            <p className="mt-2 text-sm text-[#e24b4b] font-bold">Test Connection was failed</p>
          )}
          <p className="mt-3 text-[13px] text-[#6b90c3] font-medium leading-relaxed">
            <span className="font-bold text-[#003f98]">Info:</span> Tests if the ImgBB API Key is valid by attempting to upload a dummy (1 pixel) image. If successful, the backend is ready to store all K3 violation evidence photos.
          </p>
        </div>
      </div>

      {/* DETECTION SETTINGS */}
      <div className="bg-[#f0f4f9] rounded-xl border border-[#003f98] p-6 shadow-sm">
        <h2 className="text-[22px] font-bold text-[#003f98] mb-6">Detection Settings</h2>

        {isLoading ? (
          <p className="text-[#003f98] font-medium">Loading configuration...</p>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* Confidence */}
            <div>
              <label className="block text-[16px] font-bold text-[#003f98]">Confidence Threshold</label>
              <p className="text-[13px] text-[#6b90c3] mb-2">Defines the minimum confidence score (between 0 - 1)</p>
              <input
                type="number" step="0.01" min="0" max="1"
                value={config.confidence_threshold}
                onChange={(e) => setConfig({ ...config, confidence_threshold: e.target.value })}
                className="w-full sm:w-32 px-4 py-2 rounded-lg border border-[#c8d6ea] bg-white text-[#00265d] font-bold focus:outline-none focus:ring-2 focus:ring-[#003f98]"
              />
            </div>

            {/* IoU */}
            <div>
              <label className="block text-[16px] font-bold text-[#003f98]">IoU Threshold</label>
              <p className="text-[13px] text-[#6b90c3] mb-2">Controls the overlap tolerance score (between 0 - 1) between bounding boxes to reduce duplicate detections.</p>
              <input
                type="number" step="0.01" min="0" max="1"
                value={config.iou_threshold}
                onChange={(e) => setConfig({ ...config, iou_threshold: e.target.value })}
                className="w-full sm:w-32 px-4 py-2 rounded-lg border border-[#c8d6ea] bg-white text-[#00265d] font-bold focus:outline-none focus:ring-2 focus:ring-[#003f98]"
              />
            </div>

            {/* Min Frames */}
            <div>
              <label className="block text-[16px] font-bold text-[#003f98]">Minimum Detection Frames</label>
              <p className="text-[13px] text-[#6b90c3] mb-2">Specifies the minimum number of consecutive frames an object must be detected to be confirmed as valid.</p>
              <div className="flex items-center gap-3">
                <input
                  type="number" min="1"
                  value={config.min_detection_frames}
                  onChange={(e) => setConfig({ ...config, min_detection_frames: e.target.value })}
                  className="w-full sm:w-32 px-4 py-2 rounded-lg border border-[#c8d6ea] bg-white text-[#00265d] font-bold focus:outline-none focus:ring-2 focus:ring-[#003f98]"
                />
                <span className="text-[16px] text-[#003f98] font-medium">Frame(s)</span>
              </div>
            </div>

            {/* Cooldown */}
            <div>
              <label className="block text-[16px] font-bold text-[#003f98]">Detection Cooldown per ID</label>
              <p className="text-[13px] text-[#6b90c3] mb-2">Determines the waiting time before the same object ID can trigger another detection event.</p>
              <div className="flex items-center gap-3">
                <input
                  type="number" min="0"
                  value={config.cooldown_seconds}
                  onChange={(e) => setConfig({ ...config, cooldown_seconds: e.target.value })}
                  className="w-full sm:w-32 px-4 py-2 rounded-lg border border-[#c8d6ea] bg-white text-[#00265d] font-bold focus:outline-none focus:ring-2 focus:ring-[#003f98]"
                />
                <span className="text-[16px] text-[#003f98] font-medium">Second(s)</span>
              </div>
            </div>

            {/* SAVE SECTION */}
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="bg-[#003f98] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#002c6a] transition-colors w-full sm:w-auto shadow-md disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  "Save Detection Settings"
                )}
              </button>

              {/* Status Message next to button */}
              {saveStatus.message && (
                <div className="flex items-center gap-2 animate-fade-in">
                  {saveStatus.type === "success" && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e6f4ea] text-[#137333] text-xs">✔</span>
                  )}
                  {saveStatus.type === "error" && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#fce8e6] text-[#c5221f] text-xs">✖</span>
                  )}
                  <span className={`text-sm font-bold ${saveStatus.type === "success" ? "text-[#137333]" : "text-[#c5221f]"}`}>
                    {saveStatus.message}
                  </span>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default AdminSystemConfig;
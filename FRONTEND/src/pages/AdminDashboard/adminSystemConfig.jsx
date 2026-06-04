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
  
  const [loading, setLoading] = useState(true);
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
        setLoading(false);
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

    // Validasi input threshold
    if (isNaN(payload.confidence_threshold) || payload.confidence_threshold < 0 || payload.confidence_threshold > 1) {
      setSaveStatus({ type: "error", message: "Confidence threshold harus di antara 0 dan 1" });
      return;
    }
    if (isNaN(payload.iou_threshold) || payload.iou_threshold < 0 || payload.iou_threshold > 1) {
      setSaveStatus({ type: "error", message: "IoU threshold harus di antara 0 dan 1" });
      return;
    }
    if (isNaN(payload.min_detection_frames) || payload.min_detection_frames < 1) {
      setSaveStatus({ type: "error", message: "Minimum detection frames minimal bernilai 1" });
      return;
    }
    if (isNaN(payload.cooldown_seconds) || payload.cooldown_seconds < 0) {
      setSaveStatus({ type: "error", message: "Cooldown seconds tidak boleh negatif" });
      return;
    }

    const res = await updateSystemConfig(payload);
    if (res && res.status === "success") {
      setSaveStatus({ type: "success", message: "Pengaturan berhasil disimpan!" });
      setTimeout(() => setSaveStatus({ type: "", message: "" }), 3000);
    } else {
      setSaveStatus({ type: "error", message: res.message || "Gagal menyimpan pengaturan." });
    }
  };

  return (
    <div
      style={{
        marginLeft: "303px", 
        width: "calc(100% - 303px)",
        padding: "40px",
        background: "#E6ECF5",
        minHeight: "100vh",
        boxSizing: "border-box",
      }}
    >
      <h1 className="title">System Configuration</h1>

      <hr style={{ border: "1px solid #003F98" }} />

      {/* API SETTINGS */}
      <h2 className="section-title">API Settings</h2>

      {/* TELEGRAM */}
      <div className="text-primary" style={{ marginTop: "20px" }}>
        <p className="section" style={{marginBottom: "5px"}}>Telegram</p>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            placeholder="ex: 8541407692:AAFBxusrjfoDsU8fHxsb_tlKc6DfYGAs3C4"
            value={telegramToken}
            onChange={(e) => {
              setTelegramToken(e.target.value);
              setTelegramTestStatus(""); // Reset status on edit
            }}
            style={{
              width: "50%",
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid #003F98",
              background: "#E6ECF5",
              color: "#003F98",
              fontWeight: "bold",
            }}
          />

          <button
            onClick={handleTestTelegram}
            disabled={telegramTestStatus === "loading"}
            style={{
              background: "#003F98",
              color: "#E6ECF5",
              border: "none",
              padding: "10px 20px",
              borderRadius: "10px",
              cursor: telegramTestStatus === "loading" ? "not-allowed" : "pointer",
              fontWeight: "bold",
            }}
          >
            {telegramTestStatus === "loading" ? "Testing..." : "Test Connection"}
          </button>
        </div>

        {telegramTestStatus === "successful" && (
          <p style={{ marginTop: "5px", fontSize: "14px" }}>
            Test Connection was{" "}
            <span style={{ color: "green", fontWeight: "bold" }}>successful</span>
          </p>
        )}
        {telegramTestStatus === "failed" && (
          <p style={{ marginTop: "5px", fontSize: "14px" }}>
            Test Connection was{" "}
            <span style={{ color: "red", fontWeight: "bold" }}>failed</span>
          </p>
        )}
      </div>

      {/* DATABASE (IMGBB API KEY) */}
      <div className="text-primary" style={{ marginTop: "20px" }}>
        <p className="section" style={{marginBottom: "5px"}}>Database</p>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            placeholder="ex: 158ee9e068a89b28e5b374a664a8e192"
            value={imgbbApiKey}
            onChange={(e) => {
              setImgbbApiKey(e.target.value);
              setImgbbTestStatus(""); // Reset status on edit
            }}
            style={{
              width: "50%",
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid #003F98",
              background: "#E6ECF5",
              color: "#003F98",
              fontWeight: "bold",
            }}
          />

          <button
            onClick={handleTestImgbb}
            disabled={imgbbTestStatus === "loading"}
            style={{
              background: "#003F98",
              color: "#E6ECF5",
              border: "none",
              padding: "10px 20px",
              borderRadius: "10px",
              cursor: imgbbTestStatus === "loading" ? "not-allowed" : "pointer",
              fontWeight: "bold",
            }}
          >
            {imgbbTestStatus === "loading" ? "Testing..." : "Test Connection"}
          </button>
        </div>

        {imgbbTestStatus === "successful" && (
          <p style={{ marginTop: "5px", fontSize: "14px" }}>
            Test Connection was{" "}
            <span style={{ color: "green", fontWeight: "bold" }}>successful</span>
          </p>
        )}
        {imgbbTestStatus === "failed" && (
          <p style={{ marginTop: "5px", fontSize: "14px" }}>
            Test Connection was{" "}
            <span style={{ color: "red", fontWeight: "bold" }}>failed</span>
          </p>
        )}
      </div>

      {/* DETECTION SETTINGS */}
      <h2 className="section-title" style={{ marginTop: "40px", marginBottom: "20px" }}>
        Detection Settings
      </h2>

      {loading ? (
        <p style={{ color: "#003F98" }}>Memuat konfigurasi...</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ color: "#003F98" }}>
            <p className="section">Confidence Threshold</p>
            <p style={{ fontSize: "14px", color: "#666", marginBottom: "5px" }}>
              Defines the minimum confidence score (between 0 - 1)
            </p>
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              placeholder="ex: 0.25"
              value={config.confidence_threshold}
              onChange={(e) => setConfig({ ...config, confidence_threshold: e.target.value })}
              style={{
                width: "120px",
                padding: "10px",
                borderRadius: "10px",
                border: "1px solid #003F98",
                background: "#E6ECF5",
                color: "#003F98",
                fontWeight: "bold",
              }}
            />
          </div>

          <div style={{ color: "#003F98" }}>
            <p className="section">IoU Threshold</p>
            <p style={{ fontSize: "14px", color: "#666", marginBottom: "5px" }}>
              Controls the overlap tolerance score (between 0 - 1) between bounding boxes to reduce duplicate detections.
            </p>
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              placeholder="ex: 0.01"
              value={config.iou_threshold}
              onChange={(e) => setConfig({ ...config, iou_threshold: e.target.value })}
              style={{
                width: "120px",
                padding: "10px",
                borderRadius: "10px",
                border: "1px solid #003F98",
                background: "#E6ECF5",
                color: "#003F98",
                fontWeight: "bold",
              }}
            />
          </div>

          <div style={{ color: "#003F98" }}>
            <p className="section">Minimum Detection Frames</p>
            <p style={{ fontSize: "14px", color: "#666", marginBottom: "5px" }}>
              Specifies the minimum number of consecutive frames an object must be detected to be confirmed as valid.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="number"
                min="1"
                placeholder="ex: 5"
                value={config.min_detection_frames}
                onChange={(e) => setConfig({ ...config, min_detection_frames: e.target.value })}
                style={{
                  width: "120px",
                  padding: "10px",
                  borderRadius: "10px",
                  border: "1px solid #003F98",
                  background: "#E6ECF5",
                  fontSize: "16px",
                  color: "#003F98",
                  fontWeight: "bold",
                }}
              />
              <span style={{ fontSize: "16px", lineHeight: "1" }}>Frame(s)</span>
            </div>
          </div>

          <div style={{ color: "#003F98" }}>
            <p className="section">Detection Cooldown per ID</p>
            <p style={{ fontSize: "14px", color: "#666", marginBottom: "5px" }}>
              Determines the waiting time before the same object ID can trigger another detection event.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="number"
                min="0"
                placeholder="ex: 120"
                value={config.cooldown_seconds}
                onChange={(e) => setConfig({ ...config, cooldown_seconds: e.target.value })}
                style={{
                  width: "120px",
                  padding: "10px",
                  borderRadius: "10px",
                  border: "1px solid #003F98",
                  background: "#E6ECF5",
                  fontSize: "16px",
                  color: "#003F98",
                  fontWeight: "bold",
                }}
              />
              <span style={{ fontSize: "16px", lineHeight: "1" }}>Second(s)</span>
            </div>
          </div>

          {/* STATUS NOTIFICATION */}
          {saveStatus.message && (
            <div
              style={{
                padding: "10px 15px",
                borderRadius: "8px",
                fontSize: "15px",
                width: "fit-content",
                fontWeight: "bold",
                background: saveStatus.type === "success" ? "#d1e7dd" : saveStatus.type === "error" ? "#f8d7da" : "#cff4fc",
                color: saveStatus.type === "success" ? "#0f5132" : saveStatus.type === "error" ? "#842029" : "#055160",
                border: `1px solid ${saveStatus.type === "success" ? "#badbcc" : saveStatus.type === "error" ? "#f5c2c7" : "#b6effb"}`,
                marginTop: "10px",
              }}
            >
              {saveStatus.message}
            </div>
          )}

          {/* SAVE BUTTON */}
          <button
            onClick={handleSaveSettings}
            style={{
              alignSelf: "flex-start",
              marginTop: "20px",
              background: "#003F98",
              color: "#E6ECF5",
              padding: "12px 30px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "16px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.15)",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => (e.target.style.background = "#002b66")}
            onMouseOut={(e) => (e.target.style.background = "#003F98")}
          >
            Save Detection Settings
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminSystemConfig;
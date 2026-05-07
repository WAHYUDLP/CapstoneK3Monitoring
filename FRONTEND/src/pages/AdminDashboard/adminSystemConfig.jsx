import "../../App.css";

function AdminDashboard() {
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

        <div style={{ display: "flex", gap: "10px" }}>
          <input
            placeholder="ex: https://api.imgbb.com/1/upload"
            style={{
              width: "50%",
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid #003F98",
              background: "#E6ECF5",
            }}
          />

          <button
            style={{
              background: "#003F98",
              color: "#E6ECF5",
              border: "none",
              padding: "10px 20px",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            Test Connection
          </button>
        </div>

        <p>
          Test Connection was{" "}
          <span style={{ color: "green" }}>successful</span>
        </p>
      </div>

      {/* IMGBB */}
      <div className="text-primary" style={{ marginTop: "20px" }}>
        <p className="section"style={{marginBottom: "5px"}}>ImgBB</p>

        <div style={{ display: "flex", gap: "10px" }}>
          <input
            placeholder="ex: https://api.imgbb.com/1/upload"
            style={{
              width: "50%",
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid #003F98",
              background: "#E6ECF5",
            }}
          />

          <button
            style={{
              background: "#003F98",
              color: "#E6ECF5",
              border: "none",
              padding: "10px 20px",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            Test Connection
          </button>
        </div>

        <p>
          Test Connection was{" "}
          <span style={{ color: "red" }}>failed</span>
        </p>
      </div>

      {/* ADD NEW */}
      <button
        style={{
          marginTop: "20px",
          background: "#003F98",
          color: "#E6ECF5",
          padding: "10px 20px",
          borderRadius: "10px",
          border: "none",
          cursor: "pointer",
        }}
      >
        Add New
      </button>

      {/* DETECTION SETTINGS */}
      <h2 className="section-title" style={{ marginTop: "40px", marginBottom: "20px" }}>
        Detection Settings
      </h2>

      <div style={{  color: "#003F98" }}>
        <p className="section">Confidence Threshold</p>

        <p style={{ fontSize: "14px", color: "#CCCCCC" }}>
          Defines the minimum confidence score (between 0 - 1)
        </p>

        <input
          placeholder="ex: 0.67"
          style={{
            width: "70px",
            padding: "10px",
            borderRadius: "10px",
            border: "1px solid #003F98",
            background: "#E6ECF5",
          }}
        />
      </div>
      <div style={{  color: "#003F98" }}>
        <p className="section">IoU Threshold</p>

        <p style={{ fontSize: "14px", color: "#CCCCCC" }}>
          Controls the overlap tolerance score (betwwen 0 - 1) between bounding boxes to reduce duplicate detections.
        </p>

        <input
          placeholder="ex: 0.67"
          style={{
            width: "70px",
            padding: "10px",
            borderRadius: "10px",
            border: "1px solid #003F98",
            background: "#E6ECF5",
          }}
        />
      </div>
      <div style={{  color: "#003F98" }}>
        <p className="section">Minimum Detection Frames</p>

        <p style={{ fontSize: "14px", color: "#CCCCCC" }}>
          Specifies the minimum number of consecutive frames an object must be detected to be confirmed as valid.
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center", 
            gap: "10px"
          }}
        >
          <input
            placeholder="ex: 0.67"
            style={{
              width: "70px",
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid #003F98",
              background: "#E6ECF5",
              fontSize: "16px" 
            }}
          />

          <span
            style={{
              fontSize: "16px", 
              lineHeight: "1"   
            }}
          >
            Frame(s)
          </span>
        </div>
      </div>
      <div style={{  color: "#003F98" }}>
        <p className="section">Detection Cooldown per ID</p>

        <p style={{ fontSize: "14px", color: "#CCCCCC" }}>
          Determines the waiting time before the same object ID can trigger another detection event.
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center", 
            gap: "10px"
          }}
        >
          <input
            placeholder="ex: 0.67"
            style={{
              width: "70px",
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid #003F98",
              background: "#E6ECF5",
              fontSize: "16px" 
            }}
          />

          <span
            style={{
              fontSize: "16px", 
              lineHeight: "1"   
            }}
          >
            Second(s)
          </span>
        </div>
      </div>

    </div>
  );
}

export default AdminDashboard;
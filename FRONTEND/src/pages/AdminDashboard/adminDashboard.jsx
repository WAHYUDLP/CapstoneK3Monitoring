import { useState, useEffect } from "react";
import "../../App.css";

function AdminDashboard() {
  // 1. STATE BUAT NAMPUNG DATA CPU & RAM DARI BACKEND
  const [systemData, setSystemData] = useState({ 
    cpu: 0, 
    memory: 0, 
    storage: 0, 
    api_status: { telegram: "failed", imgbb: "failed" }
  });

  // 2. SHORT POLLING: Narik data dari server tiap 3 detik
  useEffect(() => {
    const fetchSystemUsage = async () => {
      try {
        const response = await fetch("http://localhost:9001/api/system-usage");
        const result = await response.json();
        
        if (result.status === "success") {
          // Math.round() dipake biar angkanya dibuletin, bukan desimal. Biar tampilannya lebih bersih di dashboard.
          setSystemData({
            cpu: Math.round(result.data.cpu_percent),
            memory: Math.round(result.data.memory_percent),
            storage: Math.round(result.data.storage_percent),
            api_status: result.data.api_status || { telegram: "failed", imgbb: "failed" }
          });
        }
      } catch (error) {
        console.error("Gagal narik data Server:", error);
      }
    };

    fetchSystemUsage(); // Panggilan pertama
    const timer = setInterval(fetchSystemUsage, 3000); // Diulang tiap 3 detik

    return () => clearInterval(timer); // Bersihin timer kalau pindah halaman
  }, []);

  return (
    <div
      className="container"
      style={{
        marginLeft: "303px",
        width: "calc(100% - 303px)",
        padding: "40px",
        background: "#E6ECF5",
        minHeight: "100vh",
        boxSizing: "border-box",
      }}
    >
      <div className="content-wrapper">
        {/* TOP CARDS */}
        <div className="top-cards">
          <div className="card">
            <h3 style={{ marginBottom: "40px" }}>System Downtime</h3>
            <h1>0h23m</h1>
            <p>
              <span style={{ color: "green" }}>+5%</span> vs last week
            </p>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: "40px" }}>Active Device</h3>
            <h1>
              32<span style={{ color: "#1e3a8a" }}>/64</span>
            </h1>
            <p className="green">Online</p>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: "40px" }}>API Status</h3>
            <p style={{ fontSize: 20, color: "#2B60AA" }}>
              <span className={`dot ${systemData.api_status.telegram === "success" ? "green-bg" : "red-bg"}`}></span> Telegram
            </p>
            <p style={{ fontSize: 20, color: "#2B60AA" }}>
              <span className={`dot ${systemData.api_status.imgbb === "success" ? "green-bg" : "red-bg"}`}></span> ImgBB
            </p>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="bottom-section">
          {/* SYSTEM USAGE */}
          <div className="card large" style={{ color: "#1E3A8A", flex: 1.5 }}>
            <h3 style={{ marginBottom: "40px" }}>System Usage</h3>
            <div className="usage">
              
              {/* LINGKARAN MEMORY (Udah Live dari Backend) */}
              <div className="circle">
                <div className="inner" style={{ "--percent": systemData.memory }}>
                  <div className="inner-hole">
                    <span className="value">{systemData.memory}%</span>
                    <span className="label">Memory</span>
                  </div>
                </div>
              </div>

              {/* LINGKARAN CPU (Udah Live dari Backend) */}
              <div className="circle">
                <div className="inner" style={{ "--percent": systemData.cpu }}>
                  <div className="inner-hole">
                    <span className="value">{systemData.cpu}%</span>
                    <span className="label">CPU</span>
                  </div>
                </div>
              </div>

              {/* LINGKARAN STORAGE (Biarkan hardcode dulu karena Storage jarang berubah cepat) */}
              <div className="circle">
                <div className="inner" style={{ "--percent": systemData.storage }}>
                  <div className="inner-hole">
                    <span className="value">{systemData.storage}%</span>
                    <span className="label">Storage</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* API CHART (fake bar) */}
          <div className="card large">
            <h3 style={{ marginBottom: "20px" }}>API Request Success Rate</h3>
            <div className="chart-container">
              {/* CHART */}
              <div className="chart">
                <div className="bar-group">
                  <div className="bar-stack">
                    <div className="bar fail" style={{ height: "20%" }}></div>
                    <div className="bar success" style={{ height: "60%" }}></div>
                  </div>
                  <p>Telegram</p>
                </div>

                <div className="bar-group">
                  <div className="bar-stack">
                    <div className="bar fail" style={{ height: "25%" }}></div>
                    <div className="bar success" style={{ height: "85%" }}></div>
                  </div>
                  <p>ImgBB</p>
                </div>
              </div>

              {/* SIDE INFO */}
              <div className="side-info">
                <div className="mini-card">
                  <p>
                    <span className="dot green-bg"></span> Success
                  </p>
                  <p>
                    <span className="dot red-bg"></span> Fail
                  </p>
                </div>

                <div className="mini-card">
                  <p>
                    Total Requests <br />
                    <b>1,356</b>
                  </p>
                </div>

                <div className="mini-card">
                  <p>
                    Avg Response Time <br /> <b>420ms</b>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
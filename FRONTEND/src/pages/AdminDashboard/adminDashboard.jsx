import "../../App.css";

function AdminDashboard() {
  return (

    <div className="container"
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
              <span style={{ color: "green" }}>+5%</span> vs last week</p>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: "40px" }}>Active Device</h3>
            <h1>32<span style={{ color: "#1e3a8a" }}>/64</span></h1>
            <p className="green">Online</p>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: "40px" }}>API Status</h3>
            <p style={{ fontSize: 20, color: "#2B60AA" }}><span className="dot green-bg"></span> Telegram</p>
            <p style={{ fontSize: 20, color: "#2B60AA" }}><span className="dot red-bg"></span> ImgBB</p>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="bottom-section">

          {/* SYSTEM USAGE */}
          <div className="card large" style={{ color: "#1E3A8A", flex: 1.5 }}>
            <h3 style={{ marginBottom: "40px" }}>System Usage</h3>
            <div className="usage">

              <div className="circle">
                <div className="inner" style={{ "--percent": 21 }}>
                  <div className="inner-hole">
                    <span className="value">21%</span>
                    <span className="label">Memory</span>
                  </div>
                </div>
              </div>

              <div className="circle">
                <div className="inner" style={{ "--percent": 37 }}>
                  <div className="inner-hole">
                    <span className="value">37%</span>
                    <span className="label">CPU</span>
                  </div>
                </div>
              </div>

              <div className="circle">
                <div className="inner" style={{ "--percent": 67 }}>
                  <div className="inner-hole">
                    <span className="value">67%</span>
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
                  <p><span className="dot green-bg"></span> Success</p>
                  <p><span className="dot red-bg"></span> Fail</p>
                </div>

                <div className="mini-card">
                  <p>Total Requests <br /><b>1,356</b></p>
                </div>

                <div className="mini-card">
                  <p>Avg Response Time <br /> <b>420ms</b></p>
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
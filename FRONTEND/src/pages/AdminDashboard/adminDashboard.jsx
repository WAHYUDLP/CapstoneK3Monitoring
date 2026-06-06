import { useState, useEffect } from "react";
import "../../App.css";

function AdminDashboard() {
  const [systemData, setSystemData] = useState({ 
    cpu: 0, 
    memory: 0, 
    storage: 0, 
    uptime_seconds: 0,
    active_devices: 0,
    total_devices: 3,
    api_status: { telegram: "failed", imgbb: "failed" }
  });

  useEffect(() => {
    const fetchSystemUsage = async () => {
      try {
        const response = await fetch("http://localhost:9001/api/system-usage");
        const result = await response.json();
        
        if (result.status === "success") {
          setSystemData({
            cpu: Math.round(result.data.cpu_percent),
            memory: Math.round(result.data.memory_percent),
            storage: Math.round(result.data.storage_percent),
            uptime_seconds: result.data.uptime_seconds || 0,
            active_devices: result.data.active_devices || 0,
            total_devices: result.data.total_devices || 3,
            api_status: result.data.api_status || { telegram: "failed", imgbb: "failed" }
          });
        }
      } catch (error) {
        console.error("Gagal narik data Server:", error);
      }
    };

    fetchSystemUsage();
    const timer = setInterval(fetchSystemUsage, 3000);

    return () => clearInterval(timer);
  }, []);

  const formatUptime = (seconds) => {
    if (!seconds) return { h: 0, m: 0 };
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return { h, m };
  };

  const uptime = formatUptime(systemData.uptime_seconds);

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* TOP CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">

        <div className="bg-[#f0f4f9] rounded-xl border border-[#003f98] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-[22px] font-bold text-[#003f98] mb-2">Active Device</h2>
            <p className="text-[13px] text-[#6b90c3] font-medium mb-6">
              Shows the number of currently active camera nodes capturing and sending frames for AI detection.
            </p>
          </div>
          <div className="text-[64px] font-bold text-[#003f98] leading-none mb-3">
            {systemData.active_devices}<span className="text-[#6b90c3] text-4xl">/{systemData.total_devices}</span>
          </div>
          <div className={`text-[20px] font-medium ${systemData.active_devices > 0 ? 'text-[#65d738]' : 'text-[#e24b4b]'}`}>
            {systemData.active_devices > 0 ? "Online" : "Offline"}
          </div>
        </div>

        <div className="bg-[#f0f4f9] rounded-xl border border-[#003f98] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-[22px] font-bold text-[#003f98] mb-2">API Status</h2>
            <p className="text-[13px] text-[#6b90c3] font-medium mb-6">
              Monitors the connection health of the Telegram Bot for alert notifications and the ImgBB database for image hosting.
            </p>
          </div>
          <div className="flex flex-col gap-4 mb-3">
            <div className="flex items-center gap-3 text-[20px] font-bold text-[#003f98]">
              <span className={`w-4 h-4 rounded-full ${systemData.api_status.telegram === "success" ? "bg-[#65d738]" : "bg-[#e24b4b]"}`}></span> Telegram
            </div>
            <div className="flex items-center gap-3 text-[20px] font-bold text-[#003f98]">
              <span className={`w-4 h-4 rounded-full ${systemData.api_status.imgbb === "success" ? "bg-[#65d738]" : "bg-[#e24b4b]"}`}></span> ImgBB
            </div>
          </div>
          <div className="text-[14px] font-medium text-[#6b90c3]">Live services connection</div>
        </div>

        {/* System Uptime Card */}
        <div className="bg-[#f0f4f9] rounded-xl border border-[#003f98] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-[22px] font-bold text-[#003f98] mb-2">System Uptime</h2>
            <p className="text-[13px] text-[#6b90c3] font-medium mb-6">
              Tracks how long the core backend system has been continuously running without interruption.
            </p>
          </div>
          <div className="text-[64px] font-bold text-[#003f98] leading-none mb-3 flex items-baseline gap-1">
            {uptime.h}<span className="text-[#6b90c3] text-4xl mr-2">h</span>
            {uptime.m}<span className="text-[#6b90c3] text-4xl">m</span>
          </div>
          <div className="text-[20px] font-medium text-[#65d738]">Stable</div>
        </div>

      </div>

      {/* BOTTOM SECTION */}
      <div className="bg-[#f0f4f9] rounded-xl border border-[#003f98] p-8 shadow-sm w-full overflow-hidden">
        <h2 className="text-[22px] font-bold text-[#003f98] mb-2">System Usage</h2>
        <p className="text-[14px] text-[#6b90c3] font-medium mb-10 max-w-2xl">
          Displays the real-time resource utilization of the backend server. High CPU or Memory usage might lead to delayed AI inferences and alert processing.
        </p>
        
        {/* We keep the custom CSS classes "usage", "circle", "inner" from App.css for the ring charts, 
            but wrap them in a responsive flex layout */}
        <div className="usage flex flex-col sm:flex-row flex-wrap justify-around items-center gap-8 py-4">
          
          {/* LINGKARAN MEMORY */}
          <div className="circle scale-90 sm:scale-100">
            <div className="inner" style={{ "--percent": systemData.memory }}>
              <div className="inner-hole">
                <span className="value text-[#003f98]">{systemData.memory}%</span>
                <span className="label text-[#6b90c3]">Memory</span>
              </div>
            </div>
          </div>

          {/* LINGKARAN CPU */}
          <div className="circle scale-90 sm:scale-100">
            <div className="inner" style={{ "--percent": systemData.cpu }}>
              <div className="inner-hole">
                <span className="value text-[#003f98]">{systemData.cpu}%</span>
                <span className="label text-[#6b90c3]">CPU</span>
              </div>
            </div>
          </div>

          {/* LINGKARAN STORAGE */}
          <div className="circle scale-90 sm:scale-100">
            <div className="inner" style={{ "--percent": systemData.storage }}>
              <div className="inner-hole">
                <span className="value text-[#003f98]">{systemData.storage}%</span>
                <span className="label text-[#6b90c3]">Storage</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
import { Outlet } from "react-router-dom";
import Sidebar from "./sidebarAdmin";

function AdminLayout({ onLogout, username = 'Admin' }) {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar onLogout={onLogout} username={username} />

      <div style={{ flex: 1 }}>
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;
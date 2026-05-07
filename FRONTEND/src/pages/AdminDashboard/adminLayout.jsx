import { Outlet } from "react-router-dom";
import Sidebar from "./sidebarAdmin";

function AdminLayout({ onLogout }) {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar onLogout={onLogout} />

      <div style={{ flex: 1 }}>
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;
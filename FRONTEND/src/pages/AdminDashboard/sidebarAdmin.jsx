import { NavLink } from "react-router-dom";
import defaultImg from "../../assets/placeholderProfile.jpg";

function Sidebar({ onLogout, username = 'Admin' }) {
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      style={{
        width: "303px",
        height: "100vh",
        background: "#003F98",
        color: "#E6ECF5",
        padding: "25px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
        position: "fixed",
        top: 0,
        left: 0,
      }}
    >
      {/* ATAS */}
      <div>
        {/* FOTO + TANGGAL */}
        <div style={{ position: "relative" }}>
          <img
            src={defaultImg}
            width={84}
            height={84}
            style={{
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />

          <p
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              fontSize: "12px",
              margin: 0,
            }}
          >
            {today}
          </p>
        </div>

        {/* NAMA */}
        <div style={{ marginTop: "15px" }}>
          <p style={{ margin: 0, fontSize: "18px" }}>Hello,</p>
          <p
            style={{
              margin: 0,
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            {username}
          </p>
        </div>

        {/* GARIS */}
        <hr
          style={{
            margin: "25px 0",
            borderColor: "#fff",
          }}
        />

        {/* MENU */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            fontSize: "20px",
          }}
        >
          <NavLink
            to="/"
            style={({ isActive }) => ({
              textDecoration: "none",
              color: "#E6ECF5",
              fontWeight: isActive ? "bold" : "normal",
              background: isActive ? "#1e3a8a" : "transparent",
              padding: "8px 10px",
              borderRadius: "6px",
              transition: "0.2s",
            })}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/system-config"
            style={({ isActive }) => ({
              textDecoration: "none",
              color: "#E6ECF5",
              fontWeight: isActive ? "bold" : "normal",
              background: isActive ? "#1e3a8a" : "transparent",
              padding: "8px 10px",
              borderRadius: "6px",
              transition: "0.2s",
            })}
          >
            System Config
          </NavLink>
        </div>

        {/* GARIS */}
        <hr
          style={{
            margin: "25px 0",
            borderColor: "#fff",
          }}
        />
      </div>

      {/* BAWAH */}
      <button
        onClick={onLogout}
        style={{
          border: "1px solid white",
          background: "transparent",
          color: "white",
          padding: "8px 16px",
          borderRadius: "10px",
          cursor: "pointer",
          alignSelf: "flex-start",
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default Sidebar;
import { NavLink } from "react-router-dom";
import defaultImg from "../../assets/placeholderProfile.jpg";
import { useState } from "react";
import { LayoutDashboard, Settings, History, LogOut, Menu, ChevronLeft, ChevronRight } from "lucide-react";

function Sidebar({ onLogout, username = 'Admin', isSidebarOpen, setIsSidebarOpen }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await onLogout();
  };

  return (
    <aside
      className={`fixed lg:relative top-0 left-0 z-30 flex h-screen shrink-0 flex-col bg-[#003f98] py-6 pt-20 lg:pt-6 text-white shadow-xl transition-all duration-300 ease-in-out ${
        isSidebarOpen 
          ? 'w-[280px] px-6 translate-x-0' 
          : 'w-[280px] lg:w-[80px] px-6 lg:px-4 -translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Desktop Toggle Button */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        title="Toggle Sidebar"
        className="hidden lg:flex absolute -right-3 top-10 items-center justify-center w-6 h-6 bg-white text-[#003f98] border border-[#003f98] rounded-full cursor-pointer hover:bg-gray-200 transition-colors z-40 shadow-md"
      >
        {isSidebarOpen ? <ChevronLeft size={16} strokeWidth={3} /> : <ChevronRight size={16} strokeWidth={3} />}
      </button>

      <div className={`flex items-center gap-4 mb-8 transition-all duration-300 ${!isSidebarOpen ? 'lg:justify-center' : ''}`}>
        <div className="w-14 h-14 rounded-full bg-gray-300 overflow-hidden border-2 border-white/20 shrink-0">
          <img
            src={defaultImg}
            className="w-full h-full object-cover"
            alt="Profile"
          />
        </div>
        <div className={`whitespace-nowrap transition-all duration-300 overflow-hidden ${!isSidebarOpen ? 'lg:opacity-0 lg:w-0' : 'opacity-100 w-auto'}`}>
          <p className="text-[10px] text-white/70 mb-1">{today}</p>
          <p className="text-[10px] text-white/70 mb-1">Backend: Online ✅</p>
          <p className="text-xs text-white/90">Hello,</p>
          <p className="text-lg font-bold tracking-wide">
            {username.charAt(0).toUpperCase() + username.slice(1)}
          </p>
        </div>
      </div>

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto scroll-smooth pr-2 flex flex-col items-center lg:items-stretch">
        <div className="mb-6 h-px w-full bg-white/20" />

        {/* MENU */}
        <nav className="flex flex-col gap-2 text-base w-full">
          <NavLink
            to="/admin"
            end
            onClick={() => window.innerWidth < 1024 && setIsSidebarOpen && setIsSidebarOpen(false)}
            title={!isSidebarOpen ? "Dashboard" : undefined}
            className={({ isActive }) =>
              `cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 w-full ${
                isActive ? 'bg-white/20 font-bold text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'
              } ${!isSidebarOpen ? 'lg:justify-center' : ''}`
            }
          >
            <LayoutDashboard size={20} className="shrink-0" />
            <span className={`whitespace-nowrap transition-all duration-300 ${!isSidebarOpen ? 'lg:opacity-0 lg:w-0 overflow-hidden' : 'opacity-100'}`}>
              Dashboard
            </span>
          </NavLink>

          <NavLink
            to="/admin/system-config"
            onClick={() => window.innerWidth < 1024 && setIsSidebarOpen && setIsSidebarOpen(false)}
            title={!isSidebarOpen ? "System Config" : undefined}
            className={({ isActive }) =>
              `cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 w-full ${
                isActive ? 'bg-white/20 font-bold text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'
              } ${!isSidebarOpen ? 'lg:justify-center' : ''}`
            }
          >
            <Settings size={20} className="shrink-0" />
            <span className={`whitespace-nowrap transition-all duration-300 ${!isSidebarOpen ? 'lg:opacity-0 lg:w-0 overflow-hidden' : 'opacity-100'}`}>
              System Config
            </span>
          </NavLink>
        </nav>
      </div>

      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        title={!isSidebarOpen ? 'Log Out' : undefined}
        className={`mt-4 mb-2 mx-auto flex items-center justify-center gap-3 w-full rounded-md border border-white/50 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed ${
          isLoggingOut ? 'opacity-50' : 'opacity-100'
        } ${!isSidebarOpen ? 'lg:px-0 lg:w-12' : ''}`}
      >
        <LogOut size={20} className="shrink-0" />
        <span className={`whitespace-nowrap transition-all duration-300 overflow-hidden ${!isSidebarOpen ? 'lg:opacity-0 lg:w-0' : 'opacity-100'}`}>
          {isLoggingOut ? 'Logging out...' : 'Log Out'}
        </span>
      </button>
    </aside>
  );
}

export default Sidebar;
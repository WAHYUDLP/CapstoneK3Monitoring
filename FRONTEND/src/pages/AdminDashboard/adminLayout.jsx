import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Sidebar from "./sidebarAdmin";

function AdminLayout({ onLogout, username = 'Admin' }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f0f4f9] font-sans text-[#00265d]">
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 w-full h-16 bg-[#003f98] text-white flex items-center justify-between px-4 z-40 shadow-md">
        <div className="text-[18px] font-bold">Admin Dashboard</div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 cursor-pointer rounded-md hover:bg-white/10 transition-colors">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-20 backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        onLogout={onLogout} 
        username={username} 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 w-full overflow-hidden transition-all duration-300 pt-16 lg:pt-0">
        <div className="flex-1 w-full overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

    </div>
  );
}

export default AdminLayout;
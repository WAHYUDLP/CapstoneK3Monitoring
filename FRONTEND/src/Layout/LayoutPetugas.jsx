import { useState } from 'react'
import {
  Bell,
  Camera,
  ChevronDown,
  FileBarChart2,
  LayoutDashboard,
  LogOut,
  MonitorPlay,
  ScrollText,
  SlidersHorizontal,
} from 'lucide-react'

const menuItems = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Live Cams', icon: MonitorPlay },
  { label: 'Reports', icon: FileBarChart2 },
  { label: 'Logs', icon: ScrollText },
]

const LayoutPetugas = ({
  children,
  onLogout,
  activeMenu = 'Dashboard',
  onMenuSelect,
  userName = 'Petugas HSE',
  dateText = 'Jumat, 27 Maret 2026',
  topbarTitle = 'Dashboard Petugas HSE',
  sidebarContent,
}) => {
  const [isConfigOpen, setIsConfigOpen] = useState(true)

  return (
    <div className="min-h-screen bg-[#c7ced8] text-[#0f4aa1]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col lg:flex-row">
        <aside className="w-full bg-[#0f4aa1] px-5 py-6 text-white lg:min-h-screen lg:w-[250px]">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/70 bg-white/15 text-lg font-bold">
              PH
            </div>
            <div>
              <p className="text-xs text-white/80">{dateText}</p>
              <p className="text-xl font-bold">{userName}</p>
            </div>
          </div>

          <nav className="mb-8 border-t border-white/30 pt-5">
            <ul className="space-y-3 text-base">
              {menuItems.map(({ label }) => {
                const isActive = activeMenu === label
                return (
                  <li key={label}>
                    <button
                      type="button"
                      onClick={() => onMenuSelect?.(label)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                        isActive ? 'bg-white/15 font-semibold' : 'text-white/90 hover:bg-white/10'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="border-t border-white/30 pt-5">
            <button
              type="button"
              onClick={() => setIsConfigOpen((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm font-semibold hover:bg-white/10"
            >
              <span className="inline-flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Konfigurasi
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${isConfigOpen ? 'rotate-180' : ''}`} />
            </button>

            {isConfigOpen ? (
              <div className="mt-2 space-y-3 px-2">
                {sidebarContent ?? (
                  <>
                    <div>
                      <label htmlFor="dummy-camera" className="mb-1 block text-sm text-white/90">
                        Kamera
                      </label>
                      <select
                        id="dummy-camera"
                        className="h-10 w-full appearance-none rounded-lg border border-white/40 bg-[#0f4aa1] px-3 text-white focus:outline-none focus:ring-2 focus:ring-white/60"
                      >
                        <option className="text-black">Semua Kamera</option>
                        <option className="text-black">Kamera Area A</option>
                        <option className="text-black">Kamera Area B</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="dummy-alert" className="mb-1 block text-sm text-white/90">
                        Alert
                      </label>
                      <select
                        id="dummy-alert"
                        className="h-10 w-full appearance-none rounded-lg border border-white/40 bg-[#0f4aa1] px-3 text-white focus:outline-none focus:ring-2 focus:ring-white/60"
                      >
                        <option className="text-black">Semua Alert</option>
                        <option className="text-black">Prioritas Tinggi</option>
                        <option className="text-black">Prioritas Rendah</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="dummy-report" className="mb-1 block text-sm text-white/90">
                        Tipe Report
                      </label>
                      <select
                        id="dummy-report"
                        className="h-10 w-full appearance-none rounded-lg border border-white/40 bg-[#0f4aa1] px-3 text-white focus:outline-none focus:ring-2 focus:ring-white/60"
                      >
                        <option className="text-black">Harian</option>
                        <option className="text-black">Mingguan</option>
                        <option className="text-black">Bulanan</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="mt-10 inline-flex items-center gap-2 rounded-lg border border-white/60 px-4 py-2 text-sm font-medium hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </button>
        </aside>

        <main className="flex-1 p-4 sm:p-6">
          <header className="mb-4 flex items-center justify-between rounded-xl border border-[#0f4aa1]/25 bg-[#d6dce5] px-4 py-3 shadow-[0_2px_8px_rgba(15,74,161,0.12)]">
            <div>
              <p className="text-xs uppercase tracking-wider text-[#0f4aa1]/70">Portal Monitoring APD K3</p>
              <h1 className="text-lg font-bold sm:text-2xl">{topbarTitle}</h1>
            </div>
            <div className="flex items-center gap-3 text-[#0f4aa1]">
              <div className="hidden items-center gap-2 rounded-full border border-[#0f4aa1]/40 px-3 py-1 text-sm sm:flex">
                <Camera className="h-4 w-4" />
                Kamera Online
              </div>
              <button
                type="button"
                className="rounded-full border border-[#0f4aa1]/40 bg-white/30 p-2 hover:bg-white/50"
                aria-label="Notifikasi"
              >
                <Bell className="h-4 w-4" />
              </button>
            </div>
          </header>

          {children}
        </main>
      </div>
    </div>
  )
}

export default LayoutPetugas

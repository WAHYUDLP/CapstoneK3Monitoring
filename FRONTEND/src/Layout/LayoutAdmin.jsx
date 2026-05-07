import { Bell, LayoutDashboard, LogOut, Settings, ShieldCheck, Users } from 'lucide-react'

const adminMenus = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Manajemen User', icon: Users },
  { label: 'Kebijakan K3', icon: ShieldCheck },
  { label: 'Pengaturan', icon: Settings },
]

const LayoutAdmin = ({
  children,
  onLogout,
  activeMenu = 'Dashboard',
  onMenuSelect,
  adminName = 'Admin HSE',
  topbarTitle = 'Admin Panel Monitoring APD',
  sidebarContent,
}) => {
  return (
    <div className="min-h-screen bg-[#d3d9e2] text-[#0f4aa1]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col lg:flex-row">
        <aside className="w-full bg-[#113b85] px-5 py-6 text-white lg:min-h-screen lg:w-[260px]">
          <div className="mb-8 rounded-xl border border-white/25 bg-white/10 p-4">
            <p className="text-xs text-white/80">Role</p>
            <p className="text-lg font-bold">{adminName}</p>
          </div>

          <nav className="space-y-2">
            {adminMenus.map(({ label }) => {
              const isActive = activeMenu === label
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => onMenuSelect?.(label)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                    isActive ? 'bg-white/20 font-semibold' : 'text-white/90 hover:bg-white/10'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              )
            })}
          </nav>

          <div className="mt-5 border-t border-white/30 pt-5">{sidebarContent}</div>

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
          <header className="mb-4 flex items-center justify-between rounded-xl border border-[#0f4aa1]/25 bg-[#e2e7ef] px-4 py-3">
            <h1 className="text-lg font-bold sm:text-2xl">{topbarTitle}</h1>
            <button
              type="button"
              className="rounded-full border border-[#0f4aa1]/40 bg-white/40 p-2 hover:bg-white/60"
              aria-label="Notifikasi"
            >
              <Bell className="h-4 w-4" />
            </button>
          </header>
          {children}
        </main>
      </div>
    </div>
  )
}

export default LayoutAdmin

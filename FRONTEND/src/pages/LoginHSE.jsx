import { useState } from 'react'
import { Lock, ShieldAlert, User } from 'lucide-react'

const LoginHSE = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    // Tempatkan integrasi API autentikasi di sini.
    console.log('Mencoba login dengan:', formData)
    onLoginSuccess?.()
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#e6ecf5] px-4 py-8 sm:py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-[-120px] h-80 w-80 rounded-full bg-[#96b0d5]/25 blur-3xl" />
        <div className="absolute bottom-[-80px] right-[-90px] h-72 w-72 rounded-full bg-[#003f98]/12 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center justify-center">
        <div className="w-full rounded-2xl border border-[#96b0d5]/50 border-t-8 border-t-[#003f98] bg-white p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#e6ecf5] ring-1 ring-[#96b0d5]/60">
              <ShieldAlert className="h-11 w-11 text-[#003f98]" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-wide text-[#00265d]">MONITORING APD</h1>
            <p className="mt-2 text-sm font-semibold text-[#6b90c3]">Portal Akses Admin &amp; Pekerja HSE</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="mb-2 block text-sm font-bold text-[#002c6a]">
                Username
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-5 w-5 text-[#96b0d5]" />
                </div>
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-[#96b0d5] bg-slate-50 py-3 pl-10 pr-3 text-[#00265d] placeholder-[#96b0d5] transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#003f98]"
                  placeholder="Masukkan username Anda"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-bold text-[#002c6a]">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-[#96b0d5]" />
                </div>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-[#96b0d5] bg-slate-50 py-3 pl-10 pr-3 text-[#00265d] placeholder-[#96b0d5] transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#003f98]"
                  placeholder="Masukkan password Anda"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-4 flex w-full justify-center rounded-lg bg-[#003f98] px-4 py-3 text-sm font-extrabold text-white shadow-md transition-colors duration-200 hover:bg-[#002c6a] focus:outline-none focus:ring-2 focus:ring-[#003f98] focus:ring-offset-2"
            >
              Masuk ke Sistem
            </button>
          </form>

          <div className="mt-8 border-t border-[#e6ecf5] pt-6 text-center">
            <div className="flex items-center justify-center gap-2 text-xs text-[#6b90c3]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#65d738]" />
              <span>Sistem Deteksi Kamera Aktif</span>
            </div>
            <p className="mt-2 text-xs text-[#96b0d5]">Hanya untuk personel berwenang. Area Industri.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginHSE

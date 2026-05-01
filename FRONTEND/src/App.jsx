import { useState } from 'react'
import LoginHSE from './pages/LoginHSE'
import DashboardPetugasHSE from './pages/PetugasHSE/DashboardPetugasHSE'

import { BrowserRouter, Routes, Route } from "react-router-dom"
import AdminLayout from "./pages/AdminDashboard/adminLayout"
import AdminDashboard from "./pages/AdminDashboard/adminDashboard"
import AdminSystemConfig from "./pages/AdminDashboard/adminSystemconfig"

function App() {
  const [role, setRole] = useState(null)

  if (!role) {
    return <LoginHSE onLoginSuccess={setRole} />
  }

  if (role === "petugas") {
    return <DashboardPetugasHSE onLogout={() => setRole(null)} />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AdminLayout onLogout={() => setRole(null)} />}>
          <Route index element={<AdminDashboard />} />
          <Route path="system-config" element={<AdminSystemConfig />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
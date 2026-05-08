import { useState } from 'react'
import LoginHSE from './pages/LoginHSE'
import DashboardPetugasHSE from './pages/PetugasHSE/DashboardPetugasHSE'

import { BrowserRouter, Routes, Route } from "react-router-dom"
import AdminLayout from "./pages/AdminDashboard/adminLayout"
import AdminDashboard from "./pages/AdminDashboard/adminDashboard"
import AdminSystemConfig from "./pages/AdminDashboard/adminSystemconfig"

function App() {
  // Use lazy initialization to read from localStorage without useEffect
  const [role, setRole] = useState(() => localStorage.getItem('userRole'))
  const [username, setUsername] = useState(() => localStorage.getItem('username'))

  const handleLoginSuccess = (authData) => {
    const { role: newRole, username: newUsername } = authData
    setRole(newRole)
    setUsername(newUsername)
    localStorage.setItem('userRole', newRole)
    localStorage.setItem('username', newUsername)
  }

  const handleLogout = () => {
    setRole(null)
    setUsername(null)
    localStorage.removeItem('userRole')
    localStorage.removeItem('username')
  }

  if (!role) {
    return <LoginHSE onLoginSuccess={handleLoginSuccess} />
  }

  if (role === "petugas") {
    return <DashboardPetugasHSE onLogout={handleLogout} username={username} />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AdminLayout onLogout={handleLogout} username={username} />}>
          <Route index element={<AdminDashboard />} />
          <Route path="system-config" element={<AdminSystemConfig />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
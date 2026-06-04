import { useState } from 'react'
import LoginHSE from './pages/LoginHSE'
import DashboardPetugasHSE from './pages/PetugasHSE/DashboardPetugasHSE'

import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom"
import AdminLayout from "./pages/AdminDashboard/adminLayout"
import AdminDashboard from "./pages/AdminDashboard/adminDashboard"
import AdminSystemConfig from "./pages/AdminDashboard/adminSystemConfig"

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

  const getHomePath = (currentRole) => (currentRole === 'admin' ? '/admin' : '/petugas')

  const RequireAuth = ({ allowedRoles, children }) => {
    if (!role) {
      return <Navigate to="/login" replace />
    }
    if (allowedRoles && !allowedRoles.includes(role)) {
      return <Navigate to={getHomePath(role)} replace />
    }
    return children
  }

  const LoginRoute = () => {
    const navigate = useNavigate()
    if (role) {
      return <Navigate to={getHomePath(role)} replace />
    }

    const handleLogin = (authData) => {
      handleLoginSuccess(authData)
      navigate(getHomePath(authData.role), { replace: true })
    }

    return <LoginHSE onLoginSuccess={handleLogin} />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={role ? getHomePath(role) : '/login'} replace />} />
        <Route path="/login" element={<LoginRoute />} />
        <Route
          path="/petugas"
          element={
            <RequireAuth allowedRoles={['petugas']}>
              <DashboardPetugasHSE onLogout={handleLogout} username={username} />
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAuth allowedRoles={['admin']}>
              <AdminLayout onLogout={handleLogout} username={username} />
            </RequireAuth>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="system-config" element={<AdminSystemConfig />} />
        </Route>
        <Route path="*" element={<Navigate to={role ? getHomePath(role) : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
import { useState } from 'react'
import LoginHSE from './pages/LoginHSE'
import DashboardPetugasHSE from './pages/PetugasHSE/DashboardPetugasHSE'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  if (isLoggedIn) {
    return <DashboardPetugasHSE onLogout={() => setIsLoggedIn(false)} />
  }

  return <LoginHSE onLoginSuccess={() => setIsLoggedIn(true)} />
}

export default App

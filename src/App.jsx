import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell.jsx'
import { RequireAuth } from './components/RequireAuth.jsx'
import { DashboardPage } from './pages/DashboardPage.jsx'
import { LoginPage } from './pages/LoginPage.jsx'
import { ProfilePage } from './pages/ProfilePage.jsx'
import { SuggestPage } from './pages/SuggestPage.jsx'
import { NotFoundPage } from './pages/NotFoundPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/suggest" element={<SuggestPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}

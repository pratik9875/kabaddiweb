import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { HomePage } from './pages/HomePage'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { PlayersPage } from './pages/PlayersPage'
import { RetiredPlayersPage } from './pages/RetiredPlayersPage'
import { ManagementPage } from './pages/ManagementPage'
import { AchievementsPage } from './pages/AchievementsPage'
import { FinancesPage } from './pages/FinancesPage'
import { DonorsPage } from './pages/DonorsPage'
import { GalleryPage } from './pages/GalleryPage'
import { ContactPage } from './pages/ContactPage'
import { AddPlayerForm } from './components/players/AddPlayerForm'
import { EditPlayerForm } from './components/players/EditPlayerForm'

import { AdminLoginPage } from './pages/admin/AdminLoginPage'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminPlayersPage } from './pages/admin/AdminPlayersPage'
import { AdminManagementPage } from './pages/admin/AdminManagementPage'
import { AdminAchievementsPage } from './pages/admin/AdminAchievementsPage'
import { AdminExpensesPage } from './pages/admin/AdminExpensesPage'
import { AdminIncomePage } from './pages/admin/AdminIncomePage'
import { AdminDonorsPage } from './pages/admin/AdminDonorsPage'
import { AdminGalleryPage } from './pages/admin/AdminGalleryPage'
import { AdminMessagesPage } from './pages/admin/AdminMessagesPage'
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage'
import { AdminLayout } from './components/admin/AdminLayout'
import { ProtectedRoute } from './components/admin/ProtectedRoute'
import { useSettingsStore } from './store/settingsStore'
import { useAuthStore } from './store/authStore'

function App() {
  const loadSettings = useSettingsStore((s) => s.loadSettings)
  const checkSession = useAuthStore((s) => s.checkSession)

  // Bootstrap: load tenant settings (applies theme) + restore auth session.
  useEffect(() => {
    void loadSettings()
    void checkSession()
  }, [loadSettings, checkSession])

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
                    <Route path="players" element={<PlayersPage />} />
          <Route path="players/add" element={<AddPlayerForm />} />
          <Route path="players/edit/:id" element={<EditPlayerForm />} />
          <Route path="retired-players" element={<RetiredPlayersPage />} />
          <Route path="management" element={<ManagementPage />} />
          <Route path="achievements" element={<AchievementsPage />} />
          <Route path="finances" element={<FinancesPage />} />
          <Route path="donors" element={<DonorsPage />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="contact" element={<ContactPage />} />

        </Route>

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="players" element={<AdminPlayersPage />} />
          <Route path="management" element={<AdminManagementPage />} />
          <Route path="achievements" element={<AdminAchievementsPage />} />
          <Route path="expenses" element={<AdminExpensesPage />} />
          <Route path="income" element={<AdminIncomePage />} />
          <Route path="donors" element={<AdminDonorsPage />} />
          <Route path="gallery" element={<AdminGalleryPage />} />
          <Route path="messages" element={<AdminMessagesPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>

        {/* 404 */}
        <Route element={<Layout />}>
          <Route path="*" element={<PlaceholderPage title="Page Not Found" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

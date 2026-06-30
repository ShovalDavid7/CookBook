import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import { useAuthStore } from './store/authStore'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

import HomePage from './pages/HomePage'
import RecipePage from './pages/RecipePage'
import ProfilePage from './pages/ProfilePage'
import LoginPage from './pages/LoginPage'
import AddRecipePage from './pages/AddRecipePage'
import SearchPage from './pages/SearchPage'
import BatchImportPage from './pages/BatchImportPage'
import CrawlerPage from './pages/CrawlerPage'
import ResetPasswordPage from './pages/ResetPasswordPage'

function App() {
  const init = useAuthStore((s) => s.init)

  useEffect(() => {
    init()
  }, [init])

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: { fontFamily: 'Be Vietnam Pro, sans-serif', direction: 'rtl' },
          duration: 2500,
        }}
      />
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/recipe/:id" element={<RecipePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/add-recipe" element={<AddRecipePage />} />
            <Route path="/batch-import" element={<BatchImportPage />} />
            <Route path="/crawler" element={<CrawlerPage />} />
          </Route>
        </Routes>
      </Layout>
    </>
  )
}

export default App

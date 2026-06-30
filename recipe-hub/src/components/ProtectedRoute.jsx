import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function ProtectedRoute() {
  const { user, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB]">
        <span className="material-symbols-outlined text-4xl text-stone-900 animate-spin">progress_activity</span>
      </div>
    )
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />
}

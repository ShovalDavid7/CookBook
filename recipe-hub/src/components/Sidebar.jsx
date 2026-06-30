import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { icon: 'home', label: 'דף הבית', path: '/' },
  { icon: 'search', label: 'חיפוש', path: '/search' },
  { icon: 'add_circle', label: 'הוסף מתכון', path: '/add-recipe' },
  { icon: 'download_for_offline', label: 'ייבוא מרובה', path: '/batch-import' },
  { icon: 'travel_explore', label: 'ייבוא אוטומטי', path: '/crawler' },
  { icon: 'person', label: 'פרופיל', path: '/profile' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, profile, logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    toast.success('התנתקת בהצלחה')
    navigate('/')
  }

  return (
    <aside className="hidden md:flex flex-col fixed right-0 top-0 h-full w-64 bg-white border-l border-gray-100 z-40 shadow-sm">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#8B7355] rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-white text-xl">restaurant</span>
          </div>
          <div className="text-right">
            <h1 className="text-lg font-bold text-stone-900 leading-none">CookBook</h1>
            <p className="text-xs text-gray-400 mt-0.5">שיתוף מתכונים</p>
          </div>
        </div>
      </div>

      {/* User card */}
      {user ? (
        <div
          className="mx-3 my-3 px-3 py-3 rounded-2xl bg-stone-50 flex items-center gap-3 cursor-pointer hover:bg-stone-100 transition-colors"
          onClick={() => navigate('/profile')}
        >
          <img
            src={profile?.avatar_url || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
            alt="profile"
            className="w-10 h-10 rounded-full object-cover border-2 border-stone-200 flex-shrink-0"
          />
          <div className="overflow-hidden flex-1 text-right">
            <p className="font-semibold text-sm text-gray-800 truncate leading-tight">
              {profile?.name || user.email?.split('@')[0]}
            </p>
            <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
          </div>
        </div>
      ) : (
        <div className="px-4 py-3">
          <button
            onClick={() => navigate('/login')}
            className="w-full py-2.5 bg-[#8B7355] text-white rounded-xl text-sm font-bold hover:bg-[#7A6347] transition-colors"
          >
            התחברות / הרשמה
          </button>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all text-right ${
                isActive
                  ? 'bg-[#8B7355] text-white'
                  : 'text-gray-600 hover:bg-stone-50 hover:text-stone-900'
              }`}
            >
              <span className={`material-symbols-outlined text-xl ${isActive ? 'text-white' : 'text-gray-400'}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Logout */}
      {user && (
        <div className="px-3 pb-5 pt-2 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            <span>יציאה</span>
          </button>
        </div>
      )}
    </aside>
  )
}

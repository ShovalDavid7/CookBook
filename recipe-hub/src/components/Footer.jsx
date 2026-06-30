import { useNavigate, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { icon: 'home', label: 'בית', path: '/' },
  { icon: 'search', label: 'חיפוש', path: '/search' },
  { icon: 'add_circle', label: 'הוסף', path: '/add-recipe' },
  { icon: 'person', label: 'פרופיל', path: '/profile' },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center py-2 z-50 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname === item.path
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center gap-1 px-4 py-1 min-w-0"
          >
            <span className={`material-symbols-outlined text-2xl transition-colors ${isActive ? 'text-stone-900' : 'text-gray-400'}`}>
              {item.icon}
            </span>
            <span className={`text-xs font-medium transition-colors ${isActive ? 'text-stone-900' : 'text-gray-400'}`}>
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

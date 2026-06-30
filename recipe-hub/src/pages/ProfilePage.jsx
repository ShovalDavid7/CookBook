import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { usersService } from '../services/users'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, profile, logout } = useAuthStore()
  const [bookmarks, setBookmarks] = useState([])
  const [myRecipes, setMyRecipes] = useState([])
  const [activeTab, setActiveTab] = useState('שמורים')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [bm, my] = await Promise.all([
          usersService.getMyBookmarks(),
          usersService.getMyRecipes(),
        ])
        setBookmarks(bm)
        setMyRecipes(my)
      } catch {
        toast.error('שגיאה בטעינת הנתונים')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleLogout = async () => {
    await logout()
    toast.success('התנתקת בהצלחה')
    navigate('/')
  }

  const displayedRecipes = activeTab === 'שמורים' ? bookmarks : myRecipes

  const RecipeGrid = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-16">
          <span className="material-symbols-outlined text-3xl text-stone-800 animate-spin">progress_activity</span>
        </div>
      )
    }
    if (displayedRecipes.length === 0) {
      return (
        <div className="text-center py-16 text-gray-400">
          <span className="material-symbols-outlined text-6xl block mb-3">
            {activeTab === 'שמורים' ? 'bookmark_border' : 'restaurant'}
          </span>
          <p className="text-base">
            {activeTab === 'שמורים' ? 'עדיין לא שמרת מתכונים' : 'עדיין לא פרסמת מתכונים'}
          </p>
          {activeTab === 'המתכונים שלי' && (
            <button
              onClick={() => navigate('/add-recipe')}
              className="mt-4 px-6 py-2 bg-stone-900 text-white rounded-full text-sm font-medium"
            >
              הוסף מתכון ראשון
            </button>
          )}
        </div>
      )
    }
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayedRecipes.map((recipe) => recipe && (
          <div
            key={recipe.id}
            className="bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all"
            onClick={() => navigate(`/recipe/${recipe.id}`)}
          >
            <img
              src={recipe.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
              className="w-full h-36 object-cover"
              alt={recipe.title}
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400' }}
            />
            <div className="p-3">
              <h4 className="font-semibold text-sm text-right line-clamp-2 text-gray-800">{recipe.title}</h4>
              <p className="text-xs text-gray-400 mt-1 text-right">{recipe.prep_time} דק' • {recipe.difficulty}</p>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen">

      {/* ── Mobile header ── */}
      <header className="md:hidden flex items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
        <button
          onClick={handleLogout}
          className="border border-gray-200 px-4 py-2 rounded-xl text-sm text-red-500 font-medium"
        >
          יציאה
        </button>
        <h1 className="text-xl font-bold">פרופיל</h1>
        <div className="w-16" />
      </header>

      {/* ── Desktop header ── */}
      <div className="hidden md:block bg-white border-b border-gray-100 px-8 py-6">
        <div className="flex items-center justify-between">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm text-red-500 font-medium hover:bg-red-50 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            יציאה
          </button>
          <h1 className="text-2xl font-bold text-gray-800">הפרופיל שלי</h1>
        </div>
      </div>

      <div className="px-4 md:px-8 lg:px-12">

        {/* Profile card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 mt-5 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row-reverse md:items-center gap-5">
            <img
              src={profile?.avatar_url || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
              alt="profile"
              className="w-24 h-24 rounded-full mx-auto md:mx-0 object-cover border-4 border-amber-100 flex-shrink-0"
            />
            <div className="text-center md:text-right flex-1">
              <h2 className="text-2xl font-bold text-gray-900">
                {profile?.name || user?.email?.split('@')[0]}
              </h2>
              {profile?.bio && <p className="text-gray-500 mt-1">{profile.bio}</p>}
              <p className="text-sm text-gray-400 mt-0.5">{user?.email}</p>

              <div className="flex justify-center md:justify-end gap-8 mt-5">
                <div className="text-center">
                  <p className="text-2xl font-bold text-stone-900">{myRecipes.length}</p>
                  <p className="text-xs text-gray-500 mt-0.5">מתכונים שלי</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-stone-900">{bookmarks.length}</p>
                  <p className="text-xs text-gray-500 mt-0.5">שמורים</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex mt-5 bg-white rounded-2xl p-1 shadow-sm border border-gray-100">
          {['שמורים', 'המתכונים שלי'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab ? 'bg-stone-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
              {tab === 'שמורים' && bookmarks.length > 0 && (
                <span className={`mr-1.5 text-xs ${activeTab === tab ? 'text-stone-200' : 'text-gray-400'}`}>
                  ({bookmarks.length})
                </span>
              )}
              {tab === 'המתכונים שלי' && myRecipes.length > 0 && (
                <span className={`mr-1.5 text-xs ${activeTab === tab ? 'text-stone-200' : 'text-gray-400'}`}>
                  ({myRecipes.length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Desktop: Add recipe button */}
        {activeTab === 'המתכונים שלי' && (
          <div className="hidden md:flex justify-start mt-4">
            <button
              onClick={() => navigate('/add-recipe')}
              className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-xl text-sm font-bold hover:bg-stone-900 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              מתכון חדש
            </button>
          </div>
        )}

        {/* Recipe grid */}
        <div className="mt-4 mb-6">
          <RecipeGrid />
        </div>
      </div>
    </div>
  )
}

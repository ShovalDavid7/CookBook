import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useRecipeStore } from '../store/recipeStore'
import toast from 'react-hot-toast'

export default function RecipeCard({ recipe }) {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { toggleLike, toggleBookmark } = useRecipeStore()

  const handleLike = async (e) => {
    e.stopPropagation()
    if (!user) return toast.error('יש להתחבר כדי לאהוב מתכונים')
    await toggleLike(recipe.id)
  }

  const handleBookmark = async (e) => {
    e.stopPropagation()
    if (!user) return toast.error('יש להתחבר כדי לשמור מתכונים')
    await toggleBookmark(recipe.id)
    toast.success(recipe.is_bookmarked ? 'הוסר מהשמורים' : 'נשמר!')
  }

  const handleShare = async (e) => {
    e.stopPropagation()
    const url = recipe.source_url || window.location.origin + '/recipe/' + recipe.id
    const text = `${recipe.title} 🍽️\n${url}`
    if (navigator.share) {
      try { await navigator.share({ title: recipe.title, url }) } catch {}
    } else {
      window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank')
    }
  }

  const formatLikes = (n) => {
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
    return n?.toString() ?? '0'
  }

  return (
    <div
      className="bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer active:scale-95 transition-transform"
      onClick={() => navigate(`/recipe/${recipe.id}`)}
    >
      <div className="relative">
        <img
          src={recipe.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
          alt={recipe.title}
          className="w-full h-48 object-cover"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400' }}
        />
        {recipe.is_kosher && (
          <span className="absolute top-2 right-2 bg-stone-700 text-white text-xs px-2 py-0.5 rounded-full font-medium">
            כשר
          </span>
        )}
        <button
          onClick={handleBookmark}
          className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm rounded-full p-1.5"
        >
          <span className={`material-symbols-outlined text-lg ${recipe.is_bookmarked ? 'text-stone-800' : 'text-gray-500'}`}>
            {recipe.is_bookmarked ? 'bookmark' : 'bookmark_border'}
          </span>
        </button>
      </div>

      <div className="p-3">
        <div className="flex items-center justify-between mb-1">
          {recipe.profiles && (
            <p className="text-xs text-gray-400">@{recipe.profiles.name}</p>
          )}
          {recipe.source && (
            <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
              {recipe.source}
            </span>
          )}
        </div>
        <h3 className="font-semibold text-gray-800 text-sm leading-tight mb-2">{recipe.title}</h3>

        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">schedule</span>
            {recipe.prep_time} דק'
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">signal_cellular_alt</span>
            {recipe.difficulty}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <button onClick={handleLike} className="flex items-center gap-1">
            <span className={`material-symbols-outlined text-base ${recipe.is_liked ? 'text-red-500' : 'text-gray-400'}`}>
              {recipe.is_liked ? 'favorite' : 'favorite_border'}
            </span>
            {formatLikes(recipe.likes_count)}
          </button>
          <button onClick={handleShare} className="flex items-center gap-1 text-gray-400 hover:text-[#8B7355] transition-colors">
            <span className="material-symbols-outlined text-base">share</span>
          </button>
        </div>
      </div>
    </div>
  )
}

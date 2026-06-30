import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRecipeStore } from '../store/recipeStore'
import RecipeCard from '../components/RecipeCard'
import { RecipeGridSkeleton } from '../components/LoadingSkeleton'

const CATEGORIES = ['הכל', 'ארוחת בוקר', 'צהריים', 'קינוחים', 'עיקרית', 'סלטים', 'מרקים']

export default function SearchPage() {
  const navigate = useNavigate()
  const { recipes, isLoading, activeCategory, setCategory, setSearch, fetchRecipes } = useRecipeStore()
  const [searchInput, setSearchInput] = useState('')

  useEffect(() => {
    fetchRecipes()
  }, [fetchRecipes])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput)
    fetchRecipes()
  }

  const handleClear = () => {
    setSearchInput('')
    setSearch('')
    setCategory('הכל')
  }

  return (
    <div className="min-h-screen">
      {/* Mobile header */}
      <header className="md:hidden flex items-center gap-3 px-4 py-4 bg-white border-b border-gray-100 sticky top-0 z-10">
        <button onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined text-gray-500">chevron_right</span>
        </button>
        <form onSubmit={handleSearch} className="flex-1 relative">
          <input
            autoFocus
            className="w-full h-11 bg-gray-100 rounded-2xl px-4 pr-10 text-right focus:outline-none focus:ring-2 focus:ring-stone-500 text-sm"
            placeholder="חפש מתכון, קטגוריה..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
            <span className="material-symbols-outlined text-gray-400 text-lg">search</span>
          </button>
        </form>
        {searchInput && (
          <button onClick={handleClear} className="text-gray-400 text-sm">
            נקה
          </button>
        )}
      </header>

      {/* Desktop header */}
      <div className="hidden md:block bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="px-8 py-5">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">חיפוש מתכונים</h1>
          <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl">
            <button
              type="submit"
              className="px-6 py-2.5 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-900 transition-colors flex-shrink-0"
            >
              חיפוש
            </button>
            <input
              autoFocus
              className="flex-1 h-11 bg-gray-100 rounded-xl px-4 text-right focus:outline-none focus:ring-2 focus:ring-stone-500"
              placeholder="חפש מתכון, קטגוריה, מצרך..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </form>
        </div>
      </div>

      <main className="px-4 md:px-8 lg:px-12 py-4">
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap flex-shrink-0 font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-stone-900 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-stone-400 hover:text-stone-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-400">
            {isLoading ? '...' : `${recipes.length} תוצאות`}
          </span>
          <h2 className="text-base font-semibold text-gray-700">
            {searchInput ? `תוצאות עבור "${searchInput}"` : activeCategory === 'הכל' ? 'כל המתכונים' : activeCategory}
          </h2>
        </div>

        {/* Results */}
        {isLoading ? (
          <RecipeGridSkeleton count={8} />
        ) : recipes.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <span className="material-symbols-outlined text-6xl block mb-3">search_off</span>
            <p className="text-lg font-medium mb-1">לא נמצאו תוצאות</p>
            <p className="text-sm">נסה מילות חיפוש אחרות</p>
            <button
              onClick={handleClear}
              className="mt-4 px-6 py-2 bg-stone-900 text-white rounded-full text-sm font-medium"
            >
              נקה חיפוש
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

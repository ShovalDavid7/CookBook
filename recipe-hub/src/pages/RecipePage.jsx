import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { useRecipeStore } from '../store/recipeStore'
import api from '../services/api'

const TABS = ['מצרכים', 'הוראות']

export default function RecipePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { currentRecipe, isLoading, fetchRecipeById, toggleLike, toggleBookmark } = useRecipeStore()
  const [activeTab, setActiveTab] = useState('מצרכים')
  const [editingIngredients, setEditingIngredients] = useState(false)
  const [ingLines, setIngLines] = useState('')
  const [savingIng, setSavingIng] = useState(false)
  const [editingUrl, setEditingUrl] = useState(false)
  const [sourceUrlInput, setSourceUrlInput] = useState('')
  const [savingUrl, setSavingUrl] = useState(false)

  const saveSourceUrl = async () => {
    setSavingUrl(true)
    try {
      await api.put(`/api/recipes/${id}`, { ...currentRecipe, source_url: sourceUrlInput })
      toast.success('הקישור נשמר!')
      setEditingUrl(false)
      fetchRecipeById(id)
    } catch {
      toast.error('שגיאה בשמירה')
    } finally {
      setSavingUrl(false)
    }
  }

  const isOwner = user && currentRecipe && currentRecipe.created_by === user.id

  const handleShare = async () => {
    const url = r?.source_url || window.location.href
    const text = `${r?.title} 🍽️\n${url}`
    if (navigator.share) {
      try { await navigator.share({ title: r?.title, url }) } catch {}
    } else {
      window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank')
    }
  }

  const openIngEditor = () => {
    const lines = (currentRecipe.ingredients || []).map(i => `${i.amount} ${i.unit} ${i.name}`.trim()).join('\n')
    setIngLines(lines)
    setEditingIngredients(true)
  }

  const saveIngredients = async () => {
    setSavingIng(true)
    try {
      const ingredients = ingLines.split('\n').map(l => l.trim()).filter(Boolean).map(l => ({ amount: '', unit: '', name: l }))
      await api.put(`/api/recipes/${id}/ingredients`, { ingredients })
      toast.success('המצרכים עודכנו!')
      setEditingIngredients(false)
      fetchRecipeById(id)
    } catch (err) {
      toast.error(err.response?.data?.error || 'שגיאה בשמירה')
    } finally {
      setSavingIng(false)
    }
  }

  useEffect(() => {
    fetchRecipeById(id)
  }, [id, fetchRecipeById])

  const handleLike = async () => {
    if (!user) return toast.error('יש להתחבר כדי לאהוב מתכונים')
    await toggleLike(id)
  }

  const handleBookmark = async () => {
    if (!user) return toast.error('יש להתחבר כדי לשמור מתכונים')
    await toggleBookmark(id)
    toast.success(currentRecipe?.is_bookmarked ? 'הוסר מהשמורים' : 'נשמר!')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F4F0]">
        <span className="material-symbols-outlined text-4xl text-stone-900 animate-spin">progress_activity</span>
      </div>
    )
  }

  if (!currentRecipe) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-gray-400">
        <span className="material-symbols-outlined text-6xl">error</span>
        <p className="text-lg">מתכון לא נמצא</p>
        <button onClick={() => navigate('/')} className="px-6 py-2 bg-stone-900 text-white rounded-full font-medium">
          חזרה לדף הבית
        </button>
      </div>
    )
  }

  const r = currentRecipe

  return (
    <div className="min-h-screen bg-white md:bg-[#F5F4F0]">

      {/* ── Mobile layout ── */}
      <div className="md:hidden relative pb-20">
        {/* Hero image */}
        <div className="relative w-full h-72">
          <img
            className="w-full h-full object-cover"
            src={r.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'}
            alt={r.title}
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

          <button
            onClick={() => navigate('/')}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>

          <div className="absolute top-4 left-4 flex gap-2">
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow"
            >
              <span className="material-symbols-outlined text-lg text-gray-600">share</span>
            </button>
            <button
              onClick={handleBookmark}
              className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow"
            >
              <span className={`material-symbols-outlined text-lg ${r.is_bookmarked ? 'text-stone-800' : 'text-gray-600'}`}>
                {r.is_bookmarked ? 'bookmark' : 'bookmark_border'}
              </span>
            </button>
          </div>

          {r.is_kosher && (
            <div className="absolute bottom-4 right-4 bg-stone-700 text-white px-3 py-1 rounded-full text-sm font-medium">
              כשר
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-5 -mt-5 relative z-10 bg-white rounded-t-[28px] pt-6">
          <div className="mb-4">
            {r.source_url ? (
              <div className="flex items-center gap-2">
                <a href={r.source_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-[#8B7355]"
                >
                  <span className="material-symbols-outlined text-base">open_in_new</span>
                  צפו במתכון המקורי — {r.source}
                </a>
                {isOwner && (
                  <button onClick={() => { setSourceUrlInput(r.source_url); setEditingUrl(true) }}>
                    <span className="material-symbols-outlined text-base text-gray-400">edit</span>
                  </button>
                )}
              </div>
            ) : isOwner && (
              <button onClick={() => { setSourceUrlInput(''); setEditingUrl(true) }}
                className="flex items-center gap-1 text-sm text-gray-400"
              >
                <span className="material-symbols-outlined text-base">add_link</span>
                הוסיפי קישור למקור
              </button>
            )}
            {editingUrl && (
              <div className="mt-2 flex gap-2">
                <button onClick={saveSourceUrl} disabled={savingUrl}
                  className="px-3 py-2 bg-[#8B7355] text-white rounded-xl text-sm font-bold disabled:opacity-60"
                >
                  {savingUrl ? '...' : 'שמירה'}
                </button>
                <input
                  value={sourceUrlInput}
                  onChange={e => setSourceUrlInput(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  dir="ltr"
                />
              </div>
            )}
          </div>

          <div className="flex items-start justify-between mb-4">
            <button onClick={handleLike} className="flex items-center gap-1">
              <span className={`material-symbols-outlined text-2xl ${r.is_liked ? 'text-red-500' : 'text-gray-400'}`}>
                {r.is_liked ? 'favorite' : 'favorite_border'}
              </span>
              <span className="text-sm text-gray-500">{r.likes_count ?? 0}</span>
            </button>
            <div className="text-right">
              <h1 className="text-xl font-bold">{r.title}</h1>
              {r.profiles && <p className="text-sm text-gray-500 mt-0.5">@{r.profiles.name}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              { label: 'רמת קושי', value: r.difficulty },
              { label: 'כמות', value: `${r.servings} מנות` },
              { label: 'זמן הכנה', value: `${r.prep_time} דק'` },
            ].map((s) => (
              <div key={s.label} className="bg-stone-50 rounded-2xl p-3 text-center">
                <p className="font-bold text-stone-900 text-sm">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <MobileTabs activeTab={activeTab} setActiveTab={setActiveTab} r={r} isOwner={isOwner} onEditIngredients={openIngEditor} />
        </div>
      </div>

      {/* ── Desktop layout (2-col) ── */}
      <div className="hidden md:flex min-h-screen" dir="ltr">
        {/* Left: sticky image panel */}
        <div className="w-2/5 xl:w-1/3 flex-shrink-0 sticky top-0 h-screen overflow-hidden">
          <img
            className="w-full h-full object-cover"
            src={r.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800'}
            alt={r.title}
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Back button */}
          <button
            onClick={() => navigate('/')}
            className="absolute top-5 left-5 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>

          {/* Badges */}
          <div className="absolute bottom-6 left-6 right-6" dir="rtl">
            <h2 className="text-2xl font-bold text-white mb-1">{r.title}</h2>
            {r.profiles && <p className="text-white/80 text-sm">@{r.profiles.name}</p>}
            {r.is_kosher && (
              <span className="inline-block mt-2 bg-stone-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                כשר
              </span>
            )}
          </div>
        </div>

        {/* Right: scrollable details */}
        <div className="flex-1 overflow-y-auto" dir="rtl">
          <div className="max-w-2xl mx-auto px-8 py-8">
            {/* Source link */}
            <div className="mb-5">
              {r.source_url ? (
                <div className="flex items-center gap-3">
                  <a href={r.source_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-[#8B7355] hover:underline"
                  >
                    <span className="material-symbols-outlined text-base">open_in_new</span>
                    צפו במתכון המקורי באתר {r.source}
                  </a>
                  {isOwner && (
                    <button onClick={() => { setSourceUrlInput(r.source_url); setEditingUrl(true) }} className="text-gray-400 hover:text-gray-600">
                      <span className="material-symbols-outlined text-base">edit</span>
                    </button>
                  )}
                </div>
              ) : isOwner && (
                <button onClick={() => { setSourceUrlInput(''); setEditingUrl(true) }}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#8B7355]"
                >
                  <span className="material-symbols-outlined text-base">add_link</span>
                  הוסיפי קישור למקור
                </button>
              )}

              {editingUrl && (
                <div className="mt-2 flex gap-2">
                  <button onClick={saveSourceUrl} disabled={savingUrl}
                    className="px-4 py-2 bg-[#8B7355] text-white rounded-xl text-sm font-bold disabled:opacity-60"
                  >
                    {savingUrl ? '...' : 'שמירה'}
                  </button>
                  <input
                    value={sourceUrlInput}
                    onChange={e => setSourceUrlInput(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B7355]/40"
                    dir="ltr"
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={handleBookmark}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm border-2 transition-colors ${
                  r.is_bookmarked
                    ? 'border-amber-700 bg-stone-900 text-white'
                    : 'border-gray-200 text-gray-700 hover:border-stone-400'
                }`}
              >
                <span className="material-symbols-outlined text-lg">
                  {r.is_bookmarked ? 'bookmark' : 'bookmark_border'}
                </span>
                {r.is_bookmarked ? 'שמור ✓' : 'שמור'}
              </button>

              <button
                onClick={handleLike}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm border-2 border-gray-200 hover:border-red-200 hover:text-red-500 transition-colors"
              >
                <span className={`material-symbols-outlined text-lg ${r.is_liked ? 'text-red-500' : ''}`}>
                  {r.is_liked ? 'favorite' : 'favorite_border'}
                </span>
                {r.likes_count ?? 0} לייקים
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm border-2 border-gray-200 hover:border-green-300 hover:text-green-600 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">share</span>
                שתפי
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-7">
              {[
                { icon: 'bolt', label: 'רמת קושי', value: r.difficulty },
                { icon: 'group', label: 'מנות', value: `${r.servings} מנות` },
                { icon: 'schedule', label: 'זמן הכנה', value: `${r.prep_time} דק'` },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
                  <span className="material-symbols-outlined text-stone-800 text-xl block mb-1">{s.icon}</span>
                  <p className="font-bold text-gray-800 text-sm">{s.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {r.description && (
              <p className="text-gray-600 mb-6 leading-relaxed text-right">{r.description}</p>
            )}

            {/* Tabs */}
            <div className="flex gap-6 border-b border-gray-200 mb-5">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-sm font-semibold transition-colors ${
                    activeTab === tab
                      ? 'text-stone-900 border-b-2 border-amber-700'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === 'מצרכים' && (
              <>
                <ul className="divide-y divide-gray-100">
                  {r.ingredients?.length > 0 ? r.ingredients.map((ing) => (
                    <li key={ing.id} className="py-3 text-right">
                      <span className="font-medium text-gray-800">{ing.name}</span>
                      {(ing.amount || ing.unit) && (
                        <span className="text-gray-400 text-sm"> — {ing.amount} {ing.unit}</span>
                      )}
                    </li>
                  )) : <p className="text-gray-400 text-center py-10">אין מצרכים</p>}
                </ul>
                {isOwner && (
                  <button onClick={openIngEditor} className="mt-4 flex items-center gap-2 text-sm text-[#8B7355] hover:underline">
                    <span className="material-symbols-outlined text-base">edit</span>
                    עריכת מצרכים
                  </button>
                )}
              </>
            )}

            {activeTab === 'הוראות' && (
              <div className="space-y-5">
                {r.instructions?.length > 0 ? r.instructions.map((step) => (
                  <div key={step.id} className="flex gap-4">
                    <div className="w-8 h-8 bg-stone-900 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      {step.step_number}
                    </div>
                    <p className="text-gray-700 leading-relaxed text-right flex-1">{step.description}</p>
                  </div>
                )) : <p className="text-gray-400 text-center py-10">אין הוראות הכנה</p>}
              </div>
            )}

            <div className="h-8" />
          </div>
        </div>
      </div>
      {/* ── Ingredients editor modal ── */}
      {editingIngredients && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6" dir="rtl">
            <h3 className="text-lg font-bold mb-1">עריכת מצרכים</h3>
            <p className="text-xs text-gray-400 mb-3">שורה אחת לכל מצרך — לדוגמה: 2 כפות שמן זית</p>
            <textarea
              value={ingLines}
              onChange={e => setIngLines(e.target.value)}
              rows={12}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#8B7355]/40 resize-none"
              placeholder={"2 כוסות קמח\n1 כפית מלח\n3 ביצים"}
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setEditingIngredients(false)} className="flex-1 h-11 border border-gray-200 rounded-2xl text-sm text-gray-600">
                ביטול
              </button>
              <button onClick={saveIngredients} disabled={savingIng} className="flex-1 h-11 bg-[#8B7355] text-white rounded-2xl text-sm font-bold disabled:opacity-60">
                {savingIng ? 'שומר...' : 'שמירה'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MobileTabs({ activeTab, setActiveTab, r, isOwner, onEditIngredients }) {
  return (
    <>
      <div className="flex gap-6 border-b border-gray-100 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === tab ? 'text-stone-900 border-b-2 border-amber-700' : 'text-gray-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'מצרכים' && (
        <>
          <ul className="divide-y divide-gray-50 mb-4">
            {r.ingredients?.length > 0 ? r.ingredients.map((ing) => (
              <li key={ing.id} className="py-3 text-right text-sm">
                <span className="font-medium">{ing.name}</span>
                {(ing.amount || ing.unit) && (
                  <span className="text-gray-400"> — {ing.amount} {ing.unit}</span>
                )}
              </li>
            )) : <p className="text-gray-400 text-center py-8">אין מצרכים</p>}
          </ul>
          {isOwner && (
            <button onClick={onEditIngredients} className="flex items-center gap-2 text-sm text-[#8B7355] mb-6">
              <span className="material-symbols-outlined text-base">edit</span>
              עריכת מצרכים
            </button>
          )}
        </>
      )}

      {activeTab === 'הוראות' && (
        <div className="space-y-4 mb-6">
          {r.instructions?.length > 0 ? r.instructions.map((step) => (
            <div key={step.id} className="flex gap-3">
              <div className="w-7 h-7 bg-stone-900 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                {step.step_number}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed text-right">{step.description}</p>
            </div>
          )) : <p className="text-gray-400 text-center py-8">אין הוראות</p>}
        </div>
      )}
    </>
  )
}

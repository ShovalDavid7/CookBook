import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { useRecipeStore } from '../store/recipeStore'
import api from '../services/api'

const TABS = ['מצרכים', 'הוראות', 'תגובות', 'טיפים']

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

  // interactions state
  const [interactions, setInteractions] = useState(null)
  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [myRating, setMyRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [tried, setTried] = useState(false)
  const [triedImage, setTriedImage] = useState('')
  const [editingTips, setEditingTips] = useState(false)
  const [tipsText, setTipsText] = useState('')
  const [savingTips, setSavingTips] = useState(false)

  const fetchInteractions = useCallback(async () => {
    try {
      const { data } = await api.get(`/api/interactions/${id}`)
      setInteractions(data)
      if (data.mine) {
        setMyRating(data.mine.rating || 0)
        setTried(data.mine.tried || false)
        setTriedImage(data.mine.tried_image || '')
      }
    } catch {}
  }, [id])

  useEffect(() => { fetchRecipeById(id) }, [id, fetchRecipeById])
  useEffect(() => { fetchInteractions() }, [fetchInteractions])

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

  const handleLike = async () => {
    if (!user) return toast.error('יש להתחבר כדי לאהוב מתכונים')
    await toggleLike(id)
  }

  const handleBookmark = async () => {
    if (!user) return toast.error('יש להתחבר כדי לשמור מתכונים')
    await toggleBookmark(id)
    toast.success(currentRecipe?.is_bookmarked ? 'הוסר מהשמורים' : 'נשמר!')
  }

  const handleComment = async () => {
    if (!user) return toast.error('יש להתחבר כדי להגיב')
    if (!commentText.trim()) return
    setSubmittingComment(true)
    try {
      await api.post(`/api/interactions/${id}/comment`, { text: commentText })
      setCommentText('')
      await fetchInteractions()
    } catch {
      toast.error('שגיאה בשליחת תגובה')
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/api/interactions/comment/${commentId}`)
      await fetchInteractions()
    } catch {
      toast.error('שגיאה במחיקה')
    }
  }

  const handleRate = async (rating) => {
    if (!user) return toast.error('יש להתחבר כדי לדרג')
    setMyRating(rating)
    try {
      await api.put(`/api/interactions/${id}`, { rating })
      await fetchInteractions()
      toast.success('הדירוג נשמר!')
    } catch {
      toast.error('שגיאה בשמירת דירוג')
    }
  }

  const handleTried = async () => {
    if (!user) return toast.error('יש להתחבר')
    const newTried = !tried
    setTried(newTried)
    try {
      await api.put(`/api/interactions/${id}`, { tried: newTried })
      await fetchInteractions()
      if (newTried) toast.success('מעולה! סומן כ"ניסיתי" 🎉')
    } catch {
      toast.error('שגיאה')
    }
  }

  const handleTriedImageSave = async () => {
    try {
      await api.put(`/api/interactions/${id}`, { tried: true, tried_image: triedImage })
      await fetchInteractions()
      toast.success('התמונה נשמרה!')
    } catch {
      toast.error('שגיאה')
    }
  }

  const handleSaveTips = async () => {
    setSavingTips(true)
    try {
      await api.put(`/api/interactions/tips/${id}`, { tips: tipsText })
      toast.success('הטיפים נשמרו!')
      setEditingTips(false)
      fetchRecipeById(id)
    } catch {
      toast.error('שגיאה בשמירה')
    } finally {
      setSavingTips(false)
    }
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
            <button onClick={handleShare} className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow">
              <span className="material-symbols-outlined text-lg text-gray-600">share</span>
            </button>
            <button onClick={handleBookmark} className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow">
              <span className={`material-symbols-outlined text-lg ${r.is_bookmarked ? 'text-stone-800' : 'text-gray-600'}`}>
                {r.is_bookmarked ? 'bookmark' : 'bookmark_border'}
              </span>
            </button>
          </div>

          {r.is_kosher && (
            <div className="absolute bottom-4 right-4 bg-stone-700 text-white px-3 py-1 rounded-full text-sm font-medium">כשר</div>
          )}
        </div>

        <div className="px-5 -mt-5 relative z-10 bg-white rounded-t-[28px] pt-6">
          <div className="mb-4">
            {r.source_url ? (
              <div className="flex items-center gap-2">
                <a href={r.source_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-[#8B7355]">
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
              <button onClick={() => { setSourceUrlInput(''); setEditingUrl(true) }} className="flex items-center gap-1 text-sm text-gray-400">
                <span className="material-symbols-outlined text-base">add_link</span>
                הוסיפי קישור למקור
              </button>
            )}
            {editingUrl && (
              <div className="mt-2 flex gap-2">
                <button onClick={saveSourceUrl} disabled={savingUrl} className="px-3 py-2 bg-[#8B7355] text-white rounded-xl text-sm font-bold disabled:opacity-60">
                  {savingUrl ? '...' : 'שמירה'}
                </button>
                <input value={sourceUrlInput} onChange={e => setSourceUrlInput(e.target.value)} placeholder="https://..." className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" dir="ltr" />
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

          {/* Rating summary */}
          {interactions && (
            <RatingSummary avg={interactions.avg_rating} count={interactions.ratings_count} triedCount={interactions.tried_count} />
          )}

          {/* Tried it button */}
          <TriedButton tried={tried} onToggle={handleTried} count={interactions?.tried_count} />

          <div className="grid grid-cols-3 gap-2 mb-5 mt-4">
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

          <MobileTabs
            activeTab={activeTab} setActiveTab={setActiveTab} r={r}
            isOwner={isOwner} onEditIngredients={openIngEditor}
            interactions={interactions} commentText={commentText}
            setCommentText={setCommentText} onComment={handleComment}
            submittingComment={submittingComment} onDeleteComment={handleDeleteComment}
            myRating={myRating} hoverRating={hoverRating} setHoverRating={setHoverRating}
            onRate={handleRate} tried={tried} triedImage={triedImage}
            setTriedImage={setTriedImage} onTriedImageSave={handleTriedImageSave}
            editingTips={editingTips} setEditingTips={setEditingTips}
            tipsText={tipsText} setTipsText={setTipsText}
            onSaveTips={handleSaveTips} savingTips={savingTips}
            user={user}
          />
        </div>
      </div>

      {/* ── Desktop layout ── */}
      <div className="hidden md:flex min-h-screen" dir="ltr">
        <div className="w-2/5 xl:w-1/3 flex-shrink-0 sticky top-0 h-screen overflow-hidden">
          <img
            className="w-full h-full object-cover"
            src={r.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800'}
            alt={r.title}
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <button onClick={() => navigate('/')} className="absolute top-5 left-5 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <div className="absolute bottom-6 left-6 right-6" dir="rtl">
            <h2 className="text-2xl font-bold text-white mb-1">{r.title}</h2>
            {r.profiles && <p className="text-white/80 text-sm">@{r.profiles.name}</p>}
            {r.is_kosher && (
              <span className="inline-block mt-2 bg-stone-500 text-white px-3 py-1 rounded-full text-xs font-medium">כשר</span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto" dir="rtl">
          <div className="max-w-2xl mx-auto px-8 py-8">
            <div className="mb-5">
              {r.source_url ? (
                <div className="flex items-center gap-3">
                  <a href={r.source_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[#8B7355] hover:underline">
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
                <button onClick={() => { setSourceUrlInput(''); setEditingUrl(true) }} className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#8B7355]">
                  <span className="material-symbols-outlined text-base">add_link</span>
                  הוסיפי קישור למקור
                </button>
              )}
              {editingUrl && (
                <div className="mt-2 flex gap-2">
                  <button onClick={saveSourceUrl} disabled={savingUrl} className="px-4 py-2 bg-[#8B7355] text-white rounded-xl text-sm font-bold disabled:opacity-60">
                    {savingUrl ? '...' : 'שמירה'}
                  </button>
                  <input value={sourceUrlInput} onChange={e => setSourceUrlInput(e.target.value)} placeholder="https://..." className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B7355]/40" dir="ltr" />
                </div>
              )}
            </div>

            {/* Actions row */}
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <button onClick={handleBookmark} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm border-2 transition-colors ${r.is_bookmarked ? 'border-amber-700 bg-stone-900 text-white' : 'border-gray-200 text-gray-700 hover:border-stone-400'}`}>
                <span className="material-symbols-outlined text-lg">{r.is_bookmarked ? 'bookmark' : 'bookmark_border'}</span>
                {r.is_bookmarked ? 'שמור ✓' : 'שמור'}
              </button>
              <button onClick={handleLike} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm border-2 border-gray-200 hover:border-red-200 hover:text-red-500 transition-colors">
                <span className={`material-symbols-outlined text-lg ${r.is_liked ? 'text-red-500' : ''}`}>{r.is_liked ? 'favorite' : 'favorite_border'}</span>
                {r.likes_count ?? 0} לייקים
              </button>
              <button onClick={handleShare} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm border-2 border-gray-200 hover:border-green-300 hover:text-green-600 transition-colors">
                <span className="material-symbols-outlined text-lg">share</span>
                שתפי
              </button>
              <button
                onClick={handleTried}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm border-2 transition-colors ${tried ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-700 hover:border-emerald-300'}`}
              >
                <span className="material-symbols-outlined text-lg">{tried ? 'check_circle' : 'cooking'}</span>
                {tried ? 'ניסיתי ✓' : 'ניסיתי את זה'}
              </button>
            </div>

            {/* Rating summary + stars */}
            {interactions && (
              <div className="bg-white rounded-2xl p-4 mb-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">{interactions.ratings_count} דירוגים · {interactions.tried_count} ניסו</span>
                  {interactions.avg_rating && (
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-bold text-amber-500">{interactions.avg_rating}</span>
                      <span className="material-symbols-outlined text-amber-400 text-lg">star</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 justify-end">
                  <span className="text-sm text-gray-500 ml-2">הדירוג שלי:</span>
                  {[1,2,3,4,5].map(star => (
                    <button
                      key={star}
                      onClick={() => handleRate(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="text-2xl transition-transform hover:scale-110"
                    >
                      <span className={`material-symbols-outlined ${(hoverRating || myRating) >= star ? 'text-amber-400' : 'text-gray-300'}`}>
                        star
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

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

            {r.description && <p className="text-gray-600 mb-6 leading-relaxed text-right">{r.description}</p>}

            {/* Tabs */}
            <div className="flex gap-6 border-b border-gray-200 mb-5">
              {TABS.map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-sm font-semibold transition-colors ${activeTab === tab ? 'text-stone-900 border-b-2 border-amber-700' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {tab}
                  {tab === 'תגובות' && interactions?.comments?.length > 0 && (
                    <span className="mr-1 text-xs bg-stone-100 text-stone-600 rounded-full px-1.5 py-0.5">{interactions.comments.length}</span>
                  )}
                </button>
              ))}
            </div>

            {activeTab === 'מצרכים' && (
              <>
                <ul className="divide-y divide-gray-100">
                  {r.ingredients?.length > 0 ? r.ingredients.map((ing) => (
                    <li key={ing.id} className="py-3 text-right">
                      <span className="font-medium text-gray-800">{ing.name}</span>
                      {(ing.amount || ing.unit) && <span className="text-gray-400 text-sm"> — {ing.amount} {ing.unit}</span>}
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
                    <div className="w-8 h-8 bg-stone-900 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">{step.step_number}</div>
                    <p className="text-gray-700 leading-relaxed text-right flex-1">{step.description}</p>
                  </div>
                )) : <p className="text-gray-400 text-center py-10">אין הוראות הכנה</p>}
              </div>
            )}

            {activeTab === 'תגובות' && (
              <CommentsSection
                interactions={interactions} commentText={commentText}
                setCommentText={setCommentText} onComment={handleComment}
                submittingComment={submittingComment} onDeleteComment={handleDeleteComment}
                user={user}
              />
            )}

            {activeTab === 'טיפים' && (
              <TipsSection
                r={r} isOwner={isOwner}
                editingTips={editingTips} setEditingTips={setEditingTips}
                tipsText={tipsText} setTipsText={setTipsText}
                onSaveTips={handleSaveTips} savingTips={savingTips}
              />
            )}

            <div className="h-8" />
          </div>
        </div>
      </div>

      {editingIngredients && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6" dir="rtl">
            <h3 className="text-lg font-bold mb-1">עריכת מצרכים</h3>
            <p className="text-xs text-gray-400 mb-3">שורה אחת לכל מצרך — לדוגמה: 2 כפות שמן זית</p>
            <textarea value={ingLines} onChange={e => setIngLines(e.target.value)} rows={12}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#8B7355]/40 resize-none"
              placeholder={"2 כוסות קמח\n1 כפית מלח\n3 ביצים"}
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setEditingIngredients(false)} className="flex-1 h-11 border border-gray-200 rounded-2xl text-sm text-gray-600">ביטול</button>
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

function RatingSummary({ avg, count, triedCount }) {
  if (!avg && !triedCount) return null
  return (
    <div className="flex items-center gap-3 mb-3 text-sm text-gray-500">
      {avg && (
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-amber-400 text-base">star</span>
          <span className="font-semibold text-gray-700">{avg}</span>
          <span>({count})</span>
        </span>
      )}
      {triedCount > 0 && (
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-emerald-500 text-base">check_circle</span>
          {triedCount} ניסו
        </span>
      )}
    </div>
  )
}

function TriedButton({ tried, onToggle, count }) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-medium text-sm border-2 transition-all w-full justify-center mb-3 ${tried ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600 hover:border-emerald-300'}`}
    >
      <span className="material-symbols-outlined text-lg">{tried ? 'check_circle' : 'cooking'}</span>
      {tried ? 'ניסיתי את זה ✓' : 'ניסיתי את זה'}
      {count > 0 && <span className="text-xs opacity-60">· {count}</span>}
    </button>
  )
}

function CommentsSection({ interactions, commentText, setCommentText, onComment, submittingComment, onDeleteComment, user }) {
  return (
    <div className="space-y-4" dir="rtl">
      {/* Add comment */}
      <div className="flex gap-2">
        <button
          onClick={onComment}
          disabled={submittingComment || !commentText.trim()}
          className="px-4 py-2 bg-stone-900 text-white rounded-xl text-sm font-bold disabled:opacity-40 flex-shrink-0"
        >
          {submittingComment ? '...' : 'שלח'}
        </button>
        <textarea
          value={commentText}
          onChange={e => setCommentText(e.target.value)}
          placeholder={user ? 'כתבו תגובה...' : 'יש להתחבר כדי להגיב'}
          rows={2}
          disabled={!user}
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#8B7355]/40 resize-none disabled:bg-gray-50"
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onComment() } }}
        />
      </div>

      {/* Comments list */}
      {!interactions?.comments?.length ? (
        <p className="text-center text-gray-400 py-8 text-sm">אין תגובות עדיין — היו הראשונים!</p>
      ) : (
        interactions.comments.map(c => (
          <div key={c.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {user?.id === c.profiles?.id && (
                  <button onClick={() => onDeleteComment(c.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                )}
                <span className="text-xs text-gray-400">{new Date(c.created_at).toLocaleDateString('he-IL')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {c.profiles?.avatar_url ? (
                  <img src={c.profiles.avatar_url} className="w-6 h-6 rounded-full object-cover" alt="" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center text-xs font-bold text-stone-600">
                    {c.profiles?.name?.[0] || '?'}
                  </div>
                )}
                <span className="text-sm font-semibold text-gray-700">{c.profiles?.name}</span>
              </div>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed text-right">{c.text}</p>
          </div>
        ))
      )}
    </div>
  )
}

function TipsSection({ r, isOwner, editingTips, setEditingTips, tipsText, setTipsText, onSaveTips, savingTips }) {
  return (
    <div dir="rtl">
      {!editingTips ? (
        <>
          {r.tips ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-amber-500">lightbulb</span>
                <h3 className="font-bold text-amber-800">טיפים מהמטבח</h3>
              </div>
              <p className="text-sm text-amber-900 leading-relaxed whitespace-pre-line">{r.tips}</p>
            </div>
          ) : (
            <p className="text-center text-gray-400 py-8 text-sm">אין טיפים עדיין</p>
          )}
          {isOwner && (
            <button
              onClick={() => { setTipsText(r.tips || ''); setEditingTips(true) }}
              className="flex items-center gap-2 text-sm text-[#8B7355] hover:underline"
            >
              <span className="material-symbols-outlined text-base">edit</span>
              {r.tips ? 'ערוך טיפים' : 'הוסף טיפים'}
            </button>
          )}
        </>
      ) : (
        <div>
          <p className="text-xs text-gray-400 mb-2">טיפים, המלצות, שינויים שעשית...</p>
          <textarea
            value={tipsText}
            onChange={e => setTipsText(e.target.value)}
            rows={8}
            className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#8B7355]/40 resize-none mb-3"
            placeholder="לדוגמה: אפשר להחליף שמנת רגילה בשמנת קוקוס להכנה פרווה..."
          />
          <div className="flex gap-3">
            <button onClick={() => setEditingTips(false)} className="flex-1 h-11 border border-gray-200 rounded-2xl text-sm text-gray-600">ביטול</button>
            <button onClick={onSaveTips} disabled={savingTips} className="flex-1 h-11 bg-[#8B7355] text-white rounded-2xl text-sm font-bold disabled:opacity-60">
              {savingTips ? 'שומר...' : 'שמירה'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function MobileTabs({ activeTab, setActiveTab, r, isOwner, onEditIngredients, interactions, commentText, setCommentText, onComment, submittingComment, onDeleteComment, myRating, hoverRating, setHoverRating, onRate, tried, triedImage, setTriedImage, onTriedImageSave, editingTips, setEditingTips, tipsText, setTipsText, onSaveTips, savingTips, user }) {
  return (
    <>
      <div className="flex gap-4 border-b border-gray-100 mb-4 overflow-x-auto">
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${activeTab === tab ? 'text-stone-900 border-b-2 border-amber-700' : 'text-gray-400'}`}
          >
            {tab}
            {tab === 'תגובות' && interactions?.comments?.length > 0 && (
              <span className="mr-1 text-xs bg-stone-100 text-stone-600 rounded-full px-1.5">{interactions.comments.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Star rating (always visible under tabs) */}
      {interactions && (
        <div className="flex items-center gap-1 justify-end mb-4">
          <span className="text-xs text-gray-500 ml-2">דרגו:</span>
          {[1,2,3,4,5].map(star => (
            <button key={star} onClick={() => onRate(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} className="text-xl">
              <span className={`material-symbols-outlined text-xl ${(hoverRating || myRating) >= star ? 'text-amber-400' : 'text-gray-300'}`}>star</span>
            </button>
          ))}
        </div>
      )}

      {activeTab === 'מצרכים' && (
        <>
          <ul className="divide-y divide-gray-50 mb-4">
            {r.ingredients?.length > 0 ? r.ingredients.map((ing) => (
              <li key={ing.id} className="py-3 text-right text-sm">
                <span className="font-medium">{ing.name}</span>
                {(ing.amount || ing.unit) && <span className="text-gray-400"> — {ing.amount} {ing.unit}</span>}
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
              <div className="w-7 h-7 bg-stone-900 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{step.step_number}</div>
              <p className="text-sm text-gray-700 leading-relaxed text-right">{step.description}</p>
            </div>
          )) : <p className="text-gray-400 text-center py-8">אין הוראות</p>}
        </div>
      )}

      {activeTab === 'תגובות' && (
        <CommentsSection interactions={interactions} commentText={commentText} setCommentText={setCommentText} onComment={onComment} submittingComment={submittingComment} onDeleteComment={onDeleteComment} user={user} />
      )}

      {activeTab === 'טיפים' && (
        <TipsSection r={r} isOwner={isOwner} editingTips={editingTips} setEditingTips={setEditingTips} tipsText={tipsText} setTipsText={setTipsText} onSaveTips={onSaveTips} savingTips={savingTips} />
      )}
    </>
  )
}

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useRecipeStore } from '../store/recipeStore'
import RecipeCard from '../components/RecipeCard'
import { RecipeGridSkeleton } from '../components/LoadingSkeleton'

const CATEGORIES = ['הכל', 'עיקרית', 'מנות פתיחה', 'קינוחים', 'סלטים']

const SUB_CATEGORY_IMAGE_OVERRIDES = {
  'חזה עוף': 'https://d3o5sihylz93ps.cloudfront.net/wp-content/uploads/2026/04/23113947/IMG_9215-355x236.jpg',
  'שניצל':   'https://d3o5sihylz93ps.cloudfront.net/wp-content/uploads/2026/06/23130147/b2ef4ccc-abbf-4d68-a0a8-65bc73a214f0-355x236.jpg',
  'שווארמה': 'https://www.nikib.co.il/wp-content/uploads/%D7%A9%D7%95%D7%95%D7%90%D7%A8%D7%9E%D7%94.jpg?v=1618217754',
  'אסאדו':   'https://heninthekitchen.com/wp-content/uploads/2024/04/DSC000581-3small.jpg',
  'טונה':    'https://d3o5sihylz93ps.cloudfront.net/wp-content/uploads/2026/05/03110334/WhatsApp-Image-2026-04-30-at-16.58.27-1-355x236.jpeg',
}
const BLOGS = ['10 דקות', 'מאקו', 'חן במטבח']

const SUB_GROUPS = {
  'קינוחים': [
    {
      name: 'עוגות',
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600',
      desc: 'עוגת גבינה, גזר, שוקולד ועוד',
      subs: ['עוגת גבינה', 'עוגת גזר', 'עוגת תפוזים', 'עוגות שוקולד', 'בראוניז', 'טירמיסו', 'עוגות ביסקוויטים', 'עוגת בננות', 'עוגת קוקוס', 'עוגת פרפה', 'עוגות מוס', 'עוגות נוספות'],
    },
    {
      name: 'עוגיות',
      image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600',
      desc: 'שוקולד ציפס, חמאה, קוקוס ועוד',
      subs: ['עוגיות שוקולד', 'עוגיות שוקולד ציפס', 'עוגיות חמאה', 'עוגיות קוקוס', 'עוגיות תמרים', 'עוגיות שקדים ואגוזים', 'מגולגלות', 'אוזני המן', 'עוגיות נוספות'],
    },
  ],
}

const KOSHER_GROUPS = {
  'בשרי': [
    { name: 'עוף', image: 'https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?w=600', desc: 'פרגיות, שניצל, כנפיים ועוד', subs: ['פרגיות', 'שניצל', 'כנפיים', 'חזה עוף', 'שוקי עוף', 'עוף שלם', 'מרק עוף', 'שווארמה', 'תבשיל עוף', 'צלי עוף', 'קציצות עוף'] },
    { name: 'בשר', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600', desc: 'המבורגר, קבב, אסאדו ועוד', subs: ['בשר בקר', 'המבורגר', 'קבב', 'קציצות', 'אסאדו', 'סטייק', 'סינטה', 'אנטריקוט', 'בשר טחון', 'נקניקיות', 'כבש וטלה', 'קובה'] },
  ],
  'חלבי': [
    { name: 'מנות', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600', desc: 'פיצה, פסטה, קיש ועוד', subs: ['מנות חלביות', 'פסטה', 'פיצה', 'לזניה', 'ריזוטו', 'קיש', 'פשטידה', 'אורז', 'תפוחי אדמה'] },
    { name: 'מנות פתיחה', image: 'https://images.unsplash.com/photo-1590412200988-a436970781fa?w=600', desc: 'שקשוקה, ביצים, גבינות ועוד', subs: ['מנות פתיחה', 'מנות ראשונות', 'שקשוקה', 'ביצים'] },
    { name: 'מאפים', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600', desc: 'בורקס, לחמניות גבינה ועוד', subs: ['בורקס', 'מאפים', 'לחמניות', 'בייגל', "פוקאצ'ה", 'לחמים', 'פיתה'] },
  ],
}

const KOSHER_TYPES = [
  { name: 'בשרי', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600', desc: 'עוף, בשר, הודו ועוד' },
  { name: 'חלבי', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600', desc: 'פיצה, פסטה, גבינות ועוד' },
  { name: 'דגים', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600', desc: 'דג מרוקאי, סלמון, טונה ועוד' },
  { name: 'פרווה', image: 'https://images.unsplash.com/photo-1598866594230-a7c12756260f?w=600', desc: 'פסטה, ירקות, קטניות ועוד' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const { user, profile } = useAuthStore()
  const { recipes, isLoading, activeCategory, activeSubCategory, activeKosherType, activeGroup, activeGroupSubs, activeSubGroup, activeSubGroupSubs, activeSource, subCategories, setCategory, setSubCategory, setKosherType, setGroup, setSubGroup, setSource, setSearch, fetchRecipes, restoreNav } = useRecipeStore()
  const [searchInput, setSearchInput] = useState('')
  const isMounted = useRef(false)
  const isRestoring = useRef(false)

  useEffect(() => {
    window.history.scrollRestoration = 'manual'

    const saved = window.history.state?.cook
    if (saved) {
      isRestoring.current = true
      restoreNav(saved.cat || 'הכל', saved.k || '', saved.g || '', saved.gs || [], saved.sub || '', saved.sg || '', saved.sgs || [])
    } else {
      window.history.replaceState({ cook: { cat: activeCategory, k: activeKosherType, g: activeGroup, gs: activeGroupSubs, sub: activeSubCategory, sg: activeSubGroup, sgs: activeSubGroupSubs } }, '')
      fetchRecipes()
    }

    const onPop = (e) => {
      if (e.state?.cook) {
        const { cat, k, g, gs, sub, sg, sgs } = e.state.cook
        isRestoring.current = true
        restoreNav(cat || 'הכל', k || '', g || '', gs || [], sub || '', sg || '', sgs || [])
        window.scrollTo(0, 0)
      }
    }
    window.addEventListener('popstate', onPop)
    return () => {
      window.removeEventListener('popstate', onPop)
      window.history.scrollRestoration = 'auto'
    }
  }, [])

  // Push history entry on each navigation change (skip first mount and popstate restores)
  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return }
    if (isRestoring.current) { isRestoring.current = false; return }
    window.history.pushState({ cook: { cat: activeCategory, k: activeKosherType, g: activeGroup, gs: activeGroupSubs, sub: activeSubCategory, sg: activeSubGroup, sgs: activeSubGroupSubs } }, '')
    window.scrollTo(0, 0)
  }, [activeCategory, activeKosherType, activeGroup, activeSubCategory, activeSubGroup])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setSearch(searchInput)
    fetchRecipes()
  }

  const safeSubs = subCategories || []
  const groupFilteredSubs = activeGroupSubs.length
    ? safeSubs.filter(s => activeGroupSubs.includes(s.name))
    : safeSubs

  const categorySubGroups = SUB_GROUPS[activeCategory] || []
  const subGroupSubNamesSet = new Set(categorySubGroups.flatMap(g => g.subs))
  const displaySubs = safeSubs.filter(s => !subGroupSubNamesSet.has(s.name))
  const visibleSubGroups = categorySubGroups.filter(g => g.subs.some(s => safeSubs.find(sc => sc.name === s)))
  const activeSubGroupItems = activeSubGroup ? safeSubs.filter(s => activeSubGroupSubs.includes(s.name)) : []


  return (
    <div className="min-h-screen">

      {/* ── Mobile header ── */}
      <header className="md:hidden flex justify-between items-center px-5 h-16 bg-white border-b border-gray-100 sticky top-0 z-10">
        <button onClick={() => navigate(user ? '/profile' : '/login')}>
          <img
            src={profile?.avatar_url || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
            alt="profile"
            className="w-9 h-9 rounded-full object-cover border-2 border-gray-100"
          />
        </button>
        <h1 className="text-xl font-bold text-stone-900">CookBook</h1>
        <button onClick={() => navigate(user ? '/profile' : '/login')}>
          <span className="material-symbols-outlined text-2xl text-gray-400">
            {user ? 'person' : 'login'}
          </span>
        </button>
      </header>

      {/* ── Desktop hero banner ── */}
      <div className="hidden md:block bg-[#F5EFE6] relative overflow-hidden border-b border-[#E8DDD0]">
        <div className="relative px-10 py-12 flex items-center justify-between gap-10">
          <div className="flex-1">
            <p className="text-[#A08060] text-xs font-semibold mb-2 tracking-widest uppercase">The Recipe Hub</p>
            <h1 className="text-5xl font-extrabold text-[#1C1C1C] mb-3 leading-tight">מה מבשלים<br/>היום?</h1>
            <p className="text-[#8A7060] mb-8 text-base">אלפי מתכונים מהבלוגים הכי טובים — במקום אחד</p>
            <form onSubmit={handleSearchSubmit} className="flex gap-3 max-w-lg">
              <button
                type="submit"
                className="px-7 py-3 bg-[#8B7355] text-white rounded-full font-bold hover:bg-[#7A6347] transition-colors flex-shrink-0"
              >
                חפש
              </button>
              <input
                className="flex-1 h-12 bg-white border border-[#D5C8B8] rounded-full px-5 text-right text-[#1C1C1C] placeholder:text-[#B0A090] focus:outline-none focus:ring-2 focus:ring-[#C8A87A]/50 shadow-sm"
                placeholder="חפש מתכון..."
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </form>
          </div>
          <div className="hidden lg:flex gap-3">
            <div className="w-32 h-40 rounded-2xl overflow-hidden shadow-md"><img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200" className="w-full h-full object-cover" alt="" /></div>
            <div className="w-32 h-40 rounded-2xl overflow-hidden mt-6 shadow-md"><img src="https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=200" className="w-full h-full object-cover" alt="" /></div>
            <div className="w-32 h-40 rounded-2xl overflow-hidden shadow-md"><img src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=200" className="w-full h-full object-cover" alt="" /></div>
          </div>
        </div>
      </div>

      <main className="px-4 md:px-8 lg:px-12 pt-4">

        {/* Mobile search */}
        <form onSubmit={handleSearchSubmit} className="md:hidden mb-4">
          <div className="relative">
            <input
              className="w-full h-12 bg-white rounded-2xl px-4 pr-12 border border-gray-200 text-right focus:outline-none focus:ring-2 focus:ring-stone-500"
              placeholder="חיפוש מתכון..."
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
              <span className="material-symbols-outlined text-gray-400">search</span>
            </button>
          </div>
        </form>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm whitespace-nowrap flex-shrink-0 font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-[#8B7355] text-white border border-[#8B7355]'
                  : 'bg-[#EDE5D8] border border-[#D8CEBC] text-gray-600 hover:bg-[#E0D5C2] hover:text-gray-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Blog sources */}
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none mt-2 mb-2">
          <button
            onClick={() => setSource('')}
            className={`px-4 py-1.5 rounded-full text-xs whitespace-nowrap flex-shrink-0 font-medium transition-colors flex items-center gap-1 ${
              activeSource === ''
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-[#EDE5D8] border border-[#D8CEBC] text-gray-600 hover:bg-[#E0D5C2] hover:text-indigo-600'
            }`}
          >
            <span className="material-symbols-outlined text-sm">rss_feed</span>
            כל הבלוגים
          </button>
          {BLOGS.map((blog) => (
            <button
              key={blog}
              onClick={() => setSource(activeSource === blog ? '' : blog)}
              className={`px-4 py-1.5 rounded-full text-xs whitespace-nowrap flex-shrink-0 font-medium transition-colors flex items-center gap-1 ${
                activeSource === blog
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-[#EDE5D8] border border-[#D8CEBC] text-gray-600 hover:bg-[#E0D5C2] hover:text-indigo-600'
              }`}
            >
              {blog}
            </button>
          ))}
        </div>

        {/* ── LEVEL 2: kosher type cards (בשרי/חלבי/דגים) — only for עיקרית ── */}
        {activeCategory === 'עיקרית' && activeKosherType === '' && activeGroup === '' ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-400">3 סוגים</span>
              <h2 className="text-lg font-bold text-gray-800">עיקרית</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {KOSHER_TYPES.map((kt) => (
                <div
                  key={kt.name}
                  onClick={() => setKosherType(kt.name)}
                  className="relative rounded-2xl overflow-hidden cursor-pointer h-44 active:scale-95 transition-transform shadow-sm"
                >
                  <img src={kt.image} alt={kt.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-right">
                    <p className="text-white font-bold text-xl">{kt.name}</p>
                    <p className="text-white/70 text-xs mt-0.5">{kt.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </>

        ) : activeCategory === 'עיקרית' && activeKosherType !== '' && KOSHER_GROUPS[activeKosherType] && activeGroup === '' && activeSubCategory === '' ? (
          /* ── LEVEL 3: group cards (עוף/בשר within בשרי) ── */
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">{KOSHER_GROUPS[activeKosherType].length} קבוצות</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setKosherType('')} className="flex items-center gap-1 text-sm text-stone-700 font-medium">
                  <span className="material-symbols-outlined text-base">chevron_right</span>
                  עיקרית
                </button>
                <h2 className="text-lg font-bold text-gray-800">{activeKosherType}</h2>
              </div>
            </div>
            <div
              onClick={() => setSubCategory('__all__')}
              className="flex items-center justify-center gap-2 rounded-2xl cursor-pointer h-14 mb-5 active:scale-95 transition-transform bg-gradient-to-r from-[#8B7355] to-[#C4A882] shadow-sm"
            >
              <span className="material-symbols-outlined text-white text-xl">grid_view</span>
              <p className="text-white font-bold text-sm">כל מתכוני {activeKosherType}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {KOSHER_GROUPS[activeKosherType].map((group) => (
                <div
                  key={group.name}
                  onClick={() => setGroup(group.name, group.subs)}
                  className="relative rounded-2xl overflow-hidden cursor-pointer h-44 active:scale-95 transition-transform shadow-sm"
                >
                  <img src={group.image} alt={group.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-right">
                    <p className="text-white font-bold text-xl">{group.name}</p>
                    <p className="text-white/70 text-xs mt-0.5">{group.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </>

        ) : activeCategory !== 'הכל' && activeKosherType !== '' && activeSubCategory === '' && groupFilteredSubs.length > 0 ? (
          /* ── dish cards — filtered by group when group is active ── */
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">{groupFilteredSubs.length} סוגי מנות</span>
              <div className="flex items-center gap-2">
                {activeGroup ? (
                  <button onClick={() => setGroup('', [])} className="flex items-center gap-1 text-sm text-stone-700 font-medium">
                    <span className="material-symbols-outlined text-base">chevron_right</span>
                    {activeKosherType}
                  </button>
                ) : (
                  <button onClick={() => setKosherType('')} className="flex items-center gap-1 text-sm text-stone-700 font-medium">
                    <span className="material-symbols-outlined text-base">chevron_right</span>
                    {activeCategory === 'עיקרית' ? 'עיקרית' : activeCategory}
                  </button>
                )}
                <h2 className="text-lg font-bold text-gray-800">{activeGroup || activeKosherType}</h2>
              </div>
            </div>

            {/* "See all" banner */}
            <div
              onClick={() => setSubCategory('__all__')}
              className="flex items-center justify-center gap-2 rounded-2xl cursor-pointer h-14 mb-5 active:scale-95 transition-transform bg-gradient-to-r from-[#8B7355] to-[#C4A882] shadow-sm"
            >
              <span className="material-symbols-outlined text-white text-xl">grid_view</span>
              <p className="text-white font-bold text-sm">כל מתכוני {activeGroup || activeKosherType}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {groupFilteredSubs.map((sub) => (
                <div
                  key={sub.name}
                  onClick={() => setSubCategory(sub.name)}
                  className="relative rounded-2xl overflow-hidden cursor-pointer h-44 active:scale-95 transition-transform shadow-sm"
                >
                  <img
                    src={SUB_CATEGORY_IMAGE_OVERRIDES[sub.name] || sub.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
                    alt={sub.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-right">
                    <p className="text-white font-bold text-sm leading-tight">{sub.name}</p>
                    <p className="text-white/70 text-xs mt-0.5">{sub.count} גרסאות לבחירה</p>
                  </div>
                </div>
              ))}
            </div>
          </>

        ) : activeCategory !== 'הכל' && activeSubCategory === '' && activeKosherType === '' && activeSubGroup !== '' ? (
          /* ── Sub-group cards (e.g. cake types under עוגות) ── */
          <>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-400">{activeSubGroupItems.length} סוגים</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setSubGroup('', [])} className="flex items-center gap-1 text-sm text-stone-700 font-medium">
                  <span className="material-symbols-outlined text-base">chevron_right</span>
                  {activeCategory}
                </button>
                <h2 className="text-lg font-bold text-gray-800">{activeSubGroup}</h2>
              </div>
            </div>
            <div
              onClick={() => setSubCategory('__all__')}
              className="flex items-center justify-center gap-2 rounded-2xl cursor-pointer h-14 mb-5 active:scale-95 transition-transform bg-gradient-to-r from-[#8B7355] to-[#C4A882] shadow-sm"
            >
              <span className="material-symbols-outlined text-white text-xl">grid_view</span>
              <p className="text-white font-bold text-sm">כל {activeSubGroup}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {activeSubGroupItems.map((sub) => (
                <div
                  key={sub.name}
                  onClick={() => setSubCategory(sub.name)}
                  className="relative rounded-2xl overflow-hidden cursor-pointer h-44 active:scale-95 transition-transform shadow-sm"
                >
                  <img
                    src={SUB_CATEGORY_IMAGE_OVERRIDES[sub.name] || sub.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
                    alt={sub.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-right">
                    <p className="text-white font-bold text-sm leading-tight">{sub.name}</p>
                    <p className="text-white/70 text-xs mt-0.5">{sub.count} גרסאות לבחירה</p>
                  </div>
                </div>
              ))}
            </div>
          </>

        ) : activeCategory !== 'הכל' && activeSubCategory === '' && subCategories.length > 0 && activeKosherType === '' ? (
          /* ── Dish-type cards for non-עיקרית categories ── */
          <>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-400">{displaySubs.length + visibleSubGroups.length} סוגי מנות</span>
              <h2 className="text-lg font-bold text-gray-800">{activeCategory}</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div
                onClick={() => setSubCategory('__all__')}
                className="relative rounded-2xl overflow-hidden cursor-pointer h-44 active:scale-95 transition-transform shadow-sm bg-gradient-to-br from-[#8B7355] to-[#C4A882] flex flex-col items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-white text-4xl">grid_view</span>
                <p className="text-white font-bold text-sm">כל {activeCategory}</p>
              </div>
              {displaySubs.map((sub) => (
                <div
                  key={sub.name}
                  onClick={() => setSubCategory(sub.name)}
                  className="relative rounded-2xl overflow-hidden cursor-pointer h-44 active:scale-95 transition-transform shadow-sm"
                >
                  <img
                    src={SUB_CATEGORY_IMAGE_OVERRIDES[sub.name] || sub.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
                    alt={sub.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-right">
                    <p className="text-white font-bold text-sm leading-tight">{sub.name}</p>
                    <p className="text-white/70 text-xs mt-0.5">{sub.count} גרסאות לבחירה</p>
                  </div>
                </div>
              ))}
              {visibleSubGroups.map((group) => (
                <div
                  key={group.name}
                  onClick={() => setSubGroup(group.name, group.subs)}
                  className="relative rounded-2xl overflow-hidden cursor-pointer h-44 active:scale-95 transition-transform shadow-sm"
                >
                  <img src={group.image} alt={group.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-right">
                    <p className="text-white font-bold text-sm leading-tight">{group.name}</p>
                    <p className="text-white/70 text-xs mt-0.5">{group.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </>

        ) : (
          /* ── LEVEL 4 / default: recipe list ── */
          <>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-400">
                {isLoading ? '' : activeSubCategory && activeSubCategory !== '__all__'
                  ? `${recipes.length} גרסאות`
                  : `${recipes.length} מתכונים`}
              </span>
              <div className="flex items-center gap-2">
                {activeSubCategory && (
                  <button
                    onClick={() => setSubCategory('')}
                    className="flex items-center gap-1 text-sm text-stone-700 font-medium"
                  >
                    <span className="material-symbols-outlined text-base">chevron_right</span>
                    {activeSubGroup || activeKosherType || activeCategory}
                  </button>
                )}
                <h2 className="text-lg font-bold text-gray-800">
                  {activeSubCategory && activeSubCategory !== '__all__'
                    ? activeSubCategory
                    : activeCategory === 'הכל' ? 'כל המתכונים'
                    : activeSubGroup ? `כל ${activeSubGroup}`
                    : activeKosherType || activeCategory}
                </h2>
              </div>
            </div>

            {activeSubCategory && activeSubCategory !== '__all__' && (
              <p className="text-sm text-gray-400 text-right mb-3">
                בחרי את הגרסה שמתאימה לך — לפי זמן הכנה, מצרכים וסגנון
              </p>
            )}

            {isLoading ? (
              <RecipeGridSkeleton count={8} />
            ) : recipes.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <span className="material-symbols-outlined text-6xl block mb-3">restaurant</span>
                <p className="text-lg">לא נמצאו מתכונים</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {recipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            )}
          </>
        )}

        <div className="h-4" />
      </main>

      {/* FAB – mobile only */}
      {user && (
        <button
          onClick={() => navigate('/add-recipe')}
          className="md:hidden fixed bottom-20 left-5 w-14 h-14 bg-stone-900 text-white rounded-full shadow-lg shadow-stone-300/50 flex items-center justify-center z-20 active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-2xl">add</span>
        </button>
      )}
    </div>
  )
}

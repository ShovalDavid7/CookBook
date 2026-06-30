import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const CATEGORIES = ['ארוחת בוקר', 'צהריים', 'עיקרית', 'קינוחים', 'סלטים', 'מרקים']

export default function BatchImportPage() {
  const navigate = useNavigate()
  const [urlsText, setUrlsText] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)

  const urls = urlsText.split('\n').map((u) => u.trim()).filter(Boolean)

  const handleImport = async () => {
    if (urls.length === 0) return
    setLoading(true)
    setResults(null)
    try {
      const { data } = await api.post('/api/import/batch', { urls, category })
      setResults(data.summary)
    } catch (err) {
      setResults([{ url: '', status: 'error', error: err.response?.data?.error || 'שגיאה כללית' }])
    } finally {
      setLoading(false)
    }
  }

  const successCount = results?.filter((r) => r.status === 'success').length ?? 0
  const errorCount = results?.filter((r) => r.status === 'error').length ?? 0

  return (
    <div className="min-h-screen bg-[#F5F4F0]">

      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-5 md:px-8 py-4 bg-white border-b border-gray-100">
        <button onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined text-gray-600">chevron_right</span>
        </button>
        <h1 className="text-lg font-bold text-gray-800">ייבוא מרובה</h1>
        <div className="w-8" />
      </header>

      <div className="px-4 md:px-8 lg:px-12 py-6 max-w-3xl mx-auto space-y-5">

        {/* Explainer */}
        <div className="bg-gradient-to-l from-indigo-600 to-blue-500 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-xl">rocket_launch</span>
            <h2 className="font-bold text-base">ייבוא כמה מתכונים בבת אחת</h2>
          </div>
          <p className="text-blue-100 text-sm leading-relaxed">
            הדביקי כתובות של מתכונים מאתרים שונים — שורה אחת לכל כתובת.
            כולם יתווספו אוטומטית עם שם הבלוג שלהם.
          </p>
        </div>

        {/* Category picker */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <label className="block text-sm font-bold text-gray-700 mb-3 text-right">
            קטגוריה לכל המתכונים (אופציונלי)
          </label>
          <div className="flex gap-2 flex-wrap justify-end">
            <button
              onClick={() => setCategory('')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                category === '' ? 'bg-stone-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              אוטומטי
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  category === cat ? 'bg-stone-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* URL textarea */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400">{urls.length} כתובות</span>
            <label className="text-sm font-bold text-gray-700">כתובות URL</label>
          </div>
          <textarea
            value={urlsText}
            onChange={(e) => setUrlsText(e.target.value)}
            placeholder={`https://www.10dakot.co.il/recipe/pancakes\nhttps://www.allrecipes.com/recipe/pancakes\nhttps://www.mako.co.il/food/pancakes`}
            rows={8}
            dir="ltr"
            className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none font-mono"
          />
        </div>

        {/* Import button */}
        <button
          onClick={handleImport}
          disabled={loading || urls.length === 0}
          className="w-full h-14 bg-indigo-600 text-white rounded-2xl font-bold text-base flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200"
        >
          {loading ? (
            <>
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
              מייבא {urls.length} מתכונים...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined">download</span>
              ייבא {urls.length > 0 ? `${urls.length} מתכונים` : ''}
            </>
          )}
        </button>

        {/* Results */}
        {results && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Summary bar */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex gap-4">
                <span className="flex items-center gap-1.5 text-sm font-medium text-red-500">
                  <span className="material-symbols-outlined text-lg">error</span>
                  {errorCount} נכשלו
                </span>
                <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                  <span className="material-symbols-outlined text-lg">check_circle</span>
                  {successCount} יובאו
                </span>
              </div>
              <h3 className="font-bold text-gray-800">תוצאות</h3>
            </div>

            {/* Per-URL results */}
            <ul className="divide-y divide-gray-50">
              {results.map((r, i) => (
                <li key={i} className="flex items-center gap-3 px-5 py-3">
                  <span className={`material-symbols-outlined text-xl flex-shrink-0 ${
                    r.status === 'success' ? 'text-stone-500' : 'text-red-400'
                  }`}>
                    {r.status === 'success' ? 'check_circle' : 'cancel'}
                  </span>
                  <div className="flex-1 min-w-0 text-right">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {r.title || r.url}
                    </p>
                    {r.error && (
                      <p className="text-xs text-red-400 mt-0.5">{r.error}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* Action */}
            {successCount > 0 && (
              <div className="px-5 py-4 border-t border-gray-100">
                <button
                  onClick={() => navigate('/')}
                  className="w-full py-3 bg-stone-900 text-white rounded-xl font-bold text-sm hover:bg-stone-900 transition-colors"
                >
                  ראי את המתכונים בדף הבית ←
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

import { useState, useRef } from 'react'
import { useAuthStore } from '../store/authStore'

const SITES = [
  { id: '10dakot', label: '10 דקות', desc: 'מאות מתכונים מהירים' },
  { id: 'heninthekitchen', label: 'חן במטבח', desc: 'מתכונים ביתיים' },
  { id: 'foody', label: 'פודי', desc: 'אתר המתכונים המוביל בישראל' },
]

export default function CrawlerPage() {
  const { user } = useAuthStore()
  const [running, setRunning] = useState(false)
  const [log, setLog] = useState([])
  const [limit, setLimit] = useState(30)
  const [activeSite, setActiveSite] = useState(null)
  const logRef = useRef(null)

  const addLog = (entry) => {
    setLog(prev => {
      const next = [...prev, entry]
      setTimeout(() => logRef.current?.scrollTo(0, logRef.current.scrollHeight), 50)
      return next
    })
  }

  const streamSite = async (siteId, token) => {
    const url = `/api/crawl/stream?site=${siteId}&limit=${limit}`
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop()
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try { addLog(JSON.parse(line.slice(6))) } catch {}
        }
      }
    }
  }

  const startCrawl = async (siteId) => {
    setRunning(true)
    setActiveSite(siteId)
    setLog([])
    const { data: { session } } = await import('../lib/supabase').then(m => m.supabase.auth.getSession())
    await streamSite(siteId, session?.access_token)
    setRunning(false)
    setActiveSite(null)
  }

  const startCrawlAll = async () => {
    setRunning(true)
    setLog([])
    const { data: { session } } = await import('../lib/supabase').then(m => m.supabase.auth.getSession())
    for (const site of SITES) {
      setActiveSite(site.id)
      await streamSite(site.id, session?.access_token)
    }
    setRunning(false)
    setActiveSite(null)
  }

  if (!user) return <div className="p-8 text-center text-gray-500">יש להתחבר כדי להשתמש בכלי זה</div>

  const doneLog = log.find(l => l.type === 'done')
  const progressLogs = log.filter(l => l.type === 'progress')

  return (
    <div className="max-w-2xl mx-auto p-6" dir="rtl">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">ייבוא אוטומטי מאתרים</h1>
      <p className="text-gray-500 text-sm mb-6">הכלי ייכנס לאתר, ימצא את כל המתכונים ויייבא אותם אוטומטית</p>

      <div className="mb-4 flex items-center gap-3">
        <label className="text-sm text-gray-600">מקסימום מתכונים לייבוא:</label>
        <select
          value={limit}
          onChange={e => setLimit(Number(e.target.value))}
          disabled={running}
          className="border rounded-lg px-3 py-1.5 text-sm"
        >
          {[10, 30, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      <button
        onClick={startCrawlAll}
        disabled={running}
        className="w-full mb-4 py-3 bg-[#8B7355] text-white rounded-2xl font-bold text-sm hover:bg-[#7A6347] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {running ? 'מייבא...' : 'ייבא משלושת האתרים'}
      </button>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {SITES.map(site => (
          <button
            key={site.id}
            onClick={() => startCrawl(site.id)}
            disabled={running}
            className={`p-4 rounded-2xl border-2 text-right transition-all ${
              activeSite === site.id
                ? 'border-[#8B7355] bg-[#F5EFE6]'
                : 'border-gray-200 hover:border-[#8B7355] hover:bg-[#F5EFE6]'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <p className="font-bold text-gray-800">{site.label}</p>
            <p className="text-xs text-gray-500 mt-1">{site.desc}</p>
            {activeSite === site.id && running && (
              <p className="text-xs text-[#8B7355] mt-2 flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-[#8B7355] rounded-full animate-pulse" />
                מייבא...
              </p>
            )}
          </button>
        ))}
      </div>

      {log.length > 0 && (
        <div className="bg-gray-950 rounded-2xl p-4 text-sm font-mono" ref={logRef} style={{ maxHeight: 360, overflowY: 'auto' }}>
          {log.map((entry, i) => {
            if (entry.type === 'status') return <p key={i} className="text-yellow-400">{entry.message}</p>
            if (entry.type === 'progress') return (
              <p key={i} className={entry.success ? 'text-green-400' : 'text-red-400'}>
                {entry.success ? '✓' : '✗'} {entry.title || entry.url?.split('/').slice(-2, -1)[0] || entry.url}
                {!entry.success && <span className="text-gray-500 mr-1">— {entry.error}</span>}
              </p>
            )
            if (entry.type === 'done') return (
              <p key={i} className="text-white font-bold mt-2 border-t border-gray-700 pt-2">
                סיום: {entry.success} הצליחו, {entry.failed} נכשלו
              </p>
            )
            if (entry.type === 'error') return <p key={i} className="text-red-500">שגיאה: {entry.message}</p>
            return null
          })}
        </div>
      )}

      {doneLog && (
        <div className="mt-4 p-4 bg-green-50 rounded-xl text-green-800 text-sm">
          ✓ יובאו {doneLog.success} מתכונים חדשים בהצלחה
        </div>
      )}
    </div>
  )
}

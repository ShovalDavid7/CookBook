import { supabase } from '../supabase.js'
import { importAndSave } from './importController.js'

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'he,en;q=0.5',
}

async function fetchSitemapUrls(sitemapUrl, filter) {
  const res = await fetch(sitemapUrl, { headers: HEADERS, signal: AbortSignal.timeout(15000) })
  const text = await res.text()
  const urls = [...text.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim())
  return filter ? urls.filter(filter) : urls
}

const SITES = {
  '10dakot': {
    label: '10 דקות',
    getUrls: async () => {
      const indexRes = await fetch('https://www.10dakot.co.il/sitemap_index.xml', { headers: HEADERS, signal: AbortSignal.timeout(10000) })
      const indexText = await indexRes.text()
      const sitemaps = [...indexText.matchAll(/<loc>([^<]*recipe-sitemap[^<]*)<\/loc>/g)].map(m => m[1])
      const allUrls = []
      for (const sm of sitemaps) {
        const urls = await fetchSitemapUrls(sm, u => u.includes('/recipe/') && !u.endsWith('/recipe/'))
        allUrls.push(...urls)
      }
      return allUrls
    },
  },
  heninthekitchen: {
    label: 'חן במטבח',
    getUrls: async () => {
      return fetchSitemapUrls('https://heninthekitchen.com/post-sitemap.xml', u => u.includes('heninthekitchen.com/'))
    },
  },
  foody: {
    label: 'פודי',
    getUrls: async () => {
      const allUrls = []
      let page = 1
      while (true) {
        const res = await fetch(`https://foody.co.il/foody_recipe/feed/?paged=${page}`, { headers: HEADERS, signal: AbortSignal.timeout(15000) })
        const text = await res.text()
        const items = [...text.matchAll(/<item>[\s\S]*?<link>([^<]+)<\/link>[\s\S]*?<\/item>/g)]
        if (items.length === 0) break
        allUrls.push(...items.map(m => m[1].trim()))
        if (items.length < 12) break
        page++
        await new Promise(r => setTimeout(r, 500))
      }
      return allUrls
    },
  },
}

export async function crawlSite(req, res) {
  const { site, limit = 30 } = req.query
  const userId = req.user?.id

  if (!SITES[site]) {
    return res.status(400).json({ error: 'אתר לא ידוע' })
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`)

  try {
    send({ type: 'status', message: `מאחזר כתובות מ-${SITES[site].label}...` })
    const allUrls = await SITES[site].getUrls()
    send({ type: 'status', message: `נמצאו ${allUrls.length} כתובות. בודק אילו כבר קיימות...` })

    const { data: existing } = await supabase.from('recipes').select('source_url').not('source_url', 'is', null)
    const existingSet = new Set((existing || []).map(r => r.source_url))

    const newUrls = allUrls.filter(u => !existingSet.has(u)).slice(0, Number(limit))
    send({ type: 'status', message: `${newUrls.length} מתכונים חדשים לייבוא` })

    let success = 0, failed = 0
    for (const url of newUrls) {
      try {
        const saved = await importAndSave(url, '', userId)
        success++
        send({ type: 'progress', url, title: saved.title, success: true, done: success + failed, total: newUrls.length })
      } catch (err) {
        failed++
        send({ type: 'progress', url, error: err.message, success: false, done: success + failed, total: newUrls.length })
      }
      await new Promise(r => setTimeout(r, 800))
    }

    send({ type: 'done', success, failed, total: newUrls.length })
  } catch (err) {
    send({ type: 'error', message: err.message })
  }

  res.end()
}

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://jrvioblxwgzivvytslct.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydmlvYmx4d2d6aXZ2eXRzbGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjM1MjQsImV4cCI6MjA5NjM5OTUyNH0.ZYTTy711BO3hymZqIGMG_8Rh_8s-DFHaTEMTtMRr9XE'
const LIMIT_PER_SITE = 100

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'he,en;q=0.5',
}

const SITES = {
  '10dakot': {
    label: '10 דקות',
    getUrls: async () => {
      const res = await fetch('https://www.10dakot.co.il/sitemap_index.xml', { headers: HEADERS, signal: AbortSignal.timeout(10000) })
      const text = await res.text()
      const sitemaps = [...text.matchAll(/<loc>([^<]*recipe-sitemap[^<]*)<\/loc>/g)].map(m => m[1])
      const all = []
      for (const sm of sitemaps) {
        const r = await fetch(sm, { headers: HEADERS, signal: AbortSignal.timeout(10000) })
        const t = await r.text()
        const urls = [...t.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim()).filter(u => u.includes('/recipe/') && !u.endsWith('/recipe/'))
        all.push(...urls)
        if (all.length > LIMIT_PER_SITE * 2) break
      }
      return all
    },
  },
  heninthekitchen: {
    label: 'חן במטבח',
    getUrls: async () => {
      const res = await fetch('https://heninthekitchen.com/post-sitemap.xml', { headers: HEADERS, signal: AbortSignal.timeout(10000) })
      const text = await res.text()
      return [...text.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim()).filter(u => u.includes('heninthekitchen.com/'))
    },
  },
}

function findRecipe(data) {
  if (!data) return null
  if (Array.isArray(data)) { for (const i of data) { const f = findRecipe(i); if (f) return f } return null }
  if (data['@type'] === 'Recipe' || (Array.isArray(data['@type']) && data['@type'].includes('Recipe'))) return data
  if (data['@graph']) return findRecipe(data['@graph'])
  return null
}

function stripHtml(str) {
  return str.replace(/<[^>]*>/g, '').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&nbsp;/g,' ').replace(/&#8217;/g,"'").replace(/&#8211;/g,'–').replace(/&#[0-9]+;/g,'').trim()
}

function parseDuration(d) {
  if (!d) return 30
  const m = d.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
  return m ? (parseInt(m[1]||0)*60 + parseInt(m[2]||0)) || 30 : 30
}

function parseServings(r) {
  if (!r) return 4
  const s = Array.isArray(r) ? r[0] : String(r)
  const n = s.match(/\d+/)
  return n ? parseInt(n[0]) : 4
}

function extractImage(img) {
  if (!img) return ''
  if (typeof img === 'string') return img
  if (Array.isArray(img)) return extractImage(img[0])
  return img.url || img.contentUrl || ''
}

function parseIngredients(list) {
  if (!list) return []
  if (typeof list === 'string') list = list.split(/[;\n]+/).map(s=>s.trim()).filter(Boolean)
  if (!Array.isArray(list)) return []
  return list.map(item => ({ amount: null, unit: null, name: stripHtml(typeof item === 'string' ? item : item.name || item.text || '').trim() })).filter(i => i.name)
}

function parseInstructions(list) {
  if (!list) return []
  if (typeof list === 'string') return list.split(/\n+/).map(s=>stripHtml(s)).filter(Boolean)
  if (!Array.isArray(list)) return []
  return list.flatMap(item => {
    if (typeof item === 'string') return stripHtml(item) ? [stripHtml(item)] : []
    if (item['@type'] === 'HowToSection' && Array.isArray(item.itemListElement)) return parseInstructions(item.itemListElement)
    const t = stripHtml(item.text || item.name || '')
    return t ? [t] : []
  })
}

function mapCategory(cat, title) {
  const text = [Array.isArray(cat)?cat.join(' '):(cat||''), title||''].join(' ').toLowerCase()
  if (/קינוח|עוגה|עוגיות|מתוק|ממתק|שוקולד|גלידה|פנקייק|pancake|cake|dessert|cookie|sweet/.test(text)) return 'קינוחים'
  if (/סלט|salad/.test(text)) return 'סלטים'
  if (/מרק|תבשיל|soup|stew/.test(text)) return 'מרקים'
  if (/ארוחת בוקר|חביתה|breakfast|granola/.test(text)) return 'ארוחת בוקר'
  if (/עיקרית|צהריים|ערב|main|dinner|pasta|chicken|beef|fish|עוף|בשר|דג|שניצל|המבורגר/.test(text)) return 'עיקרית'
  return 'עיקרית'
}

function detectKosher(title) {
  const t = title
  if (/סלמון|טונה|הלוק|בקלה|מוסר ים|שרימפס|קלמרי|סרדין|ברמונדי|ברבוניות|פורל|דניס|לברק/.test(t)) return 'דגים'
  if (/ דג |^דג |דגים|דגי |פילה דג| בורי |^בורי /.test(t)) return 'דגים'
  if (/עוף|פרגית|שניצל|שווארמה|המבורגר|קציצ|סטייק|אסאדו|כבש|הודו|כנפיים|חזה עוף|ירך עוף|שוקי עוף|שוק עוף|בשר|בקר|קבב|כרעיים|נקניק|פסטרמה|סלמי|מרגז|סינטה|אנטריקוט|רולדת בשר|כבד עוף|אוסובוקו|צ'ולנט/.test(t)) return 'בשרי'
  if (/ טלה |כתף טלה|ירך טלה|צלעות טלה/.test(t)) return 'בשרי'
  if (/גבינה|גבינות|גבינת|שמנת|חמאה|מוצרלה|פרמזן|ריקוטה|קממבר|בולגרית|קוטג|לבנה|יוגורט|פיצה|לזניה|ריזוטו|בשמל|בוראטה|חלומי/.test(t)) return 'חלבי'
  return 'פרווה'
}

async function importRecipe(url, sourceName) {
  const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(12000) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const html = await res.text()

  const scriptPattern = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let match, recipe = null
  while ((match = scriptPattern.exec(html)) !== null) {
    try { const d = JSON.parse(match[1]); recipe = findRecipe(d); if (recipe) break } catch {}
  }
  if (!recipe) throw new Error('לא נמצא מתכון')

  const title = recipe.name || ''
  const category = mapCategory(recipe.recipeCategory, title)

  const { data: saved, error } = await supabase.from('recipes').insert({
    title,
    description: stripHtml(recipe.description || ''),
    image_url: extractImage(recipe.image),
    prep_time: parseDuration(recipe.totalTime || recipe.cookTime || recipe.prepTime),
    difficulty: 'בינוני',
    servings: parseServings(recipe.recipeYield),
    is_kosher: false,
    category,
    sub_category: '',
    kosher_type: detectKosher(title),
    source: sourceName,
    source_url: url,
    created_by: null,
  }).select().single()

  if (error) throw new Error(error.message)

  const ingredients = parseIngredients(recipe.recipeIngredient)
  if (ingredients.length) await supabase.from('ingredients').insert(ingredients.map(i => ({ ...i, recipe_id: saved.id })))
  const instructions = parseInstructions(recipe.recipeInstructions)
  if (instructions.length) await supabase.from('instructions').insert(instructions.map((t, i) => ({ description: t, step_number: i+1, recipe_id: saved.id })))

  return title
}

async function importSite(siteId, site) {
  console.log(`\n=== ${site.label} ===`)
  const allUrls = await site.getUrls()
  console.log(`נמצאו ${allUrls.length} כתובות`)

  const { data: existing } = await supabase.from('recipes').select('source_url').not('source_url', 'is', null)
  const existingSet = new Set((existing||[]).map(r => r.source_url))

  const newUrls = allUrls.filter(u => !existingSet.has(u)).slice(0, LIMIT_PER_SITE)
  console.log(`${newUrls.length} מתכונים חדשים לייבוא`)

  const sourceName = siteId === '10dakot' ? '10 דקות' : 'חן במטבח'
  let success = 0, failed = 0
  for (const url of newUrls) {
    try {
      const title = await importRecipe(url, sourceName)
      success++
      console.log(`✓ [${success+failed}/${newUrls.length}] ${title}`)
    } catch (err) {
      failed++
      console.log(`✗ [${success+failed}/${newUrls.length}] ${url.split('/').slice(-2,-1)[0]} — ${err.message}`)
    }
    await new Promise(r => setTimeout(r, 800))
  }
  console.log(`${site.label}: ${success} הצליחו, ${failed} נכשלו`)
}

for (const [id, site] of Object.entries(SITES)) {
  await importSite(id, site)
}
console.log('\nסיום כל האתרים!')

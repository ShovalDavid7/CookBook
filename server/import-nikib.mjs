import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://jrvioblxwgzivvytslct.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydmlvYmx4d2d6aXZ2eXRzbGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjM1MjQsImV4cCI6MjA5NjM5OTUyNH0.ZYTTy711BO3hymZqIGMG_8Rh_8s-DFHaTEMTtMRr9XE'
const LIMIT = 150

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'he,en;q=0.5',
}

async function getSitemapUrls(url) {
  const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(15000) })
  const text = await res.text()
  return [...text.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map(m => m[1].trim())
    .filter(u => u !== 'https://nikib.co.il/' && u.includes('/'))
}

function stripHtml(str) {
  return str
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ').replace(/&#8217;/g, "'").replace(/&#8211;/g, '–')
    .replace(/&#[0-9]+;/g, '').trim()
}

function mapCategory(url) {
  if (/cakes-dessert|cookie|sweet|brownie|dessert/.test(url)) return 'קינוחים'
  if (/salad/.test(url)) return 'סלטים'
  if (/soup|marak/.test(url)) return 'מרקים'
  if (/main-course|fish|chicken|meat|mince/.test(url)) return 'עיקרית'
  if (/pastry/.test(url)) return 'קינוחים'
  return 'עיקרית'
}

function detectKosher(title, category) {
  if (category !== 'עיקרית') return ''
  const t = title.toLowerCase()
  if (/דג|סלמון|טונה|פילה|הלוק|בקלה|מוסר ים/.test(t)) return 'דגים'
  if (/עוף|פרגית|שניצל|שווארמה|קציצ|סטייק|אסאדו|כבש|הודו|כנפיים|חזה|ירך|בשר/.test(t)) return 'בשרי'
  if (/פיצה|לזניה|ריזוטו|גבינה|שמנת|מוצרלה/.test(t)) return 'חלבי'
  return 'פרווה'
}

function parseNikibPage(html, url) {
  // Title
  const titleMatch = html.match(/<h1[^>]*class="entry-title"[^>]*>([\s\S]*?)<\/h1>/)
  const title = titleMatch ? stripHtml(titleMatch[1]).replace(/\n/g, ' ').trim() : ''
  if (!title) return null

  // Image
  const imageMatch = html.match(/property="og:image"\s+content="([^"]+)"/) ||
                     html.match(/content="([^"]+)"\s+property="og:image"/)
  const image_url = imageMatch ? imageMatch[1] : ''

  // Ingredients - inside <div id="ingredients">
  const ingDiv = html.match(/<div id="ingredients">([\s\S]*?)<div class="clearfix">/)
  let ingredients = []
  if (ingDiv) {
    const raw = stripHtml(ingDiv[1])
    ingredients = raw.split('\n')
      .map(l => l.replace(/^[-•*]\s*/, '').trim())
      .filter(l => l.length > 1 && !/^מרכיבים|^הכנות|^</.test(l))
      .map(name => ({ amount: null, unit: null, name }))
  }

  // Instructions - <p> tags after <h3 class="prp">
  const prepMatch = html.match(/<h3[^>]*class="prp"[^>]*>([\s\S]*?)(?=<div class="clearfix">|<div id="wpfp|<div class="related|$)/i)
  let instructions = []
  if (prepMatch) {
    const raw = prepMatch[1]
    const paragraphs = [...raw.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)]
    instructions = paragraphs
      .map(m => stripHtml(m[1]).replace(/\n/g, ' ').trim())
      .filter(t => t.length > 5 && !/<img/.test(t) && !/פייסבוק|אינסטגרם|לעדכונים/.test(t))
  }

  const category = mapCategory(url)

  return {
    title,
    image_url,
    ingredients,
    instructions,
    category,
    kosher_type: detectKosher(title, category),
  }
}

async function importRecipe(url) {
  const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(12000) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const html = await res.text()

  const parsed = parseNikibPage(html, url)
  if (!parsed) throw new Error('לא נמצא מתכון')
  if (!parsed.ingredients.length && !parsed.instructions.length) throw new Error('דף ריק')

  const { data: saved, error } = await supabase.from('recipes').insert({
    title: parsed.title,
    description: '',
    image_url: parsed.image_url,
    prep_time: 30,
    difficulty: 'בינוני',
    servings: 4,
    is_kosher: false,
    category: parsed.category,
    sub_category: '',
    kosher_type: parsed.kosher_type,
    source: 'ניקי ב',
    source_url: url,
    created_by: null,
  }).select().single()

  if (error) throw new Error(error.message)

  if (parsed.ingredients.length)
    await supabase.from('ingredients').insert(parsed.ingredients.map(i => ({ ...i, recipe_id: saved.id })))
  if (parsed.instructions.length)
    await supabase.from('instructions').insert(parsed.instructions.map((t, i) => ({ description: t, step_number: i + 1, recipe_id: saved.id })))

  return parsed.title
}

async function main() {
  console.log('מאחזר רשימת מתכונים מניקי ב...')
  const sitemaps = [
    'https://nikib.co.il/post-sitemap.xml',
    'https://nikib.co.il/post-sitemap2.xml',
    'https://nikib.co.il/post-sitemap3.xml',
  ]

  const allUrls = []
  for (const sm of sitemaps) {
    const urls = await getSitemapUrls(sm)
    allUrls.push(...urls)
    console.log(`  ${sm.split('/').pop()}: ${urls.length} כתובות`)
    if (allUrls.length >= LIMIT * 3) break
  }

  console.log(`\nסה"כ נמצאו ${allUrls.length} כתובות`)
  console.log('בודק אילו כבר קיימים במסד הנתונים...')

  const { data: existing } = await supabase.from('recipes').select('source_url').not('source_url', 'is', null)
  const existingSet = new Set((existing || []).map(r => r.source_url))

  const newUrls = allUrls.filter(u => !existingSet.has(u)).slice(0, LIMIT)
  console.log(`${newUrls.length} מתכונים חדשים לייבוא\n`)

  let success = 0, failed = 0
  for (const url of newUrls) {
    try {
      const title = await importRecipe(url)
      success++
      console.log(`✓ [${success + failed}/${newUrls.length}] ${title}`)
    } catch (err) {
      failed++
      console.log(`✗ [${success + failed}/${newUrls.length}] ${decodeURIComponent(url.split('/').slice(-2, -1)[0] || url)} — ${err.message}`)
    }
    await new Promise(r => setTimeout(r, 700))
  }

  console.log(`\nסיום! ${success} הצליחו, ${failed} נכשלו`)
}

main().catch(console.error)

const BLOG_SOURCES = [
  { match: '10dakot.co.il', name: '10 דקות' },
  { match: 'mako.co.il', name: 'מאקו' },
  { match: 'hashefhalavan', name: 'השף הלבן' },
  { match: 'chenbamitbach', name: 'חן במטבח' },
  { match: 'heninthekitchen', name: 'חן במטבח' },
  { match: 'foody.co.il', name: 'פודי' },
  { match: 'chef.co.il', name: 'שף' },
  { match: 'eatwell101', name: 'Eatwell101' },
  { match: 'allrecipes.com', name: 'AllRecipes' },
  { match: 'foodnetwork.com', name: 'Food Network' },
  { match: 'seriouseats.com', name: 'Serious Eats' },
  { match: 'smittenkitchen.com', name: 'Smitten Kitchen' },
  { match: 'bonappetit.com', name: 'Bon Appétit' },
  { match: 'maakol', name: 'מאכלים' },
  { match: 'ynet.co.il', name: 'Ynet' },
]

function detectSource(url) {
  try {
    const hostname = new URL(url).hostname.toLowerCase()
    const found = BLOG_SOURCES.find((b) => hostname.includes(b.match) || url.toLowerCase().includes(b.match))
    return found?.name || new URL(url).hostname.replace('www.', '')
  } catch {
    return ''
  }
}

// Fetch a recipe page and extract schema.org/Recipe structured data (JSON-LD)
export async function importFromUrl(req, res) {
  const { url } = req.body
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'נדרשת כתובת URL' })
  }

  let html
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'he,en;q=0.5',
      },
      signal: AbortSignal.timeout(10000),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    html = await response.text()
  } catch (err) {
    return res.status(502).json({ error: 'לא ניתן לטעון את הדף. בדקי שהכתובת נכונה.' })
  }

  // Extract all JSON-LD script blocks
  const scriptPattern = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let match
  let recipe = null

  while ((match = scriptPattern.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1])
      recipe = findRecipe(data)
      if (recipe) break
    } catch {
      // malformed JSON, skip
    }
  }

  if (!recipe) {
    return res.status(422).json({ error: 'לא נמצא מתכון בכתובת זו. האתר אולי לא תומך בפורמט הסטנדרטי.' })
  }

  res.json({ ...extractRecipe(recipe, html), source: detectSource(url), source_url: url })
}

// Recursively find a Recipe object inside JSON-LD (could be nested in @graph)
function findRecipe(data) {
  if (!data) return null
  if (Array.isArray(data)) {
    for (const item of data) {
      const found = findRecipe(item)
      if (found) return found
    }
    return null
  }
  const type = data['@type']
  if (type === 'Recipe') return data
  if (Array.isArray(type) && type.includes('Recipe')) return data
  if (data['@graph']) return findRecipe(data['@graph'])
  return null
}

const DISH_PATTERNS = [
  { pattern: /עוגת גבינה|cheesecake/, name: 'עוגת גבינה' },
  { pattern: /פנקייק|pancake/, name: 'פנקייקים' },
  { pattern: /וופל|waffle/, name: 'וופלים' },
  { pattern: /קרפ|crepe/, name: "קרפ'ים" },
  { pattern: /בראוניז|brownie/, name: 'בראוניז' },
  { pattern: /עוגיות|cookie/, name: 'עוגיות' },
  { pattern: /מאפין|muffin/, name: 'מאפינס' },
  { pattern: /סופגניה|donut|doughnut/, name: 'סופגניות' },
  { pattern: /טירמיסו|tiramisu/, name: 'טירמיסו' },
  { pattern: /עוגת שוקולד|chocolate cake/, name: 'עוגת שוקולד' },
  { pattern: /עוגת גזר|carrot cake/, name: 'עוגת גזר' },
  { pattern: /עוגת תפוחים|apple cake/, name: 'עוגת תפוחים' },
  { pattern: /עוגת לימון|lemon cake/, name: 'עוגת לימון' },
  { pattern: /ריזוטו|risotto/, name: 'ריזוטו' },
  { pattern: /לזניה|lasagna|lasagne/, name: 'לזניה' },
  { pattern: /ספגטי|spaghetti/, name: 'ספגטי' },
  { pattern: /פסטה|pasta|פנה|penne|ריגטוני|fettuccine/, name: 'פסטה' },
  { pattern: /פיצה|pizza/, name: 'פיצה' },
  { pattern: /שניצל|schnitzel/, name: 'שניצל' },
  { pattern: /המבורגר|burger/, name: 'המבורגר' },
  { pattern: /שווארמה|shawarma/, name: 'שווארמה' },
  { pattern: /פלאפל|falafel/, name: 'פלאפל' },
  { pattern: /סביח|sabich/, name: 'סביח' },
  { pattern: /שקשוקה|shakshuka/, name: 'שקשוקה' },
  { pattern: /חביתה|omelet|omelette/, name: 'חביתה' },
  { pattern: /קציצות|meatball/, name: 'קציצות' },
  { pattern: /חומוס|hummus/, name: 'חומוס' },
  { pattern: /גרנולה|granola/, name: 'גרנולה' },
  { pattern: /קארי|curry/, name: 'קארי' },
  { pattern: /מרק עוף|chicken soup/, name: 'מרק עוף' },
  { pattern: /מרק עגבניות|tomato soup/, name: 'מרק עגבניות' },
  { pattern: /מרק|soup|stew/, name: 'מרק' },
  { pattern: /סלמון|salmon/, name: 'סלמון' },
  { pattern: /טונה|tuna/, name: 'טונה' },
  { pattern: /דג|fish/, name: 'מנות דגים' },
  { pattern: /עוף|chicken|פרגית/, name: 'מנות עוף' },
  { pattern: /אסאדו|סטייק|steak/, name: 'סטייק' },
  { pattern: /בשר|beef/, name: 'מנות בשר' },
  { pattern: /סלט יווני|greek salad/, name: 'סלט יווני' },
  { pattern: /סלט קיסר|caesar/, name: 'סלט קיסר' },
  { pattern: /סלט|salad/, name: 'סלט' },
]

function detectDishType(title) {
  if (!title) return ''
  const t = title.toLowerCase()
  for (const dish of DISH_PATTERNS) {
    if (dish.pattern.test(t)) return dish.name
  }
  return ''
}

function isCleanSubCategory(sub) {
  if (!sub || sub.length > 40) return false
  if (sub.includes(',')) return false
  if (/מתכונים|recipes|recipe|אחרונים|חלביים|בשריים|לארוחת|להכין/i.test(sub)) return false
  return true
}

function detectKosherType(title, category) {
  if (category !== 'עיקרית') return ''
  const t = title.toLowerCase()
  if (/דג|סלמון|טונה|פילה|הלוק|בקלה|מוסר ים|שרימפס/i.test(t)) return 'דגים'
  if (/עוף|chicken|פרגית|שניצל|שווארמה|המבורגר|קציצ|סטייק|אסאדו|כבש|הודו|כנפיים|חזה|ירך|בשר|beef|lamb|turkey/i.test(t)) return 'בשרי'
  if (/פיצה|לזניה|ריזוטו|גבינה|שמנת|מוצרלה|פרמזן/i.test(t)) return 'חלבי'
  return 'פרווה'
}

function mapToAppCategory(recipeCategory, title) {
  const text = [
    ...(Array.isArray(recipeCategory) ? recipeCategory : [recipeCategory || '']),
    title || '',
  ].join(' ').toLowerCase()

  if (/dessert|cake|cookie|sweet|brownie|pastry|קינוח|עוגה|עוגיות|מתוק|ממתק|שוקולד|גלידה|פנקייק|pancake|waffle|מאפה/.test(text)) return 'קינוחים'
  if (/breakfast|brunch|ארוחת בוקר|בוקר|חביתה|omelet|omelette|granola|oatmeal|שיבולת/.test(text)) return 'ארוחת בוקר'
  if (/salad|סלט/.test(text)) return 'סלטים'
  if (/soup|stew|chowder|מרק|תבשיל/.test(text)) return 'מרקים'
  if (/main|dinner|lunch|entree|עיקרית|צהריים|ערב|פסטה|pasta|chicken|beef|fish|עוף|בשר|דג|שניצל|המבורגר/.test(text)) return 'עיקרית'
  return ''
}

function extractRecipe(r, html = '') {
  const rawCat = r.recipeCategory
  const schemaSubRaw = Array.isArray(rawCat) ? rawCat[0] : (typeof rawCat === 'string' ? rawCat : '')
  const schemaSubClean = stripHtml(schemaSubRaw)
  const subCategory = isCleanSubCategory(schemaSubClean)
    ? schemaSubClean
    : detectDishType(r.name || '')
  const category = mapToAppCategory(rawCat, r.name)
  const ingredients = parseIngredients(r.recipeIngredient)
  return {
    title: r.name || '',
    description: stripHtml(typeof r.description === 'string' ? r.description : ''),
    image_url: extractImage(r.image),
    prep_time: parseDurationMinutes(r.totalTime || r.cookTime || r.prepTime),
    servings: parseServings(r.recipeYield),
    category,
    sub_category: subCategory,
    kosher_type: detectKosherType(r.name || '', category),
    difficulty: '',
    is_kosher: false,
    ingredients: ingredients.length > 0 ? ingredients : extractIngredientsFromHtml(html),
    instructions: parseInstructions(r.recipeInstructions),
  }
}

function extractImage(image) {
  if (!image) return ''
  if (typeof image === 'string') return image
  if (Array.isArray(image)) return extractImage(image[0])
  if (typeof image === 'object') return image.url || image.contentUrl || ''
  return ''
}

// ISO 8601 duration → minutes  (PT1H30M → 90)
function parseDurationMinutes(duration) {
  if (!duration) return 30
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
  if (!match) return 30
  const hours = parseInt(match[1] || '0')
  const mins = parseInt(match[2] || '0')
  return hours * 60 + mins || 30
}

function parseServings(raw) {
  if (!raw) return 4
  const str = Array.isArray(raw) ? raw[0] : String(raw)
  const num = str.match(/\d+/)
  return num ? parseInt(num[0]) : 4
}

function parseIngredients(list) {
  if (!list) return []
  // Handle string — split by newline or semicolon
  if (typeof list === 'string') {
    list = list.split(/[;\n]+/).map(s => s.trim()).filter(Boolean)
  }
  if (!Array.isArray(list)) return []
  return list.map((item) => {
    const text = stripHtml(typeof item === 'string' ? item : item.name || item.text || '')
    const parts = text.trim().match(/^([\d¼-¾⅐-⅞\/\s]+)\s+(\S+)\s+(.+)$/)
    if (parts) {
      const amt = parts[1].trim()
      return { amount: isNaN(Number(amt)) ? null : Number(amt), unit: parts[2].trim(), name: parts[3].trim() }
    }
    return { amount: null, unit: null, name: text.trim() }
  }).filter((i) => i.name)
}

function extractIngredientsFromHtml(html) {
  // Look for <ul>/<ol> with class containing "ingredient" or "מצרכים"
  const containers = [
    /<(?:ul|ol)[^>]*class="[^"]*(?:ingredient|matzrkim|מצרכים)[^"]*"[^>]*>([\s\S]*?)<\/(?:ul|ol)>/gi,
    /<(?:ul|ol)[^>]*data-[^>]*ingredient[^>]*>([\s\S]*?)<\/(?:ul|ol)>/gi,
  ]
  for (const pattern of containers) {
    let m
    while ((m = pattern.exec(html)) !== null) {
      const items = [...m[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
      if (items.length >= 2) {
        return items.map(i => {
          const text = stripHtml(i[1]).trim()
          return text ? { amount: '', unit: '', name: text } : null
        }).filter(Boolean)
      }
    }
  }
  return []
}

function parseInstructions(list) {
  if (!list) return []
  if (typeof list === 'string') {
    return list.split(/\n+/).map((s) => stripHtml(s)).filter(Boolean)
  }
  if (!Array.isArray(list)) return []
  return list.flatMap((item) => {
    if (typeof item === 'string') return stripHtml(item) ? [stripHtml(item)] : []
    if (item['@type'] === 'HowToSection' && Array.isArray(item.itemListElement)) {
      return parseInstructions(item.itemListElement)
    }
    const text = stripHtml(item.text || item.name || '')
    return text ? [text] : []
  })
}

function stripHtml(str) {
  return str.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').trim()
}

// ── Batch import ──────────────────────────────────────────────
import { supabase } from '../supabase.js'

export async function batchImport(req, res) {
  const { urls, category } = req.body
  const userId = req.user?.id

  if (!Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: 'נדרשת רשימת כתובות' })
  }
  if (urls.length > 20) {
    return res.status(400).json({ error: 'מקסימום 20 כתובות בבת אחת' })
  }

  const results = await Promise.allSettled(
    urls.map((url) => importAndSave(url.trim(), category || '', userId))
  )

  const summary = results.map((r, i) => ({
    url: urls[i],
    status: r.status === 'fulfilled' ? 'success' : 'error',
    title: r.value?.title || null,
    error: r.reason?.message || null,
  }))

  res.json({ summary })
}

export async function importAndSave(url, category, userId) {
  // 1. Fetch & parse
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml',
    },
    signal: AbortSignal.timeout(12000),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const html = await response.text()

  const scriptPattern = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let match
  let recipe = null
  while ((match = scriptPattern.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1])
      recipe = findRecipe(data)
      if (recipe) break
    } catch {}
  }
  if (!recipe) throw new Error('לא נמצא מתכון בדף')

  const parsed = { ...extractRecipe(recipe, html), source: detectSource(url) }

  // 2. Save to DB
  const { data: saved, error } = await supabase
    .from('recipes')
    .insert({
      title: parsed.title,
      description: parsed.description,
      image_url: parsed.image_url,
      prep_time: parsed.prep_time,
      difficulty: parsed.difficulty || 'בינוני',
      servings: parsed.servings,
      is_kosher: false,
      category: category || parsed.category || '',
      sub_category: parsed.sub_category || '',
      kosher_type: parsed.kosher_type || '',
      source: parsed.source,
      source_url: url,
      created_by: userId,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  if (parsed.ingredients?.length) {
    await supabase.from('ingredients').insert(
      parsed.ingredients.map((ing) => ({ ...ing, recipe_id: saved.id }))
    )
  }
  if (parsed.instructions?.length) {
    await supabase.from('instructions').insert(
      parsed.instructions.map((text, i) => ({ description: text, step_number: i + 1, recipe_id: saved.id }))
    )
  }

  return saved
}

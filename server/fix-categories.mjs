import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  'https://jrvioblxwgzivvytslct.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydmlvYmx4d2d6aXZ2eXRzbGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjM1MjQsImV4cCI6MjA5NjM5OTUyNH0.ZYTTy711BO3hymZqIGMG_8Rh_8s-DFHaTEMTtMRr9XE'
)

// sub_categories שמעידות על קינוחים
const DESSERT_SUBS = new Set([
  'עוגיות', 'עוגת שוקולד', 'עוגת גבינה', 'עוגת קוקוס', 'עוגת בננות', 'עוגת תפוזים',
  'עוגת גזר', 'עוגת לימון', 'עוגת גלידה', 'בראוניז', 'פנקייקים', 'מאפינס', 'סופגניות',
  'טירמיסו', 'פבלובה', 'מוס', "קרפ'ים", 'וופלים', "עוגות ביסקוויטים", 'עוגות',
  'עוגות שמרים', 'עוגות שוקולד', 'קינוחים', 'קינוחי פרווה', 'קינוחים בכוסות',
  'קינוחים לפסח', 'עוגות לפסח', 'עוגות מוס', 'גלידות וארטיקים', 'מאפים מתוקים',
  'פאי וטארט (מתוקים)', 'רולדות', 'עוגת גן'
])

// sub_categories שמעידות על סלטים
const SALAD_SUBS = new Set([
  'סלטים', 'סלט יווני', 'סלט קיסר', 'סלט חצילים', 'סלט טונה', 'סלט כרוב',
  'טבולה', 'סלטים חמים', 'סלטים קרים'
])

// sub_categories שמעידות על מנות פתיחה
const STARTER_SUBS = new Set([])

function detectCategory(sub, kosherType, title) {
  if (DESSERT_SUBS.has(sub)) return 'קינוחים'
  if (SALAD_SUBS.has(sub)) return 'סלטים'
  if (STARTER_SUBS.has(sub)) return 'מנות פתיחה'
  // בשרי/חלבי/דגים → כמעט תמיד עיקרית
  if (kosherType && kosherType !== 'פרווה') return 'עיקרית'
  // פרווה עם מילות מפתח לקינוחים בכותרת
  if (/עוגה|עוגיות|קינוח|מאפינס|פנקייק|סופגנ|ברוניז|בראוני|טירמיסו|גלידה|מוס שוקו/.test(title)) return 'קינוחים'
  if (/סלט/.test(title)) return 'סלטים'
  return 'עיקרית'
}

async function main() {
  const { data: recipes } = await supabase
    .from('recipes')
    .select('id, title, category, sub_category, kosher_type')

  const toFix = recipes.filter(r =>
    !r.category || r.category === 'מרקים' || r.category === 'ארוחת בוקר'
  )

  console.log(`מתקן ${toFix.length} מתכונים\n`)

  let updated = 0
  const counts = {}

  for (const r of toFix) {
    const newCat = detectCategory(r.sub_category || '', r.kosher_type, r.title)
    await supabase.from('recipes').update({ category: newCat }).eq('id', r.id)
    counts[newCat] = (counts[newCat] || 0) + 1
    console.log(`✓ "${r.title.slice(0, 50)}" → ${newCat}`)
    updated++
  }

  console.log(`\nעודכנו ${updated}:`)
  Object.entries(counts).forEach(([k, v]) => console.log(`  ${k}: ${v}`))

  // ספירה סופית
  const { data: all } = await supabase.from('recipes').select('category')
  const final = {}
  for (const r of all) final[r.category || '(ריק)'] = (final[r.category || '(ריק)'] || 0) + 1
  console.log('\nחלוקה סופית:')
  Object.entries(final).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${k}: ${v}`))
}

main().catch(console.error)

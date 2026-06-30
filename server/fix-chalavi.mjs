import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  'https://jrvioblxwgzivvytslct.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydmlvYmx4d2d6aXZ2eXRzbGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjM1MjQsImV4cCI6MjA5NjM5OTUyNH0.ZYTTy711BO3hymZqIGMG_8Rh_8s-DFHaTEMTtMRr9XE'
)

// ── 1. תיקון קטגוריות: עוגות ומתוקים שנמצאים תחת עיקרית → קינוחים ──
const DESSERT_SUBS = new Set([
  'עוגת גבינה', 'עוגת שוקולד', 'עוגת גזר', 'עוגת לימון', 'עוגת תפוזים',
  'עוגת בננות', 'עוגת קוקוס', 'עוגת גלידה', 'בראוניז', 'עוגיות',
  'פנקייקים', 'וופלים', "קרפ'ים", 'מאפינס', 'סופגניות', 'טירמיסו',
  'פבלובה', 'מוס', 'עוגות ביסקוויטים', 'עוגות', 'קינוחים',
  'קינוחים בכוסות', 'פאי וטארט (מתוקים)', 'עוגת גן', 'גלידות וארטיקים',
  'רולדות', 'קינוחי פרווה', 'עוגות מוס', 'עוגות שוקולד', 'עוגות שמרים'
])

// ── 2. sub_categories חד-פעמיים שצריך להחליף ──
const SUB_FIXES = [
  // id → new_sub, new_category
  { title: 'בומב מרנג', new_sub: 'קינוחים', new_cat: 'קינוחים' },
  { title: 'חביתת נודלס', new_sub: 'ביצים', new_cat: null },
  { title: 'גבינת קממבר קריספית', new_sub: 'מנות פתיחה', new_cat: 'מנות פתיחה' },
  { title: 'מתכון לאבן יוגורט', new_sub: 'מנות חלביות', new_cat: null },
]

async function main() {
  const { data: recipes } = await supabase
    .from('recipes')
    .select('id, title, category, sub_category, kosher_type')
    .eq('kosher_type', 'חלבי')

  let updated = 0

  // תיקון 1: עוגות תחת עיקרית → קינוחים
  for (const r of recipes) {
    if (r.category === 'עיקרית' && DESSERT_SUBS.has(r.sub_category)) {
      await supabase.from('recipes').update({ category: 'קינוחים' }).eq('id', r.id)
      console.log(`✓ קטגוריה: "${r.title.slice(0,50)}"  עיקרית → קינוחים`)
      updated++
    }
  }

  // תיקון 2: sub_categories מוזרים
  for (const fix of SUB_FIXES) {
    const match = recipes.find(r => r.title.includes(fix.title))
    if (match) {
      const upd = { sub_category: fix.new_sub }
      if (fix.new_cat) upd.category = fix.new_cat
      await supabase.from('recipes').update(upd).eq('id', match.id)
      console.log(`✓ sub: "${match.title.slice(0,50)}"  ${match.sub_category} → ${fix.new_sub}`)
      updated++
    }
  }

  // תיקון 3: "מאפים מלוחים" → מאפים (יותר תמציתי)
  const r3 = await supabase.from('recipes')
    .update({ sub_category: 'מאפים' })
    .eq('kosher_type', 'חלבי')
    .eq('sub_category', 'מאפים מלוחים')
  console.log(`✓ מאפים מלוחים → מאפים`)

  console.log(`\nסה"כ עודכנו ${updated} מתכונים\n`)

  // סיכום חלוקה סופית
  const { data: final } = await supabase
    .from('recipes')
    .select('category, sub_category')
    .eq('kosher_type', 'חלבי')

  const byCat = {}
  for (const r of final) {
    const c = r.category || '(ריק)'
    if (!byCat[c]) byCat[c] = {}
    byCat[c][r.sub_category || '(ללא)'] = (byCat[c][r.sub_category || '(ללא)'] || 0) + 1
  }

  console.log('=== חלוקה סופית חלבי ===')
  for (const [cat, subs] of Object.entries(byCat)) {
    const total = Object.values(subs).reduce((a, b) => a + b, 0)
    console.log(`\n${cat} (${total}):`)
    Object.entries(subs).sort((a, b) => b[1] - a[1]).forEach(([s, c]) => console.log(`  ${s}: ${c}`))
  }
}

main().catch(console.error)

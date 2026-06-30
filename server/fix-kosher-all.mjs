import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jrvioblxwgzivvytslct.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydmlvYmx4d2d6aXZ2eXRzbGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjM1MjQsImV4cCI6MjA5NjM5OTUyNH0.ZYTTy711BO3hymZqIGMG_8Rh_8s-DFHaTEMTtMRr9XE'
)

function classifyText(t) {
  // דגים — לפני בשרי כדי ש"שניצל דגים"/"קציצות טונה" יסווגו נכון
  if (/סלמון|טונה|הלוק|בקלה|מוסר ים|שרימפס|קלמרי|סרדין|ברמונדי|ברבוניות|פורל|דניס|לברק/.test(t)) return 'דגים'
  if (/ דג |^דג |דגים|דגי |פילה דג| בורי |^בורי /.test(t)) return 'דגים'

  // בשרי
  // "נוטלה" מכיל "טלה" — לכן "טלה" חייב להיות עם רווח סביבו
  // "רולדת" לבד מופיע בקינוחים — לכן רק "רולדת בשר"
  if (/עוף|פרגיות|פרגית|שניצל|שווארמה|המבורגר|קציצ|סטייק|אסאדו|כבש|הודו|כנפיים|חזה עוף|ירך עוף|שוקי עוף|שוק עוף|בשר|בקר|קבב|כרעיים|נקניק|פסטרמה|סלמי|מרגז|סינטה|אנטריקוט|רולדת בשר|כבד עוף|אוסובוקו|צ'ולנט/.test(t)) return 'בשרי'
  if (/ טלה |כתף טלה|ירך טלה|צלעות טלה|צלי טלה/.test(t)) return 'בשרי'

  // חלבי
  if (/גבינה|גבינות|גבינת|מוצרלה|פרמזן|ריקוטה|קממבר|בולגרית|קוטג|לבנה|חלומי|בוראטה/.test(t)) return 'חלבי'
  if (/חמאה|שמנת|קצפת|יוגורט|פיצה|לזניה|בשמל|נוטלה|ריבת חלב/.test(t)) return 'חלבי'
  // "חלב" עלול להופיע כחלק מ"חלבי" — בודקים בגבול מילה
  if (/ חלב |^חלב | חלב$/.test(t)) return 'חלבי'

  return 'פרווה'
}

function detectKosher(title, ingredientsText) {
  // אם הכותרת מציינת "פרווה" במפורש — לוקחים ברצינות ולא מאפשרים לרכיבים לדרוס
  if (/ פרווה|^פרווה/.test(title)) return 'פרווה'

  // שלב 1: הכותרת קודמת תמיד — מונעת "ספרינג רול עוף" → דגים בגלל רוטב דגים ברכיבים
  const fromTitle = classifyText(title)
  if (fromTitle !== 'פרווה') return fromTitle

  // שלב 2: כותרת לא חד-משמעית — רכיבים משמשים גיבוי
  return classifyText(ingredientsText)
}

async function main() {
  const { data: recipes } = await supabase
    .from('recipes')
    .select('id, title, kosher_type')

  console.log(`נמצאו ${recipes.length} מתכונים\n`)

  const { data: ingredients } = await supabase
    .from('ingredients')
    .select('recipe_id, name')

  const ingMap = {}
  for (const ing of ingredients) {
    ingMap[ing.recipe_id] = (ingMap[ing.recipe_id] || '') + ' ' + ing.name
  }

  const stats = { updated: 0, unchanged: 0, byType: {} }

  for (const r of recipes) {
    const ingText = ingMap[r.id] || ''
    const newKosher = detectKosher(r.title, ingText)
    stats.byType[newKosher] = (stats.byType[newKosher] || 0) + 1

    if (newKosher !== r.kosher_type) {
      await supabase.from('recipes').update({ kosher_type: newKosher }).eq('id', r.id)
      console.log(`✓ "${r.title}"`)
      console.log(`  ${r.kosher_type || '(ריק)'} → ${newKosher}`)
      stats.updated++
    } else {
      stats.unchanged++
    }
  }

  console.log(`\n=== סיכום ===`)
  console.log(`עודכנו: ${stats.updated} | ללא שינוי: ${stats.unchanged}`)
  console.log(`\nחלוקה חדשה:`)
  Object.entries(stats.byType).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => console.log(`  ${k}: ${v}`))
}

main().catch(console.error)

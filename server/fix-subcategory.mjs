import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jrvioblxwgzivvytslct.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydmlvYmx4d2d6aXZ2eXRzbGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjM1MjQsImV4cCI6MjA5NjM5OTUyNH0.ZYTTy711BO3hymZqIGMG_8Rh_8s-DFHaTEMTtMRr9XE'
)

const DISH_PATTERNS = [
  // דגים — חייב לבוא ראשון כדי ש"קציצות טונה" לא יסווג כ"קציצות"
  { pattern: /סלמון/, name: 'סלמון' },
  { pattern: /טונה/, name: 'טונה' },
  { pattern: /ברבוניות/, name: 'ברבוניות' },
  { pattern: /דניס|לברק|בורי |אמנון|מוסר ים/, name: 'דגים שלמים' },
  // עוף
  { pattern: /פרגיות|פרגית/, name: 'פרגיות' },
  { pattern: /שניצל/, name: 'שניצל' },
  { pattern: /שווארמה/, name: 'שווארמה' },
  { pattern: /כנפיים|כנפי עוף/, name: 'כנפיים' },
  { pattern: /שוקי עוף|שוק עוף/, name: 'שוקי עוף' },
  { pattern: /חזה עוף|חזות עוף/, name: 'חזה עוף' },
  { pattern: /עוף שלם|עוף ממולא/, name: 'עוף שלם' },
  { pattern: /מרק עוף/, name: 'מרק עוף' },
  // בשר
  { pattern: /המבורגר|בורגר/, name: 'המבורגר' },
  { pattern: /קבב|קבאב/, name: 'קבב' },
  { pattern: /קציצ/, name: 'קציצות' },
  { pattern: /אסאדו/, name: 'אסאדו' },
  { pattern: /סטייק/, name: 'סטייק' },
  { pattern: /סינטה/, name: 'סינטה' },
  { pattern: /אנטריקוט/, name: 'אנטריקוט' },
  { pattern: /כבש| טלה |^טלה|כתף טלה|ירך טלה|צלעות טלה/, name: 'כבש וטלה' },
  { pattern: /בשר טחון|בשר מפורק/, name: 'בשר טחון' },
  { pattern: /נקניקיות|נקניק (?!שוקולד)/, name: 'נקניקיות' },
  // מנות
  { pattern: /פסטה|ספגטי|פנה|ריגטוני|טליאטלה/, name: 'פסטה' },
  { pattern: /פיצה/, name: 'פיצה' },
  { pattern: /לזניה/, name: 'לזניה' },
  { pattern: /ריזוטו/, name: 'ריזוטו' },
  { pattern: /שקשוקה/, name: 'שקשוקה' },
  { pattern: /פלאפל/, name: 'פלאפל' },
  { pattern: /חומוס/, name: 'חומוס' },
  { pattern: /סביח/, name: 'סביח' },
  { pattern: /אורז/, name: 'אורז' },
  { pattern: /קארי/, name: 'קארי' },
  { pattern: /תבשיל/, name: 'תבשיל' },
  // סלטים
  { pattern: /סלט יווני/, name: 'סלט יווני' },
  { pattern: /סלט קיסר/, name: 'סלט קיסר' },
  { pattern: /סלט חצילים/, name: 'סלט חצילים' },
  { pattern: /סלט טונה/, name: 'סלט טונה' },
  { pattern: /סלט כרוב/, name: 'סלט כרוב' },
  { pattern: /טבולה/, name: 'טבולה' },
  // מרקים
  { pattern: /מרק עגבניות/, name: 'מרק עגבניות' },
  { pattern: /מרק עדשים/, name: 'מרק עדשים' },
  { pattern: /מרק ירקות/, name: 'מרק ירקות' },
  { pattern: /מרק פטריות/, name: 'מרק פטריות' },
  // קינוחים
  { pattern: /עוגת גבינה|עוגת גבינ/, name: 'עוגת גבינה' },
  { pattern: /עוגת שוקולד/, name: 'עוגת שוקולד' },
  { pattern: /עוגת גזר/, name: 'עוגת גזר' },
  { pattern: /עוגת לימון/, name: 'עוגת לימון' },
  { pattern: /עוגת תפוזים/, name: 'עוגת תפוזים' },
  { pattern: /עוגת בננ/, name: 'עוגת בננות' },
  { pattern: /עוגת קוקוס/, name: 'עוגת קוקוס' },
  { pattern: /עוגת גלידה/, name: 'עוגת גלידה' },
  { pattern: /בראוניז|בראוני/, name: 'בראוניז' },
  { pattern: /עוגיות/, name: 'עוגיות' },
  { pattern: /פנקייק|פנקייקים/, name: 'פנקייקים' },
  { pattern: /וופל|וואפל/, name: 'וופלים' },
  { pattern: /קרפ/, name: "קרפ'ים" },
  { pattern: /מאפינס|מאפין/, name: 'מאפינס' },
  { pattern: /סופגניות|סופגניה|דונאטס/, name: 'סופגניות' },
  { pattern: /טירמיסו/, name: 'טירמיסו' },
  { pattern: /פבלובה/, name: 'פבלובה' },
  { pattern: /מוס שוקולד|מוס וניל/, name: 'מוס' },
  { pattern: /עוגת גן/, name: 'עוגת גן' },
  // מאפים
  { pattern: /בורקס/, name: 'בורקס' },
  { pattern: /פוקאצ|פוקאצ'ה/, name: "פוקאצ'ה" },
  { pattern: /לחמניות/, name: 'לחמניות' },
  { pattern: /בייגל/, name: 'בייגל' },
  { pattern: /חלה/, name: 'חלה' },
  { pattern: /פיתה/, name: 'פיתה' },
  { pattern: /קיש/, name: 'קיש' },
  { pattern: /פשטיד/, name: 'פשטידה' },
]

function detectSubCategory(title) {
  const t = title
  for (const { pattern, name } of DISH_PATTERNS) {
    if (pattern.test(t)) return name
  }
  return ''
}

// fallback כשאין זיהוי ספציפי — לפי סוג כשרות וקטגוריה
function fallbackSubCategory(kosherType, category) {
  if (category === 'קינוחים') return 'קינוחים'
  if (category === 'סלטים') return 'סלטים'
  if (category === 'מנות פתיחה') return 'מנות חלביות'
  if (kosherType === 'בשרי') return 'מנות בשר'
  if (kosherType === 'חלבי') return 'מנות חלביות'
  if (kosherType === 'דגים') return 'דגים'
  if (kosherType === 'פרווה') return 'מנות פרווה'
  return 'שונות'
}

async function main() {
  const { data: recipes } = await supabase
    .from('recipes')
    .select('id, title, sub_category, kosher_type, category')
  console.log(`נמצאו ${recipes.length} מתכונים\n`)

  const grouped = {}
  let updated = 0

  for (const r of recipes) {
    let newSub = detectSubCategory(r.title)
    // אם אין זיהוי ספציפי ואין sub_category — משתמשים ב-fallback
    if (!newSub && !r.sub_category) {
      newSub = fallbackSubCategory(r.kosher_type, r.category)
    }
    if (newSub && newSub !== r.sub_category) {
      await supabase.from('recipes').update({ sub_category: newSub }).eq('id', r.id)
      grouped[newSub] = (grouped[newSub] || 0) + 1
      updated++
    } else if (newSub || r.sub_category) {
      const key = newSub || r.sub_category
      grouped[key] = (grouped[key] || 0) + 1
    }
  }

  console.log('קיבוצים:')
  Object.entries(grouped).sort((a,b) => b[1]-a[1]).forEach(([name, count]) => {
    console.log(`  ${name}: ${count} מתכונים`)
  })
  console.log(`\nעודכנו ${updated} מתכונים`)
}

main().catch(console.error)

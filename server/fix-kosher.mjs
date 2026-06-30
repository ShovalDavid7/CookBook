import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jrvioblxwgzivvytslct.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydmlvYmx4d2d6aXZ2eXRzbGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjM1MjQsImV4cCI6MjA5NjM5OTUyNH0.ZYTTy711BO3hymZqIGMG_8Rh_8s-DFHaTEMTtMRr9XE'
)

function detectKosher(title) {
  const t = title
  // דגים — בדיקת מילים שלמות כדי למנוע "פאדג", "בוריק"
  if (/סלמון|טונה|הלוק|בקלה|מוסר ים|שרימפס|קלמרי|סרדין|ברמונדי|ברבוניות|פורל|דניס|לברק/.test(t)) return 'דגים'
  if (/ דג |^דג |דגים|דגי |פילה דג| בורי |^בורי /.test(t)) return 'דגים'
  // בשרי — הוצאת "נוטלה" (מכילה "טלה"), "בוריק" וכד'
  if (/עוף|פרגית|שניצל|שווארמה|המבורגר|קציצ|סטייק|אסאדו|כבש|הודו|כנפיים|חזה עוף|ירך עוף|שוקי עוף|שוק עוף|בשר|בקר|קבב|כרעיים|נקניק|פסטרמה|סלמי|מרגז|סינטה|אנטריקוט|רולדת בשר|כבד עוף|אוסובוקו|צ'ולנט/.test(t)) return 'בשרי'
  if (/ טלה |כתף טלה|ירך טלה|צלעות טלה/.test(t)) return 'בשרי'
  // חלבי
  if (/גבינה|גבינות|גבינת|שמנת|חמאה|מוצרלה|פרמזן|ריקוטה|קממבר|בולגרית|קוטג|לבנה|יוגורט|פיצה|לזניה|ריזוטו|בשמל|בוראטה|חלומי/.test(t)) return 'חלבי'
  return 'פרווה'
}

async function main() {
  const { data: recipes } = await supabase
    .from('recipes')
    .select('id, title, kosher_type, source')
    .in('source', ['פודי', 'ניקי ב', '10 דקות', 'חן במטבח'])

  console.log(`נמצאו ${recipes.length} מתכונים מפודי וניקי ב\n`)

  let updated = 0
  for (const r of recipes) {
    const newKosher = detectKosher(r.title)
    if (newKosher !== r.kosher_type) {
      await supabase.from('recipes').update({ kosher_type: newKosher }).eq('id', r.id)
      console.log(`✓ "${r.title}" → ${newKosher} (היה: ${r.kosher_type || 'ריק'})`)
      updated++
    }
  }

  console.log(`\nסיום! עודכנו ${updated} מתכונים`)
}

main().catch(console.error)

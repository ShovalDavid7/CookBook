import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  'https://jrvioblxwgzivvytslct.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydmlvYmx4d2d6aXZ2eXRzbGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjM1MjQsImV4cCI6MjA5NjM5OTUyNH0.ZYTTy711BO3hymZqIGMG_8Rh_8s-DFHaTEMTtMRr9XE'
)

// מצא את כל המתכונים בקינוחים שנראים כמו מנות עיקריות
const { data } = await supabase
  .from('recipes')
  .select('id, title, sub_category, kosher_type, category')
  .eq('category', 'קינוחים')

const SAVORY_SUBS = new Set([
  'כנפיים', 'פרגיות', 'חזה עוף', 'שניצל', 'שוקי עוף', 'עוף שלם', 'שווארמה',
  'המבורגר', 'קבב', 'אסאדו', 'סינטה', 'בשר בקר', 'בשר טחון', 'נקניקיות',
  'כבש וטלה', 'עוף', 'מרק עוף',
  'טונה', 'סלמון', 'ברבוניות', 'דגים שלמים',
  'בורקס', 'פיצה', 'לזניה', 'קיש', 'פשטידה', 'פסטה',
  'מנות חלביות', 'מנות בשר', 'מאפים'
])

const SAVORY_KEYWORDS = /כנפיים|פרגי|שניצל|שווארמה|המבורגר|קבב|אסאדו|בורקס|טונה|סלמון|בשר|עוף|קיש|פיצה|פסטה/

let fixed = 0
for (const r of data) {
  const isSavory = SAVORY_SUBS.has(r.sub_category) || SAVORY_KEYWORDS.test(r.title)
  if (isSavory) {
    await supabase.from('recipes').update({ category: 'עיקרית' }).eq('id', r.id)
    console.log(`✓ "${r.title}" (${r.sub_category}) → עיקרית`)
    fixed++
  }
}

console.log(`\nתוקנו ${fixed} מתכונים`)

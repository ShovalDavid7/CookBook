import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  'https://jrvioblxwgzivvytslct.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydmlvYmx4d2d6aXZ2eXRzbGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjM1MjQsImV4cCI6MjA5NjM5OTUyNH0.ZYTTy711BO3hymZqIGMG_8Rh_8s-DFHaTEMTtMRr9XE'
)

async function update(filter, data, label) {
  const q = supabase.from('recipes').update(data)
  for (const [k, v] of Object.entries(filter)) q.eq(k, v)
  const { error } = await q
  console.log(error ? `✗ ${label}: ${error.message}` : `✓ ${label}`)
}

async function updateTitle(titlePart, data) {
  const { data: rows } = await supabase.from('recipes').select('id, title').ilike('title', `%${titlePart}%`)
  for (const r of rows) {
    await supabase.from('recipes').update(data).eq('id', r.id)
    console.log(`  ✓ "${r.title.slice(0, 60)}"`)
  }
  return rows.length
}

console.log('\n=== תיקון קרפ ===')
// קרפ אוריאו נמצא בטעות ב-עוגיות
await updateTitle('קרפ אורי', { sub_category: "קרפ'ים" })
// כוסות פילו וטורט וניל לא קרפים
await updateTitle('כוסות פילו', { sub_category: 'קינוחים' })
await updateTitle('טורט וניל', { sub_category: 'עוגות' })

console.log('\n=== איחוד עוגות בסוגים ===')
// עוגת קוקוס, גזר, בננות, תפוזים, לימון → עוגות
await update({ category: 'קינוחים', sub_category: 'עוגת קוקוס' }, { sub_category: 'עוגות' }, 'עוגת קוקוס → עוגות')
await update({ category: 'קינוחים', sub_category: 'עוגת גזר' }, { sub_category: 'עוגות' }, 'עוגת גזר → עוגות')
await update({ category: 'קינוחים', sub_category: 'עוגת בננות' }, { sub_category: 'עוגות' }, 'עוגת בננות → עוגות')
await update({ category: 'קינוחים', sub_category: 'עוגת תפוזים' }, { sub_category: 'עוגות' }, 'עוגת תפוזים → עוגות')
await update({ category: 'קינוחים', sub_category: 'עוגת לימון' }, { sub_category: 'עוגות' }, 'עוגת לימון → עוגות')
// עוגות שוקולד (הקבוצה הקטנה) → עוגת שוקולד
await update({ category: 'קינוחים', sub_category: 'עוגות שוקולד' }, { sub_category: 'עוגת שוקולד' }, 'עוגות שוקולד → עוגת שוקולד')
// עוגות מוס → מוס
await update({ category: 'קינוחים', sub_category: 'עוגות מוס' }, { sub_category: 'מוס' }, 'עוגות מוס → מוס')
// עוגת גלידה + גלידות → גלידות
await update({ category: 'קינוחים', sub_category: 'עוגת גלידה' }, { sub_category: 'גלידות' }, 'עוגת גלידה → גלידות')
await update({ category: 'קינוחים', sub_category: 'גלידות וארטיקים' }, { sub_category: 'גלידות' }, 'גלידות וארטיקים → גלידות')

console.log('\n=== איחוד קטגוריות קטנות ===')
// קינוחי פרווה, קינוחים בכוסות, קינוחים לפסח → קינוחים
await update({ category: 'קינוחים', sub_category: 'קינוחי פרווה' }, { sub_category: 'קינוחים' }, 'קינוחי פרווה → קינוחים')
await update({ category: 'קינוחים', sub_category: 'קינוחים בכוסות' }, { sub_category: 'קינוחים' }, 'קינוחים בכוסות → קינוחים')
await update({ category: 'קינוחים', sub_category: 'קינוחים לפסח' }, { sub_category: 'קינוחים' }, 'קינוחים לפסח → קינוחים')
await update({ category: 'קינוחים', sub_category: 'עוגות לפסח' }, { sub_category: 'עוגות' }, 'עוגות לפסח → עוגות')
// בלינצ'ס → פנקייקים
await update({ category: 'קינוחים', sub_category: "בלינצ'ס ופנקייקים" }, { sub_category: 'פנקייקים' }, "בלינצ'ס → פנקייקים")
// מאפים מתוקים → מאפינס
await update({ category: 'קינוחים', sub_category: 'מאפים מתוקים' }, { sub_category: 'מאפינס' }, 'מאפים מתוקים → מאפינס')
// חלה, בייגל (מתוק) → עוגות שמרים
await update({ category: 'קינוחים', sub_category: 'חלה' }, { sub_category: 'עוגות שמרים' }, 'חלה → עוגות שמרים')
await update({ category: 'קינוחים', sub_category: 'בייגל' }, { sub_category: 'עוגות שמרים' }, 'בייגל → עוגות שמרים')
// אורז (חטיפי אורז) → קינוחים
await update({ category: 'קינוחים', sub_category: 'אורז' }, { sub_category: 'קינוחים' }, 'אורז (חטיפי) → קינוחים')
// טירמיסו → קינוחים
await update({ category: 'קינוחים', sub_category: 'טירמיסו' }, { sub_category: 'קינוחים' }, 'טירמיסו → קינוחים')
// עוגיות מלוחות (קרקר) → עיקרית
await update({ category: 'קינוחים', sub_category: 'עוגיות מלוחות' }, { sub_category: 'קינוחים', category: 'עיקרית' }, 'עוגיות מלוחות → עיקרית')

console.log('\n=== עוגיות שבטעות ב-קינוחים ===')
// מתכוני עוגיות שקיבלו sub=קינוחים — להחזיר לעוגיות
const cookieKeywords = ['עוגיות', 'ביסקוויט', 'רוזלך', 'רוגעלך', 'מגולגלות', 'כפתורי', 'אצבעות', 'קאפקייקס']
const { data: catchAll } = await supabase.from('recipes').select('id, title').eq('category', 'קינוחים').eq('sub_category', 'קינוחים')
let movedToCookies = 0
for (const r of catchAll) {
  if (cookieKeywords.some(kw => r.title.includes(kw))) {
    await supabase.from('recipes').update({ sub_category: 'עוגיות' }).eq('id', r.id)
    console.log(`  ✓ עוגיה: "${r.title.slice(0, 60)}"`)
    movedToCookies++
  }
}
console.log(`  הועברו ${movedToCookies} מתכונים לעוגיות`)

// סיכום
console.log('\n=== קינוחים אחרי תיקון ===')
const { data: final } = await supabase.from('recipes').select('sub_category').eq('category', 'קינוחים')
const c = {}
for (const r of final) c[r.sub_category] = (c[r.sub_category] || 0) + 1
Object.entries(c).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${k}: ${v}`))
console.log(`סה"כ: ${final.length}`)

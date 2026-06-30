import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  'https://jrvioblxwgzivvytslct.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydmlvYmx4d2d6aXZ2eXRzbGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjM1MjQsImV4cCI6MjA5NjM5OTUyNH0.ZYTTy711BO3hymZqIGMG_8Rh_8s-DFHaTEMTtMRr9XE'
)

const ops = [
  // בשריים שנפלו בטעות לפרווה
  { filter: { title: 'עראייס טורטיה' },      update: { kosher_type: 'בשרי', sub_category: 'בשר' } },
  { filter: { title: 'פיתה סמאש בורגר' },    update: { kosher_type: 'בשרי', sub_category: 'המבורגר' } },
  { filter: { title: 'כבד קצוץ' },           update: { kosher_type: 'בשרי', sub_category: 'כבד קצוץ' } },
  { filter: { title: 'מתכון לזרוע' },         update: { kosher_type: 'בשרי', sub_category: 'בשר בקר' } },
  // דגים
  { filter: { title: 'פילה אמנון' },          update: { kosher_type: 'דגים', sub_category: 'דגים שלמים' } },
  // קינוחים
  { filter: { title: 'טירמיסו מתכון' },       update: { category: 'קינוחים' } },
  { filter: { title: 'סופגניות מהירות' },     update: { category: 'קינוחים' } },
  { filter: { title: 'לפתן פירות' },          update: { category: 'קינוחים' } },
  { filter: { title: 'חיתוכיות ריבה' },       update: { category: 'קינוחים' } },
  { filter: { title: 'בומוואלוס' },           update: { category: 'קינוחים' } },
  { filter: { title: 'מילוי קינמון' },        update: { category: 'קינוחים' } },
  { filter: { title: 'מילוי קקאו' },          update: { category: 'קינוחים' } },
  // מאפים
  { filter: { title: 'פריקסה' },             update: { sub_category: 'מאפים' } },
  { filter: { title: 'פיתות במחבת' },         update: { sub_category: 'מאפים' } },
  { filter: { title: 'פיתות ביתיות' },        update: { sub_category: 'מאפים' } },
  { filter: { title: 'לאפות במחבת' },         update: { sub_category: 'מאפים' } },
  { filter: { title: 'מתכון לפוקצ' },         update: { sub_category: 'מאפים' } },
  { filter: { title: 'קרקרים גרעינים' },      update: { sub_category: 'מאפים' } },
  { filter: { title: 'חצ\'פורי' },            update: { sub_category: 'מאפים' } },
  { filter: { title: 'סמבוסק מלוואח' },       update: { sub_category: 'מאפים' } },
  { filter: { title: 'טוסט מלוואח' },         update: { sub_category: 'מאפים' } },
  { filter: { title: 'ריבועי בצק עלים' },     update: { sub_category: 'מאפים' } },
  { filter: { title: 'אזני המן מלוחות' },     update: { sub_category: 'מאפים' } },
  { filter: { title: 'לחמים' },               update: { sub_category: 'מאפים' } },
  // מרקים
  { filter: { title: 'מרק לובייה' },          update: { sub_category: 'מרקים' } },
  { filter: { title: 'מרק דלעת' },            update: { sub_category: 'מרקים' } },
  { filter: { title: 'מרק תירס ואיטריות' },   update: { sub_category: 'מרקים' } },
  { filter: { title: 'מרק שעועית' },          update: { sub_category: 'מרקים' } },
  { filter: { title: 'מרק ירקות' },           update: { sub_category: 'מרקים' } },
  { filter: { title: 'מרק עדשים' },           update: { sub_category: 'מרקים' } },
  // פסטה
  { filter: { title: 'בולונז' },              update: { sub_category: 'פסטה' } },
  { filter: { title: 'אטריות דקות מבושלות' }, update: { sub_category: 'פסטה' } },
  { filter: { title: 'רוטב רוזה' },           update: { sub_category: 'פסטה' } },
  // מנות פתיחה
  { filter: { title: 'שקדים מתובלים' },       update: { sub_category: 'מנות פתיחה' } },
  { filter: { title: 'שום אפוי' },            update: { sub_category: 'מנות פתיחה' } },
  { filter: { title: 'פופקורן ביתי' },        update: { sub_category: 'מנות פתיחה' } },
]

for (const op of ops) {
  const q = supabase.from('recipes').update(op.update).eq('kosher_type','פרווה')
  const [key, val] = Object.entries(op.filter)[0]
  const { error } = await q.ilike('title', `%${val}%`)
  console.log(error ? `✗ ${val}: ${error.message}` : `✓ ${val}`)
}

// מחיקת מצה (פסח)
const toDelete = ['בצקניות מטוגנות מקמח מצה','פרנץ טוסט ממצה','טוסט מצה מטוגן','חביתת מצה','מצה בריי']
for (const t of toDelete) {
  const { error } = await supabase.from('recipes').delete().ilike('title',`%${t}%`)
  console.log(error ? `✗ מחיקה ${t}` : `✓ נמחק: ${t}`)
}

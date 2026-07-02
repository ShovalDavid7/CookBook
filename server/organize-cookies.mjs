import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  'https://jrvioblxwgzivvytslct.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydmlvYmx4d2d6aXZ2eXRzbGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjM1MjQsImV4cCI6MjA5NjM5OTUyNH0.ZYTTy711BO3hymZqIGMG_8Rh_8s-DFHaTEMTtMRr9XE'
)

const ops = [
  { sub: 'עוגיות שוקולד ציפס', filter: "title.ilike.%שוקולד ציפס%,title.ilike.%שוקולד צ'יפס%" },
  { sub: 'עוגיות תמרים',       filter: 'title.ilike.%תמרים%,title.ilike.%מקרוד%' },
  { sub: 'עוגיות שוקולד',      filter: 'title.ilike.%שוקולד%,title.ilike.%נוטלה%,title.ilike.%שחור לבן%' },
  { sub: 'עוגיות חמאה',        filter: 'title.ilike.%חמאה%,title.ilike.%בצק פריך%,title.ilike.%חותכנים%,title.ilike.%שושנים%,title.ilike.%פרח ריבה%,title.ilike.%אלפחורס%,title.ilike.%אמסטרדם%' },
  { sub: 'עוגיות קוקוס',       filter: 'title.ilike.%קוקוס%' },
  { sub: 'עוגיות שקדים ואגוזים', filter: 'title.ilike.%שקדים%,title.ilike.%אגוז%,title.ilike.%בוטנים%,title.ilike.%לוז%' },
]

for (const op of ops) {
  const { data, error } = await supabase.from('recipes')
    .update({ sub_category: op.sub })
    .eq('sub_category', 'עוגיות')
    .or(op.filter)
    .select('title')
  if (error) console.log('x ' + op.sub + ': ' + error.message)
  else console.log(op.sub + ': ' + data?.length + ' | ' + data?.map(r => r.title).join(', '))
}

// כל השאר -> עוגיות נוספות
const { data: rest } = await supabase.from('recipes')
  .update({ sub_category: 'עוגיות נוספות' })
  .eq('sub_category', 'עוגיות')
  .select('title')
console.log('עוגיות נוספות: ' + rest?.length + ' | ' + rest?.map(r => r.title).join(', '))

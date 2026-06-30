import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  'https://jrvioblxwgzivvytslct.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydmlvYmx4d2d6aXZ2eXRzbGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjM1MjQsImV4cCI6MjA5NjM5OTUyNH0.ZYTTy711BO3hymZqIGMG_8Rh_8s-DFHaTEMTtMRr9XE'
)

// תקן sub_category לפי category שכבר שונה
const { data: e1 } = await supabase.from('recipes').update({ sub_category: 'עוגות' })
  .eq('sub_category', 'מנות פרווה').eq('category', 'קינוחים')
  .select('title')
console.log(`✓ עוגות/קינוחים: ${e1?.length} מתכונים`)

const { data: e2 } = await supabase.from('recipes').update({ sub_category: 'מנות פתיחה' })
  .eq('sub_category', 'מנות פרווה').eq('category', 'מנות פתיחה')
  .select('title')
console.log(`✓ מנות פתיחה: ${e2?.length} מתכונים`)

const { data: e3 } = await supabase.from('recipes').update({ sub_category: 'סלטים' })
  .eq('sub_category', 'מנות פרווה').eq('category', 'סלטים')
  .select('title')
console.log(`✓ סלטים: ${e3?.length} מתכונים`)

// מה שנשאר בעיקרית/פרווה עם מנות פרווה - לתבשיל
const { data: e4 } = await supabase.from('recipes').update({ sub_category: 'תבשיל' })
  .eq('sub_category', 'מנות פרווה').eq('category', 'עיקרית').eq('kosher_type', 'פרווה')
  .select('title')
console.log(`✓ תבשיל: ${e4?.length} מתכונים`)
e4?.forEach(r => console.log('  - ' + r.title))

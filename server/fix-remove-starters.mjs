import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  'https://jrvioblxwgzivvytslct.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydmlvYmx4d2d6aXZ2eXRzbGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjM1MjQsImV4cCI6MjA5NjM5OTUyNH0.ZYTTy711BO3hymZqIGMG_8Rh_8s-DFHaTEMTtMRr9XE'
)

const { data } = await supabase.from('recipes').select('id, title').eq('category', 'מנות פתיחה')
console.log('מעביר לעיקרית:')
for (const r of data) {
  await supabase.from('recipes').update({ category: 'עיקרית' }).eq('id', r.id)
  console.log(`  ✓ ${r.title}`)
}
console.log(`סה"כ: ${data.length}`)

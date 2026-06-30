import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  'https://jrvioblxwgzivvytslct.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydmlvYmx4d2d6aXZ2eXRzbGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjM1MjQsImV4cCI6MjA5NjM5OTUyNH0.ZYTTy711BO3hymZqIGMG_8Rh_8s-DFHaTEMTtMRr9XE'
)

const { data } = await supabase
  .from('recipes')
  .select('kosher_type, sub_category')
  .eq('category', 'עיקרית')

const byKosher = {}
for (const r of data) {
  const k = r.kosher_type || '(ללא)'
  byKosher[k] = (byKosher[k] || 0) + 1
}

console.log('עיקרית לפי kosher_type:')
Object.entries(byKosher).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => console.log(`  ${k}: ${v}`))

const { data: pasta } = await supabase
  .from('recipes')
  .select('title, kosher_type, category, sub_category')
  .ilike('title', '%פסטה%')

console.log(`\nפסטה (${pasta.length}):`)
pasta.forEach(r => console.log(`  [${r.kosher_type}/${r.category}] ${r.title} — sub:${r.sub_category}`))

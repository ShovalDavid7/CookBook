import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  'https://jrvioblxwgzivvytslct.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydmlvYmx4d2d6aXZ2eXRzbGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjM1MjQsImV4cCI6MjA5NjM5OTUyNH0.ZYTTy711BO3hymZqIGMG_8Rh_8s-DFHaTEMTtMRr9XE'
)

const { data } = await supabase
  .from('recipes')
  .select('id, title, category, kosher_type, sub_category')

const VALID_CATS = new Set(['עיקרית', 'קינוחים', 'סלטים'])

const missing = data.filter(r => !r.category || !VALID_CATS.has(r.category))

const counts = {}
for (const r of missing) {
  const k = r.category || '(ללא קטגוריה)'
  counts[k] = (counts[k] || 0) + 1
}

console.log(`סה"כ מתכונים: ${data.length}`)
console.log(`ללא קטגוריה תקינה: ${missing.length}\n`)

Object.entries(counts).sort((a,b) => b[1]-a[1])
  .forEach(([k,v]) => console.log(`  "${k}": ${v}`))

if (missing.length > 0 && missing.length <= 20) {
  console.log('\nפירוט:')
  missing.forEach(r => console.log(`  [${r.category || 'ריק'}] ${r.title} | ${r.kosher_type} | ${r.sub_category}`))
}

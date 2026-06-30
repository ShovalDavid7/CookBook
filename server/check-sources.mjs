import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  'https://jrvioblxwgzivvytslct.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydmlvYmx4d2d6aXZ2eXRzbGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjM1MjQsImV4cCI6MjA5NjM5OTUyNH0.ZYTTy711BO3hymZqIGMG_8Rh_8s-DFHaTEMTtMRr9XE'
)

const { data } = await supabase.from('recipes').select('source, kosher_type')

const bySource = {}
for (const r of data) {
  const s = r.source || '(ללא)'
  if (!bySource[s]) bySource[s] = { total: 0, בשרי: 0, חלבי: 0, דגים: 0, פרווה: 0 }
  bySource[s].total++
  if (r.kosher_type) bySource[s][r.kosher_type] = (bySource[s][r.kosher_type] || 0) + 1
}

console.log('לפי מקור:')
for (const [src, c] of Object.entries(bySource).sort((a, b) => b[1].total - a[1].total)) {
  console.log(`\n${src} (${c.total}):`)
  console.log(`  בשרי: ${c.בשרי || 0}  חלבי: ${c.חלבי || 0}  דגים: ${c.דגים || 0}  פרווה: ${c.פרווה || 0}`)
}
console.log(`\nסה"כ: ${data.length}`)

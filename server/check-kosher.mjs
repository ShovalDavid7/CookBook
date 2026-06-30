import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jrvioblxwgzivvytslct.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydmlvYmx4d2d6aXZ2eXRzbGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjM1MjQsImV4cCI6MjA5NjM5OTUyNH0.ZYTTy711BO3hymZqIGMG_8Rh_8s-DFHaTEMTtMRr9XE'
)

const { data } = await supabase.from('recipes').select('kosher_type, source')

const byKosher = {}
const bySource = {}
for (const r of data) {
  const k = r.kosher_type || '(ריק)'
  byKosher[k] = (byKosher[k] || 0) + 1
  bySource[r.source] = (bySource[r.source] || 0) + 1
}

console.log('לפי כשרות:')
Object.entries(byKosher).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => console.log(`  ${k}: ${v}`))
console.log(`\nסה"כ: ${data.length}`)
console.log('\nלפי מקור:')
Object.entries(bySource).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => console.log(`  ${k}: ${v}`))

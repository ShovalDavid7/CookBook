import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  'https://jrvioblxwgzivvytslct.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydmlvYmx4d2d6aXZ2eXRzbGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjM1MjQsImV4cCI6MjA5NjM5OTUyNH0.ZYTTy711BO3hymZqIGMG_8Rh_8s-DFHaTEMTtMRr9XE'
)

const { data } = await supabase
  .from('recipes')
  .select('id, title, sub_category')
  .eq('category', 'קינוחים')
  .order('sub_category')

const bySub = {}
for (const r of data) {
  const s = r.sub_category || '(ללא)'
  if (!bySub[s]) bySub[s] = []
  bySub[s].push(r.title)
}

console.log(`סה"כ קינוחים: ${data.length}\n`)
Object.entries(bySub).sort((a, b) => b[1].length - a[1].length).forEach(([sub, titles]) => {
  console.log(`${sub} (${titles.length}):`)
  titles.forEach(t => console.log(`  - ${t.slice(0, 65)}`))
})

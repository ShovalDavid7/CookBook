import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  'https://jrvioblxwgzivvytslct.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydmlvYmx4d2d6aXZ2eXRzbGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjM1MjQsImV4cCI6MjA5NjM5OTUyNH0.ZYTTy711BO3hymZqIGMG_8Rh_8s-DFHaTEMTtMRr9XE'
)

// קציצות עוף → עוף
await supabase.from('recipes').update({ sub_category: 'עוף' })
  .eq('kosher_type', 'בשרי').eq('sub_category', 'קציצות').ilike('title', '%עוף%')

// קציצות בשר → בשר בקר
await supabase.from('recipes').update({ sub_category: 'בשר בקר' })
  .eq('kosher_type', 'בשרי').eq('sub_category', 'קציצות').ilike('title', '%בשר%')

// תבשיל עוף → עוף
await supabase.from('recipes').update({ sub_category: 'עוף' })
  .eq('kosher_type', 'בשרי').eq('sub_category', 'תבשיל').ilike('title', '%עוף%')

// תבשיל בשר → בשר בקר
await supabase.from('recipes').update({ sub_category: 'בשר בקר' })
  .eq('kosher_type', 'בשרי').eq('sub_category', 'תבשיל').ilike('title', '%בשר%')

// קינוחים שנפלו בטעות לבשרי → תקן קטגוריה
await supabase.from('recipes').update({ category: 'קינוחים' })
  .eq('kosher_type', 'בשרי').eq('sub_category', 'קינוחים')

// סיכום בשרי
const { data: basari } = await supabase.from('recipes').select('sub_category').eq('kosher_type', 'בשרי')
const c = {}
for (const r of basari) c[r.sub_category] = (c[r.sub_category] || 0) + 1
console.log('=== בשרי סופי ===')
Object.entries(c).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${k}: ${v}`))
console.log(`סה"כ: ${basari.length}`)

// סיכום כולל
const { data: all } = await supabase.from('recipes').select('category, kosher_type')
const total = { category: {}, kosher: {} }
for (const r of all) {
  total.category[r.category || '(ריק)'] = (total.category[r.category || '(ריק)'] || 0) + 1
  total.kosher[r.kosher_type || '(ריק)'] = (total.kosher[r.kosher_type || '(ריק)'] || 0) + 1
}
console.log('\n=== סה"כ כל המתכונים ===')
Object.entries(total.category).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${k}: ${v}`))
console.log('\nלפי כשרות:')
Object.entries(total.kosher).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${k}: ${v}`))
console.log(`\nסה"כ מתכונים: ${all.length}`)

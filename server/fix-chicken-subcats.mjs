import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  'https://jrvioblxwgzivvytslct.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydmlvYmx4d2d6aXZ2eXRzbGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjM1MjQsImV4cCI6MjA5NjM5OTUyNH0.ZYTTy711BO3hymZqIGMG_8Rh_8s-DFHaTEMTtMRr9XE'
)

// כללי מיון לפי כותרת
const RULES = [
  { pattern: /כרעיים|שוק עוף|שוקי עוף|ירך עוף/, sub: 'שוקי עוף' },
  { pattern: /עוף שלם|תרנגולת|עוף מלא/, sub: 'עוף שלם' },
  { pattern: /צלי עוף|עוף צלוי|עוף צלי/, sub: 'צלי עוף' },
  { pattern: /קציצות עוף|קציצת עוף/, sub: 'קציצות עוף' },
  { pattern: /נאגטס/, sub: 'חזה עוף' },
  { pattern: /שניצל עוף/, sub: 'שניצל' },
  { pattern: /חזה עוף/, sub: 'חזה עוף' },
  { pattern: /כנפיים|כנף עוף/, sub: 'כנפיים' },
  // כל השאר — תבשיל עוף
]

const { data: recipes } = await supabase
  .from('recipes')
  .select('id, title')
  .eq('sub_category', 'עוף')

console.log(`מסווג ${recipes.length} מתכונים...\n`)

const groups = {}
const updates = []

for (const r of recipes) {
  const t = r.title
  let newSub = 'תבשיל עוף' // ברירת מחדל

  for (const rule of RULES) {
    if (rule.pattern.test(t)) {
      newSub = rule.sub
      break
    }
  }

  groups[newSub] = groups[newSub] || []
  groups[newSub].push(r.title)
  updates.push({ id: r.id, sub: newSub })
}

// הצג תצוגה מקדימה
for (const [sub, titles] of Object.entries(groups).sort()) {
  console.log(`\n📁 ${sub} (${titles.length}):`)
  titles.forEach(t => console.log(`   • ${t}`))
}

// שאל האם להמשיך
console.log('\n\nמריץ עדכון...')

for (const { id, sub } of updates) {
  const { error } = await supabase
    .from('recipes')
    .update({ sub_category: sub })
    .eq('id', id)
  if (error) console.error(`שגיאה ב-${id}: ${error.message}`)
}

console.log('✓ הושלם!')

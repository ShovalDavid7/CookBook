import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  'https://jrvioblxwgzivvytslct.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydmlvYmx4d2d6aXZ2eXRzbGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjM1MjQsImV4cCI6MjA5NjM5OTUyNH0.ZYTTy711BO3hymZqIGMG_8Rh_8s-DFHaTEMTtMRr9XE'
)

const { data: recipes } = await supabase
  .from('recipes')
  .select('id, title, source_url')
  .eq('source', 'חן במטבח')

const { data: ings } = await supabase
  .from('ingredients')
  .select('recipe_id')

const hasIng = new Set(ings.map(i => i.recipe_id))

const missing = recipes.filter(r => !hasIng.has(r.id))
const hasIngredients = recipes.filter(r => hasIng.has(r.id))

console.log(`חן במטבח: ${recipes.length} מתכונים`)
console.log(`יש מצרכים: ${hasIngredients.length}`)
console.log(`חסרים מצרכים: ${missing.length}\n`)

// בדוק URL אחד כדי לראות את המבנה
if (missing.length > 0) {
  console.log('דוגמאות ללא מצרכים:')
  missing.slice(0, 5).forEach(r => console.log(`  - ${r.title}\n    ${r.source_url}`))
}

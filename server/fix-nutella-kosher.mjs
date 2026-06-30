import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  'https://jrvioblxwgzivvytslct.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydmlvYmx4d2d6aXZ2eXRzbGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjM1MjQsImV4cCI6MjA5NjM5OTUyNH0.ZYTTy711BO3hymZqIGMG_8Rh_8s-DFHaTEMTtMRr9XE'
)

// כל מתכוני נוטלה → חלבי
const { data } = await supabase
  .from('recipes')
  .select('id, title, kosher_type')
  .ilike('title', '%נוטלה%')

for (const r of data) {
  if (r.kosher_type !== 'חלבי') {
    await supabase.from('recipes').update({ kosher_type: 'חלבי' }).eq('id', r.id)
    console.log(`✓ "${r.title}" ${r.kosher_type} → חלבי`)
  } else {
    console.log(`  (כבר חלבי) "${r.title}"`)
  }
}

// גם בדוק ברכיבים — מתכונים שיש בהם "נוטלה" כרכיב
const { data: ings } = await supabase
  .from('ingredients')
  .select('recipe_id')
  .ilike('name', '%נוטלה%')

const recipeIds = [...new Set(ings.map(i => i.recipe_id))]
const { data: recipes } = await supabase
  .from('recipes')
  .select('id, title, kosher_type')
  .in('id', recipeIds)
  .neq('kosher_type', 'חלבי')

for (const r of recipes) {
  await supabase.from('recipes').update({ kosher_type: 'חלבי' }).eq('id', r.id)
  console.log(`✓ (מרכיב) "${r.title}" → חלבי`)
}

console.log(`\nסה"כ תוקנו ${data.filter(r => r.kosher_type !== 'חלבי').length + recipes.length} מתכונים`)

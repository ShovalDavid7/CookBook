import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  'https://jrvioblxwgzivvytslct.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydmlvYmx4d2d6aXZ2eXRzbGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjM1MjQsImV4cCI6MjA5NjM5OTUyNH0.ZYTTy711BO3hymZqIGMG_8Rh_8s-DFHaTEMTtMRr9XE'
)

const { data: recipes } = await supabase
  .from('recipes')
  .select('id')
  .eq('source', 'חן במטבח')

const ids = recipes.map(r => r.id)
console.log(`מוחק מצרכים עבור ${ids.length} מתכוני חן במטבח...`)

const { error } = await supabase
  .from('ingredients')
  .delete()
  .in('recipe_id', ids)

console.log(error ? 'שגיאה: ' + error.message : '✓ נמחק הכל')

// גם מחק הוראות שנוספו
const { error: e2 } = await supabase
  .from('instructions')
  .delete()
  .in('recipe_id', ids)

console.log(e2 ? 'שגיאה הוראות: ' + e2.message : '✓ הוראות שנוספו נמחקו')

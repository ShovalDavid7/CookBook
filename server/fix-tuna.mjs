import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jrvioblxwgzivvytslct.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydmlvYmx4d2d6aXZ2eXRzbGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjM1MjQsImV4cCI6MjA5NjM5OTUyNH0.ZYTTy711BO3hymZqIGMG_8Rh_8s-DFHaTEMTtMRr9XE'
)

async function main() {
  const { data: recipes } = await supabase
    .from('recipes')
    .select('id, title, kosher_type, sub_category')
    .ilike('title', '%טונה%')

  console.log(`נמצאו ${recipes.length} מתכוני טונה\n`)

  let updated = 0
  for (const r of recipes) {
    const needsKosher = r.kosher_type !== 'דגים'
    const needsSub = r.sub_category !== 'טונה'
    if (needsKosher || needsSub) {
      await supabase.from('recipes').update({ kosher_type: 'דגים', sub_category: 'טונה' }).eq('id', r.id)
      console.log(`✓ "${r.title}" — kosher: ${r.kosher_type || 'ריק'} → דגים | sub: ${r.sub_category || 'ריק'} → טונה`)
      updated++
    } else {
      console.log(`  "${r.title}" — כבר תקין`)
    }
  }

  console.log(`\nעודכנו ${updated} מתכונים`)
}

main().catch(console.error)

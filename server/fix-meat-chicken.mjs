import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jrvioblxwgzivvytslct.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydmlvYmx4d2d6aXZ2eXRzbGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjM1MjQsImV4cCI6MjA5NjM5OTUyNH0.ZYTTy711BO3hymZqIGMG_8Rh_8s-DFHaTEMTtMRr9XE'
)

// sub_categories שהן כבר ספציפיות לעוף — לא נגע בהן
const CHICKEN_SPECIFIC = new Set(['פרגיות', 'חזה עוף', 'כנפיים', 'שוקי עוף', 'עוף שלם', 'מרק עוף', 'שניצל'])
// sub_categories שהן כבר ספציפיות לבשר — לא נגע בהן
const BEEF_SPECIFIC = new Set(['המבורגר', 'קבב', 'אסאדו', 'סינטה', 'בשר טחון', 'כבש וטלה', 'נקניקיות', 'אנטריקוט', 'סטייק'])
// sub_categories לא ברורות שצריך לסווג מחדש
const GENERIC = new Set(['מנות בשר', 'בשר', 'מתכוני עוף', 'קציצות', 'שווארמה', 'תבשיל', 'תבשילים'])

function classify(title, ingText) {
  const all = title + ' ' + ingText
  // עוף
  if (/עוף|פרגית|פרגיות|כנפיים|חזה עוף|שוקי עוף|שוק עוף|כרעיים|כבד עוף|הודו/.test(all)) return 'עוף'
  if (/עוף|פרגית/.test(ingText)) return 'עוף'
  // בשר בקר
  if (/בקר|אסאדו|קבב|סינטה|אנטריקוט|כבש|טלה|בשר טחון|נקניקיות|פסטרמה|מרגז/.test(all)) return 'בשר בקר'
  if (/ בשר /.test(ingText)) return 'בשר בקר'
  return null
}

async function main() {
  const { data: recipes } = await supabase
    .from('recipes')
    .select('id, title, sub_category, kosher_type')
    .eq('kosher_type', 'בשרי')

  console.log(`נמצאו ${recipes.length} מתכוני בשרי\n`)

  const { data: ingredients } = await supabase
    .from('ingredients')
    .select('recipe_id, name')

  const ingMap = {}
  for (const ing of ingredients) {
    ingMap[ing.recipe_id] = (ingMap[ing.recipe_id] || '') + ' ' + ing.name
  }

  let updated = 0
  const counts = {}

  for (const r of recipes) {
    // לא נגע במנות ספציפיות שכבר מסווגות נכון
    if (CHICKEN_SPECIFIC.has(r.sub_category) || BEEF_SPECIFIC.has(r.sub_category)) {
      counts[r.sub_category] = (counts[r.sub_category] || 0) + 1
      continue
    }

    const ingText = ingMap[r.id] || ''
    const newSub = classify(r.title, ingText)

    if (newSub && newSub !== r.sub_category) {
      await supabase.from('recipes').update({ sub_category: newSub }).eq('id', r.id)
      console.log(`✓ "${r.title}"`)
      console.log(`  ${r.sub_category} → ${newSub}`)
      counts[newSub] = (counts[newSub] || 0) + 1
      updated++
    } else {
      counts[r.sub_category || '?'] = (counts[r.sub_category || '?'] || 0) + 1
    }
  }

  console.log(`\n=== עודכנו ${updated} מתכונים ===\n`)
  console.log('חלוקה של בשרי:')
  Object.entries(counts).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => {
    console.log(`  ${k}: ${v}`)
  })
}

main().catch(console.error)

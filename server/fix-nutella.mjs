import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  'https://jrvioblxwgzivvytslct.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydmlvYmx4d2d6aXZ2eXRzbGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjM1MjQsImV4cCI6MjA5NjM5OTUyNH0.ZYTTy711BO3hymZqIGMG_8Rh_8s-DFHaTEMTtMRr9XE'
)

// מתכוני נוטלה/שוקולד שקיבלו בטעות sub_category של בשר
const { data } = await supabase
  .from('recipes')
  .select('id, title, sub_category, kosher_type, category')
  .in('sub_category', ['כבש וטלה', 'נקניקיות'])

for (const r of data) {
  const isSweet = /נוטלה|שוקולד|ריבת חלב|עוגי|קינוח|רולדה|מתוק|בראוניז|ממתק|סניקרס|אוראו|לוטוס/.test(r.title)
  if (isSweet) {
    // קבע sub_category ו-category נכונים
    let newSub = 'קינוחים'
    if (/בראוניז/.test(r.title)) newSub = 'בראוניז'
    else if (/עוגיות/.test(r.title)) newSub = 'עוגיות'
    else if (/רולדה|רולדת/.test(r.title)) newSub = 'עוגות'

    await supabase.from('recipes').update({
      sub_category: newSub,
      category: 'קינוחים',
      kosher_type: 'פרווה'
    }).eq('id', r.id)
    console.log(`✓ "${r.title.slice(0,55)}"  ${r.sub_category} → ${newSub} (קינוחים/פרווה)`)
  }
}

// נקניק שוקולד — קינוח פרווה
const { data: chocSausage } = await supabase
  .from('recipes')
  .select('id, title')
  .ilike('title', '%נקניק שוקולד%')

for (const r of chocSausage) {
  await supabase.from('recipes').update({
    sub_category: 'קינוחים',
    category: 'קינוחים',
    kosher_type: 'פרווה'
  }).eq('id', r.id)
  console.log(`✓ "${r.title}" → קינוחים/פרווה`)
}

// בדוק גם שאר "כבש וטלה" שנשארו עם בעיה
const { data: remaining } = await supabase
  .from('recipes')
  .select('id, title, category, kosher_type')
  .eq('sub_category', 'כבש וטלה')

console.log('\nכבש וטלה שנשארו:')
remaining.forEach(r => console.log(`  [${r.category}/${r.kosher_type}] ${r.title.slice(0,60)}`))

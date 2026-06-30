import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  'https://jrvioblxwgzivvytslct.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydmlvYmx4d2d6aXZ2eXRzbGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjM1MjQsImV4cCI6MjA5NjM5OTUyNH0.ZYTTy711BO3hymZqIGMG_8Rh_8s-DFHaTEMTtMRr9XE'
)

const { data } = await supabase
  .from('recipes')
  .select('id, title, sub_category')
  .eq('kosher_type', 'פרווה')
  .eq('category', 'עיקרית')
  .or('sub_category.ilike.%קינוח%,sub_category.ilike.%עוג%,sub_category.ilike.%עוגי%,sub_category.ilike.%פאי%,sub_category.ilike.%טארט%,title.ilike.%עוגה%,title.ilike.%עוגיות%,title.ilike.%קינוח%,title.ilike.%עוגת%,title.ilike.%גלידה%,title.ilike.%מאפה מתוק%,title.ilike.%בראוניז%,title.ilike.%מופין%,title.ilike.%טארט%,title.ilike.%פאי%,title.ilike.%חלבה%,title.ilike.%קרפ%')

console.log(`נמצאו ${data.length} קינוחים בפרווה:\n`)
data.forEach(r => console.log(`  [${r.sub_category}] ${r.title}`))

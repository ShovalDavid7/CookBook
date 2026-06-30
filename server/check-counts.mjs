import { createClient } from '@supabase/supabase-js'
const sb = createClient('https://jrvioblxwgzivvytslct.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydmlvYmx4d2d6aXZ2eXRzbGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjM1MjQsImV4cCI6MjA5NjM5OTUyNH0.ZYTTy711BO3hymZqIGMG_8Rh_8s-DFHaTEMTtMRr9XE')
const {data} = await sb.from('recipes').select('source')
const counts = {}
data.forEach(r => { const s = r.source||'(ריק)'; counts[s]=(counts[s]||0)+1 })
Object.entries(counts).sort((a,b)=>b[1]-a[1]).forEach(([s,c])=>console.log(`  ${s}: ${c}`))
console.log('סה"כ:', data.length)

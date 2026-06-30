import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  'https://jrvioblxwgzivvytslct.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydmlvYmx4d2d6aXZ2eXRzbGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjM1MjQsImV4cCI6MjA5NjM5OTUyNH0.ZYTTy711BO3hymZqIGMG_8Rh_8s-DFHaTEMTtMRr9XE'
)

function makePrompt(title, category, sub) {
  const base = `${title}, Israeli home cooking, food photography, appetizing, warm lighting, professional`
  return encodeURIComponent(base)
}

function makeImageUrl(title, category, sub, seed) {
  const prompt = makePrompt(title, category, sub)
  return `https://image.pollinations.ai/prompt/${prompt}?width=600&height=450&nologo=true&seed=${seed}`
}

const { data: recipes } = await supabase
  .from('recipes')
  .select('id, title, category, sub_category')
  .or('image_url.is.null,image_url.eq.')

console.log(`מצאתי ${recipes.length} מתכונים ללא תמונה\n`)

let ok = 0, fail = 0
for (let i = 0; i < recipes.length; i++) {
  const r = recipes[i]
  const seed = (i * 17 + 3) % 9999
  const imageUrl = makeImageUrl(r.title, r.category, r.sub_category, seed)

  // וודא שה-URL עובד
  let success = false
  for (let attempt = 0; attempt < 3 && !success; attempt++) {
    if (attempt > 0) {
      console.log(`  ↻ ניסיון ${attempt+1}...`)
      await new Promise(r => setTimeout(r, 8000))
    }
    try {
      const res = await fetch(imageUrl, { signal: AbortSignal.timeout(30000) })
      if (res.status === 429) { continue }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const { error } = await supabase
        .from('recipes')
        .update({ image_url: imageUrl })
        .eq('id', r.id)

      if (error) throw new Error(error.message)
      ok++
      success = true
      console.log(`✓ [${i+1}/${recipes.length}] ${r.title.slice(0,45)}`)
    } catch (err) {
      if (attempt === 2) {
        fail++
        console.log(`✗ [${i+1}/${recipes.length}] ${r.title.slice(0,45)} — ${err.message.slice(0,30)}`)
      }
    }
  }
  if (!success && ok + fail < i + 1) { fail++; console.log(`✗ [${i+1}/${recipes.length}] ${recipes[i].title.slice(0,45)} — 429`) }

  await new Promise(r => setTimeout(r, 4000))
}

console.log(`\n✓ הצליחו: ${ok} | ✗ נכשלו: ${fail}`)

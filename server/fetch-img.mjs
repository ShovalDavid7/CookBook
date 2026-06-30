import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  'https://jrvioblxwgzivvytslct.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydmlvYmx4d2d6aXZ2eXRzbGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjM1MjQsImV4cCI6MjA5NjM5OTUyNH0.ZYTTy711BO3hymZqIGMG_8Rh_8s-DFHaTEMTtMRr9XE'
)

const prompt = encodeURIComponent(
  'crispy glazed sweet chicken pieces, golden brown sauce, Asian style, food photography, white plate, restaurant quality, delicious'
)
const imageUrl = `https://image.pollinations.ai/prompt/${prompt}?width=600&height=450&nologo=true&seed=77`

console.log('מייצר תמונה AI...')
console.log('URL:', imageUrl)

// בדוק שה-URL עובד
const test = await fetch(imageUrl, { signal: AbortSignal.timeout(30000) })
console.log('Status:', test.status, test.headers.get('content-type'))

if (test.ok) {
  const { error } = await supabase
    .from('recipes')
    .update({ image_url: imageUrl })
    .eq('id', '84569e09-46ae-424b-9978-af8f1ff22e39')
  console.log(error ? 'שגיאה DB: ' + error.message : '✓ תמונה AI נשמרה!')
}

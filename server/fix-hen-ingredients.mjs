import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jrvioblxwgzivvytslct.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydmlvYmx4d2d6aXZ2eXRzbGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjM1MjQsImV4cCI6MjA5NjM5OTUyNH0.ZYTTy711BO3hymZqIGMG_8Rh_8s-DFHaTEMTtMRr9XE'
)

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
  'Accept-Language': 'he,en;q=0.5',
}

function stripHtml(s) {
  return s.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#[0-9]+;/g, '').trim()
}

// פרסור מצרכים מ-HTML של חן במטבח
// המבנה: <p>כותרת:<br/>מצרך 1<br/>מצרך 2...</p>
function parseHenIngredients(html) {
  const ingredients = []

  // חתוך לפני אזור התגובות
  const commentsIdx = html.search(/id=["']comments["']/)
  const content = commentsIdx > 0 ? html.slice(0, commentsIdx) : html

  // מצא כל פסקה עם <br>
  const pBlocks = [...content.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)]
    .map(m => m[1])
    .filter(block => block.includes('<br'))

  const UNIT_PATTERN = /כף|כפית|כוס|גרם|ק"ג|קילו|מ"ל|ליטר|יח'|קופסה|חבילה|ענף|שן|פרוסה|כף שטוחה|כדור|חצי|רבע|\d/

  for (const block of pBlocks) {
    // פצל על <br>
    const lines = block.split(/<br\s*\/?>/i)
      .map(l => stripHtml(l))
      .filter(l => l.length > 1 && l.length < 200)

    // בדוק אם הבלוק נראה כמו מצרכים
    const hasUnits = lines.some(l => UNIT_PATTERN.test(l))
    // שורות ארוכות מדי = הקדמה/הערות, לא מצרכים
    const avgLen = lines.reduce((s, l) => s + l.length, 0) / (lines.length || 1)
    const isLongText = avgLen > 55

    if (!isLongText && (hasUnits || lines.length >= 2)) {
      for (const line of lines) {
        // דלג על כותרות כמו "לבצק:", "להגשה:", "מצרכים:"
        if (/^ל[^:]{1,10}:$|^מצרכים:?$|^לבצק:?$|^להגשה:?$|^למילוי:?$|^לרוטב:?$/.test(line)) continue
        if (line.length > 1 && line.length < 80) {
          ingredients.push({ name: line, amount: null, unit: null })
        }
      }
    }
  }

  return ingredients
}

// פרסור הוראות מ-HTML
function parseHenInstructions(html) {
  const instructions = []
  const commentsIdx = html.search(/id=["']comments["']/)
  const content = commentsIdx > 0 ? html.slice(0, commentsIdx) : html
  const pBlocks = [...content.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)]
    .map(m => stripHtml(m[1]))
    .filter(t => t.length > 20 && /[א-ת]/.test(t))

  // הוראות הן פסקאות ארוכות שמתחילות בפועל
  const VERB_START = /^(ערבב|חמם|הוסיף|עשה|שים|הכנ|הרתח|אפה|טגן|קצוץ|חתוך|הוציא|הניח|שלב|ממיס|סנן|קלף|פתח|הפעל|הרכיב|הכניס|הגרד|פרס|נסו|לכנו|מיזגו|הכינו|הוסיפו|ערבבו|חממו|טגנו|אפו|הוציאו|חתכו|שימו)/

  for (const text of pBlocks) {
    if (VERB_START.test(text) && text.length > 15) {
      instructions.push(text)
    }
  }

  return instructions
}

async function fixRecipe(recipe) {
  if (!recipe.source_url) return 'no-url'

  try {
    const res = await fetch(recipe.source_url, { headers: HEADERS, signal: AbortSignal.timeout(12000) })
    if (!res.ok) return `http-${res.status}`
    const html = await res.text()

    const ingredients = parseHenIngredients(html)
    const instructions = parseHenInstructions(html)

    if (ingredients.length === 0) return 'no-ingredients-found'

    // שמור מצרכים
    await supabase.from('ingredients').insert(
      ingredients.map(i => ({ ...i, recipe_id: recipe.id }))
    )

    // שמור הוראות אם אין
    if (instructions.length > 0) {
      const { data: existingInst } = await supabase
        .from('instructions')
        .select('id')
        .eq('recipe_id', recipe.id)
        .limit(1)

      if (!existingInst?.length) {
        await supabase.from('instructions').insert(
          instructions.map((text, i) => ({ description: text, step_number: i + 1, recipe_id: recipe.id }))
        )
      }
    }

    return `ok:${ingredients.length}ing,${instructions.length}inst`
  } catch (err) {
    return `error:${err.message.slice(0, 40)}`
  }
}

async function main() {
  // מצא מתכוני חן במטבח ללא מצרכים
  const { data: recipes } = await supabase
    .from('recipes')
    .select('id, title, source_url')
    .eq('source', 'חן במטבח')

  const { data: ings } = await supabase.from('ingredients').select('recipe_id')
  const hasIng = new Set(ings.map(i => i.recipe_id))
  const toFix = recipes.filter(r => !hasIng.has(r.id) && r.source_url)

  console.log(`מתקן ${toFix.length} מתכונים...\n`)

  let ok = 0, failed = 0
  for (let i = 0; i < toFix.length; i++) {
    const r = toFix[i]
    const result = await fixRecipe(r)
    if (result.startsWith('ok:')) {
      ok++
      console.log(`✓ [${i+1}/${toFix.length}] ${r.title.slice(0,45)} — ${result}`)
    } else {
      failed++
      console.log(`✗ [${i+1}/${toFix.length}] ${r.title.slice(0,45)} — ${result}`)
    }
    await new Promise(r => setTimeout(r, 600))
  }

  console.log(`\n✓ הצליחו: ${ok} | ✗ נכשלו: ${failed}`)
}

main().catch(console.error)

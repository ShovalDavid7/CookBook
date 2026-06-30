const url = 'https://heninthekitchen.com/blog/2019/12/15/%d7%a4%d7%a8%d7%99%d7%a7%d7%a1%d7%94/'
const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(12000) })
const html = await res.text()

const UNIT_PATTERN = /כף|כפית|כוס|גרם|ק"ג|קילו|מ"ל|ליטר|יח'|קופסה|חבילה|ענף|שן|פרוסה|חצי|רבע|\d/
const commentsIdx = html.search(/id=["']comments["']/)
const content = commentsIdx > 0 ? html.slice(0, commentsIdx) : html

const pBlocks = [...content.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)]
  .map(m => m[1])
  .filter(b => b.includes('<br'))

const ingredients = []
for (const block of pBlocks) {
  const lines = block.split(/<br\s*\/?>/i)
    .map(l => l.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim())
    .filter(l => l.length > 1 && l.length < 200)

  const hasUnits = lines.some(l => UNIT_PATTERN.test(l))
  const avgLen = lines.reduce((s, l) => s + l.length, 0) / (lines.length || 1)
  const isLongText = avgLen > 55

  console.log(`בלוק (${lines.length} שורות, avg=${Math.round(avgLen)} תווים, longText=${isLongText}, hasUnits=${hasUnits}):`)
  lines.forEach(l => console.log(`  "${l.slice(0, 70)}"`) )

  if (!isLongText && (hasUnits || lines.length >= 2)) {
    for (const line of lines) {
      if (/^ל[^:]{1,10}:$|^מצרכים:?$/.test(line)) continue
      if (line.length > 1 && line.length < 80) ingredients.push(line)
    }
    console.log('  => KEPT as ingredients')
  } else {
    console.log('  => SKIPPED')
  }
  console.log()
}

console.log(`\n=== סה"כ מצרכים: ${ingredients.length} ===`)
ingredients.forEach(i => console.log(' -', i))

import { supabase } from '../supabase.js'

const SUB_CATEGORY_IMAGES = {
  'חזה עוף':    'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=600',
  'פרגיות':     'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600',
  'כנפיים':     'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600',
  'שניצל':      'https://images.unsplash.com/photo-1585325701165-b1b9ba44adbb?w=600',
  'שוקי עוף':   'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=600',
  'עוף שלם':    'https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?w=600',
  'תבשיל עוף':  'https://images.unsplash.com/photo-1547592180-85f173990554?w=600',
  'צלי עוף':    'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600',
  'בשר בקר':    'https://images.unsplash.com/photo-1544025162-d76694265947?w=600',
  'המבורגר':    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600',
  'קבב':        'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600',
  'אסאדו':      'https://images.unsplash.com/photo-1544025162-d76694265947?w=600',
}

export async function getSubCategories(req, res) {
  const { category, kosher_type } = req.query
  let query = supabase
    .from('recipes')
    .select('sub_category, image_url')
    .neq('sub_category', '')
    .not('sub_category', 'is', null)
  if (category && category !== 'הכל') {
    query = query.eq('category', category)
  }
  if (kosher_type) {
    query = query.eq('kosher_type', kosher_type)
  }
  const { data, error } = await query
  if (error) return res.status(500).json({ error: error.message })

  const map = {}
  for (const r of data) {
    const key = r.sub_category
    if (!map[key]) map[key] = { name: key, image_url: SUB_CATEGORY_IMAGES[key] || r.image_url || '', count: 0 }
    map[key].count++
    if (!map[key].image_url && r.image_url) map[key].image_url = r.image_url
  }

  res.json(Object.values(map).sort((a, b) => b.count - a.count))
}

export async function getRecipes(req, res) {
  const { category, search, source, sub_category, sub_categories, kosher_type } = req.query

  let query = supabase
    .from('recipes')
    .select(`
      id, title, description, image_url, prep_time, difficulty,
      servings, is_kosher, category, sub_category, source, created_at,
      profiles!created_by (id, name, avatar_url),
      likes (count),
      bookmarks (count)
    `)
    .order('created_at', { ascending: false })

  if (category && category !== 'הכל') {
    query = query.eq('category', category)
  }
  if (sub_category) {
    query = query.eq('sub_category', sub_category)
  } else if (sub_categories) {
    query = query.in('sub_category', sub_categories.split(','))
  }
  if (kosher_type) {
    query = query.eq('kosher_type', kosher_type)
  }
  if (search) {
    query = query.ilike('title', `%${search}%`)
  }
  if (source) {
    query = query.eq('source', source)
  }

  const { data, error } = await query
  if (error) return res.status(500).json({ error: error.message })

  const userId = req.user?.id
  let likedIds = new Set()
  let bookmarkedIds = new Set()

  if (userId) {
    const [{ data: likes }, { data: bookmarks }] = await Promise.all([
      supabase.from('likes').select('recipe_id').eq('user_id', userId),
      supabase.from('bookmarks').select('recipe_id').eq('user_id', userId),
    ])
    likedIds = new Set(likes?.map((l) => l.recipe_id))
    bookmarkedIds = new Set(bookmarks?.map((b) => b.recipe_id))
  }

  const recipes = data.map((r) => ({
    ...r,
    likes_count: r.likes[0]?.count ?? 0,
    bookmarks_count: r.bookmarks[0]?.count ?? 0,
    is_liked: likedIds.has(r.id),
    is_bookmarked: bookmarkedIds.has(r.id),
    likes: undefined,
    bookmarks: undefined,
  }))

  res.json(recipes)
}

export async function getRecipeById(req, res) {
  const { id } = req.params

  const { data: recipe, error } = await supabase
    .from('recipes')
    .select(`
      *,
      profiles!created_by (id, name, avatar_url),
      ingredients (id, name, amount, unit),
      instructions (id, step_number, description),
      likes (count)
    `)
    .eq('id', id)
    .single()

  if (error) return res.status(404).json({ error: 'מתכון לא נמצא' })

  const userId = req.user?.id
  let isLiked = false
  let isBookmarked = false

  if (userId) {
    const [{ data: like }, { data: bookmark }] = await Promise.all([
      supabase.from('likes').select('recipe_id').eq('user_id', userId).eq('recipe_id', id).single(),
      supabase.from('bookmarks').select('recipe_id').eq('user_id', userId).eq('recipe_id', id).single(),
    ])
    isLiked = !!like
    isBookmarked = !!bookmark
  }

  recipe.instructions?.sort((a, b) => a.step_number - b.step_number)
  recipe.likes_count = recipe.likes[0]?.count ?? 0
  recipe.is_liked = isLiked
  recipe.is_bookmarked = isBookmarked
  delete recipe.likes

  res.json(recipe)
}

export async function createRecipe(req, res) {
  const { title, description, image_url, prep_time, difficulty, servings, is_kosher, category, sub_category, kosher_type, source_url, ingredients, instructions } = req.body
  const userId = req.user?.id

  console.log('createRecipe called, userId:', userId, 'title:', title)

  const { source } = req.body
  const { data: recipe, error } = await supabase
    .from('recipes')
    .insert({ title, description, image_url, prep_time, difficulty, servings, is_kosher, category, sub_category: sub_category || '', kosher_type: kosher_type || '', source: source || '', source_url: source_url || '', created_by: userId })
    .select()
    .single()

  if (error) {
    console.log('recipes insert error:', error.message)
    return res.status(500).json({ error: error.message })
  }

  if (ingredients?.length) {
    await supabase.from('ingredients').insert(
      ingredients.map((ing) => ({ ...ing, recipe_id: recipe.id }))
    )
  }

  if (instructions?.length) {
    await supabase.from('instructions').insert(
      instructions.map((inst, i) => ({ description: inst, step_number: i + 1, recipe_id: recipe.id }))
    )
  }

  res.status(201).json(recipe)
}

export async function updateRecipe(req, res) {
  const { id } = req.params
  const userId = req.user.id

  const { data: existing } = await supabase.from('recipes').select('created_by').eq('id', id).single()
  if (existing?.created_by !== userId) return res.status(403).json({ error: 'אין הרשאה' })

  const { title, description, image_url, prep_time, difficulty, servings, is_kosher, category, source_url } = req.body
  const { data, error } = await supabase
    .from('recipes')
    .update({ title, description, image_url, prep_time, difficulty, servings, is_kosher, category, source_url: source_url || '' })
    .eq('id', id)
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
}

export async function updateIngredients(req, res) {
  const { id } = req.params
  const userId = req.user.id
  const { ingredients } = req.body

  const { data: existing } = await supabase.from('recipes').select('created_by').eq('id', id).single()
  if (existing?.created_by !== userId) return res.status(403).json({ error: 'אין הרשאה' })

  const { error: delErr } = await supabase.from('ingredients').delete().eq('recipe_id', id)
  if (delErr) console.error('delete ingredients error:', delErr.message)

  if (ingredients?.length) {
    const rows = ingredients.map((ing) => ({ name: ing.name, amount: ing.amount ? Number(ing.amount) : null, unit: ing.unit || null, recipe_id: id }))
    const { error: insErr } = await supabase.from('ingredients').insert(rows)
    if (insErr) {
      console.error('insert ingredients error:', insErr.message)
      return res.status(500).json({ error: insErr.message })
    }
  }
  res.json({ success: true })
}

export async function deleteRecipe(req, res) {
  const { id } = req.params
  const userId = req.user.id

  const { data: existing } = await supabase.from('recipes').select('created_by').eq('id', id).single()
  if (existing?.created_by !== userId) return res.status(403).json({ error: 'אין הרשאה' })

  const { error } = await supabase.from('recipes').delete().eq('id', id)
  if (error) return res.status(500).json({ error: error.message })
  res.json({ success: true })
}

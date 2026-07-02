import { supabase } from '../supabase.js'

export async function getInteractions(req, res) {
  const { recipeId } = req.params
  const userId = req.user?.id

  const [{ data: comments }, { data: ratings }, { data: tried }, { data: mine }] = await Promise.all([
    supabase.from('comments').select('id, text, created_at, profiles!user_id(id, name, avatar_url)')
      .eq('recipe_id', recipeId).order('created_at', { ascending: false }),
    supabase.from('recipe_interactions').select('rating').eq('recipe_id', recipeId).not('rating', 'is', null),
    supabase.from('recipe_interactions').select('id').eq('recipe_id', recipeId).eq('tried', true),
    userId
      ? supabase.from('recipe_interactions').select('rating, tried, tried_image').eq('recipe_id', recipeId).eq('user_id', userId).maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  const avgRating = ratings?.length
    ? Math.round((ratings.reduce((s, r) => s + r.rating, 0) / ratings.length) * 10) / 10
    : null

  res.json({
    comments: comments || [],
    avg_rating: avgRating,
    ratings_count: ratings?.length || 0,
    tried_count: tried?.length || 0,
    mine: mine || null,
  })
}

export async function addComment(req, res) {
  const { recipeId } = req.params
  const { text } = req.body
  const userId = req.user.id

  if (!text?.trim()) return res.status(400).json({ error: 'טקסט ריק' })

  const { data, error } = await supabase.from('comments')
    .insert({ recipe_id: recipeId, user_id: userId, text: text.trim() })
    .select('id, text, created_at, profiles!user_id(id, name, avatar_url)')
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
}

export async function deleteComment(req, res) {
  const { commentId } = req.params
  const userId = req.user.id

  const { data: existing } = await supabase.from('comments').select('user_id').eq('id', commentId).single()
  if (existing?.user_id !== userId) return res.status(403).json({ error: 'אין הרשאה' })

  await supabase.from('comments').delete().eq('id', commentId)
  res.json({ success: true })
}

export async function upsertInteraction(req, res) {
  const { recipeId } = req.params
  const { rating, tried, tried_image } = req.body
  const userId = req.user.id

  const { data: existing } = await supabase.from('recipe_interactions')
    .select('id').eq('recipe_id', recipeId).eq('user_id', userId).maybeSingle()

  const payload = { recipe_id: recipeId, user_id: userId }
  if (rating !== undefined) payload.rating = rating
  if (tried !== undefined) payload.tried = tried
  if (tried_image !== undefined) payload.tried_image = tried_image

  const { data, error } = existing
    ? await supabase.from('recipe_interactions').update(payload).eq('id', existing.id).select().single()
    : await supabase.from('recipe_interactions').insert(payload).select().single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
}

export async function updateTips(req, res) {
  const { id } = req.params
  const userId = req.user.id
  const { tips } = req.body

  const { data: existing } = await supabase.from('recipes').select('created_by').eq('id', id).single()
  if (existing?.created_by !== userId) return res.status(403).json({ error: 'אין הרשאה' })

  const { data, error } = await supabase.from('recipes').update({ tips }).eq('id', id).select('tips').single()
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
}

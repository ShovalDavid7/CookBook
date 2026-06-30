import { supabase } from '../supabase.js'

export async function likeRecipe(req, res) {
  const { recipeId } = req.params
  const userId = req.user.id

  const { error } = await supabase
    .from('likes')
    .insert({ user_id: userId, recipe_id: recipeId })

  if (error) return res.status(500).json({ error: error.message })
  res.json({ success: true })
}

export async function unlikeRecipe(req, res) {
  const { recipeId } = req.params
  const userId = req.user.id

  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('user_id', userId)
    .eq('recipe_id', recipeId)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ success: true })
}

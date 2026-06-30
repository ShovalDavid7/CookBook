import { supabase } from '../supabase.js'

export async function bookmarkRecipe(req, res) {
  const { recipeId } = req.params
  const userId = req.user.id

  const { error } = await supabase
    .from('bookmarks')
    .insert({ user_id: userId, recipe_id: recipeId })

  if (error) return res.status(500).json({ error: error.message })
  res.json({ success: true })
}

export async function unbookmarkRecipe(req, res) {
  const { recipeId } = req.params
  const userId = req.user.id

  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('user_id', userId)
    .eq('recipe_id', recipeId)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ success: true })
}

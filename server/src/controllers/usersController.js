import { supabase } from '../supabase.js'

export async function getMyProfile(req, res) {
  const userId = req.user.id

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) return res.status(404).json({ error: 'פרופיל לא נמצא' })
  res.json(data)
}

export async function updateMyProfile(req, res) {
  const userId = req.user.id
  const { name, bio, avatar_url } = req.body

  const { data, error } = await supabase
    .from('profiles')
    .update({ name, bio, avatar_url })
    .eq('id', userId)
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
}

export async function getMyRecipes(req, res) {
  const userId = req.user.id

  const { data, error } = await supabase
    .from('recipes')
    .select('id, title, image_url, prep_time, difficulty, created_at')
    .eq('created_by', userId)
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
}

export async function getMyBookmarks(req, res) {
  const userId = req.user.id

  const { data, error } = await supabase
    .from('bookmarks')
    .select('recipe_id, recipes (id, title, image_url, prep_time, difficulty)')
    .eq('user_id', userId)

  if (error) return res.status(500).json({ error: error.message })
  res.json(data.map((b) => b.recipes))
}

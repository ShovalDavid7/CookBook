import { supabase } from '../supabase.js'

export async function uploadRecipeImage(req, res) {
  if (!req.file) return res.status(400).json({ error: 'לא הועלתה תמונה' })

  const ext = req.file.originalname.split('.').pop()
  const fileName = `${req.user.id}_${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from('recipe-images')
    .upload(fileName, req.file.buffer, { contentType: req.file.mimetype })

  if (error) return res.status(500).json({ error: error.message })

  const { data } = supabase.storage.from('recipe-images').getPublicUrl(fileName)
  res.json({ url: data.publicUrl })
}

export async function uploadAvatar(req, res) {
  if (!req.file) return res.status(400).json({ error: 'לא הועלתה תמונה' })

  const ext = req.file.originalname.split('.').pop()
  const fileName = `${req.user.id}_${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from('avatars')
    .upload(fileName, req.file.buffer, { contentType: req.file.mimetype })

  if (error) return res.status(500).json({ error: error.message })

  const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
  res.json({ url: data.publicUrl })
}

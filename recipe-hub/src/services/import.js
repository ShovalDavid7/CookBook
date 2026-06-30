import api from './api.js'

export async function importRecipeFromUrl(url) {
  const { data } = await api.post('/api/import', { url })
  return data
}

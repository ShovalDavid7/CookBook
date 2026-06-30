import api from './api'

export async function uploadRecipeImage(file) {
  const form = new FormData()
  form.append('image', file)
  const { data } = await api.post('/api/upload/recipe-image', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.url
}

export async function uploadAvatar(file) {
  const form = new FormData()
  form.append('image', file)
  const { data } = await api.post('/api/upload/avatar', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.url
}

import api from './api'

export const usersService = {
  getMe: () => api.get('/api/users/me').then((r) => r.data),
  updateMe: (data) => api.put('/api/users/me', data).then((r) => r.data),
  getMyRecipes: () => api.get('/api/users/me/recipes').then((r) => r.data),
  getMyBookmarks: () => api.get('/api/users/me/bookmarks').then((r) => r.data),
}

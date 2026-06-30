import api from './api'

export const recipesService = {
  getAll: (params = {}) => api.get('/api/recipes', { params }).then((r) => r.data),
  getById: (id) => api.get(`/api/recipes/${id}`).then((r) => r.data),
  create: (data) => api.post('/api/recipes', data).then((r) => r.data),
  update: (id, data) => api.put(`/api/recipes/${id}`, data).then((r) => r.data),
  delete: (id) => api.delete(`/api/recipes/${id}`).then((r) => r.data),
  like: (id) => api.post(`/api/likes/${id}`).then((r) => r.data),
  unlike: (id) => api.delete(`/api/likes/${id}`).then((r) => r.data),
  bookmark: (id) => api.post(`/api/bookmarks/${id}`).then((r) => r.data),
  unbookmark: (id) => api.delete(`/api/bookmarks/${id}`).then((r) => r.data),
}

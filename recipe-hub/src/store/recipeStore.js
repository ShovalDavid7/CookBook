import { create } from 'zustand'
import { recipesService } from '../services/recipes'
import api from '../services/api'

export const useRecipeStore = create((set, get) => ({
  recipes: [],
  currentRecipe: null,
  isLoading: false,
  error: null,
  activeCategory: 'הכל',
  activeSubCategory: '',
  activeKosherType: '',
  activeGroup: '',
  activeGroupSubs: [],
  activeSubGroup: '',
  activeSubGroupSubs: [],
  activeSource: '',
  searchQuery: '',
  subCategories: [],

  setCategory: (category) => {
    set({ activeCategory: category, activeSubCategory: '', activeKosherType: '', activeGroup: '', activeGroupSubs: [], activeSubGroup: '', activeSubGroupSubs: [] })
    get().fetchRecipes()
    if (category !== 'הכל') get().fetchSubCategories(category, '')
    else set({ subCategories: [] })
  },

  setKosherType: (type) => {
    set({ activeKosherType: type, activeSubCategory: '', activeGroup: '', activeGroupSubs: [], activeSubGroup: '', activeSubGroupSubs: [] })
    get().fetchSubCategories(get().activeCategory, type)
    get().fetchRecipes()
  },

  setGroup: (groupName, groupSubs) => {
    set({ activeGroup: groupName, activeGroupSubs: groupSubs, activeSubCategory: '' })
    if (groupName) get().fetchRecipes()
  },

  setSubGroup: (name, subs) => {
    set({ activeSubGroup: name, activeSubGroupSubs: subs, activeSubCategory: '' })
  },

  setSubCategory: (sub) => {
    set({ activeSubCategory: sub })
    get().fetchRecipes()
  },

  restoreNav: (cat, k, g, gs, sub, sg, sgs) => {
    set({ activeCategory: cat, activeKosherType: k, activeGroup: g || '', activeGroupSubs: gs || [], activeSubCategory: sub, activeSubGroup: sg || '', activeSubGroupSubs: sgs || [] })
    get().fetchRecipes()
    if (cat !== 'הכל') get().fetchSubCategories(cat, k)
    else set({ subCategories: [] })
  },

  setSource: (source) => {
    set({ activeSource: source })
    get().fetchRecipes()
  },

  setSearch: (query) => {
    set({ searchQuery: query })
  },

  fetchSubCategories: async (category, kosherType = '') => {
    if (!category || category === 'הכל') { set({ subCategories: [] }); return }
    try {
      const params = { category }
      if (kosherType) params.kosher_type = kosherType
      const { data } = await api.get('/api/recipes/sub-categories', { params })
      set({ subCategories: data })
    } catch {
      set({ subCategories: [] })
    }
  },

  fetchRecipes: async () => {
    set({ isLoading: true, error: null })
    const { activeCategory, activeSubCategory, activeKosherType, activeGroup, activeGroupSubs, activeSubGroup, activeSubGroupSubs, activeSource, searchQuery } = get()
    const params = {}
    if (activeCategory !== 'הכל') params.category = activeCategory
    if (activeKosherType) params.kosher_type = activeKosherType
    if (activeSubCategory && activeSubCategory !== '__all__') {
      params.sub_category = activeSubCategory
    } else if (activeSubCategory === '__all__' && activeSubGroup && activeSubGroupSubs.length) {
      params.sub_categories = activeSubGroupSubs.join(',')
    } else if (activeGroup && activeGroupSubs.length && activeSubCategory !== '__all__') {
      params.sub_categories = activeGroupSubs.join(',')
    }
    if (activeSource) params.source = activeSource
    if (searchQuery) params.search = searchQuery
    try {
      const recipes = await recipesService.getAll(params)
      set({ recipes, isLoading: false })
    } catch (err) {
      set({ error: err.message, isLoading: false })
    }
  },

  fetchRecipeById: async (id) => {
    set({ isLoading: true, error: null, currentRecipe: null })
    try {
      const recipe = await recipesService.getById(id)
      set({ currentRecipe: recipe, isLoading: false })
    } catch (err) {
      set({ error: err.message, isLoading: false })
    }
  },

  toggleLike: async (id) => {
    const recipes = get().recipes.map((r) => {
      if (r.id !== id) return r
      return { ...r, is_liked: !r.is_liked, likes_count: r.is_liked ? r.likes_count - 1 : r.likes_count + 1 }
    })
    set({ recipes })

    const recipe = get().recipes.find((r) => r.id === id)
    if (recipe?.is_liked) {
      await recipesService.like(id)
    } else {
      await recipesService.unlike(id)
    }

    if (get().currentRecipe?.id === id) {
      const cur = get().currentRecipe
      set({ currentRecipe: { ...cur, is_liked: !cur.is_liked, likes_count: cur.is_liked ? cur.likes_count - 1 : cur.likes_count + 1 } })
    }
  },

  toggleBookmark: async (id) => {
    const recipes = get().recipes.map((r) => {
      if (r.id !== id) return r
      return { ...r, is_bookmarked: !r.is_bookmarked }
    })
    set({ recipes })

    const recipe = get().recipes.find((r) => r.id === id)
    if (recipe?.is_bookmarked) {
      await recipesService.bookmark(id)
    } else {
      await recipesService.unbookmark(id)
    }

    if (get().currentRecipe?.id === id) {
      const cur = get().currentRecipe
      set({ currentRecipe: { ...cur, is_bookmarked: !cur.is_bookmarked } })
    }
  },
}))

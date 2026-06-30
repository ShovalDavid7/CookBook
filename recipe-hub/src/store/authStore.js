import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { usersService } from '../services/users'

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  session: null,
  isLoading: true,

  init: async () => {
    const { data } = await supabase.auth.getSession()
    if (data.session) {
      set({ session: data.session, user: data.session.user })
      await get().loadProfile()
    }
    set({ isLoading: false })

    supabase.auth.onAuthStateChange(async (event, session) => {
      set({ session, user: session?.user ?? null })
      if (session) {
        await get().loadProfile()
      } else {
        set({ profile: null })
      }
    })
  },

  loadProfile: async () => {
    try {
      const profile = await usersService.getMe()
      set({ profile })
    } catch {
      // profile might not exist yet
    }
  },

  signup: async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error

    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        name,
        bio: '',
        avatar_url: null,
      })
    }
    return data
  },

  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null, session: null })
  },

  updateProfile: async (updates) => {
    const profile = await usersService.updateMe(updates)
    set({ profile })
    return profile
  },
}))

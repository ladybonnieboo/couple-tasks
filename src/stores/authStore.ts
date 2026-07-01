import { create } from 'zustand'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types'

interface AuthState {
  user: User | null
  profile: Profile | null
  partner: Profile | null
  loading: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  setPartner: (partner: Profile | null) => void
  setLoading: (loading: boolean) => void
  fetchProfiles: (userId: string) => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  partner: null,
  loading: true,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setPartner: (partner) => set({ partner }),
  setLoading: (loading) => set({ loading }),

  fetchProfiles: async (userId: string) => {
    const { data: profiles } = await supabase.from('profiles').select('*')
    if (!profiles) return
    const me = profiles.find((p) => p.id === userId) ?? null
    const other = profiles.find((p) => p.id !== userId) ?? null
    set({ profile: me, partner: other })
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null, partner: null })
  },
}))

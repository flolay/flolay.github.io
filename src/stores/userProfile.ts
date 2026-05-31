import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuthStore } from './auth'

interface UserProfile {
  id: string
  email: string
  displayName: string
  photoURL: string | null
  role: 'admin' | 'team_lead' | 'team_member'
  teamId?: string
  createdAt: string
  updatedAt?: string
}

export const useUserProfileStore = defineStore('userProfile', () => {
  const authStore = useAuthStore()
  const profile = ref<UserProfile | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const displayName = computed(() => profile.value?.displayName || '')
  const photoURL = computed(() => profile.value?.photoURL || null)
  const role = computed(() => profile.value?.role || 'team_member')
  const isAdmin = computed(() => role.value === 'admin')
  const isTeamLead = computed(() => role.value === 'team_lead')
  const isTeamMember = computed(() => role.value === 'team_member')

  async function loadProfile() {
    if (!authStore.user?.uid) return
    
    try {
      loading.value = true
      error.value = null
      
      const userDoc = await getDoc(doc(db, 'users', authStore.user.uid))
      if (userDoc.exists()) {
        profile.value = { id: userDoc.id, ...userDoc.data() } as UserProfile
      } else {
        error.value = 'Profile not found'
        profile.value = null
      }
    } catch (err) {
      console.error('Error loading profile:', err)
      error.value = 'Failed to load profile'
      profile.value = null
    } finally {
      loading.value = false
    }
  }

  async function updateProfile(updates: Partial<UserProfile>) {
    if (!authStore.user?.uid) return
    
    try {
      loading.value = true
      error.value = null
      
      const userRef = doc(db, 'users', authStore.user.uid)
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      })
      
      // Reload the profile to ensure we have the latest data
      await loadProfile()
    } catch (err) {
      console.error('Error updating profile:', err)
      error.value = 'Failed to update profile'
    } finally {
      loading.value = false
    }
  }

  function reset() {
    profile.value = null
    loading.value = false
    error.value = null
  }

  // Initialize the store
  if (authStore.isAuthenticated) {
    loadProfile()
  }

  return {
    profile,
    loading,
    error,
    displayName,
    photoURL,
    role,
    isAdmin,
    isTeamLead,
    isTeamMember,
    loadProfile,
    updateProfile,
    reset
  }
}) 
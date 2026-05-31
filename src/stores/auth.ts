import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auth } from '../firebase'
import { 
  onAuthStateChanged,
  signOut as firebaseSignOut,
  type User
} from 'firebase/auth'
import { 
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  enableNetwork,
  disableNetwork
} from 'firebase/firestore'
import { db } from '../firebase'
import { useTeamsStore } from './teams'
import { useUserProfileStore } from './userProfile'
import { useRouter } from 'vue-router'

interface UserProfile {
  id: string
  email: string
  displayName: string
  photoURL: string | null
  role: 'admin' | 'team_lead' | 'team_member'
  createdAt: string
  updatedAt?: string
}

// List of admin email addresses
const ADMIN_EMAILS = [
  'florian.lay@gmx.net'   // Add more admin emails as needed
]

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const userProfile = ref<UserProfile | null>(null)
  const loading = ref(true)
  const isOffline = ref(false)
  const intendedDestination = ref<string | null>(null)
  const showLoginModal = ref(false)
  const router = useRouter()

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => {
    // Check both role and email for admin status
    return userProfile.value?.role === 'admin' || shouldBeAdmin(user.value?.email || null)
  })
  const isTeamLead = computed(() => userProfile.value?.role === 'team_lead')
  const isTeamMember = computed(() => userProfile.value?.role === 'team_member')

  function setIntendedDestination(path: string) {
    intendedDestination.value = path
  }

  function clearIntendedDestination() {
    intendedDestination.value = null
  }

  // Function to check if a user should be an admin based on their email
  function shouldBeAdmin(email: string | null): boolean {
    return email ? ADMIN_EMAILS.includes(email.toLowerCase()) : false
  }

  async function checkNetworkStatus() {
    try {
      await enableNetwork(db)
      isOffline.value = false
      console.log('Firestore is online')
    } catch (error) {
      console.error('Error enabling network:', error)
      isOffline.value = true
    }
  }

  async function loadUserProfile(uid: string) {
    try {
      console.log('Loading user profile for:', uid)
      
      // Check network status first
      await checkNetworkStatus()
      if (isOffline.value) {
        console.warn('Firestore is offline, cannot load profile')
        return
      }

      // Check if users collection exists
      const usersCollection = collection(db, 'users')
      const usersSnapshot = await getDocs(usersCollection)
      console.log('Users collection exists:', !usersSnapshot.empty)
      
      const userDoc = doc(db, 'users', uid)
      const docSnapshot = await getDoc(userDoc)
      
      if (docSnapshot.exists()) {
        console.log('User document exists:', true)
        const data = docSnapshot.data() as UserProfile
        console.log('User document data:', data)
        
        // Check if user should be admin but isn't marked as such
        if (shouldBeAdmin(data.email) && data.role !== 'admin') {
          console.log('Upgrading user to admin based on email')
          const updatedProfile = { ...data, role: 'admin' as const }
          await updateDoc(userDoc, { role: 'admin', updatedAt: new Date().toISOString() })
          userProfile.value = updatedProfile
        } else {
          userProfile.value = data
        }
      } else {
        console.log('User document does not exist, creating default profile')
        const defaultProfile: UserProfile = {
          id: uid,
          email: user.value?.email || '',
          displayName: user.value?.displayName || user.value?.email?.split('@')[0] || 'User',
          photoURL: user.value?.photoURL || null,
          role: shouldBeAdmin(user.value?.email || null) ? 'admin' : 'team_member',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        try {
          await setDoc(userDoc, defaultProfile)
          console.log('Default profile created successfully')
          userProfile.value = defaultProfile
        } catch (error) {
          console.error('Error creating default profile:', error)
          throw error
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
      throw error
    }
  }

  async function signOut() {
    try {
      // Clear all stores
      const teamsStore = useTeamsStore()
      const userProfileStore = useUserProfileStore()
      
      // Clear Firebase auth
      await firebaseSignOut(auth)
      
      // Clear stores
      user.value = null
      userProfile.value = null
      teamsStore.reset()
      userProfileStore.reset()
      clearIntendedDestination()
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  async function updateUserProfile(updates: Partial<UserProfile>) {
    if (!user.value) return
    
    try {
      await checkNetworkStatus()
      if (isOffline.value) {
        console.warn('Firestore is offline, cannot update profile')
        return
      }

      console.log('Updating user profile:', updates)
      const userRef = doc(db, 'users', user.value.uid)
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      })
      
      // Refresh the profile
      await loadUserProfile(user.value.uid)
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
  }

  async function checkAdminStatus() {
    if (!user.value) return false
    
    try {
      await checkNetworkStatus()
      if (isOffline.value) {
        console.warn('Firestore is offline, cannot check admin status')
        return false
      }

      console.log('Checking admin status for user:', user.value.uid)
      const adminQuery = query(
        collection(db, 'users'),
        where('id', '==', user.value.uid),
        where('role', '==', 'admin')
      )
      const querySnapshot = await getDocs(adminQuery)
      console.log('Admin query result:', !querySnapshot.empty)
      return !querySnapshot.empty
    } catch (error) {
      console.error('Error checking admin status:', error)
      return false
    }
  }

  // Function to manually set a user as admin (only current admin can do this)
  async function setUserAsAdmin(targetUserId: string) {
    if (!isAdmin.value) {
      throw new Error('Only admins can set other users as admin')
    }

    try {
      const userRef = doc(db, 'users', targetUserId)
      await updateDoc(userRef, {
        role: 'admin',
        updatedAt: new Date().toISOString()
      })
      console.log(`User ${targetUserId} set as admin`)
    } catch (error) {
      console.error('Error setting user as admin:', error)
      throw error
    }
  }

  // Function to update user role to team lead
  async function setUserAsTeamLead(targetUserId: string) {
    try {
      const userRef = doc(db, 'users', targetUserId)
      await updateDoc(userRef, {
        role: 'team_lead',
        updatedAt: new Date().toISOString()
      })
      
      if (targetUserId === user.value?.uid) {
        await loadUserProfile(targetUserId)
      }
    } catch (error) {
      console.error('Error setting user as team lead:', error)
      throw error
    }
  }

  // Function to remove admin status (only current admin can do this)
  async function removeAdminStatus(targetUserId: string) {
    if (!isAdmin.value) {
      throw new Error('Only admins can remove admin status')
    }

    try {
      const userRef = doc(db, 'users', targetUserId)
      await updateDoc(userRef, {
        role: 'team_member',
        updatedAt: new Date().toISOString()
      })
      console.log(`Admin status removed from user ${targetUserId}`)
    } catch (error) {
      console.error('Error removing admin status:', error)
      throw error
    }
  }

  // Initialize auth state listener
  onAuthStateChanged(auth, async (firebaseUser) => {
    console.log('Auth state changed:', firebaseUser?.uid)
    user.value = firebaseUser
    if (firebaseUser) {
      try {
        console.log('User authenticated:', {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName
        })
        await loadUserProfile(firebaseUser.uid)
        
        // Verify the profile was created
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
        if (!userDoc.exists()) {
          console.error('Failed to create user profile')
          throw new Error('Failed to create user profile')
        }

        // Close login modal if user is authenticated
        showLoginModal.value = false
        
        // If there's an intended destination, redirect there
        if (intendedDestination.value) {
          const destination = intendedDestination.value
          clearIntendedDestination()
          router.push(destination)
        }
      } catch (error) {
        console.error('Error in auth state change:', error)
        userProfile.value = null
      }
    } else {
      userProfile.value = null
    }
    loading.value = false
  })

  return {
    user,
    userProfile,
    loading,
    isOffline,
    isAuthenticated,
    isAdmin,
    isTeamLead,
    isTeamMember,
    intendedDestination,
    showLoginModal,
    setIntendedDestination,
    clearIntendedDestination,
    shouldBeAdmin,
    signOut,
    updateUserProfile,
    checkAdminStatus,
    checkNetworkStatus,
    setUserAsAdmin,
    setUserAsTeamLead,
    removeAdminStatus
  }
}) 
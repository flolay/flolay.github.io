<template>
  <nav class="bg-gradient-to-r from-primary-600 to-primary-700 shadow-2xl sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-20">
        <!-- Logo and Navigation -->
        <div class="flex items-center space-x-6">
          <button @click="router.push('/')" class="text-white hover:bg-white/10 p-3 rounded-xl transition-all duration-300 group">
            <Home class="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>
          
          <!-- Breadcrumbs -->
          <div class="hidden md:flex items-center space-x-2 text-white/80">
            <template v-for="(crumb, index) in breadcrumbs" :key="index">
              <ChevronRight v-if="index > 0" class="w-4 h-4 opacity-60" />
              <router-link
                v-if="!crumb.disabled"
                :to="crumb.href"
                class="hover:text-white transition-colors"
              >
                {{ crumb.text }}
              </router-link>
              <span v-else class="font-semibold text-white">{{ crumb.text }}</span>
            </template>
          </div>
        </div>

        <!-- Right side actions -->
        <div class="flex items-center space-x-4">
          <!-- Login button for unauthenticated users -->
          <button
            v-if="!authStore.isAuthenticated"
            @click="authStore.showLoginModal = true"
            class="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 font-semibold shadow-lg"
          >
            <LogIn class="w-5 h-5" />
            <span>Login</span>
          </button>

          <!-- Authenticated user menu -->
          <template v-else>
            <!-- Team selector -->
            <div v-if="teams.length > 0" class="relative">
              <button
                @click="showTeamMenu = !showTeamMenu"
                class="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 font-medium"
              >
                <Users class="w-5 h-5" />
                <span>{{ selectedTeam?.name || 'Select Team' }}</span>
                <ChevronDown class="w-4 h-4 transition-transform" :class="showTeamMenu && 'rotate-180'" />
              </button>
              
              <transition
                enter-active-class="transition ease-out duration-200"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-150"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <div
                  v-if="showTeamMenu"
                  ref="teamMenuRef"
                  class="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl py-2 overflow-hidden"
                >
                  <button
                    v-for="team in teams"
                    :key="team.id"
                    @click="handleTeamSelect(team)"
                    :class="[
                      'w-full text-left px-6 py-3 hover:bg-primary-50 transition-colors flex items-center justify-between group',
                      selectedTeam?.id === team.id && 'bg-primary-100 text-primary-700'
                    ]"
                  >
                    <span class="font-medium">{{ team.name }}</span>
                    <ChevronRight class="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>
              </transition>
            </div>

            <!-- User menu -->
            <div class="relative">
              <button
                @click="showUserMenu = !showUserMenu"
                class="bg-gradient-to-r from-secondary-500 to-secondary-600 text-white hover:from-secondary-600 hover:to-secondary-700 px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 font-medium shadow-lg"
              >
                <User class="w-5 h-5" />
                <span>{{ authStore.userProfile?.displayName || authStore.user?.displayName || authStore.user?.email?.split('@')[0] || 'User' }}</span>
                <ChevronDown class="w-4 h-4 transition-transform" :class="showUserMenu && 'rotate-180'" />
              </button>
              
              <transition
                enter-active-class="transition ease-out duration-200"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-150"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <div
                  v-if="showUserMenu"
                  ref="userMenuRef"
                  class="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl py-2 overflow-hidden"
                >
                  <router-link
                    v-if="authStore.isAdmin"
                    to="/admin"
                    class="flex items-center space-x-3 px-6 py-3 hover:bg-primary-50 transition-colors group"
                  >
                    <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                      <LayoutDashboard class="w-5 h-5 text-white" />
                    </div>
                    <span class="font-medium">Admin Dashboard</span>
                  </router-link>
                  
                  <router-link
                    to="/team"
                    class="flex items-center space-x-3 px-6 py-3 hover:bg-primary-50 transition-colors group"
                  >
                    <div class="w-10 h-10 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center">
                      <Users class="w-5 h-5 text-white" />
                    </div>
                    <span class="font-medium">Team Space</span>
                  </router-link>
                  
                  <router-link
                    to="/settings"
                    class="flex items-center space-x-3 px-6 py-3 hover:bg-primary-50 transition-colors group"
                  >
                    <div class="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center">
                      <Settings class="w-5 h-5 text-white" />
                    </div>
                    <span class="font-medium">Settings</span>
                  </router-link>
                  
                  <hr class="my-2 border-gray-200" />
                  
                  <button
                    @click="handleLogout"
                    class="w-full flex items-center space-x-3 px-6 py-3 hover:bg-red-50 transition-colors group"
                  >
                    <div class="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                      <LogOut class="w-5 h-5 text-white" />
                    </div>
                    <span class="font-medium text-red-600">Logout</span>
                  </button>
                </div>
              </transition>
            </div>
          </template>
        </div>
      </div>
    </div>
  </nav>

  <!-- Login Modal -->
  <transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="authStore.showLoginModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <div class="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
          <div class="bg-gradient-to-r from-primary-600 to-secondary-600 p-8 text-white">
<h2 class="text-3xl font-bold mb-2">{{ isSignUp ? 'Konto erstellen' : 'Hi' }}</h2>
            <p class="opacity-90">{{ isSignUp ? 'Tritt dem Wettkampf bei' : 'Anmelden um fortzufahren' }}</p>
          </div>
          
          <div class="p-8">
            <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
              {{ errorMessage }}
            </div>

            <div v-if="!showEmailLogin" class="space-y-4">
              <button
                @click="handleGoogleLogin"
                class="w-full flex items-center justify-center space-x-3 bg-white border-2 border-gray-200 text-gray-700 py-4 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 font-medium"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" class="w-5 h-5" />
<span>Mit Google anmelden</span>
              </button>


              <div class="relative my-6">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-gray-200"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="px-4 bg-white text-gray-500">oder</span>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <button
                  @click="() => { showEmailLogin = true; isSignUp = false }"
                  class="border-2 border-primary-200 text-primary-600 py-3 rounded-xl hover:bg-primary-50 hover:border-primary-300 transition-all duration-300 font-medium text-sm"
                >
                  Anmelden
                </button>
                <button
                  @click="() => { showEmailLogin = true; isSignUp = true }"
                  class="bg-primary-600 text-white py-3 rounded-xl hover:bg-primary-700 transition-all duration-300 font-medium text-sm"
                >
                  Registrieren
                </button>
              </div>
            </div>

            <form v-else @submit.prevent="handleEmailAuth" class="space-y-4">
              <div>
<label class="block text-sm font-semibold text-gray-700 mb-2">E-Mail</label>
                <input
                  v-model="email"
                  type="email"
                  class="input-field"
                  placeholder="E-Mail eingeben"
                  required
                />
              </div>
              
              <div>
<label class="block text-sm font-semibold text-gray-700 mb-2">Passwort</label>
                <input
                  v-model="password"
                  type="password"
                  class="input-field"
                  placeholder="Passwort eingeben"
                  required
                />
              </div>

              <div v-if="isSignUp">
<label class="block text-sm font-semibold text-gray-700 mb-2">Vollständiger Name</label>
                <input
                  v-model="name"
                  type="text"
                  class="input-field"
                  placeholder="Name eingeben"
                  required
                />
              </div>

              <div v-if="!isSignUp" class="text-right">
                <button
                  type="button"
                  @click="showResetPasswordDialog = true"
                  class="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
Passwort vergessen?
                </button>
              </div>

              <button
                type="submit"
                :disabled="loading"
                class="w-full btn btn-primary"
              >
                <Loader2 v-if="loading" class="animate-spin mr-2" :size="20" />
{{ isSignUp ? 'Konto erstellen' : 'Anmelden' }}
              </button>

              <div class="text-center">
                <button
                  type="button"
                  @click="isSignUp = !isSignUp"
                  class="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
{{ isSignUp ? 'Bereits ein Konto? Anmelden' : 'Kein Konto? Registrieren' }}
                </button>
              </div>

              <button
                type="button"
                @click="showEmailLogin = false"
                class="w-full text-gray-500 hover:text-gray-700 font-medium"
              >
← Zurück zu Anmeldeoptionen
              </button>
            </form>
          </div>
          
          <div class="px-8 py-4 bg-gray-50">
            <button
              @click="authStore.showLoginModal = false"
              class="w-full text-gray-600 hover:text-gray-800 font-medium"
            >
              Abbrechen
            </button>
          </div>
        </div>
      </transition>
    </div>
  </transition>

  <!-- Password Reset Dialog -->
  <transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="showResetPasswordDialog" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <div class="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
          <div class="bg-gradient-to-r from-primary-600 to-secondary-600 p-8 text-white">
            <h2 class="text-3xl font-bold">Reset Password</h2>
          </div>
          
          <div class="p-8">
            <div v-if="resetErrorMessage" class="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
              {{ resetErrorMessage }}
            </div>

            <div v-if="resetSuccessMessage" class="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl">
              {{ resetSuccessMessage }}
            </div>

            <p class="text-gray-600 mb-6">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <form @submit.prevent="handlePasswordReset" class="space-y-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  v-model="resetEmail"
                  type="email"
                  class="input-field"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <button type="submit" class="w-full btn btn-primary">
                Send Reset Link
              </button>
            </form>
          </div>
          
          <div class="px-8 py-4 bg-gray-50">
            <button
              @click="showResetPasswordDialog = false"
              class="w-full text-gray-600 hover:text-gray-800 font-medium"
            >
            Abbrechen
            </button>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { auth } from '@/firebase'
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth'
import { useRouter, useRoute } from 'vue-router'
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/firebase'
import { FirebaseError } from 'firebase/app'
import { Home, ChevronRight, LogIn, Users, ChevronDown, User, LayoutDashboard, Settings, LogOut, Loader2 } from 'lucide-vue-next'
import { notify } from '@kyvg/vue3-notification'
import { onClickOutside } from '@vueuse/core'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const showEmailLogin = ref(false)
const showResetPasswordDialog = ref(false)
const showTeamMenu = ref(false)
const showUserMenu = ref(false)
const teams = ref<any[]>([])
const selectedTeam = ref<any>(null)
const email = ref('')
const password = ref('')
const name = ref('')
const isSignUp = ref(false)
const errorMessage = ref('')
const resetEmail = ref('')
const resetSuccessMessage = ref('')
const resetErrorMessage = ref('')
const loading = ref(false)

const teamMenuRef = ref<HTMLElement>()
const userMenuRef = ref<HTMLElement>()

onClickOutside(teamMenuRef, () => {
  showTeamMenu.value = false
})

onClickOutside(userMenuRef, () => {
  showUserMenu.value = false
})

const breadcrumbs = computed(() => {
  const path = route.path
  const parts = path.split('/').filter(Boolean)
  
  return parts.map((part, index) => ({
    text: part.charAt(0).toUpperCase() + part.slice(1),
    disabled: index === parts.length - 1,
    href: '/' + parts.slice(0, index + 1).join('/')
  }))
})

async function loadTeams() {
  if (!authStore.user) return
  
  try {
    const teamsQuery = query(
      collection(db, 'teams'),
      where(`members.${authStore.user.uid}`, '!=', null)
    )
    
    const querySnapshot = await getDocs(teamsQuery)
    teams.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    if (route.params.teamId) {
      selectedTeam.value = teams.value.find(t => t.id === route.params.teamId)
    }
  } catch (error) {
    console.error('Error loading teams:', error)
  }
}

async function handleTeamSelect(team: any) {
  selectedTeam.value = team
  showTeamMenu.value = false
  router.push(`/team/${team.id}`)
}

async function handleGoogleLogin() {
  const provider = new GoogleAuthProvider()
  provider.addScope('email')
  provider.addScope('profile')
  
  try {
    loading.value = true
    errorMessage.value = ''
    
    const result = await signInWithPopup(auth, provider)
    console.log('Google sign in successful:', result)
    
    // Create user profile if this is a new user
    if (result.user) {
      const userProfile = {
        id: result.user.uid,
        email: result.user.email || '',
        displayName: result.user.displayName || result.user.email?.split('@')[0] || 'Google User',
        photoURL: result.user.photoURL,
        role: authStore.shouldBeAdmin(result.user.email || '') ? 'admin' : 'team_member',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      // Only create profile if user doesn't exist
      try {
        await setDoc(doc(db, 'users', result.user.uid), userProfile, { merge: true })
      } catch (profileError) {
        console.error('Error creating user profile:', profileError)
      }
    }
    
    authStore.showLoginModal = false
    await loadTeams()
    if (teams.value.length > 0) {
      router.push(`/team/${teams.value[0].id}`)
    } else {
      router.push('/team')
    }
  } catch (error: any) {
    console.error('Google login error:', error)
    
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case 'auth/operation-not-allowed':
          errorMessage.value = 'Google Sign In ist nicht aktiviert. Bitte kontaktiere den Administrator.'
          break
        case 'auth/cancelled-popup-request':
          errorMessage.value = 'Anmeldung wurde abgebrochen.'
          break
        case 'auth/popup-blocked':
          errorMessage.value = 'Popup wurde blockiert. Bitte erlaube Popups für diese Website.'
          break
        case 'auth/popup-closed-by-user':
          errorMessage.value = 'Anmeldung wurde abgebrochen.'
          break
        default:
          errorMessage.value = `Anmeldung fehlgeschlagen: ${error.message}`
      }
    } else {
      errorMessage.value = 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.'
    }
  } finally {
    loading.value = false
  }
}


async function handleEmailAuth() {
  try {
    loading.value = true
    errorMessage.value = ''

    if (isSignUp.value) {
      const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value)
      
      const userProfile = {
        id: userCredential.user.uid,
        email: email.value,
        displayName: name.value || email.value.split('@')[0],
        photoURL: null,
        role: authStore.shouldBeAdmin(email.value) ? 'admin' : 'team_member',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      await setDoc(doc(db, 'users', userCredential.user.uid), userProfile)
    } else {
      await signInWithEmailAndPassword(auth, email.value, password.value)
    }

    authStore.showLoginModal = false
    email.value = ''
    password.value = ''
    name.value = ''
    isSignUp.value = false
  } catch (error: any) {
    console.error('Authentication error:', error)
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage.value = 'This email is already registered. Please sign in instead.'
          break
        case 'auth/invalid-email':
          errorMessage.value = 'Please enter a valid email address.'
          break
        case 'auth/weak-password':
          errorMessage.value = 'Password should be at least 6 characters.'
          break
        case 'auth/user-not-found':
          errorMessage.value = 'No account found with this email. Please sign up instead.'
          break
        case 'auth/wrong-password':
          errorMessage.value = 'Incorrect password. Please try again.'
          break
        default:
          errorMessage.value = 'An error occurred. Please try again.'
      }
    } else {
      errorMessage.value = 'An unexpected error occurred. Please try again.'
    }
  } finally {
    loading.value = false
  }
}

async function handleLogout() {
  try {
    await authStore.signOut()
    showUserMenu.value = false
    router.push('/')
  } catch (error: any) {
    console.error('Logout error:', error)
    notify({
      title: 'Error',
      text: 'Failed to logout',
      type: 'error'
    })
  }
}

async function handlePasswordReset() {
  if (!resetEmail.value) {
    resetErrorMessage.value = 'Please enter your email address'
    return
  }

  try {
    await sendPasswordResetEmail(auth, resetEmail.value)
    resetSuccessMessage.value = 'Password reset email sent. Please check your inbox.'
    resetEmail.value = ''
    setTimeout(() => {
      showResetPasswordDialog.value = false
      resetSuccessMessage.value = ''
    }, 3000)
  } catch (error: any) {
    console.error('Password reset error:', error)
    resetErrorMessage.value = error.message
  }
}

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await loadTeams()
  }
})
</script>
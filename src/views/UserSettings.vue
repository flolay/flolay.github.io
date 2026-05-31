<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-12">
        <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/50">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl flex items-center justify-center shadow-2xl">
              <div class="w-8 h-8 bg-white rounded-xl flex items-center justify-center">
                <span class="text-primary-600 font-bold text-lg">S</span>
              </div>
            </div>
            <div>
              <h1 class="text-5xl font-black gradient-text">User Settings</h1>
              <p class="text-gray-600 text-xl">Manage your profile and account preferences</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="max-w-3xl mx-auto space-y-8">
        <!-- Profile Information Card -->
        <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
          <div class="bg-gradient-to-r from-primary-600 to-secondary-600 p-6 text-white">
            <h2 class="text-2xl font-bold flex items-center space-x-3">
              <div class="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                <span class="text-white font-bold">P</span>
              </div>
              <span>Profile Information</span>
            </h2>
          </div>
          
          <div class="p-8">
            <form @submit.prevent="updateProfile" class="space-y-6">
              <div>
                <label class="block text-sm font-semibold mb-2 text-gray-700">Display Name</label>
                <input
                  v-model="displayName"
                  type="text"
                  class="input-field"
                  placeholder="Enter your display name"
                />
              </div>
              
              <div>
                <label class="block text-sm font-semibold mb-2 text-gray-700">Email</label>
                <input
                  :value="authStore.user?.email"
                  type="email"
                  class="input-field opacity-75"
                  disabled
                />
              </div>
              
              <div>
                <label class="block text-sm font-semibold mb-2 text-gray-700">Role</label>
                <div class="relative">
                  <input
                    :value="roleDisplay"
                    type="text"
                    class="input-field opacity-75"
                    disabled
                  />
                  <div class="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span 
                      :class="[
                        'px-3 py-1 text-xs font-bold rounded-full',
                        authStore.isAdmin ? 'bg-yellow-100 text-yellow-800' : 
                        authStore.isTeamLead ? 'bg-blue-100 text-blue-800' : 
                        'bg-gray-100 text-gray-800'
                      ]"
                    >
                      {{ roleDisplay }}
                    </span>
                  </div>
                </div>
              </div>
              
              <button 
                type="submit" 
                :disabled="loading" 
                class="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 py-4 px-6 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <div class="flex items-center justify-center space-x-2">
                  <Loader2 v-if="loading" class="animate-spin w-5 h-5" />
                  <span>Update Profile</span>
                </div>
              </button>
            </form>
          </div>
        </div>

        <!-- Account Actions Card -->
        <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
          <div class="bg-gradient-to-r from-secondary-600 to-red-600 p-6 text-white">
            <h2 class="text-2xl font-bold flex items-center space-x-3">
              <div class="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                <span class="text-white font-bold">A</span>
              </div>
              <span>Account Actions</span>
            </h2>
          </div>
          
          <div class="p-8">
            <div class="space-y-4">
              <button 
                @click="handlePasswordReset" 
                class="w-full bg-gradient-to-r from-secondary-500 to-secondary-600 text-white hover:from-secondary-600 hover:to-secondary-700 py-4 px-6 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Reset Password
              </button>
              
              <button 
                @click="handleLogout" 
                class="w-full bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 py-4 px-6 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/firebase'
import { notify } from '@kyvg/vue3-notification'
import { Loader2 } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const displayName = ref('')
const loading = ref(false)

const roleDisplay = computed(() => {
  if (authStore.isAdmin) return 'Administrator'
  if (authStore.isTeamLead) return 'Team Lead'
  return 'Team Member'
})

async function updateProfile() {
  if (!displayName.value) return
  
  try {
    loading.value = true
    await authStore.updateUserProfile({
      displayName: displayName.value
    })
    notify({
      title: 'Success',
      text: 'Profile updated successfully',
      type: 'success'
    })
  } catch (error) {
    notify({
      title: 'Error',
      text: 'Failed to update profile',
      type: 'error'
    })
  } finally {
    loading.value = false
  }
}

async function handlePasswordReset() {
  if (!authStore.user?.email) return
  
  try {
    await sendPasswordResetEmail(auth, authStore.user.email)
    notify({
      title: 'Success',
      text: 'Password reset email sent. Check your inbox.',
      type: 'success'
    })
  } catch (error) {
    notify({
      title: 'Error',
      text: 'Failed to send password reset email',
      type: 'error'
    })
  }
}

async function handleLogout() {
  try {
    await authStore.signOut()
    router.push('/')
  } catch (error) {
    notify({
      title: 'Error',
      text: 'Failed to logout',
      type: 'error'
    })
  }
}

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/')
  } else {
    displayName.value = authStore.userProfile?.displayName || ''
  }
})
</script>
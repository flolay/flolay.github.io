<template>
  <div class="card">
    <h2 class="text-2xl font-bold mb-6">Team Registration</h2>
    <p class="text-gray-600 mb-4">
      Create or join a team to participate in the competition.
    </p>
    
    <div class="flex space-x-4">
      <button
        @click="handleCreateTeam"
        class="btn btn-primary"
      >
        Create Team
      </button>
      <button
        @click="handleJoinTeam"
        class="btn btn-secondary"
      >
        Join Team
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

function handleCreateTeam() {
  if (!authStore.isAuthenticated) {
    authStore.showLoginModal = true
  } else {
    router.push('/team')
  }
}

function handleJoinTeam() {
  if (!authStore.isAuthenticated) {
    authStore.showLoginModal = true
  } else {
    router.push('/team')
  }
}
</script>
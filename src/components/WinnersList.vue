<template>
  <div class="card">
    <h2 class="text-2xl font-bold mb-6 flex items-center">
      <Trophy class="mr-2 text-yellow-500" :size="28" />
      Winning Teams
    </h2>
    
    <div v-if="loading" class="flex justify-center py-8">
      <Loader2 class="animate-spin text-gray-400" :size="40" />
    </div>
    
    <div v-else-if="winningTeams.length > 0">
      <div class="grid gap-4">
        <div
          v-for="team in winningTeams"
          :key="team.id"
          class="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border border-yellow-200"
        >
          <div class="flex items-start justify-between">
            <div class="flex items-center space-x-4">
              <img
                v-if="team.iconUrl"
                :src="team.iconUrl"
                :alt="team.name"
                class="w-16 h-16 rounded-full object-cover"
              />
              <div class="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center" v-else>
                <Trophy class="text-white" :size="32" />
              </div>
              
              <div>
                <h3 class="text-xl font-bold text-gray-800">{{ team.name }}</h3>
                <p class="text-gray-600">{{ team.description }}</p>
                <div class="mt-2 space-y-1 text-sm">
                  <p class="text-gray-500">
                    <Calendar class="inline mr-1" :size="14" />
                    Won on: {{ new Date(team.wonAt).toLocaleString() }}
                  </p>
                  <p class="text-gray-500">
                    <Hash class="inline mr-1" :size="14" />
                    Winning Code: <span class="font-mono font-bold">{{ team.winningCode }}</span>
                  </p>
                  <p class="text-gray-500">
                    <Users class="inline mr-1" :size="14" />
                    Members: {{ Object.keys(team.members).length }}
                  </p>
                </div>
              </div>
            </div>
            
            <div class="text-right">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                <Award class="mr-1" :size="16" />
                Winner
              </span>
            </div>
          </div>
          
          <!-- Team Members -->
          <div class="mt-4 pt-4 border-t border-yellow-200">
            <h4 class="text-sm font-semibold text-gray-700 mb-2">Team Members:</h4>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(member, userId) in team.members"
                :key="userId"
                class="inline-flex items-center px-2 py-1 rounded text-xs"
                :class="member.role === 'team_lead' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'"
              >
                <User :size="12" class="mr-1" />
                {{ member.role === 'team_lead' ? 'Lead' : 'Member' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="text-center py-8">
      <Trophy class="mx-auto text-gray-300 mb-4" :size="64" />
      <p class="text-gray-500">No winning teams yet</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Trophy, Loader2, Calendar, Hash, Users, Award, User } from 'lucide-vue-next'
import { useTeamsStore } from '@/stores/teams'

const teamsStore = useTeamsStore()

const winningTeams = ref<any[]>([])
const loading = ref(true)

async function loadWinningTeams() {
  try {
    loading.value = true
    winningTeams.value = await teamsStore.getWinningTeams()
  } catch (error) {
    console.error('Failed to load winning teams:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadWinningTeams()
})
</script>
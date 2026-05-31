<template>
  <div class="card">
    <h2 class="text-2xl font-bold mb-6">Teams Overview</h2>
    
    <div v-if="loading" class="flex justify-center py-8">
      <Loader2 class="animate-spin text-gray-400" :size="40" />
    </div>
    
    <div v-else>
      <!-- Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-blue-50 p-4 rounded-lg">
          <div class="text-2xl font-bold text-blue-600">{{ teams.length }}</div>
          <div class="text-sm text-gray-600">Total Teams</div>
        </div>
        <div class="bg-green-50 p-4 rounded-lg">
          <div class="text-2xl font-bold text-green-600">{{ totalMembers }}</div>
          <div class="text-sm text-gray-600">Total Members</div>
        </div>
        <div class="bg-yellow-50 p-4 rounded-lg">
          <div class="text-2xl font-bold text-yellow-600">{{ winningTeamsCount }}</div>
          <div class="text-sm text-gray-600">Winning Teams</div>
        </div>
        <div class="bg-purple-50 p-4 rounded-lg">
          <div class="text-2xl font-bold text-purple-600">{{ averageTeamSize }}</div>
          <div class="text-sm text-gray-600">Avg Team Size</div>
        </div>
      </div>

      <!-- Teams Table -->
      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="border-b">
              <th class="text-left p-2">Team</th>
              <th class="text-left p-2">Members</th>
              <th class="text-left p-2">Status</th>
              <th class="text-left p-2">Created</th>
              <th class="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="team in teams" :key="team.id" class="border-b hover:bg-gray-50">
              <td class="p-2">
                <div class="flex items-center space-x-3">
                  <img
                    v-if="team.iconUrl"
                    :src="team.iconUrl"
                    :alt="team.name"
                    class="w-10 h-10 rounded-full object-cover"
                  />
                  <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center" v-else>
                    <Users :size="20" class="text-gray-600" />
                  </div>
                  <div>
                    <div class="font-medium">{{ team.name }}</div>
                    <div class="text-sm text-gray-500">{{ team.description }}</div>
                  </div>
                </div>
              </td>
              <td class="p-2">
                <div class="flex items-center space-x-2">
                  <Users :size="16" class="text-gray-500" />
                  <span>{{ Object.keys(team.members || {}).length }}</span>
                </div>
              </td>
              <td class="p-2">
                <span v-if="team.isWinner" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <Trophy :size="14" class="mr-1" /> Winner
                </span>
                <span v-else class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </td>
              <td class="p-2 text-sm text-gray-500">
                {{ new Date(team.createdAt).toLocaleDateString() }}
              </td>
              <td class="p-2">
                <button
                  @click="viewTeamDetails(team)"
                  class="text-primary hover:text-blue-700 font-medium text-sm"
                >
                  View Details
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Team Details Modal -->
    <div v-if="selectedTeam" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b">
          <div class="flex justify-between items-start">
            <div class="flex items-center space-x-4">
              <img
                v-if="selectedTeam.iconUrl"
                :src="selectedTeam.iconUrl"
                :alt="selectedTeam.name"
                class="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h3 class="text-xl font-bold">{{ selectedTeam.name }}</h3>
                <p class="text-gray-600">{{ selectedTeam.description }}</p>
              </div>
            </div>
            <button @click="selectedTeam = null" class="text-gray-400 hover:text-gray-600">
              <X :size="24" />
            </button>
          </div>
        </div>
        
        <div class="p-6">
          <h4 class="font-semibold mb-4">Team Members</h4>
          <div class="space-y-2">
            <div
              v-for="(member, userId) in selectedTeam.members"
              :key="userId"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <User :size="20" class="text-gray-600" />
                </div>
                <div>
                  <div class="font-medium">Member {{ userId.slice(-6) }}</div>
                  <div class="text-sm text-gray-500">
                    {{ member.role === 'team_lead' ? 'Team Lead' : 'Team Member' }}
                  </div>
                </div>
              </div>
              <span
                class="inline-flex items-center px-2 py-1 rounded text-xs"
                :class="member.role === 'team_lead' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'"
              >
                {{ member.role === 'team_lead' ? 'Lead' : 'Member' }}
              </span>
            </div>
          </div>
          
          <div v-if="selectedTeam.isWinner" class="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h4 class="font-semibold mb-2 text-yellow-800">Winner Information</h4>
            <div class="text-sm space-y-1">
              <p><strong>Won at:</strong> {{ new Date(selectedTeam.wonAt).toLocaleString() }}</p>
              <p><strong>Winning Code:</strong> <span class="font-mono">{{ selectedTeam.winningCode }}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Loader2, Users, Trophy, User, X } from 'lucide-vue-next'
import { collection, getDocs, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'

const teams = ref<any[]>([])
const loading = ref(true)
const selectedTeam = ref<any>(null)

const totalMembers = computed(() => {
  return teams.value.reduce((sum, team) => sum + Object.keys(team.members || {}).length, 0)
})

const winningTeamsCount = computed(() => {
  return teams.value.filter(team => team.isWinner).length
})

const averageTeamSize = computed(() => {
  if (teams.value.length === 0) return 0
  return (totalMembers.value / teams.value.length).toFixed(1)
})

async function loadTeams() {
  try {
    loading.value = true
    
    const unsubscribe = onSnapshot(collection(db, 'teams'), (snapshot) => {
      teams.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      loading.value = false
    })
    
    return unsubscribe
  } catch (error) {
    console.error('Error loading teams:', error)
    loading.value = false
  }
}

function viewTeamDetails(team: any) {
  selectedTeam.value = team
}

onMounted(() => {
  loadTeams()
})
</script>
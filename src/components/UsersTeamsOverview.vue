<template>
  <div class="space-y-8">
    <!-- Refresh Button -->
    <div class="flex justify-end">
      <button
        @click="loadData(true)"
        :disabled="loading"
        class="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 px-4 py-2 rounded-xl font-semibold transition-all duration-300 shadow-lg flex items-center space-x-2"
        title="Daten aktualisieren"
      >
        <svg class="w-4 h-4" :class="{ 'animate-spin': loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
        <span>Aktualisieren</span>
      </button>
    </div>
    
    <!-- Stats Overview -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
      <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6 rounded-2xl border border-blue-200">
        <div class="flex flex-col sm:flex-row items-center sm:space-x-3 text-center sm:text-left">
          <div class="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-2 sm:mb-0">
            <Users class="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <p class="text-xs sm:text-sm text-blue-600 font-semibold">Gesamt Nutzer</p>
            <p class="text-xl sm:text-2xl font-bold text-blue-800">{{ allUsers.length }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-gradient-to-br from-green-50 to-green-100 p-4 sm:p-6 rounded-2xl border border-green-200">
        <div class="flex flex-col sm:flex-row items-center sm:space-x-3 text-center sm:text-left">
          <div class="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-xl flex items-center justify-center mb-2 sm:mb-0">
            <UserCheck class="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <p class="text-xs sm:text-sm text-green-600 font-semibold">Teams</p>
            <p class="text-xl sm:text-2xl font-bold text-green-800">{{ allTeams.length }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-gradient-to-br from-purple-50 to-purple-100 p-4 sm:p-6 rounded-2xl border border-purple-200">
        <div class="flex flex-col sm:flex-row items-center sm:space-x-3 text-center sm:text-left">
          <div class="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-2 sm:mb-0">
            <Crown class="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <p class="text-xs sm:text-sm text-purple-600 font-semibold">Team-Leads</p>
            <p class="text-xl sm:text-2xl font-bold text-purple-800">{{ teamLeads.length }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 sm:p-6 rounded-2xl border border-yellow-200">
        <div class="flex flex-col sm:flex-row items-center sm:space-x-3 text-center sm:text-left">
          <div class="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500 rounded-xl flex items-center justify-center mb-2 sm:mb-0">
            <Hash class="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <p class="text-xs sm:text-sm text-yellow-600 font-semibold">Gewinner-Codes</p>
            <p class="text-xl sm:text-2xl font-bold text-yellow-800">{{ totalWinnerCodes }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="bg-white rounded-2xl shadow-xl p-2 border border-gray-100">
      <nav class="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
        <button
          type="button"
          @click.prevent="(event) => { event.stopPropagation(); activeInternalTab = 'users' }"
          :class="[
            'w-full sm:w-auto px-4 sm:px-6 py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300',
            activeInternalTab === 'users'
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-50'
          ]"
        >
          Alle Nutzer
        </button>
        <button
          type="button"
          @click.prevent="(event) => { event.stopPropagation(); activeInternalTab = 'teams' }"
          :class="[
            'w-full sm:w-auto px-4 sm:px-6 py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300',
            activeInternalTab === 'teams'
              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-50'
          ]"
        >
          Alle Teams
        </button>
      </nav>
    </div>

    <!-- Users Tab -->
    <div v-if="activeInternalTab === 'users'" class="bg-white rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-100">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h3 class="text-xl sm:text-2xl font-bold gradient-text">Alle Nutzer</h3>
        <div class="w-full sm:w-auto">
          <input
            v-model="userSearchTerm"
            type="text"
            placeholder="Nutzer suchen..."
            class="w-full sm:w-auto px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div class="overflow-x-auto -mx-4 sm:mx-0">
        <table class="w-full min-w-[600px]">
          <thead>
            <tr class="bg-gray-50">
              <th class="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold">Nutzer</th>
              <th class="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold hidden sm:table-cell">Email</th>
              <th class="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold">Rolle</th>
              <th class="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold hidden lg:table-cell">Team</th>
              <th class="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold hidden lg:table-cell">Angemeldet</th>
              <th class="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id" class="border-b border-gray-100 hover:bg-gray-50">
              <td class="py-2 sm:py-3 px-2 sm:px-4">
                <div class="flex items-center space-x-2 sm:space-x-3">
                  <img v-if="user.photoURL" :src="user.photoURL" :alt="user.displayName" class="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0" />
                  <div v-else class="w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <User class="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  </div>
                  <div class="min-w-0">
                    <p class="font-medium text-xs sm:text-sm truncate">{{ user.displayName }}</p>
                    <p class="text-xs text-gray-500 truncate sm:hidden">{{ user.email }}</p>
                  </div>
                </div>
              </td>
              <td class="py-2 sm:py-3 px-2 sm:px-4 hidden sm:table-cell">
                <span class="text-gray-700 text-xs sm:text-sm">{{ user.email }}</span>
              </td>
              <td class="py-2 sm:py-3 px-2 sm:px-4">
                <span :class="[
                  'px-1 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-semibold',
                  user.role === 'admin' ? 'bg-red-100 text-red-800' :
                  user.role === 'team_lead' ? 'bg-purple-100 text-purple-800' :
                  'bg-blue-100 text-blue-800'
                ]">
                  {{ getRoleDisplayName(user.role) }}
                </span>
              </td>
              <td class="py-2 sm:py-3 px-2 sm:px-4 hidden lg:table-cell">
                <span v-if="getUserTeam(user.id)" class="text-blue-600 font-medium text-xs sm:text-sm">
                  {{ getUserTeam(user.id)?.name }}
                </span>
                <span v-else class="text-gray-400 italic text-xs sm:text-sm">Kein Team</span>
              </td>
              <td class="py-2 sm:py-3 px-2 sm:px-4 hidden lg:table-cell">
                <span class="text-xs sm:text-sm text-gray-500">
                  {{ new Date(user.createdAt).toLocaleDateString('de-DE') }}
                </span>
              </td>
              <td class="py-2 sm:py-3 px-2 sm:px-4">
                <div class="flex items-center space-x-2">
                  <!-- Role Change Buttons -->
                  <div class="relative" data-dropdown>
                    <button
                      @click="toggleUserActions(user.id)"
                      class="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium"
                    >
                      Aktionen
                    </button>
                    
                    <!-- Dropdown Menu -->
                    <div v-if="showUserActions[user.id]" 
                         class="absolute right-0 sm:left-auto left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-10">
                      <!-- Promote to Team Lead -->
                      <button
                        v-if="user.role === 'team_member'"
                        @click="promoteToTeamLead(user)"
                        class="w-full text-left px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-t-xl"
                      >
                        👑 Zu Team-Lead befördern
                      </button>
                      
                      <!-- Demote to Member -->
                      <button
                        v-if="user.role === 'team_lead'"
                        @click="demoteToMember(user)"
                        class="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                      >
                        👤 Zu Mitglied degradieren
                      </button>
                      
                      <!-- Promote to Admin -->
                      <button
                        v-if="user.role !== 'admin' && canPromoteToAdmin"
                        @click="promoteToAdmin(user)"
                        class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        ⚡ Zu Admin befördern
                      </button>
                      
                      <!-- Demote from Admin (only for florian.lay@gmx.net) -->
                      <button
                        v-if="user.role === 'admin' && canDemoteAdmin"
                        @click="demoteFromAdmin(user)"
                        class="w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-orange-50"
                      >
                        ⬇️ Admin-Rechte entziehen
                      </button>
                      
                      <!-- Delete User -->
                      <button
                        v-if="user.email !== 'florian.lay@gmx.net'"
                        @click="deleteUser(user)"
                        class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-xl border-t border-gray-100"
                      >
                        🗑️ Nutzer löschen
                      </button>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Teams Tab -->
    <div v-if="activeInternalTab === 'teams'" class="bg-white rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-100">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h3 class="text-xl sm:text-2xl font-bold gradient-text">Alle Teams</h3>
        <div class="w-full sm:w-auto">
          <input
            v-model="teamSearchTerm"
            type="text"
            placeholder="Teams suchen..."
            class="w-full sm:w-auto px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
        <p class="mt-2 text-gray-500">Lade Teams...</p>
      </div>
      
      <!-- Teams List -->
      <div v-else-if="filteredTeams.length > 0" class="space-y-6">
        <div v-for="team in filteredTeams" :key="team.id" 
             class="border border-gray-200 rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-shadow duration-300">
          <div class="flex flex-col lg:flex-row items-start justify-between gap-4 mb-4">
            <div class="flex items-center space-x-3 sm:space-x-4">
              <img v-if="team.iconUrl" :src="team.iconUrl" :alt="team.name" class="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex-shrink-0" />
              <div v-else class="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                <Users class="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div class="min-w-0">
                <h4 class="text-lg sm:text-xl font-bold truncate">{{ team.name || 'Unbekanntes Team' }}</h4>
                <p class="text-sm sm:text-base text-gray-600 line-clamp-2">{{ team.description || 'Keine Beschreibung' }}</p>
                <p class="text-xs sm:text-sm text-gray-500">
                  Erstellt: {{ team.createdAt ? new Date(team.createdAt).toLocaleDateString('de-DE') : 'Unbekannt' }}
                </p>
              </div>
            </div>
            
            <div class="w-full lg:w-auto">
              <div class="flex items-center justify-between lg:justify-end space-x-3 sm:space-x-4 mb-2">
                <div class="text-center">
                  <p class="text-xs sm:text-sm text-gray-500">Mitglieder</p>
                  <p class="text-base sm:text-lg font-bold text-blue-600">{{ Object.keys(getActiveMembers(team.members)).length }}</p>
                </div>
                <div class="text-center">
                  <p class="text-xs sm:text-sm text-gray-500">Gewinner-Codes</p>
                  <p class="text-base sm:text-lg font-bold text-green-600">{{ (team.winnerCodes || []).length }}</p>
                </div>
                <div class="text-center">
                  <p class="text-xs sm:text-sm text-gray-500">Lose</p>
                  <p class="text-base sm:text-lg font-bold text-purple-600">{{ team.poolEntries || 0 }}</p>
                </div>
              </div>
              
              <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:space-x-3">
                <div v-if="team.finalWinner" class="inline-flex items-center space-x-2 bg-yellow-100 text-yellow-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                  <Trophy class="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{{ team.finalWinner.place }}. Platz</span>
                </div>
                
                <!-- Team Actions -->
                <button
                  @click="deleteTeam(team)"
                  class="text-red-600 hover:text-red-800 text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
                >
                  🗑️ <span class="hidden sm:inline">Team löschen</span>
                  <span class="sm:hidden">Löschen</span>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Team Members -->
          <div v-if="team.members && getActiveMembers(team.members).length > 0" class="border-t border-gray-100 pt-4">
            <h5 class="font-semibold mb-3 text-sm sm:text-base text-gray-700">Team-Mitglieder:</h5>
            <div class="flex flex-wrap gap-2 sm:gap-3">
              <div v-for="(memberInfo, userId) in getActiveMembers(team.members)" :key="`member-${team.id}-${userId}`"
                   class="flex items-center space-x-2 bg-gray-50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl">
                <div class="w-5 h-5 sm:w-6 sm:h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <User class="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-600" />
                </div>
                <div class="min-w-0">
                  <p class="text-xs sm:text-sm font-medium truncate">{{ getUserById(userId)?.displayName || getUserById(userId)?.email || 'Unbekannt' }}</p>
                  <p class="text-xs text-gray-500">{{ getRoleDisplayName(memberInfo?.role || 'team_member') }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Winner Codes -->
          <div v-if="team.winnerCodes && team.winnerCodes.length > 0" class="border-t border-gray-100 pt-4 mt-4">
            <h5 class="font-semibold mb-3 text-sm sm:text-base text-gray-700">Gewinner-Codes:</h5>
            <div class="flex flex-wrap gap-1.5 sm:gap-2">
              <span v-for="(code, index) in team.winnerCodes" :key="`code-${team.id}-${index}`" 
                    class="px-2 sm:px-3 py-0.5 sm:py-1 bg-green-100 text-green-800 text-xs sm:text-sm rounded-full font-medium">
                {{ code }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <Users class="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-600 mb-2">Keine Teams gefunden</h3>
        <p class="text-gray-500">Es wurden noch keine Teams erstellt oder sie entsprechen nicht den Suchkriterien.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { collection, getDocs, doc, updateDoc, deleteDoc, deleteField } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuthStore } from '@/stores/auth'
import { useTeamsStore } from '@/stores/teams'
import { notify } from '@kyvg/vue3-notification'
import { Users, User, UserCheck, Crown, Hash, Trophy } from 'lucide-vue-next'

const authStore = useAuthStore()
const teamsStore = useTeamsStore()

const activeInternalTab = ref('users')
const allUsers = ref<any[]>([])
const allTeams = ref<any[]>([])
const loading = ref(false)
const userSearchTerm = ref('')
const teamSearchTerm = ref('')
const showUserActions = ref<Record<string, boolean>>({})

const teamLeads = computed(() => (allUsers.value || []).filter(user => user?.role === 'team_lead'))
const totalWinnerCodes = computed(() => {
  return (allTeams.value || []).reduce((sum, team) => sum + (team?.winnerCodes?.length || 0), 0)
})

// Only florian.lay@gmx.net can promote to admin or demote admins
const canPromoteToAdmin = computed(() => authStore.user?.email === 'florian.lay@gmx.net')
const canDemoteAdmin = computed(() => authStore.user?.email === 'florian.lay@gmx.net')

const filteredUsers = computed(() => {
  if (!userSearchTerm.value) return allUsers.value || []
  const term = userSearchTerm.value.toLowerCase()
  return (allUsers.value || []).filter(user => 
    user?.displayName?.toLowerCase().includes(term) ||
    user?.email?.toLowerCase().includes(term)
  )
})

const filteredTeams = computed(() => {
  if (!teamSearchTerm.value) return allTeams.value || []
  const term = teamSearchTerm.value.toLowerCase()
  return (allTeams.value || []).filter(team => 
    team?.name?.toLowerCase().includes(term) ||
    team?.description?.toLowerCase().includes(term)
  )
})

function getRoleDisplayName(role: string): string {
  switch (role) {
    case 'admin': return 'Administrator'
    case 'team_lead': return 'Team-Lead'
    case 'team_member': return 'Team-Mitglied'
    default: return role
  }
}

function getUserTeam(userId: string) {
  if (!userId || !allTeams.value) return null
  return allTeams.value.find(team => team?.members && team.members[userId])
}

function getUserById(userId: string) {
  if (!userId || !allUsers.value) return null
  return allUsers.value.find(user => user?.id === userId)
}

function getActiveMembers(members: any) {
  if (!members) return {}
  // Filter out null members and return only active ones
  const activeMembers: any = {}
  Object.entries(members).forEach(([userId, memberInfo]) => {
    if (memberInfo !== null && memberInfo !== undefined) {
      activeMembers[userId] = memberInfo
    }
  })
  return activeMembers
}

async function loadAllUsers() {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'))
    allUsers.value = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) || []
  } catch (error) {
    console.error('Error loading users:', error)
    allUsers.value = []
    notify({
      title: 'Fehler',
      text: 'Nutzer konnten nicht geladen werden',
      type: 'error'
    })
  }
}

async function loadAllTeams() {
  try {
    const teamsSnapshot = await getDocs(collection(db, 'teams'))
    allTeams.value = teamsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) || []
  } catch (error) {
    console.error('Error loading teams:', error)
    allTeams.value = []
    notify({
      title: 'Fehler',
      text: 'Teams konnten nicht geladen werden',
      type: 'error'
    })
  }
}

async function changeUserRole(user: any, newRole: string) {
  try {
    await authStore.setUserAsTeamLead(user.id)
    
    notify({
      title: 'Erfolg',
      text: `Rolle von ${user.displayName} wurde geändert`,
      type: 'success'
    })
    
    // Reload data
    await loadAllUsers()
  } catch (error) {
    console.error('Error changing user role:', error)
    notify({
      title: 'Fehler',
      text: 'Rolle konnte nicht geändert werden',
      type: 'error'
    })
  }
}

async function loadData(showNotification = false) {
  loading.value = true
  try {
    await Promise.all([
      loadAllUsers(),
      loadAllTeams()
    ])
    
    if (showNotification) {
      notify({
        title: 'Erfolg',
        text: 'Daten wurden aktualisiert',
        type: 'success'
      })
    }
  } finally {
    loading.value = false
  }
}

// Toggle user actions dropdown
function toggleUserActions(userId: string) {
  showUserActions.value[userId] = !showUserActions.value[userId]
  // Close all other dropdowns
  Object.keys(showUserActions.value).forEach(id => {
    if (id !== userId) {
      showUserActions.value[id] = false
    }
  })
}

// User role management functions
async function promoteToTeamLead(user: any) {
  try {
    await updateDoc(doc(db, 'users', user.id), {
      role: 'team_lead',
      updatedAt: new Date().toISOString()
    })
    
    notify({
      title: 'Erfolg',
      text: `${user.displayName} wurde zu Team-Lead befördert`,
      type: 'success'
    })
    
    showUserActions.value[user.id] = false
    await loadAllUsers()
  } catch (error) {
    console.error('Error promoting to team lead:', error)
    notify({
      title: 'Fehler',
      text: 'Beförderung zu Team-Lead fehlgeschlagen',
      type: 'error'
    })
  }
}

async function demoteToMember(user: any) {
  try {
    await updateDoc(doc(db, 'users', user.id), {
      role: 'team_member',
      updatedAt: new Date().toISOString()
    })
    
    notify({
      title: 'Erfolg',
      text: `${user.displayName} wurde zu Team-Mitglied degradiert`,
      type: 'success'
    })
    
    showUserActions.value[user.id] = false
    await loadAllUsers()
  } catch (error) {
    console.error('Error demoting to member:', error)
    notify({
      title: 'Fehler',
      text: 'Degradierung zu Team-Mitglied fehlgeschlagen',
      type: 'error'
    })
  }
}

async function promoteToAdmin(user: any) {
  try {
    await updateDoc(doc(db, 'users', user.id), {
      role: 'admin',
      updatedAt: new Date().toISOString()
    })
    
    notify({
      title: 'Erfolg',
      text: `${user.displayName} wurde zu Administrator befördert`,
      type: 'success'
    })
    
    showUserActions.value[user.id] = false
    await loadAllUsers()
  } catch (error) {
    console.error('Error promoting to admin:', error)
    notify({
      title: 'Fehler',
      text: 'Beförderung zu Administrator fehlgeschlagen',
      type: 'error'
    })
  }
}

async function demoteFromAdmin(user: any) {
  try {
    await updateDoc(doc(db, 'users', user.id), {
      role: 'team_member',
      updatedAt: new Date().toISOString()
    })
    
    notify({
      title: 'Erfolg',
      text: `${user.displayName} wurde von Administrator zu Team-Mitglied degradiert`,
      type: 'success'
    })
    
    showUserActions.value[user.id] = false
    await loadAllUsers()
  } catch (error) {
    console.error('Error demoting from admin:', error)
    notify({
      title: 'Fehler',
      text: 'Degradierung von Administrator fehlgeschlagen',
      type: 'error'
    })
  }
}

// User deletion
async function deleteUser(user: any) {
  if (!confirm(`Möchten Sie ${user.displayName} wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`)) {
    return
  }
  
  try {
    // Remove user from all teams first
    const userTeams = allTeams.value.filter(team => team.members && team.members[user.id])
    for (const team of userTeams) {
      await updateDoc(doc(db, 'teams', team.id), {
        [`members.${user.id}`]: deleteField(),
        updatedAt: new Date().toISOString()
      })
    }
    
    // Delete user document
    await deleteDoc(doc(db, 'users', user.id))
    
    notify({
      title: 'Erfolg',
      text: `${user.displayName} wurde erfolgreich gelöscht`,
      type: 'success'
    })
    
    await Promise.all([loadAllUsers(), loadAllTeams()])
  } catch (error) {
    console.error('Error deleting user:', error)
    notify({
      title: 'Fehler',
      text: 'Nutzer konnte nicht gelöscht werden',
      type: 'error'
    })
  }
}

// Team deletion
async function deleteTeam(team: any) {
  if (!confirm(`Möchten Sie das Team "${team.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`)) {
    return
  }
  
  try {
    await deleteDoc(doc(db, 'teams', team.id))
    
    notify({
      title: 'Erfolg',
      text: `Team "${team.name}" wurde erfolgreich gelöscht`,
      type: 'success'
    })
    
    await loadAllTeams()
  } catch (error) {
    console.error('Error deleting team:', error)
    notify({
      title: 'Fehler',
      text: 'Team konnte nicht gelöscht werden',
      type: 'error'
    })
  }
}

let handleOutsideClick: ((event: Event) => void) | null = null

onMounted(() => {
  loadData()
  
  // Close dropdowns when clicking outside
  handleOutsideClick = (event: Event) => {
    const target = event.target as HTMLElement
    // Only close dropdowns if clicking outside dropdown containers
    if (!target.closest('[data-dropdown]')) {
      Object.keys(showUserActions.value).forEach(id => {
        showUserActions.value[id] = false
      })
    }
  }
  
  document.addEventListener('click', handleOutsideClick)
})

onUnmounted(() => {
  if (handleOutsideClick) {
    document.removeEventListener('click', handleOutsideClick)
    handleOutsideClick = null
  }
})
</script>
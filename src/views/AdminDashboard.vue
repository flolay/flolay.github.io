<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
    <div class="container mx-auto px-2 md:px-4 py-4 md:py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-4 md:p-8 border border-white/50">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="flex items-center space-x-3 md:space-x-4">
              <div class="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl flex items-center justify-center shadow-2xl">
                <div class="w-6 h-6 md:w-8 md:h-8 bg-white rounded-xl flex items-center justify-center">
                  <span class="text-primary-600 font-bold text-sm md:text-lg">A</span>
                </div>
              </div>
              <div>
                <h1 class="text-2xl md:text-3xl lg:text-5xl font-black gradient-text">Admin-Bereich</h1>
                <p class="text-gray-600 text-sm md:text-xl">Verwaltung von Teams, Codes und Wettkampf-Daten</p>
              </div>
            </div>
            <button
              @click="refreshAllData"
              :disabled="loading"
              class="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 px-4 py-2 md:px-6 md:py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
              title="Alle Daten aktualisieren"
            >
              <RefreshCw :class="['w-4 h-4 md:w-5 md:h-5', loading && 'animate-spin']" />
              <span class="hidden sm:inline">Daten aktualisieren</span>
              <span class="sm:hidden">Aktualisieren</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Modern Tabs -->
      <div class="mb-8">
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-2 border border-white/50">
          <nav class="grid grid-cols-2 lg:flex lg:space-x-2 gap-2 lg:gap-0">
            <button
              @click="activeTab = 'teams'"
              :class="[
                'px-3 py-2 md:px-6 md:py-3 rounded-xl font-semibold text-xs md:text-sm transition-all duration-300 transform hover:scale-105',
                activeTab === 'teams'
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
              ]"
            >
              <span class="hidden md:inline">Teams & Nutzer</span>
              <span class="md:hidden">Teams</span>
            </button>
            <button
              @click="activeTab = 'codes'"
              :class="[
                'px-3 py-2 md:px-6 md:py-3 rounded-xl font-semibold text-xs md:text-sm transition-all duration-300 transform hover:scale-105',
                activeTab === 'codes'
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
              ]"
            >
              <span class="hidden md:inline">Lostopf-Verwaltung</span>
              <span class="md:hidden">Codes</span>
            </button>
            <button
              @click="activeTab = 'winners'"
              :class="[
                'px-3 py-2 md:px-6 md:py-3 rounded-xl font-semibold text-xs md:text-sm transition-all duration-300 transform hover:scale-105',
                activeTab === 'winners'
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
              ]"
            >
              Gewinner
            </button>
            <button
              @click="activeTab = 'map'"
              :class="[
                'px-3 py-2 md:px-6 md:py-3 rounded-xl font-semibold text-xs md:text-sm transition-all duration-300 transform hover:scale-105',
                activeTab === 'map'
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
              ]"
            >
              <span class="hidden md:inline">Geländeplan</span>
              <span class="md:hidden">Karte</span>
            </button>
          </nav>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
        <div v-if="activeTab === 'teams'" class="p-4 md:p-8">
          <UsersTeamsOverview />
        </div>

        <div v-else-if="activeTab === 'codes'" class="p-4 md:p-8">
          <WinnerPoolManager />
        </div>

        <div v-else-if="activeTab === 'winners'" class="p-4 md:p-8">
          <WinnersList />
        </div>

        <div v-else-if="activeTab === 'map'" class="p-4 md:p-8">
          <h2 class="text-xl md:text-3xl font-bold mb-4 md:mb-6 gradient-text">Geländeplan bearbeiten</h2>
          <div class="bg-gray-50 rounded-2xl p-2 md:p-4 shadow-inner">
            <InteractiveMap :editable="true" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import InteractiveMap from '@/components/InteractiveMap.vue'
import WinnerPoolManager from '@/components/WinnerPoolManager.vue'
import UsersTeamsOverview from '@/components/UsersTeamsOverview.vue'
import WinnersList from '@/components/WinnersList.vue'
import { RefreshCw } from 'lucide-vue-next'
import { notify } from '@kyvg/vue3-notification'

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref('teams')
const loading = ref(false)

async function refreshAllData() {
  try {
    loading.value = true
    
    // Force re-render of child components by changing key
    const currentTab = activeTab.value
    activeTab.value = ''
    await new Promise(resolve => setTimeout(resolve, 100))
    activeTab.value = currentTab
    
    notify({
      title: 'Erfolg',
      text: 'Alle Daten wurden aktualisiert',
      type: 'success'
    })
  } catch (error) {
    console.error('Error refreshing data:', error)
    notify({
      title: 'Fehler',
      text: 'Daten konnten nicht aktualisiert werden',
      type: 'error'
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!authStore.isAdmin) {
    router.push('/')
  }
})
</script>
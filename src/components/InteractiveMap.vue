<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <!-- Map Viewer -->
    <div class="lg:col-span-2">
      <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/50">
        <div class="bg-gradient-to-r from-primary-600 to-secondary-600 p-4 text-white">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold flex items-center space-x-2">
              <div class="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                <span class="text-white text-sm">📍</span>
              </div>
              <span>Veranstaltungsort Karte</span>
            </h3>
            
            <!-- Admin Edit Controls -->
            <div v-if="props.editable && authStore.isAdmin" class="flex items-center space-x-2">
              <button
                @click="isEditMode = !isEditMode"
                :class="[
                  'px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300',
                  isEditMode 
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                    : 'bg-white/20 hover:bg-white/30 text-white'
                ]"
              >
                {{ isEditMode ? 'Bearbeitung beenden' : 'Karte bearbeiten' }}
              </button>
              <button
                v-if="isEditMode"
                @click="saveMap"
                class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold text-sm transition-all duration-300"
              >
                Änderungen speichern
              </button>
              <button
                v-if="isEditMode"
                @click="clearAllMarkers"
                class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm transition-all duration-300"
              >
                Alle Marker löschen
              </button>
            </div>
          </div>
        </div>
        
        <div class="p-6">
          <!-- Map Container -->
          <div 
            ref="mapContainer"
            class="relative bg-gray-50 rounded-2xl overflow-hidden shadow-inner" 
            style="min-height: 600px;"
            @click="isEditMode && handleMapClick($event)"
            :class="{ 'cursor-crosshair': isEditMode }"
          >
            <!-- Background SVG Map -->
            <div class="absolute inset-0 w-full h-full">
              <img
                src="/assets/competition_area.svg"
                alt="Competition Area Map"
                class="w-full h-full object-contain"
                @load="onMapImageLoad"
                @error="onMapImageError"
              />
            </div>
            
            <!-- Location Markers Overlay -->
            <div class="absolute inset-0">
              <div 
                v-for="(location, index) in mapLocations" 
                :key="`location-${index}`"
                :style="{ 
                  top: location.y + '%', 
                  left: location.x + '%',
                  transform: 'translate(-50%, -50%)'
                }"
                class="absolute group cursor-pointer"
                @click.stop="isEditMode ? editLocation(location, index) : (selectedLocation = location)"
              >
                <!-- Main Marker -->
                <div 
                  :class="[
                    'w-8 h-8 rounded-full shadow-lg transition-transform duration-300 border-3 border-white',
                    getLocationMarkerClass(),
                    isEditMode ? 'group-hover:scale-125' : 'animate-pulse group-hover:scale-110'
                  ]"
                >
                  <div class="w-full h-full flex items-center justify-center">
                    <div class="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
                
                <!-- Delete button in edit mode -->
                <button
                  v-if="isEditMode"
                  @click.stop="deleteLocation(index)"
                  class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs font-bold transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                >
                  ×
                </button>
                
                <!-- Tooltip -->
                <div class="absolute bottom-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                  <div class="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-xl">
                    {{ location.name }}
                    <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Edit Mode Instructions -->
            <div v-if="isEditMode" class="absolute top-4 left-4 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg">
              Klicken Sie auf die Karte, um einen Standort-Marker hinzuzufügen
            </div>
            
            <!-- Loading Indicator -->
            <div v-if="mapLoading" class="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
              <div class="text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                <p class="text-gray-600">Karte wird geladen...</p>
              </div>
            </div>
            
            <!-- Error State -->
            <div v-if="mapError" class="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div class="text-center p-8">
                <div class="text-red-500 text-4xl mb-4">⚠️</div>
                <p class="text-gray-600 mb-4">Karte konnte nicht geladen werden</p>
                <button 
                  @click="retryLoadMap"
                  class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Erneut versuchen
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Information Panel -->
    <div class="space-y-6">
      <!-- Selected Location Info -->
      <div v-if="selectedLocation" class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
        <div class="bg-gradient-to-r from-primary-600 to-secondary-600 p-4 text-white">
          <h3 class="text-xl font-bold">{{ selectedLocation.name }}</h3>
        </div>
        
        <div class="p-6">
          <p class="text-gray-600 mb-4">{{ selectedLocation.description }}</p>
          <div v-if="selectedLocation.versus" class="space-y-2">
            <div class="flex items-center space-x-2 text-sm">
              <span class="w-2 h-2 bg-primary-500 rounded-full"></span>
              <span class="font-medium">Spielmodus:</span>
              <span class="text-gray-600">{{ selectedLocation.versus }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- All Locations List -->
      <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
        <div class="bg-gradient-to-r from-green-600 to-emerald-600 p-4 text-white">
          <h3 class="text-xl font-bold flex items-center space-x-2">
            <div class="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
              <span class="text-white text-sm">🎯</span>
            </div>
            <span>Alle Standorte</span>
          </h3>
        </div>
        
        <div class="p-6">
          <div v-if="mapLocations.length === 0" class="text-center text-gray-500 py-4">
            Keine Standorte definiert
          </div>
          <div v-else class="space-y-3">
            <div 
              v-for="(location, index) in mapLocations" 
              :key="index"
              class="p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300 cursor-pointer"
              @click="selectedLocation = location"
            >
              <div class="flex items-center justify-between">
                <div>
                  <span class="font-medium text-sm block">{{ location.name }}</span>
                  <span v-if="location.versus" class="text-xs text-gray-500">{{ location.versus }}</span>
                </div>
                <div :class="getLocationMarkerClass()" class="w-3 h-3 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Location Form Modal -->
    <div v-if="showLocationForm" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-3xl max-w-md w-full shadow-2xl">
        <div class="bg-gradient-to-r from-primary-600 to-secondary-600 p-6 text-white rounded-t-3xl">
          <h3 class="text-2xl font-bold">
            {{ editingLocationIndex !== null ? 'Standort bearbeiten' : 'Neuen Standort hinzufügen' }}
          </h3>
        </div>
        
        <div class="p-6">
          <form @submit.prevent="saveLocation" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold mb-2 text-gray-700">Standortname *</label>
              <input
                v-model="newLocation.name"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Standortname eingeben"
                required
              />
            </div>
            
            
            <div>
              <label class="block text-sm font-semibold mb-2 text-gray-700">Beschreibung *</label>
              <textarea
                v-model="newLocation.description"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows="3"
                placeholder="Standortbeschreibung eingeben"
                required
              ></textarea>
            </div>
            
            <div>
              <label class="block text-sm font-semibold mb-2 text-gray-700">Spielmodus (optional)</label>
              <select
                v-model="newLocation.versus"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">-- Spielmodus wählen --</option>
                <option value="1v1">1 gegen 1</option>
                <option value="1v2">1 gegen 2</option>
                <option value="2v2">2 gegen 2</option>
                <option value="2v3">2 gegen 3</option>
                <option value="3v3">3 gegen 3</option>
                <option value="Team">Team vs Team</option>
                <option value="Alle">Alle zusammen</option>
              </select>
            </div>
            
            <div class="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
              Position: {{ newLocation.x?.toFixed(1) }}%, {{ newLocation.y?.toFixed(1) }}%
            </div>
            
            <div class="flex space-x-3 pt-4">
              <button 
                type="submit" 
                class="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 py-3 px-6 rounded-xl font-bold transition-all duration-300"
              >
                {{ editingLocationIndex !== null ? 'Aktualisieren' : 'Hinzufügen' }}
              </button>
              <button 
                type="button" 
                @click="showLocationForm = false"
                class="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 py-3 px-6 rounded-xl font-bold transition-all duration-300"
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { notify } from '@kyvg/vue3-notification'
import { useAuthStore } from '@/stores/auth'

interface MapLocation {
  name: string
  description: string
  versus?: string // e.g., "1v1", "1v2", "2v2", etc.
  x: number // Percentage position on map
  y: number // Percentage position on map
}

// Props
interface Props {
  editable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  editable: false
})

const authStore = useAuthStore()

// Refs
const mapContainer = ref<HTMLElement>()
const selectedLocation = ref<MapLocation | null>(null)
const isEditMode = ref(false)
const showLocationForm = ref(false)
const editingLocationIndex = ref<number | null>(null)
const mapLoading = ref(true)
const mapError = ref(false)

const newLocation = ref<Partial<MapLocation>>({
  name: '',
  description: '',
  versus: undefined
})

// Map locations
const mapLocations = ref<MapLocation[]>([])


// Functions
function getLocationMarkerClass(): string {
  // Use a single consistent color for all markers
  return 'bg-gradient-to-br from-primary-500 to-secondary-500'
}

// Map interaction functions
function handleMapClick(event: MouseEvent) {
  if (!isEditMode.value || !mapContainer.value) return
  
  const rect = mapContainer.value.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 100
  const y = ((event.clientY - rect.top) / rect.height) * 100
  
  // Set the position for the new location
  newLocation.value.x = Math.round(x * 10) / 10
  newLocation.value.y = Math.round(y * 10) / 10
  
  // Reset form
  newLocation.value.name = ''
  newLocation.value.description = ''
  newLocation.value.versus = undefined
  editingLocationIndex.value = null
  
  showLocationForm.value = true
}

function onMapImageLoad() {
  mapLoading.value = false
  mapError.value = false
}

function onMapImageError() {
  mapLoading.value = false
  mapError.value = true
}

function retryLoadMap() {
  mapLoading.value = true
  mapError.value = false
  // Force reload by updating the image src
  const img = mapContainer.value?.querySelector('img')
  if (img) {
    const src = img.src
    img.src = ''
    setTimeout(() => {
      img.src = src
    }, 100)
  }
}

// Location functions
function editLocation(location: MapLocation, index: number) {
  if (!isEditMode.value) return
  
  newLocation.value = { ...location }
  editingLocationIndex.value = index
  showLocationForm.value = true
}

function deleteLocation(index: number) {
  mapLocations.value.splice(index, 1)
  notify({
    title: 'Erfolg',
    text: 'Standort gelöscht',
    type: 'success'
  })
}

function saveLocation() {
  if (!newLocation.value.name || !newLocation.value.description) {
    notify({
      title: 'Fehler',
      text: 'Bitte füllen Sie alle Pflichtfelder aus',
      type: 'error'
    })
    return
  }
  
  const locationData = {
    name: newLocation.value.name!,
    description: newLocation.value.description!,
    versus: newLocation.value.versus,
    x: newLocation.value.x!,
    y: newLocation.value.y!
  }
  
  if (editingLocationIndex.value !== null) {
    mapLocations.value[editingLocationIndex.value] = locationData
    notify({
      title: 'Erfolg',
      text: 'Standort aktualisiert',
      type: 'success'
    })
  } else {
    mapLocations.value.push(locationData)
    notify({
      title: 'Erfolg',
      text: 'Standort hinzugefügt',
      type: 'success'
    })
  }
  
  showLocationForm.value = false
  editingLocationIndex.value = null
}

function clearAllMarkers() {
  if (confirm('Möchten Sie wirklich alle Standort-Marker löschen?')) {
    mapLocations.value = []
    notify({
      title: 'Erfolg',
      text: 'Alle Marker gelöscht',
      type: 'success'
    })
  }
}

// Map configuration functions
async function loadMapConfig() {
  try {
    const mapDoc = await getDoc(doc(db, 'config', 'map'))
    if (mapDoc.exists()) {
      const data = mapDoc.data()
      if (data.locations) {
        mapLocations.value = data.locations
      }
    }
  } catch (error) {
    console.error('Error loading map config:', error)
    notify({
      title: 'Warnung',
      text: 'Gespeicherte Standorte konnten nicht geladen werden',
      type: 'warn'
    })
  }
}

async function saveMap() {
  try {
    // Filter out undefined values from locations before saving
    const cleanedLocations = mapLocations.value.map(location => {
      const cleaned: any = {
        name: location.name,
        description: location.description,
        x: location.x,
        y: location.y
      }
      
      // Only include versus if it has a value
      if (location.versus && location.versus.trim() !== '') {
        cleaned.versus = location.versus
      }
      
      return cleaned
    })
    
    await setDoc(doc(db, 'config', 'map'), {
      locations: cleanedLocations,
      updatedAt: new Date().toISOString()
    })
    
    notify({
      title: 'Erfolg',
      text: 'Kartenkonfiguration erfolgreich gespeichert',
      type: 'success'
    })
    
    isEditMode.value = false
  } catch (error) {
    console.error('Error saving map config:', error)
    notify({
      title: 'Fehler',
      text: 'Kartenkonfiguration konnte nicht gespeichert werden',
      type: 'error'
    })
  }
}

// Initialize component
onMounted(async () => {
  // await loadMapConfig() // Temporarily disabled
})
</script>
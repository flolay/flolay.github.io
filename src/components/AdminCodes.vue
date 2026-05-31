<template>
  <div class="card">
    <h2 class="text-2xl font-bold mb-6">Code Management</h2>
    
    <!-- Generate Codes Form -->
    <div class="mb-8 p-4 bg-gray-50 rounded-lg">
      <h3 class="text-lg font-semibold mb-4">Generate New Codes</h3>
      <form @submit.prevent="generateCodes" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">Total Codes</label>
            <input
              v-model.number="totalCodes"
              type="number"
              min="1"
              max="1000"
              class="input-field"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Winner Codes</label>
            <input
              v-model.number="winnerCodes"
              type="number"
              min="0"
              :max="totalCodes"
              class="input-field"
              required
            />
          </div>
        </div>
        <button type="submit" :disabled="loading" class="btn btn-primary">
          <Loader2 v-if="loading" class="animate-spin mr-2" :size="20" />
          Generate Codes
        </button>
      </form>
    </div>

    <!-- Codes List -->
    <div v-if="codes.length > 0">
      <h3 class="text-lg font-semibold mb-4">Generated Codes ({{ codes.length }})</h3>
      
      <!-- Stats -->
      <div class="grid grid-cols-4 gap-4 mb-6">
        <div class="bg-blue-50 p-4 rounded-lg">
          <div class="text-2xl font-bold text-blue-600">{{ codes.length }}</div>
          <div class="text-sm text-gray-600">Total Codes</div>
        </div>
        <div class="bg-green-50 p-4 rounded-lg">
          <div class="text-2xl font-bold text-green-600">{{ winnerCodesCount }}</div>
          <div class="text-sm text-gray-600">Winner Codes</div>
        </div>
        <div class="bg-yellow-50 p-4 rounded-lg">
          <div class="text-2xl font-bold text-yellow-600">{{ usedCodesCount }}</div>
          <div class="text-sm text-gray-600">Used Codes</div>
        </div>
        <div class="bg-gray-50 p-4 rounded-lg">
          <div class="text-2xl font-bold text-gray-600">{{ unusedCodesCount }}</div>
          <div class="text-sm text-gray-600">Unused Codes</div>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex gap-2 mb-4">
        <button
          @click="filter = 'all'"
          :class="['btn', filter === 'all' ? 'btn-primary' : 'btn-secondary']"
        >
          All
        </button>
        <button
          @click="filter = 'winners'"
          :class="['btn', filter === 'winners' ? 'btn-primary' : 'btn-secondary']"
        >
          Winners
        </button>
        <button
          @click="filter = 'used'"
          :class="['btn', filter === 'used' ? 'btn-primary' : 'btn-secondary']"
        >
          Used
        </button>
        <button
          @click="filter = 'unused'"
          :class="['btn', filter === 'unused' ? 'btn-primary' : 'btn-secondary']"
        >
          Unused
        </button>
      </div>

      <!-- Codes Table -->
      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="border-b">
              <th class="text-left p-2">Code</th>
              <th class="text-left p-2">Type</th>
              <th class="text-left p-2">Status</th>
              <th class="text-left p-2">Used By</th>
              <th class="text-left p-2">Used At</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="code in filteredCodes" :key="code.id" class="border-b hover:bg-gray-50">
              <td class="p-2 font-mono font-bold">{{ code.code }}</td>
              <td class="p-2">
                <span v-if="code.isWinner" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <Trophy :size="14" class="mr-1" /> Winner
                </span>
                <span v-else class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Regular
                </span>
              </td>
              <td class="p-2">
                <span v-if="code.isUsed" class="text-orange-600 font-medium">Used</span>
                <span v-else class="text-green-600 font-medium">Available</span>
              </td>
              <td class="p-2">{{ code.usedByTeam || '-' }}</td>
              <td class="p-2">{{ code.usedAt ? new Date(code.usedAt).toLocaleString() : '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Export & Delete All Buttons -->
      <div class="mt-6 flex gap-4">
        <button @click="exportCodes" class="btn btn-secondary">
          <Download class="mr-2" :size="20" />
          Export Codes to CSV
        </button>
        <button @click="showDeleteConfirm = true" class="btn bg-red-600 hover:bg-red-700 text-white">
          <Trash2 class="mr-2" :size="20" />
          Alle Codes löschen
        </button>
      </div>

      <!-- Delete All Confirmation Modal -->
      <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
          <h3 class="text-xl font-bold mb-4 text-red-600">Alle Codes löschen?</h3>
          <p class="text-gray-600 mb-6">Dies löscht alle {{ codes.length }} Codes unwiderruflich. Diese Aktion kann nicht rückgängig gemacht werden.</p>
          <div class="flex gap-4">
            <button @click="showDeleteConfirm = false" class="btn btn-secondary flex-1">Abbrechen</button>
            <button @click="handleDeleteAll" :disabled="deletingAll" class="btn bg-red-600 hover:bg-red-700 text-white flex-1">
              <Loader2 v-if="deletingAll" class="animate-spin mr-2" :size="20" />
              Endgültig löschen
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-8 text-gray-500">
      No codes generated yet. Use the form above to generate codes.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Loader2, Trophy, Download, Trash2 } from 'lucide-vue-next'
import { useCodesStore } from '@/stores/codes'
import { notify } from '@kyvg/vue3-notification'

const codesStore = useCodesStore()

const totalCodes = ref(100)
const winnerCodes = ref(10)
const loading = ref(false)
const filter = ref<'all' | 'winners' | 'used' | 'unused'>('all')
const showDeleteConfirm = ref(false)
const deletingAll = ref(false)

const codes = computed(() => codesStore.codes)

const filteredCodes = computed(() => {
  switch (filter.value) {
    case 'winners':
      return codes.value.filter(code => code.isWinner)
    case 'used':
      return codes.value.filter(code => code.isUsed)
    case 'unused':
      return codes.value.filter(code => !code.isUsed)
    default:
      return codes.value
  }
})

const winnerCodesCount = computed(() => codes.value.filter(c => c.isWinner).length)
const usedCodesCount = computed(() => codes.value.filter(c => c.isUsed).length)
const unusedCodesCount = computed(() => codes.value.filter(c => !c.isUsed).length)

async function generateCodes() {
  if (winnerCodes.value > totalCodes.value) {
    notify({
      title: 'Invalid Input',
      text: 'Winner codes cannot exceed total codes',
      type: 'error'
    })
    return
  }

  loading.value = true
  try {
    await codesStore.generateCodes(totalCodes.value, winnerCodes.value)
    notify({
      title: 'Success',
      text: `Generated ${totalCodes.value} codes with ${winnerCodes.value} winners`,
      type: 'success'
    })
  } catch (error) {
    notify({
      title: 'Error',
      text: 'Failed to generate codes',
      type: 'error'
    })
  } finally {
    loading.value = false
  }
}

async function handleDeleteAll() {
  deletingAll.value = true
  try {
    await codesStore.deleteAllCodes()
    showDeleteConfirm.value = false
    notify({
      title: 'Gelöscht',
      text: 'Alle Codes wurden gelöscht',
      type: 'success'
    })
  } catch (error) {
    notify({
      title: 'Fehler',
      text: 'Codes konnten nicht gelöscht werden',
      type: 'error'
    })
  } finally {
    deletingAll.value = false
  }
}

function exportCodes() {
  const csv = [
    ['Code', 'Type', 'Status', 'Used By', 'Used At'],
    ...codes.value.map(code => [
      code.code,
      code.isWinner ? 'Winner' : 'Regular',
      code.isUsed ? 'Used' : 'Available',
      code.usedByTeam || '',
      code.usedAt || ''
    ])
  ].map(row => row.join(',')).join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `codes-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(() => {
  codesStore.loadCodes()
})
</script>
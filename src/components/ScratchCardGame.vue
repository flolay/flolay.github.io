<template>
  <div class="flex flex-col items-center justify-center min-h-[400px] p-8">
    <div v-if="!showCard" class="w-full max-w-md">
      <h3 class="text-2xl font-bold mb-6 text-center">Code eingeben</h3>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <input
            v-model="code"
            type="text"
            placeholder="4-stelligen Code eingeben"
            maxlength="4"
            inputmode="numeric"
            pattern="[0-9]*"
            class="input-field text-center text-xl tracking-wider"
            :disabled="loading"
          />
        </div>
        <button
          type="submit"
          :disabled="!code || code.length !== 4 || loading"
          class="w-full btn btn-primary"
        >
          <span v-if="loading" class="flex items-center justify-center">
            <Loader2 class="animate-spin mr-2" :size="20" />
            Überprüfe...
          </span>
          <span v-else>Code einlösen</span>
        </button>
      </form>
      
      <div v-if="error" class="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
        {{ error }}
      </div>
    </div>

    <div v-else class="relative">
      <div class="relative w-80 h-96 rounded-lg overflow-hidden shadow-2xl">
        <!-- Result underneath -->
        <div class="absolute inset-0 flex items-center justify-center p-8 bg-gradient-to-br"
             :class="isWinner ? 'from-yellow-400 to-orange-500' : 'from-gray-400 to-gray-600'">
          <div class="text-center">
            <div v-if="isWinner" class="text-white">
              <Trophy :size="80" class="mx-auto mb-4" />
              <h2 class="text-3xl font-bold mb-2">GEWINNER!</h2>
              <p class="text-lg">Herzlichen Glückwunsch!</p>
              <p class="text-sm mt-2">Gewinner-Code gefunden!</p>
              <p class="text-xs mt-4 opacity-90">Euer Team erhält ein Los<br>für die finale Verlosung!</p>
            </div>
            <div v-else class="text-white">
              <XCircle :size="80" class="mx-auto mb-4" />
              <h2 class="text-3xl font-bold mb-2">Leider verloren</h2>
              <p class="text-lg">Viel Glück beim nächsten Mal!</p>
            </div>
          </div>
        </div>
        
        <!-- Scratch surface -->
        <canvas
          ref="canvas"
          :width="320"
          :height="384"
          class="absolute inset-0 cursor-pointer"
          @mousedown="startScratching"
          @mousemove="scratch"
          @mouseup="stopScratching"
          @mouseleave="stopScratching"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="stopScratching"
        ></canvas>
      </div>
      
      <button @click="reset" class="mt-6 btn btn-secondary">
        Anderen Code versuchen
      </button>
    </div>

    <!-- Confetti for winners -->
    <div v-if="showConfetti" ref="confettiContainer" class="fixed inset-0 pointer-events-none z-50"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { Loader2, Trophy, XCircle } from 'lucide-vue-next'
import confetti from 'canvas-confetti'
import { useCodesStore } from '@/stores/codes'
import { notify } from '@kyvg/vue3-notification'

const codesStore = useCodesStore()

const code = ref('')
const loading = ref(false)
const error = ref('')
const showCard = ref(false)
const isWinner = ref(false)
const showConfetti = ref(false)
const canvas = ref<HTMLCanvasElement>()
const isScratching = ref(false)
const scratchedPercent = ref(0)

let ctx: CanvasRenderingContext2D | null = null

async function handleSubmit() {
  if (!code.value || code.value.length !== 8) return
  
  loading.value = true
  error.value = ''
  
  try {
    const result = await codesStore.validateCode(code.value)
    
    if (!result.isValid) {
      error.value = result.message === 'Invalid code' ? 'Ungültiger Code' : result.message === 'Code has already been used' ? 'Code wurde bereits verwendet' : result.message
      return
    }
    
    isWinner.value = result.isWinner
    showCard.value = true
    
    await nextTick()
    setupScratchCard()
    
    if (result.isWinner) {
      setTimeout(showWinnerEffects, 2000)
    }
  } catch (err) {
    error.value = 'Code konnte nicht überprüft werden. Bitte versuche es erneut.'
  } finally {
    loading.value = false
  }
}

function setupScratchCard() {
  if (!canvas.value) return
  
  ctx = canvas.value.getContext('2d')
  if (!ctx) return
  
  // Create scratch surface
  ctx.fillStyle = '#cbd5e1'
  ctx.fillRect(0, 0, 320, 384)
  
  // Add text
  ctx.fillStyle = '#475569'
  ctx.font = 'bold 24px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('HIER RUBBELN', 160, 192)
  
  // Set up for scratching
  ctx.globalCompositeOperation = 'destination-out'
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.lineWidth = 30
}

function startScratching(e: MouseEvent) {
  isScratching.value = true
  scratch(e)
}

function scratch(e: MouseEvent) {
  if (!isScratching.value || !ctx || !canvas.value) return
  
  const rect = canvas.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  
  ctx.beginPath()
  ctx.arc(x, y, 15, 0, Math.PI * 2)
  ctx.fill()
  
  checkScratchedAmount()
}

function handleTouchStart(e: TouchEvent) {
  e.preventDefault()
  isScratching.value = true
  handleTouchMove(e)
}

function handleTouchMove(e: TouchEvent) {
  e.preventDefault()
  if (!isScratching.value || !ctx || !canvas.value) return
  
  const touch = e.touches[0]
  const rect = canvas.value.getBoundingClientRect()
  const x = touch.clientX - rect.left
  const y = touch.clientY - rect.top
  
  ctx.beginPath()
  ctx.arc(x, y, 15, 0, Math.PI * 2)
  ctx.fill()
  
  checkScratchedAmount()
}

function stopScratching() {
  isScratching.value = false
}

function checkScratchedAmount() {
  if (!ctx || !canvas.value) return
  
  const imageData = ctx.getImageData(0, 0, 320, 384)
  const pixels = imageData.data
  let transparentPixels = 0
  
  for (let i = 3; i < pixels.length; i += 4) {
    if (pixels[i] < 128) transparentPixels++
  }
  
  const percent = (transparentPixels / (pixels.length / 4)) * 100
  scratchedPercent.value = percent
  
  if (percent > 60 && isWinner.value) {
    showWinnerEffects()
  }
}

function showWinnerEffects() {
  if (!showConfetti.value) {
    showConfetti.value = true
    
    const duration = 3000
    const end = Date.now() + duration
    
    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#fbbf24', '#f59e0b', '#d97706']
      })
      
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#fbbf24', '#f59e0b', '#d97706']
      })
      
      if (Date.now() < end) {
        requestAnimationFrame(frame)
      } else {
        showConfetti.value = false
      }
    }
    
    frame()
    
    notify({
      title: 'Herzlichen Glückwunsch!',
      text: 'Dein Team hat einen Gewinner-Code gefunden!',
      type: 'success',
      duration: 5000
    })
  }
}

function reset() {
  code.value = ''
  showCard.value = false
  isWinner.value = false
  showConfetti.value = false
  scratchedPercent.value = 0
  error.value = ''
}
</script>
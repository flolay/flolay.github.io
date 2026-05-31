<template>
  <div>
    <!-- Hero Section -->
    <section class="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 relative overflow-hidden">
      <!-- Animated background elements -->
      <div class="absolute inset-0">
        <div class="absolute top-0 -left-40 w-80 h-80 bg-secondary-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div class="absolute top-0 -right-40 w-80 h-80 bg-primary-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div class="absolute -bottom-40 left-20 w-80 h-80 bg-secondary-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div class="container mx-auto px-4 py-16 relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-screen">
          <div class="text-white space-y-8">
            <div class="space-y-4">
              <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight">
                Family & Friends
                <span class="block gradient-text bg-gradient-to-r from-secondary-300 to-yellow-300">Competition</span>
                Day
              </h1>
              <h2 class="text-2xl lg:text-3xl font-light opacity-90">Ein Tag voller Spaß für alle</h2>
            </div>

            <p class="text-xl lg:text-2xl opacity-90 leading-relaxed">
              Bildet Teams, nehmt an Wettkämpfen teil und sammelt Gewinnercodes für die große Verlosung und gewinnt den Wanderpokal!
            </p>

            <div class="flex flex-col sm:flex-row gap-4">
              <button
                @click="handleGetStarted"
                class="group relative inline-flex items-center space-x-3 bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white font-bold py-5 px-10 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl"
              >
                <span>Loslegen</span>
                <ChevronRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <!-- Admin Dashboard Button -->
              <button
                v-if="auth.isAdmin"
                @click="router.push('/admin')"
                class="group relative inline-flex items-center space-x-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-5 px-10 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl border-2 border-white/20"
              >
                <LayoutDashboard class="w-5 h-5" />
                <span>Admin-Bereich</span>
                <ChevronRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div class="hidden lg:flex justify-center">
            <div class="relative">
              <div class="absolute inset-0 bg-gradient-to-br from-secondary-400 to-primary-400 rounded-3xl transform rotate-6 scale-105 opacity-20"></div>
              <div class="relative bg-white/10 backdrop-blur-xl rounded-3xl p-12 text-center text-white border border-white/20 shadow-2xl">
                <div class="w-24 h-24 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
                  <Heart class="w-12 h-12" />
                </div>
                <h3 class="text-3xl font-bold mb-4 gradient-text bg-gradient-to-r from-white to-secondary-200">Familie.Freunde.Spaß</h3>
                <p class="mb-8 opacity-80 text-lg">Erlebt zusammen spannende Wettkämpfe und unvergessliche Momente</p>
                <div class="flex justify-center gap-3">
                  <span class="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium border border-white/30">Spaß</span>
                  <span class="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium border border-white/30">Team</span>
                  <span class="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium border border-white/30">Gewinnen</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Spielregeln Section -->
    <section class="py-20 pb-24 bg-gradient-to-b from-gray-50 to-primary-50">
      <div class="container mx-auto px-4">
        <div class="text-center mb-16 space-y-4">
          <h2 class="text-5xl font-bold gradient-text leading-tight">Spielregeln</h2>
          <p class="text-gray-600 text-xl max-w-2xl mx-auto">So funktioniert der Family & Friends Competition Day.</p>
        </div>

        <div class="max-w-3xl mx-auto">
          <div class="bg-white rounded-3xl shadow-xl overflow-hidden border border-secondary-100">
            <div class="p-8 space-y-6">
              <div v-for="(rule, index) in rules" :key="index" class="flex items-start space-x-4">
                <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg font-bold">
                  {{ index + 1 }}
                </div>
                <div>
                  <h4 class="font-bold text-lg mb-2">{{ rule.title }}</h4>
                  <p class="text-gray-600">{{ rule.description }}</p>
                </div>
              </div>
            </div>

            <div class="bg-gradient-to-r from-primary-50 to-secondary-50 p-8">
              <h4 class="font-bold text-lg mb-4 flex items-center space-x-2">
                <AlertCircle class="w-5 h-5 text-primary-600" />
                <span>Wichtige Hinweise</span>
              </h4>
              <ul class="space-y-3 text-gray-700">
                <li class="flex items-start space-x-2">
                  <ChevronRight class="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                  <span>Alles ganz entspannt. Durch die Spielecodes könnt ihr kommen und gehen wie es am besten passt und habt trotzdem die Chance auf den Gewinn!</span>
                </li>
                <li class="flex items-start space-x-2">
                  <ChevronRight class="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                  <span>Fair Play steht im Vordergrund - Spaß für alle Altersgruppen</span>
                </li>
                <li class="flex items-start space-x-2">
                  <ChevronRight class="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                  <span>Gewinner-Codes müssen bis 16:00 Uhr eingegeben werden</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Prizes -->
          <div class="mt-8 bg-gradient-to-br from-yellow-50 via-white to-orange-50 rounded-3xl p-8 shadow-xl border border-yellow-200">
            <h4 class="font-bold text-xl mb-6 flex items-center space-x-2">
              <Trophy class="w-6 h-6 text-yellow-600" />
              <span>Preise & Gewinne</span>
            </h4>
            <div class="space-y-4">
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span class="text-white font-bold">1.</span>
                </div>
                <span class="text-lg">Wanderpokal</span>
              </div>
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span class="text-white font-bold">2.</span>
                </div>
                <span class="text-lg">Pizza in München</span>
              </div>
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span class="text-white font-bold">3.</span>
                </div>
                <span class="text-lg">Ruhm und Ehre</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h3 class="text-2xl font-bold mb-6 gradient-text bg-gradient-to-r from-primary-300 to-secondary-300">Über uns</h3>
            <p class="text-gray-300 leading-relaxed">Family & Friends Competition Day - Ein unvergesslicher Tag voller Spaß, Spiel und Spannung für die ganze Familie.</p>
          </div>
          <div>
            <h3 class="text-2xl font-bold mb-6 gradient-text bg-gradient-to-r from-primary-300 to-secondary-300">Navigation</h3>
            <ul class="space-y-3">
              <li>
                <router-link to="/" class="text-gray-300 hover:text-white transition-colors inline-flex items-center space-x-2 group">
                  <ChevronRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  <span>Startseite</span>
                </router-link>
              </li>
              <li>
                <router-link to="/team" class="text-gray-300 hover:text-white transition-colors inline-flex items-center space-x-2 group">
                  <ChevronRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  <span>Team</span>
                </router-link>
              </li>
            </ul>
          </div>
          <div>
            <h3 class="text-2xl font-bold mb-6 gradient-text bg-gradient-to-r from-primary-300 to-secondary-300">Kontakt</h3>
            <div class="space-y-3 text-gray-300">
              <p class="flex items-center space-x-2">
                <Mail class="w-5 h-5" />
                <span>flos email</span>
              </p>
              <p class="flex items-center space-x-2">
                <Phone class="w-5 h-5" />
                <span>flo's telefonnummer</span>
              </p>
            </div>
          </div>
        </div>

        <div class="border-t border-gray-700 mt-12 pt-8 text-center">
          <p class="text-gray-400">&copy; 2026 Family Competition Day. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { Heart, ListChecks, Trophy, ChevronRight, AlertCircle, Mail, Phone, LayoutDashboard } from 'lucide-vue-next'

const router = useRouter()
const auth = useAuthStore()

const rules = ref([
  {
    title: 'Team-Bildung',
    description: 'Bildet Teams. Ihr könnt auch Einladungscodes verschicken.'
  },
  {
    title: 'Wettkampf-Stationen',
    description: 'Besucht verschiedene Stationen auf dem Gelände. Jede Station bietet einzigartige Herausforderungen für alle Altersgruppen.'
  },
  {
    title: 'Sieg melden',
    description: 'Nach einem gewonnenen Wettkampf meldet euer Team den Sieg in der App. Das gegnerische Team bestätigt den Sieg — danach erhaltet ihr einen 4-stelligen Gewinner-Code.'
  },
  {
    title: 'Gewinner-Codes',
    description: 'Gebt eure 4-stelligen Codes ein, um sie in den Lostopf zu werfen. Je mehr Codes, desto höher die Gewinnchance!'
  },
  {
    title: 'Finale Verlosung',
    description: 'Am Ende des Tages werden aus allen Gewinner-Codes die Hauptgewinner gezogen. Je mehr Codes, desto höher die Gewinnchance!'
  }
])

function handleGetStarted() {
  if (auth.isAuthenticated) {
    if (auth.isAdmin) {
      router.push('/admin')
    } else {
      router.push('/team')
    }
  } else {
    auth.showLoginModal = true
  }
}
</script>

<style scoped>
@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
</style>

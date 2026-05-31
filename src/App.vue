<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
    <NavBar />
    <main>
      <RouterView />
    </main>
    <notifications 
      position="top right" 
      :pauseOnHover="true"
      :speed="500"
      classes="custom-notification"
    />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
</script>

<style>
.custom-notification {
  @apply rounded-xl shadow-xl p-4 backdrop-blur-sm;
}

.vue-notification.success {
  @apply bg-green-500/90 text-white border-l-4 border-green-600;
}

.vue-notification.error {
  @apply bg-red-500/90 text-white border-l-4 border-red-600;
}

.vue-notification.warn {
  @apply bg-yellow-500/90 text-white border-l-4 border-yellow-600;
}

.vue-notification.info {
  @apply bg-blue-500/90 text-white border-l-4 border-blue-600;
}
</style>
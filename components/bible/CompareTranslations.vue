<template>
  <div>
    <!-- Tabs -->
    <div class="tabs mb-4">
      <button
        :class="{ active: activeTab === 'bible' }"
        @click="activeTab = 'bible'"
      >
        Bible to Bible
      </button>
      <button
        :class="{ active: activeTab === 'quran' }"
        @click="activeTab = 'quran'"
      >
        Bible vs Quran
      </button>
    </div>

    <!-- Viewers Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h3 class="text-center font-semibold mb-2">Viewer 1</h3>
        <BibleViewer :compare="true" />
      </div>

      <div>
        <h3 class="text-center font-semibold mb-2">Viewer 2</h3>
        <component :is="activeTab === 'bible' ? 'BibleViewer' : 'QuranViewer'" :compare="true" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import BibleViewer from '@/components/bible/BibleViewer.vue'
import QuranViewer from '@/components/quran/QuranViewer.vue'

const activeTab = ref('bible')
</script>

<style scoped>
.tabs {
  display: flex;
  gap: 1rem;
}

.tabs button {
  padding: 0.5rem 1rem;
  background-color: #eee;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.tabs button.active {
  background-color: #333;
  color: white;
}
</style>

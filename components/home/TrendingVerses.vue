<template>
    <div class="bg-blue-50 dark:bg-gray-800 rounded-lg p-6 shadow">
      <h2 class="text-xl font-bold text-blue-600 dark:text-blue-300 mb-4">🔥 Trending Verses</h2>
      <ul class="space-y-3">
        <li v-for="verse in verses" :key="verse.id">
          <p class="text-gray-700 dark:text-gray-200 italic">"{{ verse.text }}"</p>
          <span class="text-sm text-gray-500 dark:text-gray-400">— {{ verse.reference }}</span>
        </li>
      </ul>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  
  const verses = ref([])
  
  onMounted(async () => {
    try {
      const res = await $fetch('/api/verses/trending')
      if (res?.verses) verses.value = res.verses
    } catch (err) {
      console.error('Failed to fetch trending verses', err)
    }
  })
  </script>
  
<template>
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 class="text-2xl font-bold text-blue-600 dark:text-blue-300 mb-4">Spiritual Growth Tracker</h2>
      
      <!-- Progress Bars -->
      <div v-for="(goal, key) in goals" :key="key" class="mb-4">
        <div class="flex justify-between mb-1">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ goal.label }}</span>
          <span class="text-sm font-medium text-blue-600 dark:text-blue-400">{{ goal.progress }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
          <div
            class="bg-blue-500 h-3 rounded-full transition-all duration-300"
            :style="{ width: goal.progress + '%' }"
          ></div>
        </div>
      </div>
  
      <!-- Add or track activities -->
      <div class="mt-6">
        <p class="text-sm text-gray-500 dark:text-gray-400">Track your progress daily by updating your completed activities.</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const goals = ref({
    prayer: { label: 'Prayer', progress: 60 },
    bibleReading: { label: 'Bible Reading', progress: 45 },
    meditation: { label: 'Meditation/Reflection', progress: 30 },
    fellowship: { label: 'Fellowship / Community', progress: 70 },
  })
  </script>
  
<template>
    <div class="bg-yellow-100 dark:bg-yellow-900 rounded-lg p-6 shadow">
      <h2 class="text-xl font-bold text-yellow-700 dark:text-yellow-300 mb-2">🌟 Featured Devotional</h2>
      <p class="text-gray-800 dark:text-gray-100 mb-1">{{ devotional.title }}</p>
      <p class="text-gray-600 dark:text-gray-300 text-sm">{{ devotional.snippet }}</p>
      <router-link :to="`/devotionals/${devotional.id}`" class="mt-2 inline-block text-blue-500 hover:underline">Read More</router-link>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  
  const devotional = ref({
    id: null,
    title: 'Loading...',
    snippet: ''
  })
  
  onMounted(async () => {
    try {
      const res = await $fetch('/api/devotionals/featured')
      if (res?.devotional) devotional.value = res.devotional
    } catch (err) {
      console.error('Failed to load featured devotional', err)
    }
  })
  </script>
  
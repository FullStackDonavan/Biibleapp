<template>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Recent Highlights -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold text-blue-600 dark:text-blue-300 mb-4">Recent Highlights</h2>
        <ul class="space-y-4">
          <li
            v-for="highlight in highlights"
            :key="highlight.id"
            class="border-l-4 pl-4 rounded border-blue-500 bg-blue-50 dark:bg-blue-950 text-gray-800 dark:text-gray-100"
          >
            <p class="font-semibold">{{ highlight.book }} {{ highlight.chapter }}:{{ highlight.verse }}</p>
            <p class="text-sm italic">"{{ highlight.text }}"</p>
          </li>
          <li v-if="highlights.length === 0" class="text-gray-500 dark:text-gray-400">No highlights yet.</li>
        </ul>
      </div>
  
      <!-- Recent Notes -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold text-yellow-600 dark:text-yellow-300 mb-4">Recent Notes</h2>
        <ul class="space-y-4">
          <li
            v-for="note in notes"
            :key="note.id"
            class="border-l-4 pl-4 rounded border-yellow-500 bg-yellow-50 dark:bg-yellow-950 text-gray-800 dark:text-gray-100"
          >
            <p class="font-semibold">{{ note.book }} {{ note.chapter }}:{{ note.verse }}</p>
            <p class="text-sm">📝 {{ note.content }}</p>
          </li>
          <li v-if="notes.length === 0" class="text-gray-500 dark:text-gray-400">No notes yet.</li>
        </ul>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import Cookies from "js-cookie";
  
  // Mock data – replace with real API call
  const highlights = ref([])
  const notes = ref([])
  
  onMounted(async () => {
  try {
    const token = Cookies.get("auth_token");

    const headers = {
      Authorization: `Bearer ${token}`,
    }

    const [highlightRes, noteRes] = await Promise.all([
      $fetch('/api/user/highlights/recent', { headers }),
      $fetch('/api/user/notes/recent', { headers }),
    ])

    console.log('Highlight response:', highlightRes)
    console.log('Note response:', noteRes)

    // ✅ Defensive check
    highlights.value = highlightRes?.highlights || []
    notes.value = noteRes?.notes || []

  } catch (error) {
    console.error('Error loading recent highlights/notes:', error)
  }
})


  </script>
  
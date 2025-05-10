<template>
  <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
    <h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">🙏 Prayer Journal</h2>

    <!-- New Entry Form -->
    <form @submit.prevent="addEntry" class="mb-6">
      <textarea
        v-model="newEntryText"
        rows="3"
        class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
        placeholder="Write your prayer or reflection..."
      ></textarea>
      <button
        type="submit"
        class="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Add Entry
      </button>
    </form>

    <!-- Entry List -->
    <div v-if="entries.length === 0" class="text-gray-500 dark:text-gray-400">
      No entries yet. Start writing your prayers...
    </div>
    <ul class="space-y-4">
      <li
        v-for="entry in entries"
        :key="entry.id"
        class="bg-gray-100 dark:bg-gray-700 p-4 rounded"
      >
        <p class="text-gray-800 dark:text-gray-100">{{ entry.text }}</p>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {{ formatDate(entry.createdAt) }}
        </p>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Cookies from 'js-cookie'

const entries = ref([])
const newEntryText = ref('')



async function fetchEntries() {
  try {
    const token = Cookies.get('auth_token')
    const headers = { Authorization: `Bearer ${token}` }

    const response = await $fetch('/api/user/prayer/list', { headers })
    entries.value = response.entries
  } catch (error) {
    console.error('Failed to load entries:', error)
  }
}

async function addEntry() {
  if (!newEntryText.value.trim()) return

  try {
    const token = Cookies.get('auth_token')
    const headers = { Authorization: `Bearer ${token}` }

    const response = await $fetch('/api/user/prayer/add', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: { text: newEntryText.value }  // <-- Make sure this is a string
})


    entries.value.unshift(response.entry)
    newEntryText.value = ''
  } catch (error) {
    console.error('Failed to add entry:', error)
  }
}

function formatDate(date) {
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(fetchEntries)
</script>


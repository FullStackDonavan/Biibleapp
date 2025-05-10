<template>
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mx-auto">
      <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-2">
        📬 Receive Your Daily Verse by Email
      </h2>
      <p class="text-gray-600 dark:text-gray-300 mb-4">
        Get encouragement in your inbox every morning with a powerful Bible verse.
      </p>
  
      <form @submit.prevent="subscribe">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <input
            v-model="email"
            type="email"
            placeholder="Enter your email"
            class="w-full sm:flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            :disabled="loading"
            class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
          >
            {{ loading ? 'Subscribing...' : 'Subscribe' }}
          </button>
        </div>
      </form>
  
      <p v-if="success" class="mt-4 text-green-600 dark:text-green-400 font-medium">
        ✅ You're subscribed! Check your inbox soon.
      </p>
      <p v-if="error" class="mt-4 text-red-600 dark:text-red-400 font-medium">
        ❌ {{ error }}
      </p>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const email = ref('')
  const loading = ref(false)
  const success = ref(false)
  const error = ref(null)
  
  const subscribe = async () => {
    loading.value = true
    success.value = false
    error.value = null
  
    try {
      await $fetch('/api/verse-subscription', {
        method: 'POST',
        body: { email: email.value },
      })
      success.value = true
      email.value = ''
    } catch (err) {
      error.value = err?.data?.message || 'Something went wrong. Please try again.'
    } finally {
      loading.value = false
    }
  }
  </script>
  
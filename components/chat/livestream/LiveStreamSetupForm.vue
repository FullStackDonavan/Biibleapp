<template>
    <div class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4">📡 Set Up Live Stream</h2>
  
      <form @submit.prevent="submitStream">
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Channel ARN</label>
          <input v-model="channelArn" class="input" type="text" required />
        </div>
  
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Ingest Endpoint</label>
          <input v-model="ingestEndpoint" class="input" type="text" required />
        </div>
  
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Stream Key</label>
          <input v-model="streamKey" class="input" type="text" required />
        </div>
  
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Playback URL</label>
          <input v-model="playbackUrl" class="input" type="text" required />
        </div>
  
        <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Save Live Stream
        </button>
      </form>
  
      <div v-if="success" class="mt-4 text-green-600 dark:text-green-400">
        ✅ Stream info saved successfully.
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useToast } from 'vue-toastification'
  
  const toast = useToast()
  const channelArn = ref('')
  const ingestEndpoint = ref('')
  const streamKey = ref('')
  const playbackUrl = ref('')
  const success = ref(false)
  
  const authToken = useCookie('auth_token').value
  
  const submitStream = async () => {
    try {
      const res = await fetch('/api/livestream/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ channelArn: channelArn.value, ingestEndpoint: ingestEndpoint.value, streamKey: streamKey.value, playbackUrl: playbackUrl.value }),
      })
  
      const data = await res.json()
      if (!data.success) throw new Error('Failed to save')
  
      success.value = true
      toast.success('Live stream info saved.')
    } catch (error) {
      console.error(error)
      toast.error('Error saving live stream info')
    }
  }
  </script>
  
  <style scoped>
  .input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 0.375rem;
    background-color: #f9fafb;
    color: #111827;
  }
  .dark .input {
    background-color: #374151;
    border-color: #4b5563;
    color: #f3f4f6;
  }
  </style>
  
<template>
    <div class="chat-box p-4 bg-white dark:bg-gray-800 rounded shadow-md">
      <div class="messages h-64 overflow-y-scroll border-b border-gray-300 dark:border-gray-600 mb-4">
        <div v-for="msg in messages" :key="msg.timestamp" class="mb-2 flex items-start space-x-2">
          <img :src="msg.avatar" class="w-8 h-8 rounded-full" />
          <div>
            <p class="text-sm font-semibold text-gray-800 dark:text-white">{{ msg.username }}</p>
            <p class="text-sm text-gray-700 dark:text-gray-300">{{ msg.message }}</p>
          </div>
        </div>
      </div>
  
      <div class="flex space-x-2">
        <input
          v-model="newMessage"
          type="text"
          placeholder="Type a message..."
          class="flex-1 p-2 border rounded dark:bg-gray-700 dark:text-white"
          @keyup.enter="sendMessage"
        />
        <button @click="sendMessage" class="px-4 py-2 bg-blue-500 text-white rounded">Send</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useAuthCookie } from '~/composables/useAuth'
  
  const newMessage = ref('')
  const messages = ref([])
  const roomId = ref('global-room')
  const authCookie = useAuthCookie()
  
  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/chat/get?roomId=${roomId.value}`)
      const data = await res.json()
      messages.value = data.messages || []
    } catch (err) {
      console.error('Failed to fetch messages', err)
    }
  }
  
  const sendMessage = async () => {
    if (!newMessage.value.trim()) return
    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authCookie.value}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomId: roomId.value, message: newMessage.value }),
      })
      const data = await res.json()
      messages.value.push(data.message)
      newMessage.value = ''
    } catch (err) {
      console.error('Send failed:', err)
    }
  }
  
  onMounted(() => {
    fetchMessages()
    setInterval(fetchMessages, 3000) // Poll every 3 seconds
  })
  </script>
  
  <style scoped>
  .chat-box {
    max-width: 600px;
    margin: auto;
  }
  </style>
  
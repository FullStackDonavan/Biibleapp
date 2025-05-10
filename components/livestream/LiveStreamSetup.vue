<template>
  <div class="flex flex-col items-center gap-4">
    <video ref="videoRef" autoplay muted playsinline class="w-full max-w-xl rounded-lg shadow" />
    <button @click="startStream" class="bg-blue-600 text-white px-4 py-2 rounded" v-if="!isStreaming">Go Live</button>
    <button @click="stopStream" class="bg-red-600 text-white px-4 py-2 rounded" v-if="isStreaming">Stop Stream</button>
    <p v-if="status" class="text-sm text-gray-500">{{ status }}</p>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import Cookies from 'js-cookie'

const videoRef = ref(null)
const status = ref('')
const isStreaming = ref(false) // Flag to check if streaming is active
let mediaRecorder = null
let socket = null
let chunks = [] 

async function startStream() {
  status.value = '🔐 Getting auth...'

  const authToken = Cookies.get("auth_token")
  if (!authToken) {
    status.value = '⚠️ No auth token found.'
    console.error("No auth token found in cookies")
    return
  }

  status.value = '🛠️ Creating live stream...'

  const createRes = await fetch('/api/livestream/create', {
    headers: { Authorization: `Bearer ${authToken}` }
  })

  if (!createRes.ok) {
    const errorMsg = await createRes.text()
    status.value = '❌ Failed to create stream.'
    console.error("Create stream failed:", errorMsg)
    return
  }

  status.value = '📡 Fetching stream info...'

  const res = await fetch('/api/livestream/go-live', {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`
    }
  })

  if (!res.ok) {
    const errorMsg = await res.text()
    status.value = '❌ Failed to get stream key.'
    console.error("Failed to fetch stream info:", errorMsg)
    return
  }

  const { streamKey, ingestEndpoint } = await res.json()

  if (!streamKey || !ingestEndpoint) {
    status.value = '❌ Missing stream key or endpoint.'
    console.error('Missing stream key or ingest endpoint.')
    return
  }

  console.log(`🔌 Stream Key: ${streamKey}`)
  console.log(`🌐 Ingest Endpoint: ${ingestEndpoint}`)

  status.value = '📷 Requesting camera/mic...'
  const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })

  await nextTick()

  if (videoRef.value) {
    videoRef.value.srcObject = stream
  } else {
    status.value = '⚠️ Video preview failed.'
    console.error('videoRef is not available')
    return
  }

  status.value = '🔌 Connecting to WebSocket...'
  console.log("🔑 streamKey:", streamKey)
  console.log("🌐 ingestEndpoint:", ingestEndpoint)

  socket = new WebSocket(
    `ws://3.91.201.108:8080/?key=${streamKey}&endpoint=${encodeURIComponent(ingestEndpoint)}`
  )

  socket.onerror = (err) => {
    status.value = '❌ WebSocket connection failed'
    console.error('WebSocket error:', err)
  }

  socket.onopen = () => {
    status.value = '🎥 Streaming LIVE!'
    console.log('🔌 WebSocket connected')

    mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp8,opus'
    })

    mediaRecorder.ondataavailable = async (e) => {
      if (e.data.size > 0) {
        console.log("🧪 Chunk type:", e.data.type)
        const buffer = await e.data.arrayBuffer()
        console.log("📦 Sending", buffer.byteLength, "bytes")
        socket.send(buffer)
        console.log('Recording chunk size:', e.data.size) // Log each chunk's size
        chunks.push(e.data)
      }
    }

    mediaRecorder.start(10) // ✅ Start only when WebSocket is ready
  }

  isStreaming.value = true // Mark streaming as active
}

async function stopStream() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop() // Stop recording
    console.log('📹 MediaRecorder stopped')
  }

  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.close() // Close WebSocket connection
    console.log('🔌 WebSocket connection closed')
  }

  if (videoRef.value && videoRef.value.srcObject) {
    const stream = videoRef.value.srcObject
    const tracks = stream.getTracks()

    tracks.forEach(track => track.stop()) // Stop all tracks
    videoRef.value.srcObject = null // Clear video source
  }

  status.value = '❌ Stream stopped.'
  isStreaming.value = false // Mark streaming as stopped

  // Save the video after stream ends
  if (mediaRecorder && mediaRecorder.state === 'inactive') {
    const blob = new Blob(chunks, { type: 'video/mp4' }) // Create a Blob from the chunks
    const formData = new FormData()
    formData.append('video', blob, 'streamed_video.mp4')

    // Send the video to the backend API
    const authToken = Cookies.get("auth_token")
    try {
      const response = await fetch('/api/videos/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`, // Use the same auth token
        },
        body: formData,
      })

      if (!response.ok) {
        const errorMsg = await response.text()
        status.value = `❌ Error uploading video: ${errorMsg}`
        console.error('Upload failed:', errorMsg)
      } else {
        const result = await response.json()
        status.value = `✅ Video uploaded successfully!`
        console.log('Upload success:', result)
      }
    } catch (error) {
      console.error('Error uploading video:', error)
      status.value = '❌ Failed to upload video.'
    }
  }
}
</script>

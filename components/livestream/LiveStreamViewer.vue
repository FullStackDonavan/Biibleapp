<template>
  <div class="flex flex-col items-center gap-4">
    <video
      id="video-player"
      controls
      autoplay
      muted
      playsinline
      class="w-full max-w-xl rounded-lg shadow"
      style="width: 100%; height: auto"
    >
      <source :src="playbackUrl" type="application/x-mpegURL" />
    </video>

    <div class="text-sm text-gray-600 mt-2 flex space-x-4">
  <p><strong>State:</strong> {{ streamStatus.state }}</p>
  <p><strong>Health:</strong> {{ streamStatus.health || '–' }}</p>
  <p><strong>Viewers:</strong> {{ streamStatus.viewers }}</p>
</div>

  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const playbackUrl = ref('')
const streamStatus = ref({
  state: 'Loading...',
  health: null,
  duration: null,
  viewers: 0,
})

onMounted(async () => {
  const userId = route.params.id || route.path.split('/').pop()

  if (!userId) {
    console.error('Missing userId in route params or path.')
    return
  }

  // Fetch playback URL
  const res = await fetch(`/api/livestream/play-stream?userId=${userId}`)
  const data = await res.json()
  playbackUrl.value = data.playbackUrl

  // Fetch stream status
  try {
    const statusRes = await fetch(`/api/livestream/status?userId=${userId}`)
    const status = await statusRes.json()
    streamStatus.value = status
  } catch (err) {
    console.error('Failed to fetch stream status:', err)
  }

  // Wait until DOM updates with new source before initializing Fluid Player
  setTimeout(() => {
    if (window.fluidPlayer) {
      window.fluidPlayer('video-player', {
        layoutControls: {
          primaryColor: '#0d9488',
          posterImage: '',
          autoPlay: true,
          mute: false,
        },
      })
    } else {
      console.error('Fluid Player not loaded.')
    }
  }, 100)
})
</script>

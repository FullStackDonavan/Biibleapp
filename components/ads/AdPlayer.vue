<template>
  <video
    :id="playerId"
    class="w-full h-auto"
    controls
    muted
    playsinline
  >
    <source :src="videoSrc" type="video/mp4" />
  </video>
</template>

<script setup>
import { onMounted } from 'vue'

const props = defineProps({
  videoSrc: {
    type: String,
    required: true
  },
  videoId: {
    type: [Number, String],
    required: true
  }
})

const playerId = `ad-player-${props.videoId}`

onMounted(() => {
  if (!window.fluidPlayer) {
    console.error('[AdPlayer] ❌ Fluid Player not loaded')
    return
  }

  const instance = fluidPlayer(playerId, {
    layoutControls: {
        autoPlay: false, // 🚫 disable autoplay
      mute: false,
      fillToContainer: true,
      controlBar: {
        autoHide: true,
        autoHideTimeout: 3,
        animated: true,
      },
    },
    vastOptions: {
      adList: [
        {
          roll: 'preRoll',
          vastTag: `/api/ads/vast-for-video/${props.videoId}`
        },
        {
        roll: 'midRoll',
        vastTag: `/api/ads/vast-for-video/${props.videoId}`,
        timer: 10 // 👈 Seconds into the video for midroll
      },
      {
        roll: 'postRoll',
        vastTag: `/api/ads/vast-for-video/${props.videoId}`
      }
      ]
    }
  })

  console.log('[AdPlayer] ✅ Fluid Player initialized with VAST for:', props.videoId)
})
</script>

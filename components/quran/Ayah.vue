<template>
    <div class="space-y-6">
      <div v-for="ayah in ayahs" :key="ayah.id" class="border-b pb-4">
        <p class="text-lg font-semibold text-right">{{ ayah.text }}</p>
        <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">
          {{ ayah.translation }}
        </p>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      surahId: Number,
      translationId: Number,
    },
    data() {
      return { ayahs: [] }
    },
    async mounted() {
      const res = await $fetch(`/api/quran/ayahs?surah=${this.surahId}&translation=${this.translationId}`)
      this.ayahs = res
    },
  }
  </script>
  
  <style scoped>
  /* Optional styling */
  </style>
  
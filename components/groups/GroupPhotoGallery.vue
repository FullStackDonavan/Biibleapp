<template>
    <div>
      <div v-if="loading">
        <p>Loading photos...</p>
      </div>
  
      <div v-else-if="photos.length">
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div v-for="photo in photos" :key="photo.id">
            <img :src="photo.url" alt="Group Photo" class="w-full rounded shadow" />
          </div>
        </div>
      </div>
  
      <p v-else class="text-gray-500">No photos uploaded yet.</p>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, watch } from 'vue'
  import axios from 'axios'
  import Cookies from 'js-cookie'
  
  const props = defineProps<{
    groupId: number
  }>()
  
  const photos = ref([])
  const loading = ref(true)
  
  const authToken = Cookies.get("auth_token")
  
  const fetchPhotos = async () => {
    try {
      const { data } = await axios.get(`/api/groups/${props.groupId}/photos`, {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      photos.value = data
    } catch (error) {
      console.error("Failed to load group photos:", error)
    } finally {
      loading.value = false
    }
  }
  
  onMounted(fetchPhotos)
  watch(() => props.groupId, fetchPhotos)
  </script>
  
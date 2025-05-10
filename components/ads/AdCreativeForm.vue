<template>
    <div class="ad-creative-form bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Create New Ad</h2>
  
      <!-- Ad Title -->
      <div class="mb-4">
        <label for="adTitle" class="block text-gray-700 dark:text-gray-300">Ad Title</label>
        <input
          v-model="ad.title"
          id="adTitle"
          type="text"
          placeholder="Enter ad title"
          class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          required
        />
      </div>
  
      <!-- Ad Media -->
      <div class="mb-4">
        <label class="block text-gray-700 dark:text-gray-300">Ad Media (Video/Image URL)</label>
        <input
          v-model="ad.mediaUrl"
          type="text"
          placeholder="Enter URL for media"
          class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
        <div v-if="ad.mediaType === 'video'" class="mt-2">
          <input
            type="file"
            accept="video/*"
            @change="handleMediaUpload"
            class="p-2 border border-gray-300 dark:border-gray-600 rounded-lg"
          />
        </div>
        <div v-if="ad.mediaType === 'image'" class="mt-2">
          <input
            type="file"
            accept="image/*"
            @change="handleMediaUpload"
            class="p-2 border border-gray-300 dark:border-gray-600 rounded-lg"
          />
        </div>
      </div>
  
      <!-- Ad Placement -->
      <div class="mb-4">
        <label for="placement" class="block text-gray-700 dark:text-gray-300">Ad Placement</label>
        <select
          v-model="ad.placement"
          id="placement"
          class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="video_pre">Video Pre-roll</option>
          <option value="video_mid">Video Mid-roll</option>
          <option value="game_banner">Game Banner</option>
          <option value="feed_inline">Feed Inline</option>
        </select>
      </div>
  
      <!-- Ad Targeting -->
      <div class="mb-4">
        <label for="targeting" class="block text-gray-700 dark:text-gray-300">Targeting (Optional)</label>
        <textarea
          v-model="ad.targeting"
          id="targeting"
          placeholder='{"country": "US", "user_type": "premium"}'
          class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        ></textarea>
      </div>
  
      <!-- Ad Status -->
      <div class="mb-4">
        <label for="status" class="block text-gray-700 dark:text-gray-300">Ad Status</label>
        <select
          v-model="ad.status"
          id="status"
          class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="expired">Expired</option>
        </select>
      </div>
  
      <!-- Submit Button -->
      <div class="mt-6 flex justify-end">
        <button
          @click="submitAd"
          class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Submit Ad
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import Cookies from 'js-cookie'  // Importing the js-cookie library
  
  const ad = ref({
    title: '',
    mediaUrl: '',
    mediaType: 'image',  // or 'video' based on user choice
    placement: 'feed_inline',
    targeting: '',
    status: 'active',
    ctaUrl: '', // Ensure ctaUrl is always provided
    duration: undefined,
  })
  
  // Handle media file upload
  const handleMediaUpload = async (event) => {
    const file = event.target.files[0]
    if (file) {
      console.log('File selected:', file)
      const formData = new FormData()
      formData.append("image", file)
  
      // Upload the file
      try {
        const response = await fetch('/api/photos/upload', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${Cookies.get('auth_token')}`,
          },
          body: formData,
        })
  
        const data = await response.json()
        if (data.success && data.photo?.url) {
          ad.value.mediaUrl = data.photo.url  // Save the uploaded media URL in ad
          console.log('Image uploaded successfully:', data.photo.url)
        } else {
          alert('❌ Image upload failed.')
        }
      } catch (error) {
        console.error('Error uploading media:', error)
        alert('Error uploading media. Try again.')
      }
    }
  }
  
  // Submit the ad
  const submitAd = async () => {
    const authToken = Cookies.get('auth_token')  // Getting the auth_token from cookies
    if (!authToken) {
      alert('You must be logged in to create an ad.')
      return
    }
  
    // Ensure the ctaUrl is not empty (provide a default if needed)
    if (!ad.value.ctaUrl) {
      ad.value.ctaUrl = 'https://default-url.com' // Use a placeholder or default URL
    }
  
    const adData = {
      title: ad.value.title,
      mediaUrl: ad.value.mediaUrl,
      mediaType: ad.value.mediaType,
      placement: ad.value.placement,
      targeting: ad.value.targeting,
      status: ad.value.status,
      ctaUrl: ad.value.ctaUrl,
      duration: ad.value.duration,
    }
  
    try {
      const response = await $fetch('/api/ads/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,  // Pass the auth_token in the header
        },
        body: JSON.stringify(adData),
      })
  
      if (response.success) {
        alert('Ad created successfully!')
        ad.value = {
          title: '',
          mediaUrl: '',
          mediaType: 'image',
          placement: 'game_banner',
          targeting: '',
          status: 'active',
          ctaUrl: '', // Reset form fields
        }
      } else {
        alert('Failed to create ad.')
      }
    } catch (error) {
      console.error('Error submitting ad:', error)
      alert('Error submitting ad. Please try again.')
    }
  }
  </script>
  
  <style scoped>
  .input {
    @apply w-full p-2 border rounded-md;
  }
  .btn {
    @apply px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700;
  }
  </style>
  
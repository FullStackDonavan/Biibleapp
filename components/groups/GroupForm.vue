<template>
    <div class="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 class="text-2xl font-bold mb-4">Create New Group</h2>
  
      <form @submit.prevent="submitForm">
        <div class="mb-4">
          <label for="name" class="block text-sm font-semibold text-gray-700">Group Name</label>
          <input 
            v-model="group.name" 
            type="text" 
            id="name" 
            class="w-full p-2 border border-gray-300 rounded-md" 
            placeholder="Enter group name" 
            required 
          />
        </div>
  
        <div class="mb-4">
          <label for="description" class="block text-sm font-semibold text-gray-700">Group Description</label>
          <textarea 
            v-model="group.description" 
            id="description" 
            class="w-full p-2 border border-gray-300 rounded-md" 
            placeholder="Enter group description" 
            rows="4" 
            required 
          ></textarea>
        </div>
  
        <div class="mb-6">
          <label for="visibility" class="block text-sm font-semibold text-gray-700">Group Visibility</label>
          <select 
            v-model="group.visibility" 
            id="visibility" 
            class="w-full p-2 border border-gray-300 rounded-md"
            required
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>
  
        <div class="flex justify-end">
          <button 
            type="submit" 
            class="bg-blue-600 text-white px-4 py-2 rounded-md"
            :disabled="loading"
          >
            <span v-if="loading">Creating...</span>
            <span v-else>Create Group</span>
          </button>
        </div>
      </form>
  
      <div v-if="error" class="mt-4 text-red-600">
        <p>{{ error }}</p>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  import axios from 'axios'
  import Cookies from 'js-cookie'
  
  const group = ref({
    name: '',
    description: '',
    visibility: 'public' // Default to public visibility
  })
  
  const error = ref<string | null>(null)
  const loading = ref(false)

  const submitForm = async () => {
  error.value = null;
  loading.value = true;

  try {
    const authToken = Cookies.get('auth_token');
    if (!authToken) throw new Error("Authentication required");

    const response = await fetch('/api/groups/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(group.value),
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "Group creation failed");

    console.log('Group created:', data.group);
    // Optionally redirect or show success message here
  } catch (err: any) {
    console.error('Error creating group:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};


  </script>
  
  <style scoped>
  /* Add your custom styles here if needed */
  </style>
  
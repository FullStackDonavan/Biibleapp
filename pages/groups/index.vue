<script setup lang="ts">
import { onMounted, ref } from 'vue'
import axios from 'axios'

const groups = ref([])

const fetchGroups = async () => {
  try {
    const { data } = await axios.get('/api/groups')
    groups.value = data
  } catch (err) {
    console.error('Failed to load groups', err)
  }
}

onMounted(fetchGroups)
</script>

<template>
  <PatternSection>
  <div class="">
    <!-- List of Groups -->
    <div>
      <h1 class="text-2xl font-bold mb-4">All Groups</h1>

      <div v-if="groups.length === 0" class="text-gray-500">No groups found.</div>

      <div v-else class="space-y-4">
        <div v-for="group in groups" :key="group.id" class="bg-white rounded shadow p-4">
          <h2 class="text-xl font-semibold">{{ group.name }}</h2>
          <p class="text-gray-600">{{ group.description }}</p>
          <router-link
            :to="`/groups/${group.id}`"
            class="text-blue-600 underline mt-2 inline-block"
          >
            View Group
          </router-link>
        </div>
      </div>
    </div>
  </div>
</PatternSection>
</template>

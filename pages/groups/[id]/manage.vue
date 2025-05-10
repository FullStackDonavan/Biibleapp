<script setup lang="ts">
import { useRoute } from 'vue-router'
import { onMounted, ref } from 'vue'
import axios from 'axios'

const route = useRoute()
const groupId = Number(route.params.id)
const pendingRequests = ref([])

const fetchRequests = async () => {
  const { data } = await axios.get(`/api/groups/${groupId}/pending-requests`)
  pendingRequests.value = data
}

const approve = async (userId: number) => {
  await axios.post(`/api/groups/${groupId}/approve`, { userId })
  await fetchRequests()
}

const deny = async (userId: number) => {
  await axios.post(`/api/groups/${groupId}/deny`, { userId })
  await fetchRequests()
}

onMounted(fetchRequests)
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Manage Group Members</h1>

    <div v-if="pendingRequests.length === 0">No pending requests</div>

    <div v-for="request in pendingRequests" :key="request.userId" class="bg-white p-4 rounded shadow mb-2 flex justify-between items-center">
      <span>User {{ request.userId }}</span>
      <div>
        <button @click="approve(request.userId)" class="bg-green-500 text-white px-3 py-1 rounded mr-2">Approve</button>
        <button @click="deny(request.userId)" class="bg-red-500 text-white px-3 py-1 rounded">Deny</button>
      </div>
    </div>
  </div>
</template>

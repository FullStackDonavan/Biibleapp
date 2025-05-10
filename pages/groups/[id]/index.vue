<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import { useUser } from '~/composables/useAuth'
import Cookies from 'js-cookie'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const groupId = Number(route.params.id)
const group = ref(null)
const isApprovedMember = ref(false)
const posts = ref([])

const user = useUser()

const loggedInUser = ref(null)
const userId = ref<number | null>(null)
const authToken = Cookies.get("auth_token")  // Fetch auth token from cookies

// Loading state for group data
const loadingGroupData = ref(true)

const activeTab = ref<'admin' | 'about' | 'feed' | 'members' | 'photos' | 'videos' | 'live' | 'Debate'>('about')


// Get logged-in user
const getLoggedInUser = async () => {
  if (!authToken) return;

  try {
    const response = await axios.get("/api/user", {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    loggedInUser.value = response.data;
    userId.value = loggedInUser.value?.user.id;  // Assign the user's ID
  } catch (error) {
    console.error("Error fetching user:", error);
  }
}


// Check if the token exists before making API calls
if (!authToken) {
  if (process.client) {
    alert('You are not authenticated. Please log in.');
  }
  router.push('/login'); // Redirect to login page if no auth token
}

onMounted(async () => {
  try {
    // Debug: Log groupId and authToken
    console.log('Group ID:', groupId)
    console.log('Auth Token:', authToken)
    await getLoggedInUser();

    // Fetch membership status first
    let membership
    try {
      const res = await axios.get(`/api/groups/${groupId}/membership-status`, {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      membership = res.data
    } catch (err) {
      console.error('Membership status fetch error:', err.response?.data || err)
      alert('Could not verify group membership. Redirecting.')
      router.push('/groups')
      return
    }

    if (membership.status !== 'approved') {
      router.push('/groups')
      return
    }

    isApprovedMember.value = true

    // Fetch group data
    const { data: groupData } = await axios.get(`/api/groups/${groupId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
    console.log('Group Data:', groupData)  // Log group data to check the response
    group.value = groupData

    // Fetch posts
    const { data: postData } = await axios.get(`/api/groups/${groupId}/posts`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
    posts.value = postData
  } catch (e) {
    console.error('Error loading group:', e.response?.data || e.message || e)
    if (process.client) {
      alert('Error loading group data. Please try again.')
    }
  } finally {
    loadingGroupData.value = false  // Set loading state to false once data is fetched
  }
})
</script>

<template>
  <PatternSection>
    <div class="max-w-6xl mx-auto bg-white dark:bg-gray-800 p-6 relative z-10">
      <div v-if="loadingGroupData">
        <p>Loading group data...</p>
      </div>
      <div v-else-if="group">
        <h1 class="text-3xl font-bold mb-8">{{ group.name }}</h1>

        <!-- Tabs -->
<div class="flex space-x-4 border-b mb-6">
  <button
  v-if="userId === group.admin.id"
    @click="activeTab = 'admin'"
    :class="[
      'pb-2 px-3 text-sm font-medium border-b-2',
      activeTab === 'admin' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
    ]"
  >
    Admin
  </button>
  <button
    @click="activeTab = 'about'"
    :class="[
      'pb-2 px-3 text-sm font-medium border-b-2',
      activeTab === 'about' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
    ]"
  >
    About
  </button>
  <button
    @click="activeTab = 'feed'"
    :class="[
      'pb-2 px-3 text-sm font-medium border-b-2',
      activeTab === 'feed' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
    ]"
  >
    Feed
  </button>
  <button
    @click="activeTab = 'members'"
    :class="[
      'pb-2 px-3 text-sm font-medium border-b-2',
      activeTab === 'members' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
    ]"
  >
    Members
  </button>
  <button
    @click="activeTab = 'photos'"
    :class="[
      'pb-2 px-3 text-sm font-medium border-b-2',
      activeTab === 'photos' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
    ]"
  >
    Photos
  </button>
  <button
    @click="activeTab = 'videos'"
    :class="[
      'pb-2 px-3 text-sm font-medium border-b-2',
      activeTab === 'videos' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
    ]"
  >
    Videos
  </button>
  <button
    @click="activeTab = 'live'"
    :class="[
      'pb-2 px-3 text-sm font-medium border-b-2',
      activeTab === 'live' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
    ]"
  >
    Live
  </button>
  <button
    @click="activeTab = 'debate'"
    :class="[
      'pb-2 px-3 text-sm font-medium border-b-2',
      activeTab === 'debate' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
    ]"
  >
    Debate
  </button>

</div>


        <!-- Tab Content -->
        <div v-if="activeTab === 'admin'">
          <p class="text-gray-600 mb-6">Group Admin Area</p>
        </div>
        <div v-if="activeTab === 'about'">
          <p class="text-gray-600 mb-6">{{ group.description }}</p>
        </div>
<div v-if="activeTab === 'feed'">
  <GroupPostCreator v-if="group?.id" :group-id="group.id" />
  <div v-if="posts.length" class="mt-8">
    <div
      v-for="post in posts"
      :key="post.id"
      class="bg-gray-100 p-4 rounded mb-3"
    >
      <p>{{ post.content }}</p>
      <small class="text-sm text-gray-500">By User {{ post.authorId }}</small>
    </div>
  </div>
  <p v-else>No posts yet.</p>
</div>

<div v-else-if="activeTab === 'members'">
  <h2 class="text-xl font-semibold mb-2">Group Members</h2>
  <!-- Add your member list component or logic here -->
  <p>Coming soon: Member list</p>
</div>

<div v-else-if="activeTab === 'photos'">
  <h2 class="text-xl font-semibold mb-2">Group Photos</h2>
  <GroupPhotoGallery :group-id="group.id" />
</div>
<div v-else-if="activeTab === 'videos'">
  <h2 class="text-xl font-semibold mb-2">Group Photos</h2>
  <p>Coming soon: Group video gallery</p>
</div>
<div v-else-if="activeTab === 'live'">
  <h2 class="text-xl font-semibold mb-2">Group Live</h2>
  <!-- Add your photo gallery or uploader here -->
  <div class="mb-6">
     <LiveStreamSetup v-if="userId === group.admin.id" />
  </div>
</div>
<div v-if="activeTab === 'debate'">
          <p class="text-gray-600 mb-6">Coming Soon</p>
        </div>
</div>
    </div>
  </PatternSection>
</template>

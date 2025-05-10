<template>
  <PatternSection>
    <div>
        <!-- Cover Image -->
        <div
          class="h-[500px] w-full bg-cover bg-center relative pb-20"
          :style="{ backgroundImage: `url('${loggedInUser?.coverImage || defaultCoverImage}')` }"
        >
          <!-- Camera Icon for Cover Image -->
          <label
          for="cover-upload"
          class="absolute bottom-4 right-4 bg-gray-500 text-white p-3 rounded-full cursor-pointer hover:bg-gray-600 shadow-md"
          title="Upload Cover Image"
        >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
      </svg>

        </label>
        <input
          id="cover-upload"
          type="file"
          name="cover"
          accept="image/*"
          class="hidden"
          @change="handleFileChange('cover', $event)"
        />
        </div>

        <!-- Full-Width Box -->
        <div class="bg-white dark:bg-gray-800 border-b border-gray-300">
          <div class="max-w-6xl mx-auto bg-white dark:bg-gray-800 p-6 relative z-10">
            <!-- Profile Header -->
            <div class="flex items-center space-x-6">
              <!-- Avatar -->
              <div class="relative">
                <img
                    :src="loggedInUser?.avatar || 'https://placehold.co/500x500'"
                    alt="Profile Avatar"
                    class="w-48 h-48 rounded-full border-4 border-white dark:border-gray-800 -mt-16 mx-auto"
                  />
                  

                <!-- Camera Icon for Cover Image -->
                <label
                  for="avatar-upload"
                  class="absolute bottom-2 right-2 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 shadow-md"
                  title="Upload Avatar"
                >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
              </svg>

                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  name="avatar"
                  accept="image/*"
                  class="hidden"
                  @change="handleFileChange('avatar', $event)"
                />
                  
                
              </div>
              <!-- Name and Title -->
              <div>
                <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  {{ loggedInUser?.firstName }} {{ loggedInUser?.lastName }}
                </h1>
                <p class="text-gray-600 dark:text-gray-400">{{ loggedInUser?.role || 'User' }}</p>
                <!-- Friends -->
                <div class="mt-4 p-4">
                  <div v-if="loadingFriends" class="text-gray-600 dark:text-gray-400">Loading friends...</div>
                  <div v-else-if="friends.length === 0" class="text-gray-600 dark:text-gray-400">No friends found.</div>
                  <div v-else class="flex flex-wrap items-center">
                    <div
                      v-for="friend in friends"
                      :key="friend.id"
                      class="relative -ml-4 first:ml-0"
                    >
                      <router-link
                        :key="friend.id"
                        :to="`/profile/${friend.id}`"
                        class="block w-16 h-16 rounded-full border border-gray-400 dark:border-gray-600 overflow-hidden hover:scale-105 transition transform duration-200"
                      >
                        <img :src="friend.avatar" alt="Friend Avatar" class="w-full h-full object-cover" />
                      </router-link>
                    </div>
                  </div>
                </div>


                


              </div>
            </div>
          </div>
          
        </div>

      
        <div class="max-w-8xl mx-auto p-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-start transition-all duration-500 ease-in-out">

            <Transition name="slide-aside">
              <aside
                v-if="tab !== 'live' && tab !== 'debate'"
                class="md:col-span-1 transition-all duration-500 ease-in-out"
              >
              <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
                <!-- Edit Form -->
                <div v-if="editing" class="mt-6">
                  <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Edit Profile</h2>
                  <form @submit.prevent="updateLoggedInUser">
                    <div class="space-y-4">
                      <div>
                        <label for="firstName" class="block text-gray-700 dark:text-gray-300">First Name:</label>
                        <input
                          id="firstName"
                          v-model="loggedInUser.firstName"
                          type="text"
                          class="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 p-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label for="lastName" class="block text-gray-700 dark:text-gray-300">Last Name:</label>
                        <input
                          id="lastName"
                          v-model="loggedInUser.lastName"
                          type="text"
                          class="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 p-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label for="email" class="block text-gray-700 dark:text-gray-300">Email:</label>
                        <input
                          id="email"
                          v-model="loggedInUser.email"
                          type="email"
                          class="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 p-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label for="phone" class="block text-gray-700 dark:text-gray-300">Phone:</label>
                        <input
                          id="phone"
                          v-model="loggedInUser.phone"
                          type="tel"
                          class="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 p-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label for="location" class="block text-gray-700 dark:text-gray-300">Location:</label>
                        <input
                          id="location"
                          v-model="loggedInUser.location"
                          type="text"
                          class="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 p-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label for="bio" class="block text-gray-700 dark:text-gray-300">Bio:</label>
                        <textarea
                          id="bio"
                          v-model="loggedInUser.bio"
                          class="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 p-2 focus:ring-blue-500 focus:border-blue-500"
                        ></textarea>
                      </div>
                    </div>
                    <div class="mt-4 flex justify-end space-x-4">
                      <button
                        type="button"
                        class="bg-gray-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-600"
                        @click="cancelEdit"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        class="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>

                <!-- Personal Info -->
                <div v-else>
                  <h2 class="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">Intro</h2>
                  <ul class="space-y-4">
                    <li class="flex justify-between">
                      <span class="text-gray-700 dark:text-gray-300">Email:</span>
                      <span class="text-gray-800 dark:text-gray-200">{{ loggedInUser?.email }}</span>
                    </li>
                    <li class="flex justify-between">
                      <span class="text-gray-700 dark:text-gray-300">Phone:</span>
                      <span class="text-gray-800 dark:text-gray-200">{{ loggedInUser?.phone || 'N/A' }}</span>
                    </li>
                    <li class="flex justify-between">
                      <span class="text-gray-700 dark:text-gray-300">Location:</span>
                      <span class="text-gray-800 dark:text-gray-200">{{ loggedInUser?.location || 'N/A' }}</span>
                    </li>
                  </ul>
                </div>

                <!-- Edit and Logout Buttons -->
                <div class="mt-6 flex justify-between">
                  <button
                    class="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg shadow-md hover:bg-gray-300 w-full"
                    @click="editProfile"
                  >
                    Edit Details
                  </button>

                  <!-- <button
                    class="bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600"
                    @click="logout"
                  >
                    Logout
                  </button> -->
                </div>
              </div>

              <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg mt-4 p-4">
                <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Friends</h2>
                <div>
                  <div v-if="loadingFriends" class="text-gray-600 dark:text-gray-400">Loading friends...</div>
                  <div v-else-if="friends.length === 0" class="text-gray-600 dark:text-gray-400">No friends found.</div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
                    <div
                      v-for="friend in friends"
                      :key="friend.id"
                      class="flex flex-col items-center space-y-2"
                    >
                      <router-link
                        :key="friend.id"
                        :to="`/profile/${friend.id}`"
                        class="flex flex-col items-center p-2"
                      >
                        <!-- Friend Avatar with Rounded Corners -->
                        <img :src="friend.avatar" alt="Friend Avatar" class="w-24 h-24 border-2 border-gray-300 dark:border-gray-600 object-cover rounded-md" />
                      </router-link>
                      <!-- Friend Name -->
                      <p class="text-sm text-gray-800 dark:text-gray-200 font-medium leading-none">
                        {{ friend.firstName }} {{ friend.lastName }}
                      </p>
                    </div>
                  </div>
                </div>


              </div>

              <!-- Photos -->
              <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg mt-4 p-4">
                <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Photos</h2>
                <div>
                <div v-if="loadingPhotos" class="text-gray-600 dark:text-gray-400">Loading photos...</div>
                <div v-else-if="photos.length === 0" class="text-gray-600 dark:text-gray-400">No photos found.</div>
                <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div
                    v-for="photo in photos"
                    :key="photo.id"
                    class="flex flex-col items-center space-y-2"
                  >
                    <img
                      :src="photo.url"
                      alt="Uploaded Photo"
                      class="w-24 h-24 border-2 border-gray-300 dark:border-gray-600 object-cover rounded-md"
                    />
                  </div>

                </div>
              </div>
            </div>
          






              



            </aside>
          </Transition>

         
         
            <!-- Section Column -->
            <Transition name="slide-aside">
            <section
              class="transition-all duration-500 ease-in-out"
              :class="(tab === 'live' || tab === 'debate') ? 'md:col-span-3' : 'md:col-span-2'"
            >
              <!-- Tabs -->
              <div class="border-b border-gray-300 dark:border-gray-600 mb-4">
                <ul class="flex space-x-4 bg-white dark:bg-gray-800 p-4 shadow-md">
                  <li
                    :class="tab === 'bible' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-blue-500'"
                    class="cursor-pointer pb-2"
                    @click="setTab('bible')"
                  >
                    Bible
                  </li>
                  <li
                    :class="tab === 'highlights' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-blue-500'"
                    class="cursor-pointer pb-2"
                    @click="setTab('highlights')"
                  >
                    Highlights
                  </li>
                  <li
                    :class="tab === 'notes' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-blue-500'"
                    class="cursor-pointer pb-2"
                    @click="setTab('notes')"
                  >
                    Notes
                  </li>
                  <li
                    :class="tab === 'places' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-blue-500'"
                    class="cursor-pointer pb-2"
                    @click="setTab('places')"
                  >
                    Places
                  </li>
                  <li
                    :class="tab === 'acient-language' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-blue-500'"
                    class="cursor-pointer pb-2"
                    @click="setTab('acient-language')"
                  >
                  Acient Language
                  </li>
                  <li
                    :class="tab === 'create' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-blue-500'"
                    class="cursor-pointer pb-2"
                    @click="setTab('create')"
                  >
                    Create
                  </li>
                  <li
                    :class="tab === 'compare' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-blue-500'"
                    class="cursor-pointer pb-2"
                    @click="setTab('compare')"
                  >
                    Compare
                  </li>
                  <li
                    :class="tab === 'live' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-blue-500'"
                    class="cursor-pointer pb-2"
                    @click="setTab('live')"
                  >
                    Live
                  </li>
                  <li
                    :class="tab === 'debate' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-blue-500'"
                    class="cursor-pointer pb-2"
                    @click="setTab('debate')"
                  >
                    Debate
                  </li>
                </ul>
              </div>

              <!-- Tab Content -->
              <div>

              <!-- Debate Tab -->
              <div v-if="tab === 'debate'" class="bg-white dark:bg-gray-800 border-b border-gray-300 shadow-md p-6 rounded-lg">
                <!-- Live Stream Setup and Chatbox Section -->
                <div class="flex gap-6">
                  <!-- Live Stream Setup Section -->
                  <div class="flex-1">
                    <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">📡 Debate</h2>
                    <div>
                      <Debater />
                    </div>
                  </div>

                  <!-- Chatbox Section -->
                  <div class="flex-1">
                    <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">💬 Chat with Viewers</h2>
                    <ChatBox />
                  </div>
                </div>
              </div>

              <!-- Live Tab -->
              <div v-if="tab === 'live'" class="bg-white dark:bg-gray-800 border-b border-gray-300 shadow-md p-6 rounded-lg">
                <!-- Live Stream Setup and Chatbox Section -->
                <div class="flex gap-6">
                  <!-- Live Stream Setup Section -->
                  <div class="flex-1">
                    <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">📡 Live Stream Setup</h2>
                    <LiveStreamSetup />
                  </div>

                  <!-- Chatbox Section -->
                  <div class="flex-1">
                    <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">💬 Chat with Viewers</h2>
                    <ChatBox />
                  </div>
                </div>
              </div>



                <!-- Compareate Tab -->
                <div v-if="tab === 'compare'" class="">
                  <CompareTranslations />
                </div>

                <!-- Create Tab -->
                <div v-if="tab === 'create'" class="">
                  <PostCreator />
                  <Feed />
                </div>
                
                
                <!-- Acient Language Tab -->
                <div v-if="tab === 'acient-language'" class="bg-white dark:bg-gray-800 border-b border-gray-300 shadow-md p-4">
                  <DictionaryPagination />
                </div>
                <!-- Bible Tab -->
                <div v-if="tab === 'bible'">
                  <BibleViewer />
                </div>
                <!-- Highlights Tab -->
                <div v-if="tab === 'highlights'" class="bg-white dark:bg-gray-800 border-b border-gray-300 shadow-md p-4">
                  <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Highlights</h2>
                  <div v-if="loadingHighlights" class="text-gray-500 dark:text-gray-400">Loading highlights...</div>
                  <div v-if="errorHighlights" class="text-red-500">{{ errorHighlights }}</div>
                  <ul v-if="!loadingHighlights && highlights.length" class="space-y-4">
                    <li
                      v-for="highlight in highlights"
                      :key="highlight.id"
                      class="p-4 border rounded-lg"
                      :style="{ backgroundColor: highlight.color }"
                    >
                      <p class="text-gray-800 dark:text-gray-800">
                        <strong>{{ highlight.translation }} | {{ highlight.book }} {{ highlight.chapter }}:{{ highlight.verse }}</strong>
                      </p>
                      <p class="text-gray-600 dark:text-gray-600">{{ highlight.text }}</p>
                    </li>
                  </ul>
                  <div v-if="!loadingHighlights && highlights.length === 0" class="text-gray-500 dark:text-gray-400">
                    No highlights found.
                  </div>
                </div>

                <!-- Notes Tab -->
            <div v-if="tab === 'notes'" class="bg-white dark:bg-gray-800 border-b border-gray-300 shadow-md p-4">
              <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Notes</h2>
              <div v-if="loadingNotes" class="text-gray-500 dark:text-gray-400">Loading notes...</div>
              <ul v-if="!loadingNotes && notes.length > 0" class="space-y-4">
                <li v-for="note in notes" :key="note.id" class="p-4 border rounded-lg">
                  <p class="text-gray-800 dark:text-gray-200">{{ note.content }}</p>
                </li>
              </ul>
              <div v-if="!loadingNotes && notes.length === 0" class="text-gray-500 dark:text-gray-400">
                No notes found.
              </div>
            </div>

                <!-- Places Tab -->
                <div v-if="tab === 'places'" class="bg-white dark:bg-gray-800 border-b border-gray-300 shadow-md p-4">
                  <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Places</h2>
                  <div v-if="loadingPlaces" class="text-gray-500 dark:text-gray-400">Loading places...</div>
                  <div v-if="errorPlaces" class="text-red-500">{{ errorPlaces }}</div>
                  <ul v-if="!loadingPlaces && places && places.length" class="space-y-4">
                    <li
                      v-for="place in places"
                      :key="place.id"
                      class="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800"
                    >
                      <p class="text-gray-800 dark:text-gray-200">
                        <strong>{{ place.name }}</strong> - {{ place.location || "No location" }}
                      </p>
                      <p class="text-sm text-gray-500 dark:text-gray-400">
                        Verse: {{ place.verse.chapter.book.name }} {{ place.verse.chapter.number }}:{{ place.verse.number }}
                      </p>
                    </li>
                  </ul>
                  <div v-if="!loadingPlaces && (!places || places.length === 0)" class="text-gray-500 dark:text-gray-400">
                    No places found.
                  </div>
                </div>

                

              
                


                
              </div>
            </section>
          </Transition>
          </div>
        </div>
    </div>
  </PatternSection>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useUser, userLogout, useAuthCookie } from '~/composables/useAuth'
import Cookies from 'js-cookie'

// Data & State
const loggedInUser = ref(null)
const defaultCoverImage = 'https://placehold.co/2000x500'
const editing = ref(false)
const tab = ref('bible')
const highlights = ref([])
const loadingHighlights = ref(false)
const errorHighlights = ref(null)
const friends = ref([])
const loadingFriends = ref(false)
const errorFriends = ref(null)
const notes = ref([])
const loadingNotes = ref(false)
const photos = ref([])
const loadingPhotos = ref(false)
const errorPhotos = ref(null)
const places = ref([])
const loadingPlaces = ref(false)
const errorPlaces = ref(null)

// Get the reactive auth cookie
const authCookie = useAuthCookie()

// Watch for changes to the auth cookie and re-fetch user data
watch(
  () => authCookie.value,
  (newVal, oldVal) => {
    console.log('Auth cookie changed from', oldVal, 'to', newVal)
    if (newVal) {
      // When a new token is set, re-fetch the user data
      getLoggedInUser().then(data => {
        loggedInUser.value = data
      })
    } 
  }
)

// Methods (as functions)
async function getLoggedInUser() {
  try {
    if (!authCookie.value) {
      console.error("Auth cookie is missing.");
      return null;
    }
    console.log("Fetching fresh user data...");
    
    const response = await $fetch(`/api/user`, {
      headers: { Authorization: `Bearer ${authCookie.value}` },
    });

    console.log("✅ User fetched:", response);
    
    // **Check response format and return correct object**
    return response.user || response; // ✅ Handles both old & new API formats
  } catch (error) {
    console.error("Error in getLoggedInUser:", error.message || error);
    return null;
  }
}



async function fetchPhotos() {
  try {
    loadingPhotos.value = true
    // Directly use the auth cookie's value for API calls
    if (!authCookie.value) throw new Error('Authentication token is missing.')
    const response = await $fetch('/api/user/photos', {
      headers: { Authorization: `Bearer ${authCookie.value}` },
    })
    photos.value = response.photos || []
  } catch (error) {
    console.error('Error fetching photos:', error)
    errorPhotos.value = 'Failed to load photos. Please try again.'
  } finally {
    loadingPhotos.value = false
  }
}

async function fetchFriends() {
  try {
    loadingFriends.value = true
    if (!authCookie.value) throw new Error('Authentication token is missing.')
    const response = await $fetch('/api/friends/friends', {
      headers: { Authorization: `Bearer ${authCookie.value}` },
    })
    friends.value = response.friends || []
    console.log('friends', friends.value)
  } catch (error) {
    console.error('Error fetching friends:', error)
    errorFriends.value = 'Failed to load friends. Please try again.'
  } finally {
    loadingFriends.value = false
  }
}

async function fetchHighlights() {
  try {
    loadingHighlights.value = true
    if (!authCookie.value) throw new Error('Authentication token is missing.')
    const response = await $fetch('/api/user/highlights', {
      headers: { Authorization: `Bearer ${authCookie.value}` },
    })
    highlights.value = response.highlights || []
  } catch (error) {
    console.error('Error fetching highlights:', error)
  } finally {
    loadingHighlights.value = false
  }
}

async function fetchNotes() {
  try {
    loadingNotes.value = true
    if (!authCookie.value) throw new Error('Authentication token is missing.')
    const response = await $fetch('/api/user/getNotes', {
      headers: { Authorization: `Bearer ${authCookie.value}` },
    })
    notes.value = response.notes || []
  } catch (error) {
    console.error('Error fetching notes:', error)
  } finally {
    loadingNotes.value = false
  }
}

async function fetchPlaces() {
  try {
    loadingPlaces.value = true
    if (!authCookie.value) throw new Error('Authentication token is missing.')
    const response = await $fetch('/api/user/getPlaces', {
      headers: { Authorization: `Bearer ${authCookie.value}` },
    })
    places.value = response.places || []
  } catch (error) {
    console.error('Error fetching places:', error)
    errorPlaces.value = 'Failed to load places. Please try again.'
  } finally {
    loadingPlaces.value = false
  }
}

async function updateLoggedInUser() {
  try {
    const token = Cookies.get('auth_token')
    if (!token) throw new Error('Authentication token is missing.')
    await $fetch('/api/user', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: loggedInUser.value,
    })
    alert('Profile updated successfully!')
    editing.value = false
  } catch (error) {
    console.error('Error updating profile:', error)
    alert('Failed to update profile. Please try again.')
  }
}

function editProfile() {
  editing.value = true
}

function cancelEdit() {
  editing.value = false
}

async function handleFileChange(type, event) {
  const file = event.target.files[0]
  if (!file) {
    alert('No file selected.')
    return
  }
  const formData = new FormData()
  formData.append(type, file)
  try {
    if (!authCookie.value) throw new Error('Authentication token is missing.')
    await $fetch('/api/user/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authCookie.value}`,
      },
      body: formData,
    })
    alert(`${type === 'cover' ? 'Cover image' : 'Profile image'} uploaded successfully.`)
    loggedInUser.value = await getLoggedInUser()
  } catch (error) {
    console.error(`Error uploading ${type}:`, error)
    alert(`Failed to upload ${type}. Please try again.`)
  }
}

async function setTab(tabName) {
  tab.value = tabName
  console.log('Switching tab to:', tabName)
  if (tabName === 'highlights') {
    await fetchHighlights()
  } else if (tabName === 'notes') {
    await fetchNotes()
  } else if (tabName === 'places') {
    await fetchPlaces()
  }
}

async function logout() {
  await userLogout()
}










onMounted(async () => {
  if (!authCookie.value) {
    console.log("❌ No auth token found.");
    return;
  }

  console.log("✅ Fetching user...");
  loggedInUser.value = await getLoggedInUser();


  await fetchPhotos();
  await fetchFriends();
});



</script>

<style lang="css" scoped>
/* Sidebar slide */
.slide-aside-enter-active,
.slide-aside-leave-active {
  transition: all 0.5s ease;
}
.slide-aside-enter-from,
.slide-aside-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}
.slide-aside-enter-to,
.slide-aside-leave-from {
  opacity: 1;
  transform: translateX(0);
}

/* Main section grows */
.grow-section {
  transition: all 0.5s ease;
}




</style>
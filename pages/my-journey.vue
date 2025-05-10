<template>
<PatternSection>
  <div>
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg">
      <!-- Tab Headers -->
      <div class="flex space-x-4 border-b dark:border-gray-600 mb-4">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          class="px-4 py-2 text-sm font-semibold border-b-2"
          :class="{
            'border-blue-500 text-blue-600 dark:text-blue-400': activeTab === tab.key,
            'border-transparent text-gray-600 dark:text-gray-300 hover:text-blue-500': activeTab !== tab.key
          }"
        >
          {{ tab.name }}
        </button>
      </div>

      <!-- Tab Content -->
      <div v-if="activeTab === 'badges'">
        <BadgeSystem />
      </div>

      <div v-else-if="activeTab === 'growth'">
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg mb-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Total Highlights -->
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg text-center">
              <h3 class="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">Total Highlights</h3>
              <p class="text-3xl font-bold text-gray-800 dark:text-white">{{ totalHighlights }}</p>
            </div>

            <!-- Total Notes -->
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg text-center">
              <h3 class="text-lg font-semibold text-yellow-600 dark:text-yellow-400 mb-2">Total Notes</h3>
              <p class="text-3xl font-bold text-gray-800 dark:text-white">{{ totalNotes }}</p>
            </div>

            <!-- Total Places -->
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg text-center">
              <h3 class="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">Total Places</h3>
              <p class="text-3xl font-bold text-gray-800 dark:text-white">{{ totalPlaces }}</p>
            </div>

            <!-- Recent Highlights & Notes - Centered Full Width -->
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg text-center md:col-span-3 mx-auto">
              <RecentHighlightsNotes />
            </div>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SpiritualGrowthTracker />
          <MyJourneyTracker />
        </div>
      </div>

      <div v-else-if="activeTab === 'prayer'">
        <PrayerJournal />
      </div>

      <div v-else-if="activeTab === 'devotional'">
        <div class="p-4 bg-yellow-50 dark:bg-gray-700 rounded-lg">
          <h2 class="text-2xl font-bold text-yellow-600 dark:text-yellow-300 mb-2">Today's Devotional</h2>
          <p class="text-gray-800 dark:text-gray-200 mb-2">{{ devotional.title }}</p>
          <p class="text-gray-700 dark:text-gray-300">{{ devotional.content }}</p>
        </div>
      </div>

      <div v-else-if="activeTab === 'reflections'">
        <div>
          <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Latest Reflections</h2>
          <ul class="space-y-4">
            <li v-for="post in latestPosts" :key="post.id" class="border-b pb-2">
              <h3 class="font-semibold text-gray-800 dark:text-gray-100">{{ post.title }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ post.snippet }}</p>
            </li>
          </ul>
        </div>
      </div>
      <div v-else-if="activeTab === 'compare'">
        <CompareTranslations />
      </div>
      <div v-else-if="activeTab === 'games'">
        <div>
          <h2 class="text-2xl font-bold text-center text-gray-800 dark:text-gray-200 mb-4">Games</h2>

          <!-- Toggle -->
          <div class="flex justify-center mb-6">
            <button
              v-for="mode in ['upload', 'marketplace', 'play', 'worlds']"
              :key="mode"
              @click="activeGameView = mode"
              :class="[
                'px-4 py-2 mx-2 rounded font-semibold',
                activeGameView === mode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              ]"
            >
              {{ mode.charAt(0).toUpperCase() + mode.slice(1) }}
            </button>
          </div>

          <!-- Views -->
  <div v-if="activeGameView === 'upload'">
    <GameUploadForm @game-uploaded="fetchGames" class="mb-8" />
  </div>

  <div v-else-if="activeGameView === 'marketplace'">
    <div>
      <!-- Filters -->
      <div class="flex justify-center mb-6">
        <div class="flex flex-wrap justify-center items-center gap-4">

        <select
          v-model="filters.book"
          class="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Books</option>
          <option v-for="book in books" :key="book" :value="book">{{ book }}</option>
        </select>

        <select v-model="filters.theme" class="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Themes</option>
          <option v-for="theme in themes" :key="theme" :value="theme">{{ theme }}</option>
        </select>

        <select v-model="filters.tag" class="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Tags</option>
          <option v-for="tag in tags" :key="tag" :value="tag">{{ tag }}</option>
        </select>

        <select v-model="sortBy" class="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="popular">Most Popular</option>
          <option value="newest">Newest</option>
        </select>

        <button @click="fetchMarketplaceGames" class="btn">Apply</button>
        <button
          @click="clearFilters"
          class="px-3 py-2 rounded bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-400 dark:hover:bg-gray-600"
        >
          Clear Filters
        </button>
      </div>
      </div>

      <!-- Game Cards -->
      <div v-if="marketplaceGames.length && currentUserId !== null" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="game in marketplaceGames"
          :key="game.id"
          @click="startGameWithAd(game)"
          class="relative cursor-pointer rounded shadow bg-white dark:bg-gray-900 hover:shadow-lg transition"
        >
          <img :src="game.poster" class="w-full h-[400px] border-none" />
          <div class="p-4">
            <h3 class="text-lg font-bold text-gray-800 dark:text-white">{{ game.title }}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-300">{{ game.description }}</p>
          </div>

        <!-- ❤️ Like Button -->
          <div
            v-if="currentUserId !== null && game.userId != currentUserId"
            class="absolute bottom-3 right-4 text-2xl"
            @click.stop="toggleLike(game.id)"
          >
            <span :class="likedGameIds.includes(game.id) ? 'text-red-500' : 'text-gray-400'">
              <Icon name="mdi:heart"  />
            </span>
          </div>








        </div>
      </div>


      <div v-else class="text-center text-gray-500 dark:text-gray-400 mt-6">No games found.</div>
    </div>
  </div>


  <div v-else-if="activeGameView === 'play'">
    <!-- My Uploaded Games -->
    <div v-if="games.length">
      <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4">My Uploads</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div
          v-for="game in games"
          :key="game.id"
          @click="startGameWithAd(game)"
          class="cursor-pointer border rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow hover:shadow-lg transition"
        >
          <img :src="game.poster" class="w-full h-[400px] border-none" />
          <div class="p-4">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white">{{ game.title }}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-300">{{ game.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Liked Games -->
  <div v-if="likedGames.length">
    <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4">Liked Games</h3>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="game in likedGames"
        :key="game.id"
        @click="startGameWithAd(game)"
        class="relative cursor-pointer border rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow hover:shadow-lg transition"
      >

        <img :src="game.poster" class="w-full h-[400px] border-none" />
        <div class="p-4">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-white">{{ game.title }}</h3>
          <p class="text-sm text-gray-600 dark:text-gray-300">{{ game.description }}</p>
        </div>

        <!-- ❤️ Like Button: Only if not uploaded by current user -->
        <div
          v-if="game.userId !== currentUserId"
          class="absolute bottom-3 right-4 text-2xl"
          @click.stop="toggleLike(game.id)"
        >
          <span :class="likedGameIds.includes(game.id) ? 'text-red-500' : 'text-gray-400'">
            <Icon name="mdi:heart" />
          </span>
        </div>

      </div>
    </div>
  </div>


    <div v-if="!games.length && !likedGames.length" class="text-center text-gray-500 dark:text-gray-400 mt-6">
      No games uploaded or liked yet.
    </div>
  </div>

  <div v-else-if="activeGameView === 'worlds'">
    <Editor3D />
  </div>

        
  <div v-if="showAd" class="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center">
  <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full relative text-center">
    <p class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Your game is almost ready...</p>
    
    <!-- Show Ad content -->
    <div v-if="adsList.length > 0">
      <img :src="adsList[currentAdIndex].media_url" class="w-full h-64 object-cover rounded" alt="Ad" />
      <p class="text-gray-600 dark:text-gray-400">{{ adsList[currentAdIndex].title }}</p>
      <p class="text-sm text-gray-600 dark:text-gray-400">{{ adsList[currentAdIndex].description || 'No description available' }}</p>
    </div>

    <button
      v-if="adCountdown === 0"
      @click="launchGameAfterAd"
      class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Continue to Game
    </button>
    <p v-else class="mt-4 text-gray-500">Please wait {{ adCountdown }}s...</p>
  </div>
</div>






</div>




        <!-- Game Modal -->
  <div
    v-if="modalOpen"
    class="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center"
  >
    <div class="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full">
      <button
        @click="closeGameModal"
        class="absolute top-2 right-2 text-gray-800 dark:text-gray-200 text-xl font-bold hover:text-red-500"
      >
        &times;
      </button>

      <iframe
        v-if="selectedGame"
        :src="selectedGame.path"
        class="w-full h-[80vh] rounded-b-lg"
        allowfullscreen
      ></iframe>
      <div class="p-4">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ selectedGame?.title }}</h3>
        <p class="text-sm text-gray-600 dark:text-gray-300">{{ selectedGame?.description }}</p>
      </div>
    </div>
  </div>

      </div>


      <div v-else-if="activeTab === 'ai'">
        <div>
          <h2 class="text-2xl font-bold text-center text-gray-800 dark:text-gray-200 mb-2">Bible Logic</h2>
          <BibleLogic />
        </div>
      </div>
      <div v-else-if="activeTab === 'groups'">
        <GroupForm />
      </div>
    </div>
  </div>
</PatternSection>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import Cookies from 'js-cookie'

const totalHighlights = ref(0)
const totalNotes = ref(0)
const totalPlaces = ref(0)
const loadingGames = ref(false)
const activeGameView = ref('play') 


const verse = ref(null)

// Tab state
const activeTab = ref('badges')

// Tab options
const tabs = [
  { name: 'Achievements', key: 'badges' },
  { name: 'Growth Trackers', key: 'growth' },
  { name: 'Prayer Journal', key: 'prayer' },
  { name: 'Devotional', key: 'devotional' },
  { name: 'Reflections', key: 'reflections' },
  { name: 'Compare', key: 'compare' },
  { name: 'Games', key: 'games' },
  { name: 'Ai', key: 'ai' },
  { name: 'Groups', key: 'groups' },
]

const devotional = ref({
  title: 'Trusting God in Uncertain Times',
  content: 'When things are unclear, we are reminded that God is always in control...'
})

const latestPosts = ref([
  { id: 1, title: 'God’s Grace in My Life', snippet: 'This week I experienced God’s grace in an unexpected way...' },
  { id: 2, title: 'Lessons from the Wilderness', snippet: 'Just like the Israelites, sometimes we must walk through dry places...' },
])

const games = ref([])

async function fetchGames() {
  const token = Cookies.get('auth_token')
  loadingGames.value = true
  try {
    const res = await fetch('/api/games', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const data = await res.json()
    games.value = data.games
  } catch (err) {
    console.error('Failed to fetch uploaded games:', err)
  } finally {
    loadingGames.value = false
  }
}



const marketplaceGames = ref([])
const filters = ref({ book: '', theme: '', tag: '' })
const sortBy = ref('popular')

const books = ref(['Genesis', 'Exodus', 'Matthew']) // Add full list if needed
const themes = ref(['Faith', 'Grace', 'Redemption'])
const tags = ref(['adventure', 'quiz', 'strategy'])

async function fetchMarketplaceGames() {
  const token = Cookies.get('auth_token')
  const headers = { Authorization: `Bearer ${token}` }

  const params = new URLSearchParams()
  if (filters.value.book) params.append('book', filters.value.book)
  if (filters.value.theme) params.append('theme', filters.value.theme)
  if (filters.value.tag) params.append('tag', filters.value.tag)
  if (sortBy.value) params.append('sort', sortBy.value)

  try {
    // Fetch marketplace games
    const res = await fetch(`/api/games/marketplace?${params.toString()}`, { headers })
    const data = await res.json()
    marketplaceGames.value = data.games

    // Fetch associated ads for the games (e.g., game_banner)
    const adRes = await fetch('/api/ads/getGameAd', { headers })
    const adData = await adRes.json()

    // Associate the ads with the games
    marketplaceGames.value.forEach(game => {
      game.ad = adData.find(ad => ad.placement === 'game_banner') || null
    })

    // Refresh liked game IDs so hearts stay accurate
    await fetchLikedGames()

  } catch (err) {
    console.error('❌ Failed to load marketplace games:', err)
  }
}


// Auto-fetch all games when marketplace tab/view becomes active
watch([activeTab, activeGameView], ([tab, view]) => {
  if (tab === 'games' && view === 'marketplace') {
    fetchMarketplaceGames()
  }
})


function clearFilters() {
  filters.value = { book: '', theme: '', tag: '' }
  sortBy.value = 'popular'
  fetchMarketplaceGames()
}

const selectedGame = ref(null)
const modalOpen = ref(false)



function openGameModal(game) {
  selectedGame.value = game
  modalOpen.value = true
  document.body.classList.add('modal-open')
}

const closeGameModal = () => {
  modalOpen.value = false;
  selectedGame.value = null;
  showAd.value = false;  // Hide the ad when closing the game modal
  document.body.classList.remove('modal-open');
};


const currentUserId = ref(null)
const likedGameIds = ref([])
const likedGames = ref([])

async function fetchLikedGames() {
  const token = Cookies.get('auth_token')
  try {
    const res = await fetch('/api/games/liked', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    likedGames.value = data.games
    likedGameIds.value = data.games.map((g) => g.id)
  } catch (err) {
    console.error('Failed to fetch liked games:', err)
  }
}


async function toggleLike(gameId) {
  const token = Cookies.get('auth_token')
  const headers = { Authorization: `Bearer ${token}` }
  const isLiked = likedGameIds.value.includes(gameId)

  try {
    await $fetch('/api/games/like', {
      method: 'POST',
      headers,
      body: { gameId, like: !isLiked },
    })

    if (isLiked) {
      likedGameIds.value = likedGameIds.value.filter((id) => id !== gameId)
    } else {
      likedGameIds.value.push(gameId)
    }
  } catch (e) {
    console.error('Failed to toggle like:', e)
  }
}

const isOwner = (gameUserId) => {
  return String(gameUserId) === String(currentUserId.value)
}


const showAd = ref(false);
const adCountdown = ref(5);

const adDetails = ref(null) // To store ad details

function startGameWithAd(game) {
  selectedGame.value = game;
  showAd.value = true;  // Show the ad

  // Ensure the game has an adId before calling fetchAdDetails
  if (game.adId) {
    console.log('Fetching ad details for adId:', game.adId);
    fetchAdDetails(game.adId);  // Fetch ad details based on the game adId
  } else {
    console.log('No adId associated with this game.');
  }

  adCountdown.value = 5;  // Set countdown to 5 seconds

  // Countdown logic
  const countdown = setInterval(() => {
    adCountdown.value--;
    if (adCountdown.value === 0) {
      clearInterval(countdown);
    }
  }, 1000);
}






const launchGameAfterAd = async () => {
  const gameId = selectedGame.value.id;
  const token = Cookies.get('auth_token');
  
  console.log('Sending ad impression for gameId:', gameId); // Debug log
  
  try {
    const response = await fetch('/api/ads/impression', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ gameId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create ad impression: ${response.status}`);
    }

    const data = await response.json();
    console.log('Ad impression response:', data);  // Log server response
    
    // Hide the ad and show the game modal after successful impression
    showAd.value = false;
    modalOpen.value = true;  // Show the game modal after the ad impression

  } catch (error) {
    console.error('Ad impression failed:', error);
    alert('Ad impression failed. Please try again.');
  }
};


const fetchAdDetails = async (adId) => {
  const token = Cookies.get('auth_token');
  const headers = { Authorization: `Bearer ${token}` };

  try {
    // Fetch the ad details based on adId
    const res = await fetch(`/api/ads/${adId}`, { headers });
    
    if (!res.ok) {
      console.error('Error fetching ad details. Response not OK:', res);
      return; // Exit early if the response is not ok
    }
    
    const adData = await res.json();
    console.log('Fetched ad data:', adData);
    
    if (adData && adData.title && adData.media_url) {
      adDetails.value = adData; // Only set adDetails if the data is valid
    } else {
      console.error('Ad data missing expected fields:', adData);
    }
  } catch (error) {
    console.error('Error fetching ad details:', error);
  }
};




const adsList = ref([]);  // List to store fetched ads
const currentAdIndex = ref(0);  // Keep track of the current ad index
const maxAdsBeforeRotation = 3;  // Number of ads to show before rotating

// Function to fetch ads from the server
const fetchAds = async () => {
  const token = Cookies.get('auth_token');  // Get the user's auth token
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  try {
    const res = await fetch('/api/ads', { headers });
    if (!res.ok) throw new Error('Failed to fetch ads');
    const ads = await res.json();

    // Store the fetched ads in the list
    adsList.value = ads;
    console.log('Fetched ads:', ads);

    // Start rotating ads
    startRotation();
  } catch (error) {
    console.error('Error fetching ads:', error);
  }
};




// Function to rotate through ads
const startRotation = () => {
  setInterval(() => {
    if (adsList.value.length > 0 && adsList.value.length > currentAdIndex.value) {
      // Display the next ad in the list
      console.log('Displaying ad title:', adsList.value[currentAdIndex.value].title);
      console.log('Displaying ad media_url:', adsList.value[currentAdIndex.value].media_url);

      // Move to the next ad in the list
      currentAdIndex.value = (currentAdIndex.value + 1) % adsList.value.length;  // Loop back to the first ad when reaching the end
    } else {
      // If we've shown all ads, restart rotation from the first ad
      currentAdIndex.value = 0;
    }
  }, 5000);  // Change ad every 5 seconds (you can adjust this interval)
};






const rotateAds = () => {
  setInterval(() => {
    if (adDetails.value && adDetails.value.length > 0) {
      currentAdIndex.value = (currentAdIndex + 1) % adDetails.value.length;  // Rotate through the ads
      console.log('Displaying ad:', adDetails.value[currentAdIndex]);
      adDetails.value = adDetails.value[currentAdIndex];  // Show the next ad
    }
  }, 5000);  // Rotate every 5 seconds (adjust as needed)
};



onMounted(async () => {
  await fetchGames()
  await fetchAds()
  await fetchLikedGames()
  try {
    const token = Cookies.get('auth_token')
    const headers = {
      Authorization: `Bearer ${token}`,
    }

    const summary = await $fetch('/api/user/summary', { headers })
    currentUserId.value = summary.userId
    console.log('✅ Current User ID:', currentUserId.value)



    console.log('🔍 User Summary:', summary)

    totalHighlights.value = summary.totalHighlights
    totalNotes.value = summary.totalNotes
    totalPlaces.value = summary.totalPlaces

  } catch (error) {
    console.error('Failed to fetch user summary:', error)
  }
})
</script>
<style lang="css" scoped>
body.modal-open {
  overflow: hidden;
}
</style>
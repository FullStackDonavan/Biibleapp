<template>
<PatternSection>
  <!-- Cover Image -->
  <div
    class="h-[500px] w-full bg-cover bg-center relative pb-20"
    :style="{ backgroundImage: `url('${userProfile?.coverImage || defaultCoverImage}')` }"
  ></div>

  <!-- Full-Width Box -->
  <div class="bg-white dark:bg-gray-800 border-b border-gray-300">
  <div class="max-w-8xl mx-auto bg-white dark:bg-gray-800 p-6 relative z-10">
    <!-- Profile Header -->
    <div class="flex items-center justify-between">
      <!-- Left Section (Avatar and Name) -->
      <div class="flex items-center space-x-6">
        <!-- Avatar -->
        <div class="relative">
          <img
            :src="userProfile?.avatar || 'https://placehold.co/500x500'"
            alt="Profile Avatar"
            class="w-48 h-48 rounded-full border-4 border-white dark:border-gray-800 -mt-16 mx-auto"
          />
        </div>
        <!-- Name and Title -->
        <div>
          <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {{ userProfile?.firstName }} {{ userProfile?.lastName }}
          </h1>
          <p class="text-gray-600 dark:text-gray-400">{{ userProfile?.role || 'User' }}</p>
        </div>
      </div>
     
      <!-- Add Friend Button -->
      <div class="flex items-center space-x-2">
        <button
          v-if="!isFriend"
          class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 flex items-center space-x-2"
          @click="addFriend(userProfile.id)"
        >
        <Icon
                  name="mdi-account-plus"
                  class="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white"
                  size="45"
            />
          <span>Add Friend</span>
        </button>

        <div
          v-else
          class="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg shadow-md hover:bg-gray-300 w-full"
        >
        <Icon
                  name="mdi-account"
                  class="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white"
                  size="45"
            />
          <span>Friends</span>
        </div>
      </div>

    </div>
  </div>
</div>



  

  
    <div class="max-w-8xl mx-auto p-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Aside Column -->
        <Transition name="slide-aside">
        <aside v-if="tab !== 'live' && tab !== 'debate'" class="md:col-span-1">
          <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
            <h2 class="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">Intro</h2>
            <ul class="space-y-4">
              <li class="flex justify-between">
                <span class="text-gray-700 dark:text-gray-300">Email:</span>
                <span class="text-gray-800 dark:text-gray-200">{{ userProfile?.email || 'N/A' }}</span>
              </li>
              <li class="flex justify-between">
                <span class="text-gray-700 dark:text-gray-300">Phone:</span>
                <span class="text-gray-800 dark:text-gray-200">{{ userProfile?.phone || 'N/A' }}</span>
              </li>
              <li class="flex justify-between">
                <span class="text-gray-700 dark:text-gray-300">Location:</span>
                <span class="text-gray-800 dark:text-gray-200">{{ userProfile?.location || 'N/A' }}</span>
              </li>
            </ul>
          </div>

          <!-- Friends Section -->
          <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg mt-4 p-4">
            <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Friends</h2>
            <div v-if="loadingFriends" class="text-gray-600 dark:text-gray-400">Loading friends...</div>
            <div v-else-if="friends.length === 0" class="text-gray-600 dark:text-gray-400">No friends found.</div>
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div
                v-for="friend in friends"
                :key="friend.id"
                class="flex flex-col items-center"
              >
              <router-link
                    :key="friend.id"
                    :to="`/profile/${friend.id}`"
                    class="flex flex-col items-center p-2"
                  >
                <img :src="friend.avatar" alt="Friend Avatar" class="w-24 h-24" />
              </router-link>
                <p class="text-sm text-gray-800 dark:text-gray-200 font-medium leading-none">
                  {{ friend.firstName }} {{ friend.lastName }}
                </p>
              
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

        <!-- Main Section -->
        <Transition name="slide-aside">
        <section class="transition-all duration-500 ease-in-out"
        :class="(tab === 'live' || tab === 'debate') ? 'md:col-span-3' : 'md:col-span-2'">
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
                    :class="tab === 'create' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-blue-500'"
                    class="cursor-pointer pb-2"
                    @click="setTab('create')"
                  >
                    Feed
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

            

            
          <!-- Feed Tab -->
          <div v-if="tab === 'create'">
            <div class="feed-container mx-auto">
              <h2 class="text-xl font-semibold my-4">Posts</h2>

              <div v-if="loadingPosts" class="text-center text-gray-600 dark:text-gray-400">Loading posts...</div>
              <div v-else-if="errorPosts" class="text-red-500">{{ errorPosts }}</div>
              <div v-else>
                <div
                  v-for="post in posts"
                  :key="post.id"
                  class="post-card bg-white dark:bg-gray-800 shadow-md p-4 rounded-lg mb-4"
                >
                  <!-- Author Info -->
                  <div class="flex items-center space-x-3">
                    <img
                      v-if="post.user.avatar"
                      :src="post.user.avatar"
                      alt="User Avatar"
                      class="w-10 h-10 rounded-full border-2 border-gray-300 dark:border-gray-700"
                    />
                    <span class="font-semibold text-gray-900 dark:text-gray-200">
                      {{ post.user.firstName }} {{ post.user.lastName }}
                    </span>
                  </div>

                  <!-- Apologetics -->
                  <div v-if="post.type === 'apologetics'" class="mt-2 space-y-2 text-gray-800 dark:text-gray-300">
                    <p v-if="post.content?.title" class="font-bold text-lg">{{ post.content.title }}</p>
                    <div v-if="Array.isArray(post.content?.arguments)">
                      <div
                        v-for="(arg, index) in post.content.arguments"
                        :key="index"
                        class="border-l-4 border-blue-400 pl-4 ml-2 mt-2"
                      >
                        <p v-if="arg.claim" class="text-sm"><strong>Claim:</strong> {{ arg.claim }}</p>
                        <p v-if="arg.evidence" class="text-sm"><strong>Evidence:</strong> {{ arg.evidence }}</p>
                        <p v-if="arg.verse?.text" class="italic text-sm text-gray-500 dark:text-gray-400">
                          <strong>Verse:</strong> {{ arg.verse.text }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Video Content -->
                  <div v-if="post.type === 'video'" class="mt-3">
                    <p class="text-gray-800 dark:text-gray-300">{{ post.content?.text }}</p>
                    <div v-if="post.content?.videoUrl" class="mt-3">
                      <!-- Embed video if it's a valid URL -->
                      <ClientOnly>
                        <AdPlayer :videoSrc="post.content.videoUrl" :videoId="post.id" />

                      </ClientOnly>

                    </div>
                  </div>

                  <!-- Text / Meme -->
                  <p
                    v-if="['text', 'meme'].includes(post.type) && post.content?.text"
                    class="mt-2 text-gray-800 dark:text-gray-300"
                  >
                    {{ post.content.text }}
                  </p>

                  <!-- Post Image -->
                  <div v-if="post.content.imageUrl" class="mt-3">
                    <img :src="post.content.imageUrl" alt="Post Image" class="w-full rounded-lg" />
                  </div>

                  <!-- Timestamp -->
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-3">
                    Posted on {{ new Date(post.createdAt).toLocaleString() }}
                  </p>

                  <!-- Reactions -->
                  <div class="mt-4 flex items-center space-x-3">
                    <button
                      v-for="reaction in reactionTypes"
                      :key="reaction.type"
                      @click="addReaction(post.id, reaction.type)"
                      class="flex items-center space-x-1 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300"
                      :class="{
                        'bg-blue-500 text-white shadow-md': userReactions[post.id] === reaction.type,
                        'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600':
                          userReactions[post.id] !== reaction.type
                      }"
                    >
                      <span class="text-lg">{{ reaction.emoji }}</span>
                      <span class="font-semibold">{{ countReactions(post.reactions, reaction.type) }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>


          
            <!-- Bible Tab -->
            <div v-if="tab === 'bible'">
              <BibleViewer :userId="(parseInt($route.params.id)) || null" />
            </div>

            
            <!-- Highlights Tab -->
            <div v-if="tab === 'highlights'" class="bg-white dark:bg-gray-800 border-b border-gray-300 shadow-md p-4">
              <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Highlights</h2>
              <div v-if="loadingHighlights" class="text-gray-500 dark:text-gray-400">Loading highlights...</div>
              <div v-else-if="highlights.length === 0" class="text-gray-500 dark:text-gray-400">
                No highlights found.
              </div>
              <ul v-else class="space-y-4">
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
            </div>

            <!-- Notes Tab -->
            <div v-if="tab === 'notes'" class="bg-white dark:bg-gray-800 border-b border-gray-300 p-4">
              <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Notes</h2>
              <div v-if="loadingNotes" class="text-gray-500 dark:text-gray-400">Loading notes...</div>
              <div v-if="errorNotes" class="text-red-500">{{ errorNotes }}</div>
              <ul v-if="!loadingNotes && notes && notes.length" class="space-y-4">
                <li
                  v-for="note in notes"
                  :key="note.id"
                  class="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800"
                >
                  <p class="text-gray-800 dark:text-gray-200">{{ note.content }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Created At: {{ new Date(note.createdAt).toLocaleString() }}</p>
                </li>
              </ul>
              <div v-if="!loadingNotes && (!notes || notes.length === 0)" class="text-gray-500 dark:text-gray-400">
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

            <div v-if="tab === 'live'" class="bg-white dark:bg-gray-800 border-b border-gray-300 shadow-md p-6 rounded-lg">
              <div class="flex gap-6">
                  <!-- Live Stream Setup Section -->
                  <div class="flex-1">
                    <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">📡 Live Stream Setup</h2>
                    <LiveStreamViewer />
                  </div>

                  <!-- Chatbox Section -->
                  <div class="flex-1">
                    <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">💬 Chat with Viewers</h2>
                    <ChatBox />
                  </div>
                </div>
        </div>
        <!-- Debate Tab -->
        <div v-if="tab === 'debate'" class="bg-white dark:bg-gray-800 border-b border-gray-300 shadow-md p-6 rounded-lg">
              <div class="flex gap-6">
                  <!-- Live Stream Setup Section -->
                  <div class="flex-1">
                    <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">📡 Debate</h2>
                    <div>
                      <Debatee />
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
             <div v-if="tab === 'live'">
              <GoLive />
            </div>
      </div>


         
        </section>
      </Transition>
      </div>
    </div>
  </PatternSection>
</template>

<script>
import BibleViewer from "~/components/bible/BibleViewer.vue";
import Cookies from "js-cookie";
import { LiveStreamSetupForm } from "#components";
import LiveStreamViewer from "~/components/livestream/LiveStreamViewer.vue";
export default {
  data() {
    return {
      userProfile: null,
      tab: 'bible',
      highlights: [],
      loadingHighlights: false,
      friends: [],
      loadingFriends: false,
      defaultCoverImage: 'https://placehold.co/2000x500',
      isFriend: false,
      notes: [],
      loadingNotes: false,
      photos: [], // To store the user's photos
      loadingPhotos: false, // To track loading state for photos
      errorPhotos: null, // To track errors for photos

      posts: [], // To store the user's posts
      loadingPosts: false, // To track loading state for posts
      errorPosts: null, // To track errors for posts
      places: [],
      loadingPlaces: false,
      errorPlaces: null,
      userReactions: {}, // Stores the logged-in user's reactions
      reactionTypes: [
        { type: "like", emoji: "👍" },
        { type: "love", emoji: "❤️" },
        { type: "laugh", emoji: "😂" },
        { type: "pray", emoji: "🙏" }
      ]
    };
  },
  async created() {
    const userId = this.$route.params.id;
    await this.fetchUserProfile(userId);
    await this.fetchUserHighlights(userId);
    await this.fetchFriends(userId);
    await this.fetchUserNotes(userId);
    await this.fetchUserPlaces(userId);
    await this.fetchUserPhotos(userId);
    await this.fetchUserPosts(userId);
    this.checkIfFriend(userId); 
  },
  methods: {
    async fetchUserProfile(userId) {
      const response = await $fetch(`/api/user/${userId}`);
      this.userProfile = response.user;
    },
    
    async fetchUserHighlights(userId) {
      this.loadingHighlights = true;
      try {
        const response = await $fetch(`/api/user/${userId}/highlights`);
        this.highlights = response.highlights;
      } catch (error) {
        console.error("Error fetching highlights:", error);
        this.highlights = [];
      } finally {
        this.loadingHighlights = false;
      }
    },
    
    async fetchFriends(userId) {
      this.loadingFriends = true;
      try {
        const response = await $fetch(`/api/user/${userId}/friends`);
        this.friends = response.friends;
      } catch (error) {
        console.error("Error fetching friends:", error);
        this.friends = [];
      } finally {
        this.loadingFriends = false;
      }
    },
    async checkIfFriend(userId) {
      try {
        const authToken = Cookies.get("auth_token"); // Retrieve the token from cookies or storage
        const response = await $fetch(`/api/user/${userId}/is-friend`, {
          headers: {
            Authorization: `Bearer ${authToken}`, // Attach token here
          },
        });
        this.isFriend = response.isFriend;
      } catch (error) {
        console.error("Error checking friend status:", error);
      }
    },
    async addFriend(userId) {
      try {
        const authToken = Cookies.get("auth_token");
        if (!authToken) throw new Error("Authentication token is missing.");

        await $fetch(`/api/user/${userId}/add-friend`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        alert("Friend request sent successfully.");
      } catch (error) {
        console.error("Error sending friend request:", error);
        alert(error.message || "Failed to send friend request.");
      }
    },
    setTab(tabName) {
      this.tab = tabName;
    },
    
    async fetchUserNotes(userId) {
      try {
        this.loadingNotes = true;
        const authToken = Cookies.get("auth_token");
        const response = await $fetch(`/api/user/${userId}/getUserNotes`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        this.notes = response.notes;
      } catch (error) {
        console.error("Error fetching notes:", error);
        this.errorNotes = "Failed to load notes. Please try again.";
      } finally {
        this.loadingNotes = false;
      }
    },

    async fetchUserPlaces(userId) {
      try {
        this.loadingPlaces = true;
        const authToken = Cookies.get("auth_token");
        const response = await $fetch(`/api/user/${userId}/getUserPlaces`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        this.places = response.places;
      } catch (error) {
        console.error("Error fetching places:", error);
        this.errorPlaces = "Failed to load place. Please try again.";
      } finally {
        this.loadingPlaces = false;
      }
    },
    async fetchUserPhotos(userId) {
      try {
        this.loadingPhotos = true;
        const authToken = Cookies.get("auth_token");
        if (!authToken) throw new Error("Authentication token is missing.");

        const response = await $fetch(`/api/user/${userId}/getUserPhotos`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        this.photos = response.photos || [];
      } catch (error) {
        console.error("Error fetching photos:", error);
        this.errorPhotos = "Failed to load photos. Please try again.";
      } finally {
        this.loadingPhotos = false;
      }
    },
    

    async fetchUserPosts(userId) {
      try {
        this.loadingPosts = true;
        const authToken = Cookies.get("auth_token");
        if (!authToken) throw new Error("Authentication token is missing.");

        const response = await $fetch(`/api/user/${userId}/getUserPosts`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        this.posts = response.posts.map(post => ({
          ...post,
          content: this.parseContent(post.content),
          user: post.user || { firstName: "Unknown", lastName: "", avatar: "https://placehold.co/100" }
        }));
      } catch (error) {
        console.error("Error fetching posts:", error);
        this.errorPosts = "Failed to load posts. Please try again.";
        this.posts = []; // ✅ Ensure posts is always an array
      } finally {
        this.loadingPosts = false;
      }
    },

    parseContent(content) {
      try {
        return typeof content === "string" ? JSON.parse(content) : content;
      } catch (e) {
        console.error("Failed to parse post content:", e);
        return {};
      }
    },


    async addReaction(postId, reactionType) {
        const authToken = Cookies.get("auth_token");
        await fetch("/api/posts/reactions", {
            method: "POST",
            headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
            body: JSON.stringify({ postId, reactionType }),
        });
        await this.fetchUserPosts(this.$route.params.id);
        },

    countReactions(reactions, type) {
      return reactions.filter(r => r.type === type).length;
    }

    

    

  },
};
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
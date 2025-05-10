<template>
  <PatternSection>
    <!-- Cover Image and Profile Header (existing code) -->
    <div
      class="h-[500px] w-full bg-cover bg-center relative pb-20"
      :style="{ backgroundImage: `url('${loggedInUser?.coverImage || defaultCoverImage}')` }"
    >
      <!-- Cover Upload Button -->
      <label
        for="cover-upload"
        class="absolute bottom-4 right-4 bg-gray-500 text-white p-3 rounded-full cursor-pointer hover:bg-gray-600 shadow-md"
        title="Upload Cover Image"
      >
        <!-- SVG icon -->
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
        </svg>
      </label>
      <input id="cover-upload" type="file" name="cover" accept="image/*" class="hidden" @change="handleFileChange('cover', $event)" />
    </div>

    <!-- Main Content Box -->
    <div class="max-w-6xl mx-auto p-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Aside Column (Profile & Friends) -->
        <aside class="md:col-span-1">
          <!-- (Your existing aside content here) -->
        </aside>

        <!-- Section Column (Tabs & Content) -->
        <section class="md:col-span-2">
          <!-- Tabs -->
          <div class="border-b border-gray-300 dark:border-gray-600 mb-4">
            <ul class="flex space-x-4 bg-white dark:bg-gray-800 p-4 shadow-md">
              <li :class="tab === 'bible' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-blue-500'" class="cursor-pointer pb-2" @click="setTab('bible')">Bible</li>
              <li :class="tab === 'highlights' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-blue-500'" class="cursor-pointer pb-2" @click="setTab('highlights')">Highlights</li>
              <li :class="tab === 'notes' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-blue-500'" class="cursor-pointer pb-2" @click="setTab('notes')">Notes</li>
              <li :class="tab === 'places' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-blue-500'" class="cursor-pointer pb-2" @click="setTab('places')">Places</li>
              <li :class="tab === 'cross-reference' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-blue-500'" class="cursor-pointer pb-2" @click="setTab('cross-reference')">Cross Reference</li>
              <li :class="tab === 'acient-language' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-blue-500'" class="cursor-pointer pb-2" @click="setTab('acient-language')">Acient Language</li>
            </ul>
          </div>

          <!-- Tab Content -->
          <div>
            <!-- Bible Tab -->
            <div v-if="tab === 'bible'">
              <BibleViewer />
            </div>

            <!-- Highlights Tab -->
            <!-- ... existing tab content for highlights, notes, places, cross-reference ... -->

            <!-- Acient Language Tab -->
            <div v-if="tab === 'acient-language'" class="bg-white dark:bg-gray-800 border-b border-gray-300 shadow-md p-4">
              <DictionaryPagination />
            </div>
          </div>
        </section>
      </div>
    </div>
  </PatternSection>
</template>

<script>
import { useUser, userLogout } from "~/composables/useAuth";
import Cookies from "js-cookie";
import BibleViewer from "~/components/bible/BibleViewer.vue";
import DictionaryPagination from "~/components/bible/DictionaryPagination.vue";

export default {
  data() {
    return {
      loggedInUser: null,
      editing: false,
      defaultCoverImage: 'https://placehold.co/2000x500',
      tab: 'bible',
      highlights: [],
      loadingHighlights: false,
      errorHighlights: null,
      friends: [],
      loadingFriends: false,
      errorFriends: null,
      notes: [],
      loadingNotes: false,
      photos: [],
      loadingPhotos: false,
      errorPhotos: null,
      places: [],
      loadingPlaces: false,
      errorPlaces: null,
    };
  },
  async created() {
    this.loggedInUser = await this.getLoggedInUser();
    await this.fetchPhotos();
    await this.fetchFriends();
    this.setTab(this.tab);
  },
  methods: {
    async getLoggedInUser() {
      try {
        const authToken = await useUser();
        if (!authToken) throw new Error("Authentication token is missing.");
        const response = await $fetch(`/api/user`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        return response;
      } catch (error) {
        console.error("Error in getLoggedInUser:", error.message || error);
        return null;
      }
    },
    // ... other methods for highlights, notes, friends, file uploads, etc. (unchanged) ...
    setTab(tabName) {
      this.tab = tabName;
      this.$nextTick(() => {
        if (tabName === "highlights") {
          this.fetchHighlights();
        } else if (tabName === "notes") {
          this.fetchNotes();
        } else if (tabName === "places") {
          this.fetchPlaces();
        }
      });
    },
  },
};
</script>

<style scoped>
/* Add any scoped styles if needed */
</style>

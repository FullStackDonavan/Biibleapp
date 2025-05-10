<template>
  <div class="feed-container mx-auto">
    <h2 class="text-xl font-semibold my-4 text-gray-800 dark:text-gray-100">Posts</h2>

    <div v-if="loading" class="text-center text-gray-600 dark:text-gray-300">Loading posts...</div>
    <div v-else-if="error" class="text-red-500 dark:text-red-400">{{ error }}</div>
    
    <div v-else>
      <div
        v-for="post in posts"
        :key="post.id"
        class="post-card bg-white dark:bg-gray-800 shadow-md p-4 rounded-lg mb-4 transition"
      >
        <!-- Header -->
        <div class="flex items-center space-x-3 text-gray-800 dark:text-gray-100">
          <img
            v-if="post.user.avatar"
            :src="post.user.avatar"
            alt="User Avatar"
            class="w-10 h-10 rounded-full object-cover"
          />
          <span class="font-semibold">{{ post.user.firstName }} {{ post.user.lastName }}</span>
        </div>

        <!-- Apologetics -->
        <div v-if="post.type === 'apologetics'" class="mt-3">
          <h3 class="font-bold text-lg text-gray-900 dark:text-gray-100">
            {{ post.content.title }}
          </h3>
          <ul>
            <li v-for="(arg, index) in post.content.arguments" :key="index" class="mt-2 text-gray-700 dark:text-gray-200">
              <strong>{{ arg.claim }}</strong>: {{ arg.evidence }}
              <p v-if="arg.verse" class="text-sm italic text-gray-600 dark:text-gray-400 mt-1">
                <strong>Verse:</strong> {{ formatVerse(arg.verse) }}
              </p>
            </li>
          </ul>
        </div>

        <!-- Meme/Text -->
        <p
          v-if="post.type === 'meme' || post.type === 'text'"
          class="mt-2 text-gray-800 dark:text-gray-200"
        >
          {{ post.content.text }}
        </p>

        <!-- Image -->
        <div v-if="getImageUrl(post)" class="mt-3">
          <img :src="getImageUrl(post)" alt="Post Image" class="w-full rounded-lg object-cover" />
        </div>

        <!-- Timestamp -->
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-3">
          Posted on {{ new Date(post.createdAt).toLocaleString() }}
        </p>

        <!-- Reactions -->
        <div class="mt-4 flex items-center space-x-3 border-t border-gray-300 dark:border-gray-600 pt-2 relative">
          <!-- Default Reaction -->
          <button
            @mousedown="startHold(post.id)"
            @mouseup="stopHold"
            @mouseleave="stopHold"
            @touchstart="startHold(post.id)"
            @touchend="stopHold"
            class="text-2xl transition-all duration-300"
            :class="{ 'text-gray-600 dark:text-gray-300': !userReactions[post.id] }"
          >
            {{ userReactions[post.id] || "👍" }} <span class="text-sm">{{ post.totalReactions }}</span>
          </button>

          <!-- Reaction Menu -->
          <div
            v-if="showReactionMenu === post.id"
            class="absolute top-0 left-12 bg-white dark:bg-gray-700 shadow-lg p-2 rounded-lg flex space-x-2 transition-opacity duration-200"
          >
            <button
              v-for="reaction in reactionTypes"
              :key="reaction"
              @click="addReaction(post, reaction)"
              class="text-lg px-2 py-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              {{ reaction }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

  
  <script>
  import Cookies from "js-cookie";
  
  export default {
    data() {
      return {
        posts: [],
        loading: false,
        error: null,
        reactionTypes: ["👍", "❤️", "😂", "🙏"],
        userReactions: {}, // Track the selected reaction per post
        showReactionMenu: null, // Track which post's reaction menu is visible
        holdTimeout: null, // Timer for press-and-hold
        loggedInUserId: null, // Track the logged-in user's ID
      };
    },
    async created() {
      await this.fetchUserData(); // Load user ID first
      await this.fetchPosts();
    },
    methods: {
      async fetchUserData() {
        try {
          const authToken = Cookies.get("auth_token");
          if (!authToken) throw new Error("Authentication token missing.");
  
          const response = await fetch("/api/user", {
            method: "GET",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY_BIBLE_LOGIC}`,
          });
  
          if (!response.ok) throw new Error(`API request failed: ${response.status}`);
  
          const data = await response.json();
          if (!data.success) throw new Error("Invalid API response format");
  
          this.loggedInUserId = data.user.id;
        } catch (err) {
          console.error("❌ Failed to fetch user data:", err);
          this.error = "Failed to load user data. Please refresh.";
        }
      },
  
      async fetchPosts() {
        this.loading = true;
        try {
          const authToken = Cookies.get("auth_token");
          if (!authToken) throw new Error("Authentication token missing.");
  
          const response = await fetch("/api/user/posts", {
            method: "GET",
            headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
          });
  
          const data = await response.json();
          if (!data.success) throw new Error(data.message);
  
          // Ensure content is properly parsed
          this.posts = data.posts.map(post => ({
            ...post,
            content: this.parseContent(post.content), // ✅ Parse content safely
          }));
        } catch (err) {
          this.error = err.message || "Failed to load posts.";
        } finally {
          this.loading = false;
        }
      },
  
      // ✅ Safely parse JSON content
      parseContent(content) {
        try {
          return typeof content === "string" ? JSON.parse(content) : content;
        } catch (error) {
          console.error("❌ Error parsing post content:", error);
          return { title: "Error loading content", arguments: [] }; // Return a safe fallback
        }
      },
  
      // ✅ Format Bible verse display
      formatVerse(verse) {
        if (!verse || !verse.book) return "No verse selected";
        return `${verse.book} ${verse.chapter}:${verse.number} - "${verse.text}"`;
      },
  
      // ✅ Fix: Retrieve the correct image URL
      getImageUrl(post) {
        if (post.imageUrl) return post.imageUrl;
        if (post.content && post.content.imageId) return `/uploads/${post.content.imageId}`;
        return null;
      },
  
      async addReaction(post, reactionType) {
        const authToken = Cookies.get("auth_token");
        const previousReaction = this.userReactions[post.id]; // Store the old reaction
        this.userReactions[post.id] = reactionType;
  
        try {
          const response = await fetch("/api/posts/reactions", {
            method: "POST",
            headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
            body: JSON.stringify({ postId: post.id, reactionType }),
          });
  
          const data = await response.json();
          if (!data.success) {
            throw new Error(data.message || "Reaction update failed");
          }
  
          post.totalReactions += data.totalReactions;
        } catch (error) {
          console.error("❌ Failed to update reaction:", error);
          this.userReactions[post.id] = previousReaction; // Revert UI if API fails
          await this.fetchPosts();
        }
      },
  
      startHold(postId) {
        this.holdTimeout = setTimeout(() => {
          this.showReactionMenu = postId;
        }, 500); // Hold for 500ms to show reaction menu
      },
  
      stopHold() {
        clearTimeout(this.holdTimeout);
      },
    },
  };
  </script>
  
  <style scoped>
  /* Add animation for reaction menu */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease-in-out;
  }
  .fade-enter,
  .fade-leave-to {
    opacity: 0;
  }
  </style>
  
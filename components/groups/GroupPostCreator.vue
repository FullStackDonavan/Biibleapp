<template>
    <div class="group-post-creator border rounded-lg p-4 bg-white dark:bg-gray-800 shadow-md mx-auto">
      <div class="text-gray-800 dark:text-gray-200 mb-4">
        <h2 class="text-lg font-semibold">Create a Group Post</h2>
      </div>
  
      <!-- Post Type Selection -->
      <div class="mb-4 flex space-x-4">
        <button
          @click="togglePostType('video')"
          :class="{ 'bg-blue-500 text-white': postType === 'video' }"
          class="px-4 py-2 rounded focus:outline-none"
        >
          Video Post
        </button>
        <button
          @click="togglePostType('meme')"
          :class="{ 'bg-blue-500 text-white': postType === 'meme' }"
          class="px-4 py-2 rounded focus:outline-none"
        >
          Meme Post
        </button>
        <button
          @click="togglePostType('apologetics')"
          :class="{ 'bg-blue-500 text-white': postType === 'apologetics' }"
          class="px-4 py-2 rounded focus:outline-none"
        >
          Apologetics Post
        </button>
      </div>
  
      <!-- Video Post -->
      <div v-if="postType === 'video'" class="mt-4">
        <textarea
          v-model="postText"
          placeholder="Describe your video post..."
          class="w-full p-2 border rounded-lg resize-none focus:outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          rows="3"
        ></textarea>
  
        <div class="mb-2">
          <label class="block font-semibold mb-1 text-gray-700 dark:text-gray-200">Upload Video:</label>
          <input type="file" accept="video/*" @change="handleVideoUpload" class="dark:text-gray-100" />
        </div>
  
        <div v-if="videoUrl" class="mt-4">
          <video controls class="w-full rounded">
            <source :src="videoUrl" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
  
      <!-- Meme Post -->
      <div v-if="postType === 'meme'" class="mt-4">
        <textarea
          v-model="postText"
          placeholder="Write your caption..."
          class="w-full p-2 border rounded-lg resize-none focus:outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          rows="3"
        ></textarea>
  
        <div class="mb-2">
          <label class="block font-semibold mb-1 text-gray-700 dark:text-gray-200">Upload Meme Image:</label>
          <input type="file" accept="image/*" @change="handleMemeImageUpload" class="dark:text-gray-100" />
        </div>
  
        <div v-if="imageUrl" class="mt-4">
          <img :src="imageUrl" alt="Meme Image" class="w-full object-cover rounded" />
        </div>
      </div>
  
      <!-- Apologetics Post -->
      <div v-if="postType === 'apologetics'" class="mt-4">
        <ApologeticsForm v-model="apologeticsContent" />
      </div>
  
      <!-- Post Submission -->
      <div class="flex justify-between items-center mt-4 border-t pt-2 border-gray-300 dark:border-gray-600">
        <button @click="submitPost" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Post
        </button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from "vue";
  import { useRoute } from "vue-router";
  
  const props = defineProps({
    groupId: {
      type: Number,
      required: true,
    },
  });
  
  const postText = ref("");
  const postType = ref("video");
  const videoUrl = ref<string | null>(null);
  const imageUrl = ref<string | null>(null);
  const apologeticsContent = ref(null);
  const authToken = useCookie("auth_token").value;
  
  // Handle video upload
  const handleVideoUpload = async (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append("video", file);
  
    const response = await fetch("/api/groups/videos/upload", {
      method: "POST",
      body: formData,
    });
  
    if (response.ok) {
      const data = await response.json();
      videoUrl.value = data.video.url;
    } else {
      alert("Video upload failed.");
    }
  };
  
  // Handle meme image upload
  const handleMemeImageUpload = async (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append("image", file);
  
    const response = await fetch(`/api/groups/${props.groupId}/photos/upload`, {
        method: "POST",
        headers: {
    Authorization: `Bearer ${authToken}`,
  },

      body: formData,
    });
  
    if (response.ok) {
      const data = await response.json();
      imageUrl.value = data.photo.url;
    } else {
      alert("Image upload failed.");
    }
  };
  
  // Toggle post type
  const togglePostType = (type: string) => {
    postType.value = postType.value === type ? "" : type;
  };
  
  // Submit the post
  const submitPost = async () => {
    const postData = {
      groupId: props.groupId,
      type: postType.value,
      content: {
        text: postText.value,
        videoUrl: videoUrl.value,
        imageUrl: imageUrl.value,
        apologeticsContent: apologeticsContent.value,
      },
    };
  
    const response = await fetch("/api/groups/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(postData),
    });
  
    if (response.ok) {
      alert("Post created successfully!");
      postText.value = "";
      videoUrl.value = null;
      imageUrl.value = null;
      apologeticsContent.value = null;
      postType.value = "video";
    } else {
      const error = await response.json();
      alert("Failed to create post: " + error.message);
    }
  };
  </script>
  
  <style scoped>
  button {
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  button:hover {
    background-color: #1e40af;
  }
  </style>
  
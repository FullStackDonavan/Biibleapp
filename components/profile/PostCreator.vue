<template>
  <div class="post-creator border rounded-lg p-4 bg-white dark:bg-gray-800 shadow-md mx-auto">

    <!-- Video Post -->
    <div v-if="postType === 'video'" class="mt-4">
      <textarea
        v-model="postText"
        placeholder="Describe your video post..."
        class="w-full p-2 border rounded-lg resize-none focus:outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        rows="3"
      ></textarea>

      <!-- Upload and Generate Buttons -->
      <div class="mb-2 flex items-center space-x-4">
        <div>
          <label class="block font-semibold mb-1 text-gray-700 dark:text-gray-200">Upload Video:</label>
          <input type="file" accept="video/*" @change="handleVideoUpload" class="dark:text-gray-100" />
        </div>
      </div>

      <!-- Uploaded Video Preview -->
      <div v-if="videoUrl" class="mt-4 relative">
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
        placeholder="Write your post..."
        class="w-full p-2 border rounded-lg resize-none focus:outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        rows="3"
      ></textarea>

      <!-- Upload and Generate Buttons -->
      <div class="mb-2 flex items-center space-x-4">
        <div>
          <label class="block font-semibold mb-1 text-gray-700 dark:text-gray-200">Upload Meme Image (Optional):</label>
          <input type="file" accept="image/*" @change="handleMemeImageUpload" class="dark:text-gray-100" />
        </div>
      </div>

      <!-- Bible Verse Selection -->
      <div class="mb-2">
        <label class="block font-semibold mb-1 text-gray-700 dark:text-gray-200">Select a Bible Verse:</label>
        <VerseSelector @verse-selected="setBibleVerse" />
        <div v-if="bibleVerse" class="mt-1 italic text-gray-700 dark:text-gray-300">
          {{ bibleVerse }}
        </div>
      </div>

      <!-- Uploaded / Generated Image Preview -->
      <div v-if="imageUrl" class="mt-4 relative">
        <img :src="imageUrl" alt="Uploaded Image" class="w-full object-cover rounded" />
      </div>
    </div>

     <!-- Button to Generate Image -->
    <div class="mt-4">
      <button @click="handleGenerateClick">Generate Image</button>
    </div>


    <!-- Apologetics Post -->
    <ApologeticsForm v-if="postType === 'apologetics'" @update="setApologeticsData" />

    <!-- Bottom Action Buttons -->
    <div class="flex justify-between items-center mt-4 border-t pt-2 border-gray-300 dark:border-gray-600">
      <button @click="togglePostType('video')" class="focus:outline-none text-gray-800 dark:text-gray-200">
        Video Post
      </button>
      <button @click="togglePostType('meme')" class="focus:outline-none text-gray-800 dark:text-gray-200">
        Meme
      </button>
      <button @click="togglePostType('apologetics')" class="focus:outline-none text-gray-800 dark:text-gray-200">
        Apologetics
      </button>
      <button
        @click="submitPost"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Post
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuthCookie } from "~/composables/useAuth";

const loggedInUser = ref(null);
const authCookie = useAuthCookie();
const authToken = useCookie("auth_token").value;
const postText = ref("");
const postType = ref("video");
const imageUrl = ref(null);
const imageId = ref(null);
const bibleVerse = ref("");
const apologeticsContent = ref(null);
const videoUrl = ref(null);
const emit = defineEmits(["update"]); // 👈 enable emitting updates

// Handle video upload
const handleVideoUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) {
    alert("❌ No file selected.");
    return;
  }

  const formData = new FormData();
  formData.append("video", file);

  try {
    const response = await fetch("/api/videos/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authCookie.value}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!data.success || !data.video?.url) {
      alert("❌ Video upload failed. Try again.");
      return;
    }

    videoUrl.value = data.video.url;
  } catch (error) {
    console.error("❌ Error uploading video:", error);
    alert("Error uploading video. Check console for details.");
  }
};

// Handle meme image upload
const handleMemeImageUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) {
    alert("❌ No file selected.");
    return;
  }

  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch("/api/photos/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authCookie.value}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!data.success || !data.photo?.id) {
      alert("❌ Image upload failed. Try again.");
      return;
    }

    imageId.value = data.photo.id;
    imageUrl.value = data.photo.url;
  } catch (error) {
    console.error("❌ Error uploading image:", error);
    alert("Error uploading image. Check console for details.");
  }
};

// Generate AI image
async function generateImage() {
  if (!bibleVerse.value) {
    alert("Please select a Bible verse first!");
    return;
  }

  try {
    const prompt = `${bibleVerse.value}. ${postText.value}. Absolutely NO text in the image, only storytelling through visuals.`;
    const response = await fetch("/api/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();
    if (!data.imageUrl) {
      alert("Failed to generate image. Please try again.");
      return;
    }

    imageUrl.value = data.imageUrl;
    
  } catch (error) {
    console.error("Error generating image:", error);
    alert("Error generating image. Check console for details.");
  }
}

async function handleGenerateClick() {
  try {
    const prompt = `${bibleVerse.value}. ${postText.value}. Absolutely NO text in the image, only storytelling through visuals.`;
    const result = await generateImageSD(prompt); // Direct call, no `this`
    if (!result?.imageUrl) {
      alert("❌ Image generation failed.");
      return;
    }
    imageUrl.value = result.imageUrl;
    console.log("✅ Image generated:", result.imageUrl);
  } catch (err) {
    console.error("❌ Generation failed:", err);
    alert("Image generation error. See console.");
  }
}


// Alternative image generation (e.g., local SD)
async function generateImageSD(prompt) {
  try {
    const response = await fetch("http://127.0.0.1:5002/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error generating image:", err);
    throw err;
  }
}

// Toggle post type
function togglePostType(type) {
  postType.value = postType.value === type ? "" : type;
}

// Set selected Bible verse
function setBibleVerse(verse) {
  bibleVerse.value = `${verse.book} ${verse.chapter}:${verse.verse} - ${verse.text}`;
}

// Set apologetics form data
function setApologeticsData(data) {
  apologeticsContent.value = data;
}

// Submit post
async function submitPost() {
  if (!authCookie.value) {
    alert("❌ Authentication token is missing.");
    return;
  }

  let content = {
    type: postType.value,
    text: postText.value.trim() || null,
    imageUrl: imageUrl.value || null,
    imageId: imageId.value || null,
    videoUrl: videoUrl.value || null,
    bibleVerse: bibleVerse.value || null,
    apologetics: apologeticsContent.value || null,
  };

  // Emit the content to parent
  emit("update", content);
}
</script>


<style scoped>

button {
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #ff4500;
}
</style>

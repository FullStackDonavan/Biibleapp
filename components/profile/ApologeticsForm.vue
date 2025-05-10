<template>
  <div class="apologetics-form mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
    <!-- Select a Polemics Category -->
    <label class="block font-semibold mb-1 text-gray-700 dark:text-gray-200">Select a Polemics Category:</label>
    <select
      v-model="selectedCategory"
      @change="fetchClaims"
      class="w-full p-2 border rounded-lg focus:outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
    >
      <option value="" disabled>Select a category</option>
      <option v-for="category in polemicsCategories" :key="category" :value="category">
        {{ category }}
      </option>
    </select>

    <!-- Select a Claim -->
    <div v-if="claims.length > 0" class="mt-4">
      <label class="block font-semibold mb-1 text-gray-700 dark:text-gray-200">Select a Claim:</label>
      <select
        v-model="selectedClaim"
        @change="addClaim"
        class="w-full p-2 border rounded-lg focus:outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      >
        <option value="" disabled>Select a claim</option>
        <option v-for="claim in claims" :key="claim.id" :value="claim.claim">
          {{ claim.claim }}
        </option>
      </select>
    </div>

    <!-- User Entered Title -->
    <label class="block font-semibold mt-4 text-gray-700 dark:text-gray-200">Title:</label>
    <input
      v-model="apologeticsData.title"
      type="text"
      class="w-full p-2 border rounded-lg focus:outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      placeholder="Enter the title of your apologetics post"
    />

    <!-- Arguments Section -->
    <div
      v-for="(arg, index) in apologeticsData.arguments"
      :key="index"
      class="mt-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700"
    >
      <label class="block font-semibold text-gray-700 dark:text-gray-200">Claim:</label>
      <input
        v-model="arg.claim"
        type="text"
        class="w-full p-2 border rounded-lg focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        placeholder="Enter your claim"
      />

      <label class="block font-semibold mt-2 text-gray-700 dark:text-gray-200">Evidence:</label>
      <textarea
        v-model="arg.evidence"
        class="w-full p-2 border rounded-lg focus:outline-none resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        rows="3"
        placeholder="Provide supporting evidence"
      ></textarea>

      <!-- Select a Supporting Bible Verse -->
      <label class="block font-semibold mt-2 text-gray-700 dark:text-gray-200">Select a Supporting Bible Verse:</label>
      <VerseSelector :chapterId="selectedChapter" @verse-selected="setVerseForClaim(index, $event)" />

      <div v-if="arg.verse" class="mt-2 text-gray-700 dark:text-gray-300 italic">
        <strong>Selected Verse:</strong> {{ formatVerse(arg.verse) }}
      </div>

      <button
        @click="removeArgument(index)"
        class="text-red-500 text-sm mt-2 underline"
        v-if="apologeticsData.arguments.length > 1"
      >
        Remove Claim
      </button>
    </div>

    <button
      @click="addArgument"
      class="mt-4 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
    >
      + Add Another Claim
    </button>

    <!-- Submit Button -->
    <button
      @click="submitPost"
      class="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
    >
      Submit Post
    </button>
  </div>
</template>


<script setup>
import { ref, onMounted, defineProps } from "vue";
import Cookies from "js-cookie";

// ✅ Fix: Define `selectedChapter` as a prop
const props = defineProps({
  selectedChapter: {
    type: Number,
    required: true,
  },
});

const selectedCategory = ref("");
const selectedClaim = ref("");
const polemicsCategories = ref([]);
const claims = ref([]);

const apologeticsData = ref({
  title: "",
  arguments: [{ claim: "", evidence: "", verse: null }],
});

// Fetch categories on mount
onMounted(async () => {
  await fetchPolemicsCategories();
});

// ✅ Fetch categories
async function fetchPolemicsCategories() {
  try {
    const response = await fetch("/api/polemics");
    const data = await response.json();
    if (data.success) {
      polemicsCategories.value = data.categories;
    } else {
      console.error("❌ Failed to fetch polemics categories:", data.message);
    }
  } catch (error) {
    console.error("❌ Error fetching polemics:", error);
  }
}

// ✅ Fetch claims when a category is selected
async function fetchClaims() {
  if (!selectedCategory.value) return;
  
  try {
    const response = await fetch(`/api/polemics?category=${selectedCategory.value}`);
    const data = await response.json();
    if (data.success) {
      claims.value = data.claims;
    } else {
      console.error("❌ Failed to fetch claims:", data.message);
    }
  } catch (error) {
    console.error("❌ Error fetching claims:", error);
  }
}

// ✅ Add selected claim as a new argument
function addClaim() {
  if (!selectedClaim.value) return;

  apologeticsData.value.arguments.push({
    claim: selectedClaim.value,
    evidence: "",
    verse: null,
  });

  selectedClaim.value = ""; // Reset dropdown selection
}

// ✅ Add a new argument manually
const addArgument = () => {
  apologeticsData.value.arguments.push({ claim: "", evidence: "", verse: null });
};

// ✅ Remove a claim
const removeArgument = (index) => {
  apologeticsData.value.arguments.splice(index, 1);
};

// ✅ Set the selected verse for a claim
const setVerseForClaim = (index, verse) => {
  apologeticsData.value.arguments[index].verse = {
    id: verse.id,
    number: verse.number,
    text: verse.text,
  }; // ✅ Only store necessary properties
};

// ✅ Format verse display
const formatVerse = (verse) => {
  return verse ? `${verse.number} - "${verse.text}"` : "No verse selected";
};

// ✅ Fix `null` issue & Submit Apologetics Post
async function submitPost() {
  const authToken = Cookies.get("auth_token");
  if (!authToken) {
    console.error("❌ No auth token found.");
    return;
  }

  // Validate and clean arguments
  const validArguments = apologeticsData.value.arguments
    .filter(arg => arg.claim.trim() !== "")
    .map(arg => ({
      claim: arg.claim,
      evidence: arg.evidence,
      verse: arg.verse ? { id: arg.verse.id, number: arg.verse.number, text: arg.verse.text } : null,
    }));

  if (!apologeticsData.value.title.trim() || validArguments.length === 0) {
    console.error("❌ Title or claims cannot be empty!");
    return;
  }

  // 🛑 **Fix: Ensure JSON is an object before sending**
  const postData = {
    type: "apologetics",
    content: { title: apologeticsData.value.title, arguments: validArguments }, // ✅ Pass as object, not string
  };

  console.log("📤 Sending Post Data:", postData);

  try {
    const response = await fetch("/api/posts/add", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
      body: JSON.stringify(postData), // ✅ Stringify only once
    });

    const data = await response.json();
    if (data.success) {
      console.log("✅ Post Added Successfully:", data);
      resetForm();
    } else {
      console.error("❌ Failed to add post:", data.message);
    }
  } catch (error) {
    console.error("❌ Error adding post:", error);
  }
}


// ✅ Reset form after submission
function resetForm() {
  selectedCategory.value = "";
  selectedClaim.value = "";
  claims.value = [];
  apologeticsData.value = {
    title: "",
    arguments: [{ claim: "", evidence: "", verse: null }],
  };
}
</script>

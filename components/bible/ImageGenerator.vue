<script setup>
import { ref } from 'vue';

const prompt = ref('');
const imageUrl = ref('');
const loading = ref(false);
const error = ref(null);

const generateImage = async () => {
  loading.value = true;
  error.value = null;
  imageUrl.value = '';

  try {
    const res = await fetch(`/api/generate-image?prompt=${encodeURIComponent(prompt.value)}`);
    const data = await res.json();

    if (data.imageUrl) {
      imageUrl.value = data.imageUrl;
    } else {
      error.value = data.error || "Something went wrong";
    }
  } catch (err) {
    error.value = "API request failed";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="image-generator">
    <input v-model="prompt" placeholder="Enter prompt..." class="input" />
    <button @click="generateImage" :disabled="loading" class="btn">
      {{ loading ? "Generating..." : "Generate Image" }}
    </button>

    <p v-if="error" class="error">{{ error }}</p>
    <img v-if="imageUrl" :src="imageUrl" alt="Generated Image" class="generated-image" />
  </div>
</template>

<style scoped>
.image-generator {
  text-align: center;
}
.input {
  padding: 8px;
  width: 80%;
  margin: 10px;
}
.btn {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}
.generated-image {
  margin-top: 20px;
  max-width: 100%;
}
.error {
  color: red;
}
</style>

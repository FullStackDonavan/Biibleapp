<template>
  <form @submit.prevent="uploadGame" class="space-y-4 p-4 border rounded-md bg-white dark:bg-gray-900">
    <div>
      <label class="font-semibold">Title:</label>
      <input v-model="title" type="text" class="input" required />
    </div>

    <div>
      <label class="font-semibold">Description:</label>
      <textarea v-model="description" class="input" required />
    </div>

    <div>
      <label class="font-semibold">Slug:</label>
      <input v-model="slug" type="text" class="input" required />
    </div>

    <div>
      <label class="font-semibold">Book:</label>
      <input v-model="book" type="text" class="input" placeholder="e.g., Genesis" />
    </div>

    <div>
      <label class="font-semibold">Theme:</label>
      <input v-model="theme" type="text" class="input" placeholder="e.g., Faith" />
    </div>

    <div>
      <label class="font-semibold">Tags (comma-separated):</label>
      <input v-model="tagsInput" type="text" class="input" placeholder="e.g., quiz, adventure" />
    </div>

    <div>
      <label class="font-semibold">Game ZIP File:</label>
      <input type="file" @change="handleFile" accept=".zip" class="input" required />
    </div>

    <div>
      <label class="font-semibold">Poster Image:</label>
      <input type="file" @change="handlePoster" accept="image/*" class="input" />
    </div>

    <button type="submit" class="btn">Upload Game</button>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import Cookies from 'js-cookie'

const title = ref('')
const description = ref('')
const slug = ref('')
const book = ref('')
const theme = ref('')
const tagsInput = ref('')
const file = ref(null)
const poster = ref(null)

function handleFile(event) {
  file.value = event.target.files[0]
}

function handlePoster(event) {
  poster.value = event.target.files[0]
  console.log('📸 Selected poster:', poster.value)
}


async function uploadGame() {
  const token = Cookies.get('auth_token')
  if (!file.value || !token) return alert('Missing file or auth.')

  const formData = new FormData()
  formData.append('title', title.value)
  formData.append('description', description.value)
  formData.append('slug', slug.value)
  formData.append('book', book.value)
  formData.append('theme', theme.value)
  formData.append('tags', tagsInput.value)
  formData.append('file', file.value)

  if (poster.value) {
    formData.append('poster', poster.value)
  }

  try {
    const res = await fetch('/api/games/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })

    const data = await res.json()
    alert('✅ Game uploaded!')
    console.log('Uploaded:', data)
  } catch (err) {
    console.error(err)
    alert('❌ Upload failed.')
  }
}
</script>

<style scoped>
.input {
  @apply w-full p-2 border rounded-md;
}
.btn {
  @apply px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700;
}
</style>

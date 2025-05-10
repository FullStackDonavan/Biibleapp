<template>
    <div class="dictionary-container">
      <h2 class="text-xl font-bold mb-4">Ancient Hebrew Dictionary</h2>
      <!-- Word List -->
      <div class="grid grid-cols-1 gap-4">
        <div
          v-for="word in paginatedWords"
          :key="word.xmlId"
          class="p-4 border rounded shadow"
        >
          <p class="block text-8xl font-bold my-8"><strong>{{ word.text }}</strong></p>
          <p v-if="word.transliteration">Transliteration: {{ word.transliteration }}</p>
          <p v-if="word.english">Translation: {{ word.english }}</p>
          <p v-if="word.pos">Part of Speech: {{ word.pos }}</p>
          <p v-if="word.gender">Gender: {{ word.gender }}</p>
          <p v-if="word.number">Number: {{ word.number }}</p>
        </div>
      </div>
      <!-- Pagination Controls -->
      <div class="pagination mt-4 flex justify-center space-x-2">
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "DictionaryPagination",
    data() {
      return {
        words: [],
        currentPage: 1,
        pageSize: 20,
      };
    },
    computed: {
      totalPages() {
        return Math.ceil(this.words.length / this.pageSize);
      },
      paginatedWords() {
        const start = (this.currentPage - 1) * this.pageSize;
        return this.words.slice(start, start + this.pageSize);
      },
    },
    methods: {
      async fetchWords() {
        try {
          // This endpoint returns an object like { words: [...] }
          const data = await $fetch("/api/dictionary");
          this.words = data.words || [];
        } catch (error) {
          console.error("Error fetching dictionary words:", error);
        }
      },
      nextPage() {
        if (this.currentPage < this.totalPages) {
          this.currentPage++;
        }
      },
      prevPage() {
        if (this.currentPage > 1) {
          this.currentPage--;
        }
      },
    },
    created() {
      this.fetchWords();
    },
  };
  </script>
  
  <style scoped>
  .dictionary-container {
    padding: 1rem;
  }
  </style>
  
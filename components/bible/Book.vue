<script>
export default {
  props: {
    translationId: {
      type: Number,
      required: true,
    },
  },

  data() {
    return {
      books: [],
      selectedBook: null,
    };
  },

  watch: {
    translationId: {
      immediate: true, // ✅ Runs immediately when component is mounted
      handler(newTranslationId) {
        if (newTranslationId) {
          console.log("📖 Translation ID changed, fetching books:", newTranslationId);
          this.fetchBooks(newTranslationId);
        }
      },
    },
  },

  methods: {
    async fetchBooks(id) {
      console.log("📚 Fetching books for translation ID:", id);
      try {
        const response = await $fetch(`/api/user/books?translationId=${id}`);
        console.log("📘 API Response:", response);
        this.books = response.books || [];
      } catch (error) {
        console.error("❌ Error fetching books:", error);
      }
    },

    fetchChapters() {
      console.log("📕 Selected Book ID:", this.selectedBook);
      this.$emit("book-selected", this.selectedBook);
    },
  },
};
</script>

<template>
  <div>
    <label class="block text-xl font-medium text-gray-700 dark:text-gray-300">Select Book:</label>
    <select v-model="selectedBook" @change="fetchChapters" class="w-full border bg-white dark:bg-gray-800 p-4">
      <option value="" disabled>Select a book</option>
      <option v-for="book in books" :key="book.id" :value="book.id">
        {{ book.name }}
      </option>
    </select>
  </div>
</template>

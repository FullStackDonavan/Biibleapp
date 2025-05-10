<script>
export default {
  props: {
    bookId: {
      type: Number,
      required: true,
    },
  },

  data() {
    return {
      chapters: [],
      selectedChapter: null,
    };
  },

  watch: {
    bookId: {
      immediate: true, // ✅ Runs immediately when component is mounted
      handler(newBookId) {
        if (newBookId) {
          console.log("📕 Book ID changed, fetching chapters:", newBookId);
          this.fetchChapters(newBookId);
        }
      },
    },
  },

  methods: {
    async fetchChapters(id) {
      console.log("📗 Fetching chapters for book ID:", id);
      try {
        const response = await $fetch(`/api/chapters?bookId=${id}`);
        console.log("📘 API Response:", response);
        this.chapters = response.chapters || [];
      } catch (error) {
        console.error("❌ Error fetching chapters:", error);
      }
    },

    selectChapter() {
      console.log("📖 Selected Chapter:", this.selectedChapter);
      this.$emit("chapter-selected", this.selectedChapter);
    },
  },
};
</script>

<template>
  <div>
    <label class="block text-xl font-medium text-gray-700 dark:text-gray-300">Select Chapter:</label>
    <select v-model="selectedChapter" @change="selectChapter" class="w-full border bg-white dark:bg-gray-800 p-4">
      <option value="" disabled>Select a chapter</option>
      <option v-for="chapter in chapters" :key="chapter.id" :value="chapter.id">
        Chapter {{ chapter.number }}
      </option>
    </select>
  </div>
</template>

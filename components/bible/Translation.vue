<template>
    <div>
      <label class="block text-xl font-medium text-gray-700 dark:text-gray-300">Select Translation:</label>
      <select v-model="selectedTranslation" @change="fetchBooks" class="w-full border bg-white dark:bg-gray-800 p-4">
        <option value="" disabled>Select a translation</option>
        <option v-for="translation in translations" :key="translation.id" :value="translation.id">
          {{ translation.title }}
        </option>
      </select>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        translations: [],
        selectedTranslation: null,
      };
    },
    async created() {
      const response = await $fetch("/api/translations");
      this.translations = response.translations;
    },
    methods: {
      fetchBooks() {
        const selected = this.translations.find(t => t.id === this.selectedTranslation);
        if (selected) {
          this.$emit("translation-selected", {
            id: selected.id,
            title: selected.title,
          });
        }
      },
    },
  };
  </script>
  
<template>
  <div>
    <label class="block text-xl font-medium text-gray-700 dark:text-gray-300">
      Select Translation:
    </label>
    <select
      v-model="selectedTranslation"
      @change="emitSelectedTranslation"
      class="w-full border bg-white dark:bg-gray-800 p-4"
    >
      <option value="" disabled>Select a translation</option>
      <option
        v-for="translation in translations"
        :key="translation.id"
        :value="translation.id"
      >
        {{ translation.name }}
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
    const response = await $fetch("/api/quran/translations");
    this.translations = response.translations;
  },
  methods: {
    emitSelectedTranslation() {
      const selected = this.translations.find(
        (t) => t.id === this.selectedTranslation
      );
      this.$emit("translation-selected", {
        id: selected.id,
        name: selected.name,
      });
    },
  },
};
</script>

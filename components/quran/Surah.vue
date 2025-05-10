<template>
  <div>
    <label class="block text-xl font-medium text-gray-700 dark:text-gray-300">
      Select Surah:
    </label>
    <select v-model="selectedSurah" @change="emitSurah" class="w-full border bg-white dark:bg-gray-800 p-4">
      <option value="" disabled>Select a Surah</option>
      <option
        v-for="surah in surahs"
        :key="surah.id"
        :value="surah.id"
      >
        {{ surah.transliteration }} ({{ surah.number }})
      </option>
    </select>
  </div>
</template>

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
      surahs: [],
      selectedSurah: null,
    };
  },
  watch: {
    translationId: {
      immediate: true,
      async handler(id) {
        if (!id) return
        const response = await $fetch(`/api/quran/surahs?translation=${id}`);
        this.surahs = response;
      },
    },
  },
  methods: {
    emitSurah() {
      const surah = this.surahs.find((s) => s.id === this.selectedSurah);
      this.$emit("surah-selected", {
        id: surah.id,
        name: surah.transliteration,
        number: surah.number,
      });
    },
  },
};
</script>

<template>
    <div class="transition duration-500">
      <div class="max-w-6xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h1 v-if="selectedTranslationTitle && selectedSurahName && selectedSurahNumber" 
            class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
          {{ selectedTranslationTitle }} - Surah {{ selectedSurahName }} ({{ selectedSurahNumber }})
        </h1>
  
        <Toolbar v-if="selectedVerse" :selectedVerse="selectedVerse" @close="closeToolbar" />
  
        <div class="flex flex-wrap gap-0 mb-6">
          <div class="w-full sm:w-1/2">
            <QuranTranslations @translation-selected="handleTranslationSelection" />

          </div>
  
          <div class="w-full sm:w-1/2" v-if="selectedTranslation">
            <Surah :translationId="selectedTranslation" @surah-selected="handleSurahSelection" />
          </div>
        </div>
  
        <Ayah
          v-if="selectedSurah"
          :surahId="selectedSurah"
          :translationId="selectedTranslation"
          :userId="userId"
          @verse-selected="handleVerseSelection"
        />
      </div>
    </div>
  </template>
  
  <script>
  import QuranTranslations from '@/components/quran/QuranTranslations.vue'
  import Surah from '@/components/quran/Surah.vue'
  import Ayah from '@/components/quran/Ayah.vue'
  import Toolbar from '@/components/bible/Toolbar.vue'
  
  export default {
    props: {
      userId: {
        type: Number,
        default: null,
      },
    },
    components: { QuranTranslations, Surah, Ayah, Toolbar },
    data() {
      return {
        selectedTranslation: null,
        selectedTranslationTitle: null,
        selectedSurah: null,
        selectedSurahName: null,
        selectedSurahNumber: null,
        selectedVerse: null,
      }
    },
    methods: {
      handleTranslationSelection({ id, name }) {
        this.selectedTranslation = id
        this.selectedTranslationTitle = name
        this.selectedSurah = null
      },
      handleSurahSelection({ id, name, number }) {
        this.selectedSurah = id
        this.selectedSurahName = name
        this.selectedSurahNumber = number
      },
      handleVerseSelection(verse) {
        if (!verse) return
        this.selectedVerse = verse
        this.$emit('verse-selected', verse)
      },
      closeToolbar() {
        this.selectedVerse = null
      },
    },
  }
  </script>
  
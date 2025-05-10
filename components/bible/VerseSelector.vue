<template>
  <div class="transition duration-500">
    <div class="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <h1 v-if="selectedTranslationTitle && selectedBookName && selectedChapterNumber" 
          class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
        {{ selectedTranslationTitle }} - Book of {{ selectedBookName }}, Chapter {{ selectedChapterNumber }}
      </h1>
      <Translation @translation-selected="handleTranslationSelection" />
      <Book v-if="selectedTranslation" :translationId="selectedTranslation" @book-selected="handleBookSelection" />
      <Chapter v-if="selectedBook" :bookId="selectedBook" @chapter-selected="handleChapterSelection" />
      <Verse v-if="selectedChapter" :chapterId="selectedChapter" @verse-selected="handleVerseSelection" :userId="userId"  />
    </div>
  </div>
</template>

<script>
import Translation from "@/components/bible/Translation.vue";
import Book from "@/components/bible/Book.vue";
import Chapter from "@/components/bible/Chapter.vue";
import Verse from "@/components/bible/Verse.vue";
import Toolbar from "@/components/bible/Toolbar.vue";

export default {
  props: {
    userId: {
      type: Number,
      default: null,
    },
  },
  components: { Translation, Book, Chapter, Verse, Toolbar },

  data() {
    return {
      loading: false,
      error: false,
      selectedTranslation: null,
      selectedTranslationTitle: null,
      selectedBook: null,
      selectedBookName: null,
      selectedChapter: null,
      selectedChapterNumber: null,
      selectedVerse: null,
    };
  },

  emits: ["verse-selected"], // ✅ Declare the event

  methods: {
    handleTranslationSelection(translationId) {
      this.selectedTranslation = translationId;
      this.selectedBook = null;
      this.selectedChapter = null;
    },

    handleBookSelection(bookId) {
      this.selectedBook = bookId;
      this.selectedChapter = null;
    },

    handleChapterSelection(chapterId) {
      this.selectedChapter = chapterId;
    },

    handleVerseSelection(verse) {
      if (!verse) {
        console.error("❌ handleVerseSelection() received null");
        return;
      }

      this.selectedVerse = verse;
      this.$emit("verse-selected", verse); // ✅ Emit the selected verse
    },

    closeToolbar() {
      this.selectedVerse = null;
    },
  },
};
</script>

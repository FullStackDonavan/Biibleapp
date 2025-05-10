<template>
  <div class="transition duration-500">
    <div class="max-w-6xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <h1 v-if="selectedTranslationTitle && selectedBookName && selectedChapterNumber" 
          class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
        {{ selectedTranslationTitle }} - Book of {{ selectedBookName }}, Chapter {{ selectedChapterNumber }}
      </h1>
      <Toolbar v-if="selectedVerse" :selectedVerse="selectedVerse" @play-audio="playAudio" @close="closeToolbar" />

      <div class="flex flex-wrap gap-0 my-6">
        <div class="w-full sm:w-1/3">
          <Translation @translation-selected="handleTranslationSelection" />
        </div>

        <div class="w-full sm:w-1/3" v-if="selectedTranslation">
          <Book :translationId="selectedTranslation" @book-selected="handleBookSelection" />
        </div>

        <div class="w-full sm:w-1/3" v-if="selectedBook">
          <Chapter :bookId="selectedBook" @chapter-selected="handleChapterSelection" />
        </div>
      </div>

      <Verse v-if="selectedChapter" :chapterId="selectedChapter" :compare="compare" @verse-selected="handleVerseSelection" :userId="userId"  />
    </div>
  </div>
</template>

<script>
import axios from 'axios';
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
    compare: {
      type: Boolean,
      default: false,
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
      audioUrl: null, // Holds the generated audio URL
    };
  },

  emits: ["verse-selected"],

  methods: {
    handleTranslationSelection({ id, title }) {
      this.selectedTranslation = id;
      this.selectedTranslationTitle = title;
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
      this.$emit("verse-selected", verse); // Emit the selected verse
    },

    closeToolbar() {
      this.selectedVerse = null;
    },

    async playAudio() {
      if (!this.selectedVerse || !this.selectedVerse.text) return;

      const verseText = this.selectedVerse.text;

      try {
        this.loading = true;
        const response = await this.generateAudio(verseText);

        // Check for error or audio stream data
        if (response.error) {
          console.error(response.error);
          return;
        }

        // Create a blob from the audio stream
        const audioBlob = new Blob([response], { type: 'audio/mp3' });

        // Play the audio
        const audioUrl = URL.createObjectURL(audioBlob);
        this.playAudioFile(audioUrl);  // Play the stream as an audio file

      } catch (error) {
        this.error = true;
        console.error("Error generating audio:", error);
      } finally {
        this.loading = false;
      }
    },

    async generateAudio(text) {
      try {
        const response = await axios.post('/api/generate-audio', { text }, {
          responseType: 'arraybuffer',  // Ensure the response is treated as a binary buffer
        });
        return response.data;  // Return the audio stream data
      } catch (error) {
        console.error("Error generating audio:", error);
        throw new Error('Failed to generate audio');
      }
    },

    playAudioFile(url) {
      const audio = new Audio(url);
      audio.play();
    },
  },
};
</script>

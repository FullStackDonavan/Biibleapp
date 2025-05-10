<template>
<!-- Toolbar -->
<div
  v-if="showingToolbar"
  class="sticky top-0 left-0 w-full bg-white dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600 p-3 flex flex-col space-y-2 z-50 shadow-md"
>
  

  <!-- Color Buttons -->
  <div class="flex justify-center space-x-4">
    <!-- Display the selected verse -->
  <div class="content-center text-center text-gray-800 dark:text-gray-200 font-bold">
    <span>Verse: </span>
    <span>{{ selectedVerse?.number }}</span>
  </div>
    <button
      v-for="color in colors"
      :key="color"
      :style="{ backgroundColor: color }"
      class="w-10 h-10 rounded-full border-2 border-gray-300 dark:border-gray-600"
      @click="handleHighlight(selectedVerse, color)"
    ></button>

   
    <!-- Add Note Button -->
     <span class="content-center text-center text-gray-800 dark:text-gray-200 font-bold">|</span>
<button
  class="flex items-center justify-center w-10 h-10 text-gray-800 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-600"
  @click="toggleNoteForm"
>
  <!-- Pencil and Paper Icon -->
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
    <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
  </svg>
</button>

<!-- Places Icon -->
<button
      class="flex items-center justify-center w-10 h-10 text-gray-800 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-600"
      @click="togglePlaceForm"
    >
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
		  <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7m0 9.5a2.5 2.5 0 0 1 0-5a2.5 2.5 0 0 1 0 5" />
	  </svg>
    </button>

    <!-- Cross References Icon -->
   <button
      class="flex items-center justify-center w-10 h-10 text-gray-800 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-600"
      @click="handleCrossReferences"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
        <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
          <path d="M3 17h2.397a5 5 0 0 0 4.096-2.133l.177-.253m3.66-5.227l.177-.254A5 5 0 0 1 17.603 7H21" />
          <path d="m18 4l3 3l-3 3M3 7h2.397a5 5 0 0 1 4.096 2.133l4.014 5.734A5 5 0 0 0 17.603 17H21" />
          <path d="m18 20l3-3l-3-3" />
        </g>
      </svg>
    </button>

  

  <!-- Close Button -->
  <button
    class="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 mx-auto"
    @click="closeToolbar"
  >
    Close
  </button>
</div>

 <!-- Note Form  -->
 <div v-if="showNoteForm" class="sticky top-0 left-0 w-full">
  <div class="bg-white dark:bg-gray-800 rounded-lg my-4 p-4">
    <textarea
      v-model="noteContent"
      class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
      placeholder="Enter your note..."
    ></textarea>
    <div class="flex justify-end mt-2 space-x-2">
      <button
        class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
        @click="cancelNote"
      >
        Cancel
      </button>
      <button
        class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        @click="addNote"
      >
        Save Note
      </button>
    </div>
    </div>
  </div>

   <!-- Place Form -->
   <div v-if="showPlaceForm" class="bg-white dark:bg-gray-800 rounded-lg my-4 p-4">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Add Place</h3>
        <form @submit.prevent="submitPlace">
          <div class="space-y-4">
            <!-- Place Name -->
            <div>
              <label for="placeName" class="block text-gray-700 dark:text-gray-300">Place Name:</label>
              <input
                id="placeName"
                v-model="place.name"
                type="text"
                required
                class="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <!-- Location -->
            <div>
              <label for="placeLocation" class="block text-gray-700 dark:text-gray-300">Location (Optional):</label>
              <input
                id="placeLocation"
                v-model="place.location"
                type="text"
                class="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div class="flex justify-end mt-4 space-x-4">
            <button
              type="button"
              class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              @click="cancelPlace"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Save Place
            </button>
          </div>
          
        </form>
  </div>

</div>



     

  <div class="min-h-screen transition duration-500">
    <div class="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <h1 v-if="selectedBook && selectedChapter" class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
        {{ selectedTranslationTitle }} - Book of {{ selectedBookName }}, Chapter {{ selectedChapterNumber }}
      </h1>

      <!-- Error Message -->
      <div v-if="error" class="text-red-500 mb-4">Failed to load data. Please try again.</div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center text-gray-500 dark:text-gray-400 mb-4">Loading...</div>

      <!-- Translations Dropdown -->
      <div v-if="!loading && !error" class="mb-4">
        <label
          for="translations"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Select Translation:
        </label>
        <select
          id="translations"
          v-model="selectedTranslation"
          @change="fetchBooks"
          class="w-full border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-300"
        >
          <option value="" disabled>Select a translation</option>
          <option v-for="translation in translations" :key="translation.id" :value="translation.id">
            {{ translation.title }}
          </option>
        </select>
      </div>

      <!-- Books Dropdown -->
      <div v-if="!loading && !error && books.length" class="mb-4">
        <label
          for="books"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Select Book:
        </label>
        <select
          id="books"
          v-model="selectedBook"
          @change="fetchChapters"
          class="w-full border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:disabled:bg-gray-600"
        >
          <option value="" disabled>Select a book</option>
          <option v-for="book in books" :key="book.id" :value="book.id">{{ book.name }}</option>
        </select>
      </div>

      <!-- Chapters Dropdown -->
      <div v-if="!loading && !error && chapters.length" class="mb-4">
        <label
          for="chapters"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Select Chapter:
        </label>
        <select
          id="chapters"
          v-model="selectedChapter"
          @change="fetchVerses"
          class="w-full border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:disabled:bg-gray-600"
        >
          <option value="" disabled>Select a chapter</option>
          <option v-for="chapter in chapters" :key="chapter.id" :value="chapter.id">
            Chapter {{ chapter.number }}
          </option>
        </select>
      </div>

     <!-- Verses List -->
      <div class="space-y-2">
        <span
          v-for="verse in verses"
          :key="verse.id"
          class="block p-2 cursor-pointer"
          :class="{
            'ring-2 ring-blue-500 dark:ring-blue-300': selectedVerse?.id === verse.id,
          }"
          :style="{ backgroundColor: verse.highlighted ? verse.color : 'transparent' }"
          @click="showToolbar($event, verse)"
        >
          <span class="text-xs text-gray-500 dark:text-gray-300 align-super font-bold">
            {{ verse.number }}
          </span>
          <span class="text-gray-800 dark:text-gray-300">{{ verse.text }} 
              <div class="flex justify-end items-center space-x-2">
                <!-- Places Icon -->
                <svg v-if="verse.places.length" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7m0 9.5a2.5 2.5 0 0 1 0-5a2.5 2.5 0 0 1 0 5" />
                </svg>

                <!-- Notes Icon -->
                <svg v-if="verse.notes.length" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                  <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                </svg>
              </div>
          </span>
        </span>
      </div>
    </div>
  </div>
</template>


<script>
import Cookies from "js-cookie";

export default {
  props: {
    userId: {
      type: Number,
      default: null,
    },
  },
  data() {
    return {
      translations: [],
      books: [],
      chapters: [],
      verses: [],
      selectedTranslation: null,
      selectedTranslationTitle: null,
      selectedBook: null,
      selectedBookName: null,
      selectedChapter: null,
      selectedChapterNumber: null,
      loading: true,
      error: false,
      showingToolbar: false,
      selectedVerse: null,
      toolbarPosition: { top: 0, left: 0 },
      colors: ["#fef3c7", "#bfdbfe", "#fde68a", "#d9f99d", "transparent"],
      endpoint: "",
      showNoteForm: false,
      noteContent: "",
      showPlaceForm: false,
      place: {
        name: "",
        location: "",
      },
    };
  },
  
  methods: {
    async fetchTranslations() {
      try {
        const response = await $fetch("/api/translations");
        this.translations = response.translations;
        this.selectedTranslationTitle = response.translations[0].translation;
      } catch (error) {
        console.error("Error fetching translations:", error);
      }
    },
    async fetchBooks() {
      if (!this.selectedTranslation) return;

      try {
        const response = await $fetch(`/api/books?translationId=${this.selectedTranslation}`);
        this.books = response.books;
        this.selectedBookName = response.books[0].name;
        this.chapters = [];
        this.verses = [];
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    },
    async fetchChapters() {
      if (!this.selectedBook) return;

      try {
        const response = await $fetch(`/api/chapters?bookId=${this.selectedBook}`);
        this.chapters = response.chapters;
        this.selectedChapterNumber = response.chapters[0].number
      } catch (error) {
        console.error("Error fetching chapters:", error);
      }
    },
    async fetchVerses() {
      if (!this.selectedChapter) return;

      const authToken = Cookies.get("auth_token");
      try {
        if (this.userId) {
          this.endpoint = `/api/user/${this.userId}/userVerses?chapterId=${this.selectedChapter}`;
        } else {
          this.endpoint = `/api/verses?chapterId=${this.selectedChapter}`;
        }

        const response = await $fetch(this.endpoint, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        // Ensure each verse has a 'places' property
        this.verses = response.verses.map((verse) => ({
          ...verse,
          places: verse.places || [], // Default to empty array if not present
          notes: verse.notes || [], // Default to empty array if not present
        }));
      } catch (error) {
        console.error("Error fetching verses:", error);
      }
    },
    async handleHighlight(verse, color) {
      if (this.userId === null) {
        await this.toggleHighlight(verse, color);
      } else {
        await this.fetchUserHighlights(verse, color);
      }
    },
      
    // Toggle highlight and store color
    async toggleHighlight(verse, color) {
          try {
            verse.highlighted = !verse.highlighted;
            verse.color = color;

            // Find the verse in the main verses array and update it
            const verseIndex = this.verses.findIndex((v) => v.id === verse.id);
            if (verseIndex !== -1) {
              this.verses[verseIndex].highlighted = verse.highlighted;
              this.verses[verseIndex].color = color;
            }

            // Send data to the backend
            const authToken = Cookies.get("auth_token");
            await $fetch("/api/highlight", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json",
              },
              body: {
                verseId: verse.id,
                highlighted: verse.highlighted,
                color: color,
              },
            });
          } catch (error) {
            console.error("Error toggling highlight:", error);
            verse.highlighted = !verse.highlighted; // Revert on error
          }
     },






    async fetchUserHighlights(verse, color) {
      try {
        
      } catch (error) {
        console.error("Error toggling highlight:", error);
        verse.highlighted = !verse.highlighted; // Revert on error
      }
    },


    




 
   // Show toolbar for the selected verse
   showToolbar(_, verse) {
      if(this.userId){
        this.showingToolbar = false;
      }else{
        this.selectedVerse = verse;
        this.showingToolbar = true;
      }
      
    },

    // Close toolbar
    closeToolbar() {
      this.showingToolbar = false;
      this.selectedVerse = null;
    },

    
  

  
  toggleNoteForm() {
      this.showNoteForm = !this.showNoteForm;
    },
    cancelNote() {
      this.noteContent = "";
      this.showNoteForm = false;
    },
    async addNote() {
      if (!this.noteContent) {
        alert("Note content cannot be empty.");
        return;
      }
      try {
        const authToken = Cookies.get("auth_token");
        await $fetch("/api/user/addNote", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: {
            verseId: this.selectedVerse.id,
            content: this.noteContent,
          },
        });
        alert("Note added successfully!");
        this.noteContent = "";
        this.showNoteForm = false;
      } catch (error) {
        console.error("Error adding note:", error);
        alert("Failed to add note.");
      }
    },

  // Handle Cross References Icon Click
  handleCrossReferences() {
    alert("Feature to view cross references is under construction.");
  },
  togglePlaceForm() {
      this.showPlaceForm = !this.showPlaceForm;
    },
    cancelPlace() {
      this.place = { name: "", location: "" };
      this.showPlaceForm = false;
    },
    async submitPlace() {
      if (!this.place.name) {
        alert("Place Name is required.");
        return;
      }
      try {
        const authToken = Cookies.get("auth_token");
        await $fetch("/api/places/add", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: {
            verseId: this.selectedVerse?.id,
            name: this.place.name,
            location: this.place.location,
          },
        });
        alert("Place added successfully!");
        this.cancelPlace();
      } catch (error) {
        console.error("Error adding place:", error);
        alert("Failed to add place.");
      }
    },
  },
  async created() {
    try {
      this.loading = true;
      await this.fetchTranslations();
    } catch {
      this.error = true;
    } finally {
      this.loading = false;
    }
  },
};
</script>


<style>
.lh-loose {
  line-height: 3;
}
.bg-yellow-200.dark\:bg-yellow-500 {
  transition: background-color 0.3s ease;
}
</style>

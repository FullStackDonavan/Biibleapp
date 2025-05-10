<template>
    <div
      v-if="selectedVerse"
      class="sticky top-0 left-0 w-full bg-white dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600 p-3 flex flex-col space-y-2 z-50 shadow-md"
    >
      <!-- Selected Verse -->
      <div class="text-center text-gray-800 dark:text-gray-200 font-bold">
        <span>Verse: </span>
        <span>{{ selectedVerse?.number }}</span>
      </div>
  
      <!-- Color Buttons -->
      <div class="flex justify-center space-x-4">
        <button
          v-for="color in colors"
          :key="color"
          :style="{ backgroundColor: color }"
          class="w-10 h-10 rounded-full border-2 border-gray-300 dark:border-gray-600"
          @click="toggleHighlight(selectedVerse, color)"
        ></button>
  
        <span class="text-gray-800 dark:text-gray-200 font-bold">|</span>
  
        <!-- Note Button -->
        <button class="w-10 h-10 text-gray-800 dark:text-gray-200" @click="toggleNoteForm">
           <!-- Pencil and Paper Icon -->
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
            </svg>
        </button>
  
        <!-- Places Button -->
        <button class="w-10 h-10 text-gray-800 dark:text-gray-200" @click="togglePlaceForm">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7m0 9.5a2.5 2.5 0 0 1 0-5a2.5 2.5 0 0 1 0 5" />
            </svg>
        </button>
  
        <!-- Cross References Button -->
        <button class="w-10 h-10 text-gray-800 dark:text-gray-200" @click="handleCrossReferences">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
                <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                <path d="M3 17h2.397a5 5 0 0 0 4.096-2.133l.177-.253m3.66-5.227l.177-.254A5 5 0 0 1 17.603 7H21" />
                <path d="m18 4l3 3l-3 3M3 7h2.397a5 5 0 0 1 4.096 2.133l4.014 5.734A5 5 0 0 0 17.603 17H21" />
                <path d="m18 20l3-3l-3-3" />
                </g>
            </svg>
        </button>

        <!-- Audio Button -->
        <button class="w-10 h-10 text-gray-800 dark:text-gray-200" @click="playAudio">
          

          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 16 16"><g fill="currentColor"><path d="M10 0v5.401a2.999 2.999 0 0 1 0 5.198V16l-5.333-4H0V4h4.667zM8 4L5.333 6H2v4h3.333L8 12z"/><path d="m13.6 3.2l-.799-.6L11.6 4.199l.8.6a4 4 0 0 1 .8.802c.503.668.8 1.497.8 2.399s-.297 1.73-.8 2.4a4 4 0 0 1-.8.8l-.8.601l1.201 1.6l.8-.601a6 6 0 0 0 1.198-1.2A5.98 5.98 0 0 0 16 8c0-1.35-.447-2.598-1.2-3.6a6 6 0 0 0-1.2-1.2"/></g></svg>
        </button>

      </div>

    


  
      <!-- Close Button -->
      <button class="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 mx-auto" @click="$emit('close')">
        Close
      </button>
  
      <!-- Note Form -->
      <div v-if="showNoteForm" class="bg-white dark:bg-gray-800 rounded-lg my-4 p-4">
        <textarea
          v-model="noteContent"
          class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          placeholder="Enter your note..."
        ></textarea>
        <div class="flex justify-end mt-2 space-x-2">
          <button class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600" @click="cancelNote">
            Cancel
          </button>
          <button class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600" @click="saveNote">
            Save Note
          </button>
        </div>
      </div>



    <!-- Cross-References List -->
    <div v-if="crossReferences.length" class="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg shadow-md">
      <h3 class="text-lg font-bold text-gray-800 dark:text-gray-200">🔗 Cross References</h3>
      <ul class="mt-2 space-y-2 max-h-40 overflow-y-auto">
        <li v-for="ref in crossReferences" :key="`${ref.book}-${ref.chapter}-${ref.verse}`"
            class="p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
          <span class="text-gray-900 dark:text-gray-200 font-semibold">
            {{ ref.book }} {{ ref.chapter }}:{{ ref.verse }}
          </span>
          - <span class="text-gray-700 dark:text-gray-400 italic">{{ ref.text }}</span>
        </li>
      </ul>
    </div>

  
      <!-- Place Form -->
      <div v-if="showPlaceForm" class="bg-white dark:bg-gray-800 rounded-lg my-4 p-4">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Add Place</h3>
        <form @submit.prevent="savePlace">
          <div class="space-y-4">
            <div>
              <label for="placeName" class="block text-gray-700 dark:text-gray-300">Place Name:</label>
              <input
                id="placeName"
                v-model="place.name"
                type="text"
                required
                class="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 p-2"
              />
            </div>
          </div>
          <div class="flex justify-end mt-4 space-x-4">
            <button type="button" class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600" @click="cancelPlace">
              Cancel
            </button>
            <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
              Save Place
            </button>
          </div>
        </form>
      </div>


    </div>
  </template>
  
  <script>
  import { useCookie } from "#app";
  
  export default {
    props: {
      selectedVerse: Object,
    },
    data() {
      return {
        colors: ["#fef3c7", "#bfdbfe", "#fde68a", "#d9f99d"],
        showNoteForm: false,
        noteContent: "",
        showPlaceForm: false,
        place: { name: "" },
        showCrossReferences: false,
        crossReferences: [],
      };
    },
    methods: {
      async toggleHighlight(verse, color) {
        if (!verse) return;
        verse.highlighted = !verse.highlighted;
        verse.color = color;
  
        const authToken = useCookie("auth_token").value;
        try {
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
          console.error("Error saving highlight:", error);
          verse.highlighted = !verse.highlighted; // Revert if error
        }
      },
  
      toggleNoteForm() {
        this.showNoteForm = !this.showNoteForm;
      },
  
      async saveNote() {
        if (!this.noteContent) {
            alert("❌ Note content cannot be empty.");
            return;
        }

        if (!this.selectedVerse) {
            alert("❌ No verse selected.");
            return;
        }

        try {
            const authToken = useCookie("auth_token").value;
            if (!authToken) {
            console.error("❌ No auth token found");
            alert("Unauthorized: Please log in.");
            return;
            }

            console.log("📝 Saving note:", {
            verseId: this.selectedVerse.id,
            content: this.noteContent,
            });

            const response = await $fetch("/api/user/addNote", {
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

            console.log("✅ Note saved successfully!", response);
            alert("✅ Note saved!");

            // Reset form after successful save
            this.noteContent = "";
            this.showNoteForm = false;
        } catch (error) {
            console.error("❌ Error adding note:", error);
            alert("Failed to save note.");
        }
      },

  
      togglePlaceForm() {
        this.showPlaceForm = !this.showPlaceForm;
      },
  
      async savePlace() {
        if (!this.place.name) {
            alert("❌ Place Name is required.");
            return;
        }

        if (!this.selectedVerse) {
            alert("❌ No verse selected.");
            return;
        }

        try {
            const authToken = useCookie("auth_token").value;
            if (!authToken) {
            console.error("❌ No auth token found");
            alert("Unauthorized: Please log in.");
            return;
            }

            console.log("📍 Saving place:", {
            verseId: this.selectedVerse.id,
            name: this.place.name,
            });

            const response = await $fetch("/api/places/add", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json",
            },
            body: {
                verseId: this.selectedVerse.id,
                name: this.place.name,
            },
            });

            console.log("✅ Place added successfully!", response);
            alert("✅ Place saved!");

            // Reset form after successful save
            this.place.name = "";
            this.showPlaceForm = false;
        } catch (error) {
            console.error("❌ Error adding place:", error);
            alert("Failed to add place.");
        }
    },
  
      cancelNote() {
        this.noteContent = "";
        this.showNoteForm = false;
      },
  
      cancelPlace() {
        this.place.name = "";
        this.showPlaceForm = false;
      },

      async handleCrossReferences() {
        this.crossReferences = this.selectedVerse.crossReferences;
        console.log("this.crossReferences " + this.selectedVerse.crossReferences)
      if (!this.selectedVerse?.book || !this.selectedVerse?.chapter || !this.selectedVerse?.number) {
        return;
      }

      try {
        console.log("📡 Fetching cross-references for:", this.selectedVerse);

        const response = await $fetch("/api/cross-references", {
          method: "GET",
          query: {
            book: this.selectedVerse.book,
            chapter: this.selectedVerse.chapter,
            verse: this.selectedVerse.number,
          },
        });

        console.log("✅ Cross References Retrieved:", response);
        this.crossReferences = response || [];

        if (this.crossReferences.length === 0) {
          alert("No cross-references found.");
        }
      } catch (error) {
        console.error("❌ Error fetching cross-references:", error);
        alert("Failed to retrieve cross-references.");
      }
    },




      jumpToReference(ref) {
        alert(`Jumping to: ${ref.book} ${ref.chapter}:${ref.verse}`);
        // Implement your logic to navigate to the selected verse
      },

      playAudio() {
      this.$emit('play-audio');  // Emit play-audio event to parent component
    }

    },
  };
  </script>
  
<template>
  <div>
    <div class="space-y-2 my-4">
      <span
        v-for="verse in verses"
        :key="verse.id"
        class="block p-2 cursor-pointer"
        :class="[
          compare ? 'min-h-[120px]' : '',
          { 'ring-2 ring-blue-500 dark:ring-blue-300': selectedVerse?.id === verse.id }
        ]"
        :style="{ backgroundColor: verse.highlighted ? verse.color : 'transparent' }"
        @click="selectVerse(verse)"
      >
        <span
          class="text-xs text-gray-500 align-super font-bold"
          :class="[
            colorMode.value === 'dark'
              ? verse.highlighted
                ? 'text-gray-800'
                : 'dark:text-gray-100'
              : verse.highlighted
                ? 'text-gray-900'
                : 'text-gray-100'
          ]"
        >
          {{ verse.number }}
        </span>
        <span
          :class="[
            colorMode.value === 'dark'
              ? verse.highlighted
                ? 'text-gray-800'
                : 'text-gray-400'
              : verse.highlighted
                ? 'text-gray-900'
                : 'text-gray-800'
          ]"
        >
          {{ verse.text }}
          <div class="flex justify-end items-center space-x-2">
            <!-- Places Icon -->
            <svg
              v-if="verse.places && verse.places.length > 0"
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7m0 9.5a2.5 2.5 0 0 1 0-5a2.5 2.5 0 0 1 0 5"
              />
            </svg>

            <!-- Notes Icon -->
            <svg
              v-if="verse.notes && verse.notes.length > 0"
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              fill="currentColor"
              class="bi bi-pencil-square"
              viewBox="0 0 16 16"
            >
              <path
                d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"
              />
              <path
                fill-rule="evenodd"
                d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
              />
            </svg>
          </div>
        </span>
      </span>
    </div>
  </div>
</template>

  
  <script>
  import { useColorMode } from '#imports'
  export default {
  props: {
    chapterId: { type: Number, required: true },
    userId: { type: Number, required: false }, 
    compare: { type: Boolean, default: false },
  },

  data() {
    return {
      verses: [],
      selectedVerse: null,
      colorMode: useColorMode()
    };
  },

  watch: {
    chapterId: {
      immediate: true,
      handler(newChapterId) {
        if (newChapterId) {
          console.log("📖 Chapter ID changed, fetching verses:", newChapterId);
          this.fetchVerses(newChapterId);
        }
      },
    },
  },

  methods: {
    async fetchVerses(id) {
      console.log("📜 Fetching verses for chapter ID:", id);

      const authToken = useCookie("auth_token").value;
      if (!authToken) {
        console.error("❌ No auth token found");
        return;
      }

      let endpoint = `/api/verses?chapterId=${id}`;
      if (this.userId) {
        endpoint = `/api/user/${this.userId}/userVerses?chapterId=${id}`;
      }else{
        
      }

      try {
        const response = await $fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        console.log("📘 API Response:", response);
        this.verses = response.verses || [];
      } catch (error) {
        console.error("❌ Error fetching verses:", error);
      }
    },

    selectVerse(verse) {
        if (!verse) {
          console.error("❌ selectVerse() called with null or undefined");
          return;
        }
  
        
        if(!this.userId){
            this.selectedVerse = verse;
        console.log("✅ Emitting selected verse:", verse);
            this.$emit("verse-selected", verse);
        }
        
      },
  },
};

  </script>
  
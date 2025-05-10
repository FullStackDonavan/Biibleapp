<template>
  <PatternSection>
    <!-- Hero Image Slider -->
    <MagicImageSlider :items="carouselItems" />

    <!-- Verse of the Day + Signup -->
    <div class="max-w-6xl mx-auto mt-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
          <!-- Verse of the Day -->
          <div>
            <div class="p-6 bg-blue-50 dark:bg-gray-800 rounded-lg shadow">
              <h2 class="text-2xl font-bold text-blue-600 dark:text-blue-300 mb-2">Verse of the Day</h2>
              <p class="text-gray-800 dark:text-gray-200 italic">
                "{{ verse?.text || 'Loading...' }}"
              </p>
              <p v-if="verse?.reference" class="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                — {{ verse.reference }}
              </p>
            </div>
          </div>

          <!-- Email Signup for Daily Verse -->
          <div>
            <DailyVerseSignup />
          </div>
        </div>

        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
        <!-- TrendingVerses -->
        <div class="mb-6">
          <TrendingVerses />
        </div>

        <!-- FeaturedDevotional -->
        <div class="mb-6">
          <FeaturedDevotional />
        </div>
        
      </div>
      <div><KeyFeatures /></div>
      <!-- Embedded Bible Viewer -->
      <div class="mb-6">
          <BibleViewer />
        </div>
    </div>
    <Ribbon />
  </PatternSection>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const verse = ref(null)

const carouselItems = ref([
  {
    img: "/img/code.jpg",
    author: "Donavan Jones",
    title: "Grow Spiritually, One Step at a Time",
    des: "Track your progress, reflect on God’s Word, and build lasting spiritual habits.",
    linkUrl: "/categories/",
    buttonText: "Start Your Journey",
  },
  {
    img: "/img/workspace.jpg",
    author: "Donavan Jones",
    title: "Explore the Word Like Never Before",
    des: "Read, highlight, and compare Bible verses across translations. Save notes, mark favorites, and discover deeper meaning.",
    linkUrl: "/about-me",
    buttonText: "Dive Into the Bible",
  },
  {
    img: "/img/contact-me.jpg",
    author: "Donavan Jones",
    title: "Join a Growing Faith Community",
    des: "Connect with others on their journey. Share notes, reflections, and encourage one another through God's Word.",
    linkUrl: "/contact",
    buttonText: "See the Community",
  }
])

onMounted(async () => {
  try {
    const res = await $fetch('/api/verse-of-the-day')
    if (res?.verse) verse.value = res.verse
  } catch (error) {
    console.error('Failed to fetch verse of the day:', error)
  }
})
</script>

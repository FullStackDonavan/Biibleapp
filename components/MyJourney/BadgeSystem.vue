<template>
    <div class="badge-system bg-white dark:bg-gray-800 rounded-lg p-6">
      <h2 class="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Achievements</h2>
  
      <div v-for="(group, tier) in groupedBadges" :key="tier" class="mb-8">
        <h3 class="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-300">{{ tier }}</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div
            v-for="badge in group"
            :key="badge.id"
            class="p-4 rounded-lg shadow-sm border"
            :class="badgeStyles(badge.tier, badge.unlocked)"
          >
            <div class="flex items-center space-x-3 mb-2">
              <div class="text-3xl">
                <Icon :name="badge.icon" />
              </div>
              <div>
                <h4 class="font-semibold text-lg">{{ badge.title }}</h4>
                <p class="text-sm">{{ badge.tier }}</p>
              </div>
            </div>
  
            <p class="text-sm text-gray-700 dark:text-gray-300">{{ badge.description }}</p>
  
            <div v-if="badge.unlocked" class="mt-2 text-green-500 font-semibold">✔ Unlocked</div>
            <div v-else class="mt-2 text-gray-400 italic">Locked</div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  
  <script setup>
const badges = [
  // Easy
  { id: 1, title: "First Verse Read", description: "You read your first Bible verse.", tier: "Easy", unlocked: true, icon: "mdi:book-open-page-variant" },
  { id: 2, title: "Devotion Starter", description: "Completed your first devotional.", tier: "Easy", unlocked: true, icon: "mdi:cross" },
  { id: 3, title: "Daily Bread", description: "Read a verse 3 days in a row.", tier: "Easy", unlocked: false, icon: "mdi:calendar-check" },
  { id: 4, title: "Comment Contributor", description: "Left a comment on a post.", tier: "Easy", unlocked: false, icon: "mdi:comment" },
  { id: 5, title: "Profile Complete", description: "Completed your profile setup.", tier: "Easy", unlocked: true, icon: "mdi:account-check" },
  { id: 6, title: "Liked It", description: "Reacted to a post.", tier: "Easy", unlocked: true, icon: "mdi:thumb-up" },
  { id: 7, title: "New Testament Newbie", description: "Read 5 chapters of the New Testament.", tier: "Easy", unlocked: false, icon: "mdi:book" },
  { id: 8, title: "Old Testament Starter", description: "Read a chapter from Genesis.", tier: "Easy", unlocked: false, icon: "mdi:script-text" },
  { id: 9, title: "Prayer Logged", description: "Added a personal prayer.", tier: "Easy", unlocked: false, icon: "mdi:hand-pray" },
  { id: 10, title: "Highlighted", description: "Highlighted your first verse.", tier: "Easy", unlocked: false, icon: "mdi:marker" },

  // Uncommon
  { id: 11, title: "Consistent Seeker", description: "Read for 7 days straight.", tier: "Uncommon", unlocked: false, icon: "mdi:clock" },
  { id: 12, title: "Bible Explorer", description: "Read from 5 different books.", tier: "Uncommon", unlocked: false, icon: "mdi:compass" },
  { id: 13, title: "Devotional Regular", description: "Completed 5 devotionals.", tier: "Uncommon", unlocked: false, icon: "mdi:cross-outline" },
  { id: 14, title: "Discussion Starter", description: "Started a thread or question.", tier: "Uncommon", unlocked: false, icon: "mdi:forum" },
  { id: 15, title: "Verse Sharer", description: "Shared a verse publicly.", tier: "Uncommon", unlocked: false, icon: "mdi:share" },
  { id: 16, title: "Highlight Collector", description: "Created 10 highlights.", tier: "Uncommon", unlocked: false, icon: "mdi:highlighter" },
  { id: 17, title: "Reflection Writer", description: "Wrote 3 reflections.", tier: "Uncommon", unlocked: false, icon: "mdi:book-edit" },
  { id: 18, title: "Daily Disciple", description: "Read a verse every day for 14 days.", tier: "Uncommon", unlocked: false, icon: "mdi:calendar-range" },
  { id: 19, title: "Gospel Grasper", description: "Read all 4 Gospels.", tier: "Uncommon", unlocked: false, icon: "mdi:alpha-g" },
  { id: 20, title: "Bookworm", description: "Completed an entire book of the Bible.", tier: "Uncommon", unlocked: false, icon: "mdi:book-open" },

  // Rare
  { id: 21, title: "Master of Translation", description: "Compared translations across 5 chapters.", tier: "Rare", unlocked: false, icon: "mdi:translate" },
  { id: 22, title: "Memory Verse Champ", description: "Memorized 10 different verses.", tier: "Rare", unlocked: false, icon: "mdi:brain" },
  { id: 23, title: "Consistent Contributor", description: "Posted for 4 straight weeks.", tier: "Rare", unlocked: false, icon: "mdi:calendar-month" },
  { id: 24, title: "Teacher's Heart", description: "Explained a passage in a post.", tier: "Rare", unlocked: false, icon: "mdi:school" },
  { id: 25, title: "Language Explorer", description: "Explored 5 words in Ancient Greek or Hebrew.", tier: "Rare", unlocked: false, icon: "mdi:alphabet-greek" },
  { id: 26, title: "Faithful Friend", description: "Added 10 friends.", tier: "Rare", unlocked: false, icon: "mdi:account-multiple" },
  { id: 27, title: "Verse Artist", description: "Created 3 verse-based graphics.", tier: "Rare", unlocked: false, icon: "mdi:palette" },
  { id: 28, title: "Verse Deep Diver", description: "Added 10 notes to verses.", tier: "Rare", unlocked: false, icon: "mdi:notebook" },
  { id: 29, title: "Reflection Master", description: "Wrote 10 reflections.", tier: "Rare", unlocked: false, icon: "mdi:book-account" },
  { id: 30, title: "Apologetics Advocate", description: "Posted 5 apologetics arguments.", tier: "Rare", unlocked: false, icon: "mdi:scale-balance" },

  // Legendary
  { id: 31, title: "Legendary Reader", description: "Read the entire New Testament.", tier: "Legendary", unlocked: false, icon: "mdi:crown" },
  { id: 32, title: "Whole Word Warrior", description: "Read the entire Bible.", tier: "Legendary", unlocked: false, icon: "mdi:book-multiple" },
  { id: 33, title: "Verse Whisperer", description: "Memorized 50 verses.", tier: "Legendary", unlocked: false, icon: "mdi:brain" },
  { id: 34, title: "Evangelist", description: "Shared 20 verses to others.", tier: "Legendary", unlocked: false, icon: "mdi:bullhorn" },
  { id: 35, title: "Greek Scholar", description: "Explored 50 Greek terms.", tier: "Legendary", unlocked: false, icon: "mdi:language-greek-ancient" },
  { id: 36, title: "Hebrew Expert", description: "Studied 50 Hebrew terms.", tier: "Legendary", unlocked: false, icon: "mdi:language-hebrew" },
  { id: 37, title: "Prayer Warrior", description: "Logged 100 prayers.", tier: "Legendary", unlocked: false, icon: "mdi:hand-pray" },
  { id: 38, title: "Verse Illustrator", description: "Created 25 verse memes.", tier: "Legendary", unlocked: false, icon: "mdi:image" },
  { id: 39, title: "Community Pillar", description: "Received 50 likes across posts.", tier: "Legendary", unlocked: false, icon: "mdi:thumb-up-outline" },
  { id: 40, title: "Master Apologist", description: "Posted 20 apologetics arguments.", tier: "Legendary", unlocked: false, icon: "mdi:shield-check" },

  // Bonus Achievements (fill to 50)
  { id: 41, title: "Verse Hunter", description: "Found 20 places in scripture.", tier: "Rare", unlocked: false, icon: "mdi:map-marker" },
  { id: 42, title: "Verse Annotator", description: "Wrote 20 personal notes.", tier: "Uncommon", unlocked: false, icon: "mdi:note-text" },
  { id: 43, title: "Devotion Devotee", description: "Completed 25 devotionals.", tier: "Rare", unlocked: false, icon: "mdi:bookmark-check" },
  { id: 44, title: "Friend of Many", description: "Added 25 friends.", tier: "Rare", unlocked: false, icon: "mdi:account-group" },
  { id: 45, title: "Storyteller", description: "Posted 10 stories tied to scripture.", tier: "Uncommon", unlocked: false, icon: "mdi:book-open-variant" },
  { id: 46, title: "Map Master", description: "Visited 20 biblical places.", tier: "Rare", unlocked: false, icon: "mdi:map" },
  { id: 47, title: "Community Builder", description: "Started 5 discussions.", tier: "Rare", unlocked: false, icon: "mdi:chat-outline" },
  { id: 48, title: "Verse Collector", description: "Saved 100 verses.", tier: "Legendary", unlocked: false, icon: "mdi:folder-multiple" },
  { id: 49, title: "Scholar of Scripture", description: "Finished 5 books in both OT and NT.", tier: "Legendary", unlocked: false, icon: "mdi:library" },
  { id: 50, title: "Daily Lightbearer", description: "Used the app daily for 30 days.", tier: "Legendary", unlocked: false, icon: "mdi:lightbulb-on-outline" },
]

function badgeStyles(tier, unlocked) {
  const base = "transition-all duration-300"
  const status = unlocked ? "bg-green-50 dark:bg-green-900 border-green-400" : "bg-gray-100 dark:bg-gray-700"
  const tierColors = {
    Easy: "border-blue-300",
    Uncommon: "border-teal-400",
    Rare: "border-purple-400",
    Legendary: "border-yellow-400",
  }
  return `${base} ${status} ${tierColors[tier] || ""}`
}

const groupedBadges = computed(() => {
  return badges.reduce((acc, badge) => {
    if (!acc[badge.tier]) acc[badge.tier] = []
    acc[badge.tier].push(badge)
    return acc
  }, {})
})

</script>

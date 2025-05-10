<template>
    <div class="flex space-x-2 mb-6">
      <button
        :class="tab === 'bible' ? activeClass : inactiveClass"
        @click="$emit('switch', 'bible')"
      >
        Bible to Bible
      </button>
      <button
        :class="tab === 'religion' ? activeClass : inactiveClass"
        @click="$emit('switch', 'religion')"
      >
        Bible vs Other Religions
      </button>
    </div>
  </template>
  
  <script setup>
  defineProps({
    tab: {
      type: String,
      required: true,
    },
  });
  
  const activeClass = 'bg-blue-600 text-white font-semibold px-4 py-2 rounded';
  const inactiveClass = 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded';
  </script>
  
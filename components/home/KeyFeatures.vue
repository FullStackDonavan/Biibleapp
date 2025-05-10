<template>
    <section class="max-w-6xl mx-auto text-center">
      <h2 class="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200">Key Features</h2>
  
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
        <!-- Bible Study Tools -->
        <div class="p-4 rounded-lg bg-white dark:bg-gray-800 shadow">
          <Icon name="mdi:bible" class="text-blue-600 dark:text-blue-400 mb-3 w-12 h-12 mx-auto" />
          <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-100">Bible Study Tools</h3>
          <p class="text-gray-600 dark:text-gray-400">
            Explore multiple translations, highlight verses, and take personal notes.
          </p>
        </div>
  
        <!-- My Journey Dashboard -->
        <div class="p-4 rounded-lg bg-white dark:bg-gray-800 shadow">
          <Icon name="mdi:account-heart" class="text-rose-600 dark:text-rose-400 mb-3 w-12 h-12 mx-auto" />
          <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-100">My Journey Dashboard</h3>
          <p class="text-gray-600 dark:text-gray-400">
            Track your spiritual growth, prayer journal, and daily habits.
          </p>
        </div>
  
        <!-- Daily Verse by Email -->
        <div class="p-4 rounded-lg bg-white dark:bg-gray-800 shadow">
          <Icon name="mdi:email-variant" class="text-yellow-500 dark:text-yellow-300 mb-3 w-12 h-12 mx-auto" />
          <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-100">Daily Verse by Email</h3>
          <p class="text-gray-600 dark:text-gray-400">
            Get a Bible verse sent to your inbox every morning for encouragement.
          </p>
        </div>
  
        <!-- Biblical Places -->
        <div class="p-4 rounded-lg bg-white dark:bg-gray-800 shadow">
          <Icon name="mdi:map-marker-radius" class="text-purple-600 dark:text-purple-400 mb-3 w-12 h-12 mx-auto" />
          <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-100">Biblical Places</h3>
          <p class="text-gray-600 dark:text-gray-400">
            Discover key locations from Scripture and add your own place notes.
          </p>
        </div>
  
        <!-- Ancient Languages -->
        <div class="p-4 rounded-lg bg-white dark:bg-gray-800 shadow">
          <Icon name="mdi:alphabetical-variant" class="text-green-600 dark:text-green-400 mb-3 w-12 h-12 mx-auto" />
          <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-100">Ancient Languages</h3>
          <p class="text-gray-600 dark:text-gray-400">
            Learn original Hebrew & Greek with easy-to-understand word studies.
          </p>
        </div>
  
        <!-- Daily Devotionals -->
        <div class="p-4 rounded-lg bg-white dark:bg-gray-800 shadow">
          <Icon name="mdi:calendar-star" class="text-pink-500 dark:text-pink-400 mb-3 w-12 h-12 mx-auto" />
          <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-100">Daily Devotionals</h3>
          <p class="text-gray-600 dark:text-gray-400">
            A fresh word each day—Scripture, reflection, and prayer all in one.
          </p>
        </div>
  
        <!-- Reading Progress Tracker -->
        <div class="p-4 rounded-lg bg-white dark:bg-gray-800 shadow">
          <Icon name="mdi:chart-bar" class="text-cyan-600 dark:text-cyan-400 mb-3 w-12 h-12 mx-auto" />
          <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-100">Reading Progress</h3>
          <p class="text-gray-600 dark:text-gray-400">
            Visual charts help you track your Bible reading and spiritual milestones.
          </p>
        </div>
  
        <!-- Prayer Journal -->
        <div class="p-4 rounded-lg bg-white dark:bg-gray-800 shadow">
          <Icon name="mdi:book-open-variant" class="text-indigo-500 dark:text-indigo-300 mb-3 w-12 h-12 mx-auto" />
          <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-100">Prayer Journal</h3>
          <p class="text-gray-600 dark:text-gray-400">
            Keep a private record of your prayers, reflections, and answers over time.
          </p>
        </div>
  
        <!-- Community Feed -->
        <div class="p-4 rounded-lg bg-white dark:bg-gray-800 shadow">
          <Icon name="mdi:account-group" class="text-orange-500 dark:text-orange-400 mb-3 w-12 h-12 mx-auto" />
          <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-100">Community Feed</h3>
          <p class="text-gray-600 dark:text-gray-400">
            See what others are reflecting on and get inspired by their journey too.
          </p>
        </div>
      </div>
    </section>
  </template>
  
  <script setup>
  import { Icon } from '#components'
  </script>
  
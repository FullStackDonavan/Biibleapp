<template>
    <div v-if="isLive" class="go-live-container bg-red-600 text-white p-4 rounded-lg shadow-md">
      <!-- Live Indicator -->
      <h2 class="text-xl font-bold">Live Now: {{ eventTitle }}</h2>
      <p class="text-sm">{{ eventDescription }}</p>
  
      <!-- Join Button -->
      <button @click="joinLiveSession" class="mt-3 bg-white text-red-600 py-2 px-4 rounded-lg">
        Join Now
      </button>
    </div>
  
    <!-- If not live, show upcoming event details -->
    <div v-else class="go-live-container bg-gray-300 text-gray-800 p-4 rounded-lg shadow-md">
      <h2 class="text-xl font-bold">Upcoming Event: {{ eventTitle }}</h2>
      <p class="text-sm">{{ eventDescription }}</p>
      <p class="text-sm font-semibold">Starts at: {{ formattedStartTime }}</p>
  
      <button @click="notifyMe" class="mt-3 bg-blue-500 text-white py-2 px-4 rounded-lg">
        Notify Me When Live
      </button>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const isLive = ref(false);  // Toggle between live and upcoming event
  const eventTitle = ref('Debate: Faith vs. Reason');
  const eventDescription = ref('Join the live debate on faith and reason, featuring prominent scholars.');
  const eventStartTime = ref(new Date('2025-05-01T18:00:00Z')); // Example upcoming event start time
  
  // Format start time for upcoming events
  const formattedStartTime = new Date(eventStartTime.value).toLocaleString();
  
  // Function to join live session
  const joinLiveSession = () => {
    // Navigate or trigger logic to start the live session
    alert('Joining live session...');
  };
  
  // Function to notify the user about the live event
  const notifyMe = () => {
    // This can be an API call to set up notifications (or push notifications) for the user
    alert('You will be notified when the event goes live!');
  };
  
  // Function to simulate toggling live status (for testing)
  setTimeout(() => {
    isLive.value = true; // Simulate that the event is live after a few seconds
  }, 5000);  // Set the event live after 5 seconds for demo
  </script>
  
  <style scoped>
  .go-live-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 400px;
    margin: 0 auto;
  }
  
  button {
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  button:hover {
    background-color: #ff4500;
  }
  </style>
  
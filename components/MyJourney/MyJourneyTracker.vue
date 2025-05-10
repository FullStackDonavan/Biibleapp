<template>
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">📖 My Journey: Chapter Progress</h2>
      <canvas ref="progressChart" height="300"></canvas>
    </div>
  </template>
  
  <script setup>
  import { onMounted, ref } from 'vue'
  import Chart from 'chart.js/auto'
  
  const progressChart = ref(null)
  
  const books = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy']
  const chaptersRead = [40, 25, 12, 30, 10]
  const totalChapters = [50, 40, 27, 36, 34]
  const progressPercentages = chaptersRead.map((read, idx) => ((read / totalChapters[idx]) * 100).toFixed(1))
  
  onMounted(() => {
    if (progressChart.value) {
      new Chart(progressChart.value, {
        type: 'bar',
        data: {
          labels: books,
          datasets: [{
            label: '% Read',
            data: progressPercentages,
            backgroundColor: '#3B82F6',
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              title: {
                display: true,
                text: 'Progress (%)'
              }
            }
          }
        }
      })
    }
  })
  </script>
  
  <style scoped>
  canvas {
    max-width: 100%;
  }
  </style>
  
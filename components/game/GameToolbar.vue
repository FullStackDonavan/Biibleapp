<template>
    <div class="absolute top-4 left-4 z-10 bg-white p-3 rounded shadow flex gap-2 items-center">
      <select v-model="selected" @change="emitTool" class="border rounded px-2 py-1">
        <option value="barrel">Barrel</option>
        <option value="grass">Grass</option>
        <option value="wall">Wall</option>
        <option value="verse">Verse Block</option>
        <option value="enemy">Enemy (Patrol)</option>
        <option value="npc">NPC (Dialogue)</option>
        <option value="light">Move Light</option>
        <option value="move">Move</option>
        <option value="camera">Camera</option>
      </select>
  
      <button @click="$emit('add-light')" class="bg-yellow-400 px-2 py-1 rounded hover:bg-yellow-500">
        Add Light
      </button>
  
      <input
        type="range"
        min="0" max="2" step="0.1"
        :value="lightIntensity"
        @input="$emit('update-intensity', +$event.target.value)"
      />
      <input
        type="color"
        :value="lightColor"
        @input="$emit('update-color', $event.target.value)"
      />
  
      <button @click="$emit('save')" class="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600">
        Save
      </button>
      <button @click="$emit('load')" class="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">
      Load
    </button>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const selected = ref('camera')
  
  const emit = defineEmits([
    'update-tool',
    'add-light',
    'save',
    'load',
    'update-intensity',
    'update-color'
  ])
  defineProps({
    lightIntensity: Number,
    lightColor: String,
    pointLight: Object
  })
  
  function emitTool() {
    emit('update-tool', selected.value)
  }
  </script>
  
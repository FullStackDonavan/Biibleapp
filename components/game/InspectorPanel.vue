<template>
    <div class="absolute top-4 right-4 z-10 w-80 bg-white p-4 rounded shadow overflow-y-auto max-h-[80vh]">
      <h2 class="text-lg font-semibold mb-2">Inspector</h2>
  
      <!-- Light Section -->
      <div v-if="light" class="border p-3 mb-4 rounded">
        <div class="font-bold">Point Light</div>
        <div class="text-xs text-gray-600 mb-2">
          x: <input type="number" v-model.number="lx" @input="emitLightPos" class="w-16 text-xs p-1" />,
          y: <input type="number" v-model.number="ly" @input="emitLightPos" class="w-16 text-xs p-1" />,
          z: <input type="number" v-model.number="lz" @input="emitLightPos" class="w-16 text-xs p-1" />
        </div>
  
        <label class="block text-sm">Intensity</label>
        <input
          type="range" min="0" max="10" step="0.1"
          v-model.number="light.intensity"
          class="w-full mb-2"
        />
  
        <label class="block text-sm">Color</label>
        <input
          type="color"
          :value="colorHex"
          @input="updateColor($event.target.value)"
          class="w-full mb-2"
        />
  
        <!-- little gray cube indicator -->
        <div class="flex justify-center mt-2">
          <div class="w-4 h-4 bg-gray-400 rounded"></div>
        </div>
      </div>
  
      <!-- Placed Objects -->
      <div v-if="objects.length===0" class="text-gray-500 text-sm">
        No objects placed
      </div>
      <div
        v-for="(obj, i) in objects"
        :key="i"
        class="border p-2 mb-2 rounded text-sm flex justify-between items-center"
        :class="{ 'bg-blue-100': selectedIdx===i }"
        @click="selectObject(i)"
      >
        <div>
          <div class="font-bold capitalize">{{ obj.type }}</div>
          <div class="text-xs text-gray-600">
            x: <input type="number" v-model.number="obj.x" @input="updateObjectPosition(i)" class="w-16 text-xs p-1" />,
            y: <input type="number" v-model.number="obj.y" @input="updateObjectPosition(i)" class="w-16 text-xs p-1" />,
            z: <input type="number" v-model.number="obj.z" @input="updateObjectPosition(i)" class="w-16 text-xs p-1" />
          </div>
        </div>
        <button @click.stop="$emit('delete', i)" class="text-red-500 hover:text-red-700 text-xs">
          ✕
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch } from 'vue'
  import * as BABYLON from 'babylonjs'
  
  const props = defineProps({
    objects: Array,
    light: Object
  })
  const emit = defineEmits([
    'select-object',
    'update-object-position',
    'update-light-position',
    'delete'
  ])
  
  // highlighted object index
  const selectedIdx = ref(null)
  
  // two-way fields for light position
  const lx = ref(0), ly = ref(0), lz = ref(0)
  watch(() => props.light?.position, p => {
    if (p) {
      lx.value = p.x
      ly.value = p.y
      lz.value = p.z
    }
  }, { immediate: true })
  
  const colorHex = computed(() => {
    if (!props.light?.diffuse) return '#ffffff'
    const { r, g, b } = props.light.diffuse
    return '#' + [r, g, b]
      .map(v => Math.round(v*255).toString(16).padStart(2, '0'))
      .join('')
  })
  
  function updateColor(hex) {
    props.light.diffuse = BABYLON.Color3.FromHexString(hex)
  }
  
  function emitLightPos() {
    emit('update-light-position', { x: lx.value, y: ly.value, z: lz.value })
  }
  
  function selectObject(i) {
    selectedIdx.value = i
    emit('select-object', { index: i, object: props.objects[i] })
  }
  
  function updateObjectPosition(i) {
    const o = props.objects[i]
    if (o.mesh && o.mesh.position) {
      o.mesh.position.set(o.x, o.y, o.z)
      emit('update-object-position', { index: i, x: o.x, y: o.y, z: o.z })
    }
  }
  </script>
  
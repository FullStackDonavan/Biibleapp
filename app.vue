<script setup lang="ts">
import { useUser } from "~/composables/useAuth";
import { MotionPlugin, useMotionTransitions } from "@vueuse/motion";
const nuxtApp = useNuxtApp();

// Install Vue Motion Plugin
nuxtApp.vueApp.use(MotionPlugin);

// Scroll to top on page finish
nuxtApp.hook("page:finish", () => {
  window.scrollTo(0, 0);
});

// Set favicon
useHead({
  //link: [{ rel: "icon", type: "image/x-icon", href: "/img/favicon.ico" }],
  script: [
    {
      src: 'https://cdn.fluidplayer.com/v3/current/fluidplayer.min.js',
      defer: true
    },
  ]
});

// Ensure user authentication
await useUser();
</script>

<template>
  <NuxtLayout>
    <div
      v-motion
      class="dark:bg-gray-900 dark:text-slate-300 transition duration-500"
      :initial="{ opacity: 0 }"
      :enter="{ opacity: 1, transition: { duration: 0.5 } }"
      :leave="{ opacity: 0, transition: { duration: 0.3 } }"
    >
      <!-- Overlay Component -->
      <!-- <Overlay /> -->
      <NuxtPage />
    </div>
  </NuxtLayout>
</template>

<style>
/* Rotate animation */
.rotate-enter-active,
.rotate-leave-active {
  transition: all 0.4s ease-in-out;
}

.rotate-enter-from,
.rotate-leave-to {
  opacity: 0;
  transform: rotate3d(1, 1, 1, 15deg);
}

/* Page transition animation */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease-in-out;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
</style>

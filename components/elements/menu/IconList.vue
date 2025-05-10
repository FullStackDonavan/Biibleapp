<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthCookie, useUser } from '~/composables/useAuth'
import { onClickOutside } from '@vueuse/core'

const hideActions = ref(true)
const userActions = ref(null)

onClickOutside(userActions, () => (hideActions.value = true))

const colorMode = useColorMode()
const user = useState('user')
const authCookie = useAuthCookie()
const loggedInUser = ref(null)
console.log('Initial user:', user.value)

async function getLoggedInUser() {
  try {
    if (!authCookie.value) {
      console.error("Auth cookie is missing.");
      return null;
    }
    console.log("Fetching fresh user data...");
    
    const response = await $fetch(`/api/user`, {
      headers: { Authorization: `Bearer ${authCookie.value}` },
    });

    console.log("✅ User fetched:", response);
    
    // **Check response format and return correct object**
    return response.user || response; // ✅ Handles both old & new API formats
  } catch (error) {
    console.error("Error in getLoggedInUser:", error.message || error);
    return null;
  }
}
// Fetch the user on mount if not already set
const avatar = ref('https://placehold.co/40x40') // default

onMounted(async () => {
  if (!user.value) {
    const fetched = await getLoggedInUser()

    if (fetched) {
      user.value = fetched
      avatar.value = fetched.avatar ? fetched.avatar : avatar.value
    }
  } else {
    const fetched = await getLoggedInUser()
    console.log('✅ Fetched user avatar:', fetched?.avatar)

    if (fetched?.avatar) {
      avatar.value = fetched.avatar
    }
  }
})


watch(
  () => authCookie.value,
  (newVal, oldVal) => {
    console.log('Auth cookie changed from', oldVal, 'to', newVal)
    if (newVal) {
      // When a new token is set, re-fetch the user data
      getLoggedInUser().then(data => {
        loggedInUser.value = data
      })
    } 
  }
)



const isLoggedInUser = computed(() => !!user.value?.id)

// Use computed for reactive login check
const isLoggedIn = computed(() => useAuthCookie)

const setColorTheme = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

</script>

<template>
  <div class="hidden md:flex justify-between space-x-10 mt-4 items-center text-gray-600 dark:text-gray-200">

    <!-- Home -->
    <NuxtLink to="/" title="Home">
      <Icon name="mdi:home" class="w-6 h-6 hover:text-blue-500" />
    </NuxtLink>

    <!-- Reflections -->
    <NuxtLink to="/categories" title="Reflections">
      <Icon name="mdi:book-open-page-variant" class="w-6 h-6 hover:text-blue-500" />
    </NuxtLink>

    <!-- My Journey -->
    <NuxtLink to="/my-journey" v-if="isLoggedIn() && user" title="My Journey">
      <Icon name="mdi:account-heart" class="w-6 h-6 hover:text-blue-500" />
    </NuxtLink>

    <!-- Dashboard (admin only) -->
    <NuxtLink to="/dashboard" v-if="isLoggedIn() && user" title="Dashboard">
      <Icon name="mdi:view-dashboard" class="w-6 h-6 hover:text-blue-500" />
    </NuxtLink>

    <!-- Light/Dark Toggle -->
     <ClientOnly>
    <span @click="setColorTheme" class="cursor-pointer">
      <Icon
        v-if="colorMode.value === 'dark'"
        name="mdi:white-balance-sunny"
        class="w-6 h-6 text-yellow-400"
      />
      <Icon
        v-else
        name="mdi:moon-waning-crescent"
        class="w-6 h-6 text-gray-800 dark:text-gray-100"
      />
    </span>
  </ClientOnly>

    <!-- Avatar or Default Icon -->
    <NuxtLink :to="isLoggedIn() && user ? '/profile' : '/login'" title="My Profile">
      <template v-if="isLoggedIn() && user">
        <img
        :src="avatar"


          alt="User Avatar"
          class="h-16 w-16 rounded-full object-cover ring-2 ring-blue-500 hover:ring-blue-400 transition-all"
        />
      </template>
      <template v-else>
        <User :isLoggedIn="isLoggedIn" class="md:block" />
      </template>
    </NuxtLink>

  </div>
</template>
